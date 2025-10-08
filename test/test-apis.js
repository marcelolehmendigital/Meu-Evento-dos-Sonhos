// Script de teste para verificar as APIs do sistema
// Execute com: node test/test-apis.js

const fetch = require('node-fetch');

// Configurações
const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'senha-admin-super-segura-123';

// Função auxiliar para fazer requisições
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        return {
            status: 0,
            ok: false,
            error: error.message
        };
    }
}

// Testes das APIs
async function runTests() {
    console.log('🧪 Iniciando testes das APIs...\n');
    
    // Teste 1: Verificar quota do Drive
    console.log('1️⃣ Testando API de quota do Drive...');
    const quotaResult = await makeRequest(`${BASE_URL}/api/admin/drive-quota`, {
        method: 'GET',
        headers: {
            'x-admin-pass': ADMIN_PASSWORD
        }
    });
    
    if (quotaResult.ok) {
        console.log('✅ Quota do Drive obtida com sucesso');
        console.log(`   Uso: ${quotaResult.data.quota.usage.total.formatted}`);
        console.log(`   Limite: ${quotaResult.data.quota.limit.formatted}`);
    } else {
        console.log('❌ Erro ao obter quota do Drive:', quotaResult.data?.error || quotaResult.error);
    }
    console.log('');
    
    // Teste 2: Listar eventos
    console.log('2️⃣ Testando API de listagem de eventos...');
    const listResult = await makeRequest(`${BASE_URL}/api/admin/list-events`, {
        method: 'GET',
        headers: {
            'x-admin-pass': ADMIN_PASSWORD
        }
    });
    
    if (listResult.ok) {
        console.log('✅ Eventos listados com sucesso');
        console.log(`   Total de eventos: ${listResult.data.total}`);
        console.log(`   Eventos ativos: ${listResult.data.activeEvents}`);
    } else {
        console.log('❌ Erro ao listar eventos:', listResult.data?.error || listResult.error);
    }
    console.log('');
    
    // Teste 3: Criar evento de teste
    console.log('3️⃣ Testando criação de evento...');
    const eventName = `Evento Teste ${Date.now()}`;
    const createResult = await makeRequest(`${BASE_URL}/api/admin/create-event`, {
        method: 'POST',
        headers: {
            'x-admin-pass': ADMIN_PASSWORD
        },
        body: JSON.stringify({
            eventName: eventName
        })
    });
    
    let testEventId = null;
    if (createResult.ok) {
        console.log('✅ Evento criado com sucesso');
        console.log(`   Nome: ${createResult.data.event.name}`);
        console.log(`   ID: ${createResult.data.event.id}`);
        testEventId = createResult.data.event.id;
    } else {
        console.log('❌ Erro ao criar evento:', createResult.data?.error || createResult.error);
    }
    console.log('');
    
    // Teste 4: Verificar se há evento ativo para upload
    console.log('4️⃣ Verificando disponibilidade para upload...');
    // Simular um upload sem arquivo para testar a validação
    const uploadTest = await makeRequest(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'guestName=Teste'
    });
    
    if (uploadTest.status === 400 && uploadTest.data?.error?.includes('arquivo')) {
        console.log('✅ API de upload está funcionando (validação de arquivos OK)');
    } else if (uploadTest.status === 400 && uploadTest.data?.error?.includes('evento')) {
        console.log('⚠️ Nenhum evento ativo encontrado para upload');
    } else {
        console.log('❌ Erro inesperado na API de upload:', uploadTest.data?.error || uploadTest.error);
    }
    console.log('');
    
    // Teste 5: Encerrar evento de teste (se foi criado)
    if (testEventId) {
        console.log('5️⃣ Testando encerramento de evento...');
        const closeResult = await makeRequest(`${BASE_URL}/api/admin/close-event`, {
            method: 'POST',
            headers: {
                'x-admin-pass': ADMIN_PASSWORD
            },
            body: JSON.stringify({
                eventId: testEventId
            })
        });
        
        if (closeResult.ok) {
            console.log('✅ Evento encerrado com sucesso');
        } else {
            console.log('❌ Erro ao encerrar evento:', closeResult.data?.error || closeResult.error);
        }
        console.log('');
    }
    
    // Teste 6: Verificar autenticação admin
    console.log('6️⃣ Testando autenticação admin...');
    const authTest = await makeRequest(`${BASE_URL}/api/admin/list-events`, {
        method: 'GET',
        headers: {
            'x-admin-pass': 'senha-errada'
        }
    });
    
    if (authTest.status === 401) {
        console.log('✅ Autenticação admin funcionando corretamente');
    } else {
        console.log('❌ Problema na autenticação admin');
    }
    console.log('');
    
    console.log('🏁 Testes concluídos!');
}

// Verificar se o servidor está rodando
async function checkServer() {
    console.log('🔍 Verificando se o servidor está rodando...');
    
    try {
        const response = await fetch(BASE_URL);
        if (response.ok) {
            console.log('✅ Servidor está rodando\n');
            return true;
        }
    } catch (error) {
        console.log('❌ Servidor não está rodando. Execute "npm run dev" primeiro.\n');
        return false;
    }
    
    return false;
}

// Executar testes
async function main() {
    const serverRunning = await checkServer();
    
    if (serverRunning) {
        await runTests();
    } else {
        console.log('💡 Para executar os testes:');
        console.log('   1. Configure as variáveis de ambiente no .env.local');
        console.log('   2. Execute: npm run dev');
        console.log('   3. Execute: node test/test-apis.js');
    }
}

main().catch(console.error);
