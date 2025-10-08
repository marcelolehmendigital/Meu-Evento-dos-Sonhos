const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'ID do evento é obrigatório' });
    }

    // Verificar se o evento existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Buscar contagem de uploads do evento
    const { count: uploadsCount, error: countError } = await supabase
      .from('uploads')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (countError) {
      console.error('Erro ao contar uploads:', countError);
    }

    // Marcar evento como inativo
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({ active: false })
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      success: true,
      message: 'Evento encerrado com sucesso',
      event: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        driveFolderId: updatedEvent.drive_folder_id,
        active: updatedEvent.active,
        uploadsCount: uploadsCount || 0,
        closedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao encerrar evento:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
