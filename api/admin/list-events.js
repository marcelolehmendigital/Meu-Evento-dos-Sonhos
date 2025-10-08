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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pass');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar autenticação admin
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  try {
    // Buscar todos os eventos com contagem de uploads
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        drive_folder_id,
        active,
        created_at,
        uploads(count)
      `)
      .order('created_at', { ascending: false });

    if (eventsError) {
      throw eventsError;
    }

    // Formatar resposta
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      driveFolderId: event.drive_folder_id,
      active: event.active,
      createdAt: event.created_at,
      uploadsCount: event.uploads[0]?.count || 0
    }));

    res.status(200).json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length,
      activeEvents: formattedEvents.filter(e => e.active).length
    });

  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
