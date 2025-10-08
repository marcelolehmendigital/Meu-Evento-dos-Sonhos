const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const formidable = require('formidable');
const fs = require('fs');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Configuração do Google Drive
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/drive']
});
const drive = google.drive({ version: 'v3', auth });

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Buscar evento ativo
    const { data: activeEvent, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('active', true)
      .single();

    if (eventError || !activeEvent) {
      return res.status(400).json({ error: 'Nenhum evento ativo encontrado' });
    }

    // Parse do formulário
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      multiples: true
    });

    const [fields, files] = await form.parse(req);
    const guestName = Array.isArray(fields.guestName) ? fields.guestName[0] : fields.guestName;

    if (!guestName) {
      return res.status(400).json({ error: 'Nome do convidado é obrigatório' });
    }

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
    const results = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const storedName = `${timestamp}_${file.originalFilename}`;

      // Upload para Google Drive
      const fileMetadata = {
        name: storedName,
        parents: [activeEvent.drive_folder_id]
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath)
      };

      const driveResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      // Tornar arquivo público
      await drive.permissions.create({
        fileId: driveResponse.data.id,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      const driveLink = `https://drive.google.com/file/d/${driveResponse.data.id}/view`;

      // Salvar metadados no Supabase
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('uploads')
        .insert({
          event_id: activeEvent.id,
          original_name: file.originalFilename,
          stored_name: storedName,
          guest_name: guestName,
          drive_file_id: driveResponse.data.id,
          drive_link: driveLink,
          mime_type: file.mimetype,
          size_bytes: file.size
        })
        .select()
        .single();

      if (uploadError) {
        console.error('Erro ao salvar no Supabase:', uploadError);
        continue;
      }

      results.push({
        id: uploadRecord.id,
        originalName: file.originalFilename,
        driveLink: driveLink,
        size: file.size
      });

      // Limpar arquivo temporário
      fs.unlinkSync(file.filepath);
    }

    res.status(200).json({
      success: true,
      message: `${results.length} arquivo(s) enviado(s) com sucesso`,
      files: results,
      event: activeEvent.name
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
