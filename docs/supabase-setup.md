# Configuração do Supabase

Este documento explica como configurar o Supabase para o sistema "Meu Evento dos Sonhos".

## Passo 1: Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com/)
2. Clique em **Start your project**
3. Faça login com GitHub, Google ou email
4. Crie uma nova organização se necessário

## Passo 2: Criar Novo Projeto

1. No dashboard, clique em **New Project**
2. Preencha os dados:
   - **Name**: `meu-evento-dos-sonhos`
   - **Database Password**: Crie uma senha forte e anote
   - **Region**: Escolha a região mais próxima (ex: South America)
3. Clique em **Create new project**
4. Aguarde alguns minutos para o projeto ser criado

## Passo 3: Obter Credenciais

1. No dashboard do projeto, vá para **Settings** > **API**
2. Anote as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: Chave pública para uso no frontend
   - **service_role secret**: Chave secreta para uso no backend (não usar no frontend)

## Passo 4: Configurar Banco de Dados

1. Vá para **SQL Editor** no menu lateral
2. Clique em **New query**
3. Cole o conteúdo do arquivo `database/setup.sql`
4. Clique em **Run** para executar o script
5. Verifique se as tabelas foram criadas em **Table Editor**

## Passo 5: Configurar Variáveis de Ambiente

No arquivo `.env.local`, configure:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica-aqui
```

### Qual chave usar?

- **Frontend**: Use a `anon public key`
- **Backend/API**: Use a `anon public key` (para este projeto)
- **Operações administrativas**: Use a `service_role secret` se necessário

## Passo 6: Configurar Row Level Security (RLS)

O script SQL já configura as políticas básicas de segurança:

- **Eventos**: Leitura pública apenas para eventos ativos
- **Uploads**: Inserção e leitura públicas (ajuste conforme necessário)

### Personalizar Políticas (Opcional)

Se quiser restringir mais o acesso:

1. Vá para **Authentication** > **Policies**
2. Selecione a tabela desejada
3. Edite ou crie novas políticas conforme necessário

## Passo 7: Verificar Configuração

Para testar a conexão:

1. Execute o sistema localmente com `npm run dev`
2. Tente criar um evento via API admin
3. Verifique se os dados aparecem no **Table Editor** do Supabase

## Estrutura das Tabelas

### Tabela `events`
- `id`: Identificador único (auto-incremento)
- `name`: Nome do evento
- `drive_folder_id`: ID da pasta no Google Drive
- `active`: Se o evento está ativo para receber uploads
- `created_at`: Data de criação

### Tabela `uploads`
- `id`: Identificador único (auto-incremento)
- `event_id`: Referência ao evento
- `original_name`: Nome original do arquivo
- `stored_name`: Nome armazenado no Drive
- `guest_name`: Nome do convidado
- `drive_file_id`: ID do arquivo no Drive
- `drive_link`: Link público do arquivo
- `mime_type`: Tipo do arquivo
- `size_bytes`: Tamanho em bytes
- `created_at`: Data do upload

## Monitoramento

### Logs
- Vá para **Logs** > **API** para ver requisições
- Use **Logs** > **Database** para ver queries SQL

### Métricas
- **Reports** mostra estatísticas de uso
- Monitore o número de requisições e storage usado

## Backup e Segurança

### Backup Automático
- Supabase faz backup automático diário
- Backups ficam disponíveis por 7 dias no plano gratuito

### Segurança
- Use HTTPS sempre
- Configure CORS adequadamente
- Monitore logs para atividades suspeitas
- Use RLS para controlar acesso aos dados

## Limites do Plano Gratuito

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB
- **Requests**: 50,000/mês

Para projetos maiores, considere upgrade para plano pago.

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se a `SUPABASE_KEY` está correta
- Confirme se está usando a chave pública (`anon`)

### Erro: "relation does not exist"
- Execute o script `setup.sql` no SQL Editor
- Verifique se as tabelas foram criadas

### Erro: "Row Level Security"
- Verifique as políticas RLS
- Temporariamente desabilite RLS para testar: `ALTER TABLE nome_tabela DISABLE ROW LEVEL SECURITY;`

### Performance lenta
- Verifique se os índices foram criados
- Monitore queries lentas nos logs
- Considere otimizar consultas complexas
