const { google } = require('googleapis');

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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    // Obter informações sobre o storage
    const response = await drive.about.get({
      fields: 'storageQuota'
    });

    const storageQuota = response.data.storageQuota;
    
    const limit = parseInt(storageQuota.limit) || 0;
    const usage = parseInt(storageQuota.usage) || 0;
    const usageInDrive = parseInt(storageQuota.usageInDrive) || 0;
    const usageInDriveTrash = parseInt(storageQuota.usageInDriveTrash) || 0;

    const available = limit - usage;
    const usagePercentage = limit > 0 ? ((usage / limit) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      quota: {
        limit: {
          bytes: limit,
          formatted: formatBytes(limit)
        },
        usage: {
          total: {
            bytes: usage,
            formatted: formatBytes(usage)
          },
          drive: {
            bytes: usageInDrive,
            formatted: formatBytes(usageInDrive)
          },
          trash: {
            bytes: usageInDriveTrash,
            formatted: formatBytes(usageInDriveTrash)
          }
        },
        available: {
          bytes: available,
          formatted: formatBytes(available)
        },
        usagePercentage: parseFloat(usagePercentage)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao obter quota do Drive:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
