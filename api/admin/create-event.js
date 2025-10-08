const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

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

function verifyAdminAuth(req) {
  const adminPassword = req.headers['x-admin-pass'];
  return adminPassword === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pass');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar autenticação admin
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  try {
    const { eventName } = req.body;

    if (!eventName || eventName.trim() === '') {
      return res.status(400).json({ error: 'Nome do evento é obrigatório' });
    }

    // Desativar eventos anteriores
    await supabase
      .from('events')
      .update({ active: false })
      .eq('active', true);

    // Criar pasta no Google Drive
    const folderMetadata = {
      name: eventName.trim(),
      parents: [process.env.DRIVE_FOLDER_ID],
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folderResponse = await drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });

    const driveFolderId = folderResponse.data.id;

    // Criar evento no Supabase
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        name: eventName.trim(),
        drive_folder_id: driveFolderId,
        active: true
      })
      .select()
      .single();

    if (eventError) {
      // Se falhar ao criar no Supabase, tentar deletar a pasta do Drive
      try {
        await drive.files.delete({ fileId: driveFolderId });
      } catch (deleteError) {
        console.error('Erro ao deletar pasta do Drive:', deleteError);
      }
      throw eventError;
    }

    res.status(201).json({
      success: true,
      message: 'Evento criado com sucesso',
      event: {
        id: newEvent.id,
        name: newEvent.name,
        driveFolderId: driveFolderId,
        active: newEvent.active,
        createdAt: newEvent.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
