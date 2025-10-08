# Meu Evento dos Sonhos - Sistema de Upload de Arquivos

Este é um sistema completo para upload de arquivos de eventos, projetado para ser simples para o cliente final e robusto para o administrador. A arquitetura utiliza frontend estático, backend com Vercel Serverless Functions, Google Drive para armazenamento de arquivos e Supabase para gerenciamento de metadados.

## ✨ Funcionalidades

### Para Clientes (Público)
- **Interface Simples**: Uma página única onde o cliente digita seu nome e seleciona os arquivos.
- **Upload Múltiplo**: Permite o envio de múltiplas fotos e vídeos de uma só vez.
- **Feedback Visual**: Interface moderna com feedback de progresso, sucesso e erro.
- **Sem Login**: Não exige nenhuma autenticação do cliente, facilitando o compartilhamento.

### Para Administradores
- **Painel de Controle**: Uma página `admin.html` protegida por senha para gerenciar o sistema.
- **Criação de Eventos**: Crie novos eventos, que automaticamente se tornam o evento ativo para uploads.
- **Encerramento de Eventos**: Encerre um evento, impedindo novos uploads para ele.
- **Listagem de Eventos**: Visualize todos os eventos, seus status (ativo/inativo) e a contagem de uploads.
- **Monitoramento de Quota**: Verifique o uso e o limite de armazenamento da sua conta do Google Drive.

## 🚀 Arquitetura

- **Frontend**: HTML, CSS e JavaScript puros, localizados na pasta `/public`.
- **Backend**: Funções Serverless Node.js na pasta `/api`, prontas para deploy na Vercel.
- **Banco de Dados**: [Supabase](https://supabase.com/) para armazenar metadados de eventos e uploads.
- **Armazenamento**: [Google Drive](https://www.google.com/drive/) para guardar os arquivos enviados.

## 📂 Estrutura de Pastas

```
meu-evento-dos-sonhos/
│
├── api/                    # Funções Serverless (Backend)
│   ├── upload.js           # API para upload de arquivos
│   └── admin/              # APIs de administração
│       ├── create-event.js
│       ├── list-events.js
│       ├── close-event.js
│       └── drive-quota.js
│
├── public/                 # Arquivos estáticos (Frontend)
│   ├── index.html          # Página principal de upload
│   ├── admin.html          # Painel de administração
│   ├── style.css           # Estilos
│   └── app.js              # Lógica do frontend
│
├── database/
│   └── setup.sql           # Script para criar tabelas no Supabase
│
├── docs/
│   ├── google-drive-setup.md # Guia de configuração do Google Drive
│   └── supabase-setup.md     # Guia de configuração do Supabase
│
├── test/
│   └── test-apis.js        # Script para testar as APIs
│
├── .env.local              # Arquivo para variáveis de ambiente (NÃO versionar)
├── .gitignore              # Arquivos e pastas a serem ignorados pelo Git
├── package.json            # Dependências e scripts do projeto
├── vercel.json             # Configuração de deploy para a Vercel
└── README.md               # Este arquivo
```

## 🛠️ Como Configurar e Executar

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma conta no [Supabase](https://supabase.com/)
- Uma conta no [Google Cloud](https://console.cloud.google.com/)

### 2. Configuração do Supabase

1. Crie um novo projeto no Supabase.
2. Vá para o **SQL Editor** e execute o script de `database/setup.sql` para criar as tabelas `events` e `uploads`.
3. Vá para **Settings > API** e anote a **URL do Projeto** e a chave **anon public**.
4. Siga o guia detalhado em `docs/supabase-setup.md`.

### 3. Configuração do Google Drive

1. Crie um projeto no Google Cloud Console.
2. Ative a **Google Drive API**.
3. Crie uma **Service Account** e gere uma chave JSON.
4. Crie uma pasta no Google Drive e compartilhe-a com o email da Service Account (dando permissão de **Editor**).
5. Anote o ID da pasta.
6. Siga o guia detalhado em `docs/google-drive-setup.md`.

### 4. Variáveis de Ambiente

1. Renomeie o arquivo `.env.local.example` para `.env.local`.
2. Preencha as seguintes variáveis com as informações obtidas nos passos anteriores:

```env
# Configurações do Supabase
SUPABASE_URL=URL_DO_SEU_PROJETO_SUPABASE
SUPABASE_KEY=SUA_CHAVE_ANON_PUBLIC_DO_SUPABASE

# Google Drive
DRIVE_FOLDER_ID=ID_DA_PASTA_RAIZ_NO_GOOGLE_DRIVE
SERVICE_ACCOUNT_KEY=CONTEÚDO_COMPLETO_DO_ARQUIVO_JSON_DA_SERVICE_ACCOUNT

# Administração
ADMIN_PASSWORD=UMA_SENHA_FORTE_PARA_O_PAINEL_ADMIN
```

**Importante**: O valor de `SERVICE_ACCOUNT_KEY` deve ser o conteúdo completo do arquivo JSON, em uma única linha.

### 5. Instalação e Execução

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Instale a CLI da Vercel** (se ainda não tiver):
   ```bash
   npm install -g vercel
   ```

3. **Execute o ambiente de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. O sistema estará disponível em `http://localhost:3000`.

## 🚀 Deploy na Vercel

1. Faça o deploy do seu projeto para um repositório no GitHub/GitLab/Bitbucket.
2. Crie um novo projeto na [Vercel](https://vercel.com/) e importe seu repositório.
3. A Vercel deve detectar automaticamente que é um projeto Node.js.
4. Configure as **variáveis de ambiente** no painel de configurações do projeto na Vercel (copie os valores do seu `.env.local`).
5. Faça o deploy. Suas funções serverless e seu frontend estarão online.

## ✅ Testando o Sistema

- **Frontend**: Acesse `http://localhost:3000` para ver a página de upload.
- **Painel Admin**: Acesse `http://localhost:3000/admin.html` para gerenciar os eventos.
- **Testes de API**: Com o servidor rodando (`npm run dev`), execute o script de teste em outro terminal:
  ```bash
  node test/test-apis.js
  ```
  Este script verificará todas as rotas da API e a autenticação.

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

