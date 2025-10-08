# Configuração do Google Drive Service Account

Este documento explica como configurar uma Service Account do Google para integração com o Google Drive.

## Passo 1: Criar um Projeto no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID** para referência

## Passo 2: Habilitar a API do Google Drive

1. No menu lateral, vá para **APIs & Services** > **Library**
2. Procure por "Google Drive API"
3. Clique em **Enable** para habilitar a API

## Passo 3: Criar uma Service Account

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **Service Account**
3. Preencha os dados:
   - **Service account name**: `meu-evento-dos-sonhos`
   - **Service account ID**: será gerado automaticamente
   - **Description**: `Service account para upload de arquivos do sistema Meu Evento dos Sonhos`
4. Clique em **Create and Continue**
5. Pule as etapas de permissões (opcional)
6. Clique em **Done**

## Passo 4: Gerar Chave da Service Account

1. Na lista de Service Accounts, clique na que você criou
2. Vá para a aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione **JSON** como tipo
5. Clique em **Create**
6. O arquivo JSON será baixado automaticamente
7. **IMPORTANTE**: Guarde este arquivo com segurança, ele contém credenciais sensíveis

## Passo 5: Configurar Pasta no Google Drive

1. Acesse o [Google Drive](https://drive.google.com/)
2. Crie uma pasta chamada "Eventos" (ou o nome que preferir)
3. Clique com o botão direito na pasta e selecione **Share**
4. Adicione o email da Service Account (encontrado no arquivo JSON, campo `client_email`)
5. Defina a permissão como **Editor**
6. Clique em **Share**
7. Copie o ID da pasta da URL (parte após `/folders/`)

## Passo 6: Configurar Variáveis de Ambiente

No arquivo `.env.local`, configure:

```env
# Google Drive
DRIVE_FOLDER_ID=ID_DA_PASTA_EVENTOS_AQUI
SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

### Exemplo do SERVICE_ACCOUNT_KEY

O conteúdo do arquivo JSON baixado deve ser colocado como uma string na variável `SERVICE_ACCOUNT_KEY`:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "meu-evento-dos-sonhos@seu-projeto-123456.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Verificação da Configuração

Para verificar se tudo está funcionando:

1. Execute o sistema localmente com `npm run dev`
2. Acesse a rota `/api/admin/drive-quota` com o header `x-admin-pass`
3. Se retornar informações sobre o storage, a configuração está correta

## Segurança

- **NUNCA** commite o arquivo JSON da Service Account no repositório
- Use variáveis de ambiente para armazenar as credenciais
- No Vercel, configure as variáveis de ambiente no painel de configurações
- Mantenha as permissões da Service Account no mínimo necessário

## Troubleshooting

### Erro: "The caller does not have permission"
- Verifique se a Service Account foi adicionada à pasta do Drive
- Confirme se as permissões estão como "Editor"

### Erro: "Invalid credentials"
- Verifique se o JSON da Service Account está correto
- Confirme se a API do Google Drive está habilitada

### Erro: "Folder not found"
- Verifique se o `DRIVE_FOLDER_ID` está correto
- Confirme se a pasta existe e está compartilhada com a Service Account
