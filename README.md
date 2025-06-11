# 🚀 Kanban Board com WebSocket Real-time

Uma aplicação Kanban sofisticada com colaboração em tempo real usando WebSockets, Next.js 14 e Socket.io.

## ✨ Funcionalidades

- 🔄 **Colaboração em tempo real** com WebSockets
- 🎯 **Drag & Drop** de tarefas entre colunas
- 👥 **Usuários online** em tempo real
- 📊 **Feed de atividades** ao vivo
- 🎨 **Design moderno** e responsivo
- ⚡ **UI Otimista** com rollback automático
- 🔧 **Resolução de conflitos** inteligente

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Real-time**: Socket.io, WebSockets
- **Drag & Drop**: @hello-pangea/dnd
- **Deploy**: Vercel (Frontend) + Railway (WebSocket)

## 🚀 Desenvolvimento

### Pré-requisitos

```bash
node >= 18
npm >= 9
```

### Instalação

# Clonar repositório

```bash
git clone https://github.com/vinnyzor/jira-kanban-realtime.git
cd kanban-realtime
```

# Instalar dependências

```bash
npm install
```

# Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

### Executar em desenvolvimento

# Iniciar ambos os servidores (WebSocket + Next.js)

```bash
npm run dev
```

# Ou separadamente:

```bash
npm run websocket:dev # Terminal 1
npm run next:dev # Terminal 2
```

A aplicação estará disponível em:

- **Frontend**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

## 🌐 Deploy em Produção

### 1. Deploy do WebSocket Server (Railway)

# Instalar Railway CLI

```bash
npm install -g @railway/cli
```

# Login no Railway

```bash
railway login
```

# Criar projeto

```bash
railway new
```

# Deploy

```bash
railway up
```

### 2. Deploy do Frontend (Vercel)

# Instalar Vercel CLI

```bash
npm install -g vercel
```

# Deploy

```bash
vercel
```

# Configurar variável de ambiente na Vercel:

```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-project.railway.app
```

### 3. Configurar Variáveis de Ambiente

**Vercel Dashboard:**

```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.railway.app
```

**Railway Dashboard:**

```bash
NODE_ENV=production
PORT=3001
```

## 📁 Estrutura do Projeto

```plaintext
app/                  # Next.js App Router
  ├─ page.tsx         # Página principal do Kanban
  └─ layout.tsx       # Layout global
components/           # Componentes React
  └─ ui/              # Componentes base (shadcn/ui)
  └─ task-dialog.tsx  # Modal de criação de tarefas
  └─ online-users.tsx # Lista de usuários online
  └─ activity-feed.tsx# Feed de atividades
hooks/                # Custom hooks
  └─ use-websocket.ts # Hook para WebSocket
server/               # Servidor WebSocket
  └─ websocket-server.js
lib/                  # Utilitários
public/               # Assets estáticos
```
