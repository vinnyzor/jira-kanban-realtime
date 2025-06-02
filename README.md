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

\`\`\`bash
node >= 18
npm >= 9
\`\`\`

### Instalação

\`\`\`bash
# Clonar repositório
git clone <repo-url>
cd kanban-realtime

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
\`\`\`

### Executar em desenvolvimento

\`\`\`bash
# Iniciar ambos os servidores (WebSocket + Next.js)
npm run dev

# Ou separadamente:
npm run websocket:dev  # Terminal 1
npm run next:dev       # Terminal 2
\`\`\`

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

## 🌐 Deploy em Produção

### 1. Deploy do WebSocket Server (Railway)

\`\`\`bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login

# Criar projeto
railway new

# Deploy
railway up
\`\`\`

### 2. Deploy do Frontend (Vercel)

\`\`\`bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variável de ambiente na Vercel:
# NEXT_PUBLIC_WEBSOCKET_URL=wss://your-project.railway.app
\`\`\`

### 3. Configurar Variáveis de Ambiente

**Vercel Dashboard:**
\`\`\`
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.railway.app
\`\`\`

**Railway Dashboard:**
\`\`\`
NODE_ENV=production
PORT=3001
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página principal do Kanban
│   └── layout.tsx         # Layout global
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── task-dialog.tsx   # Modal de criação de tarefas
│   ├── online-users.tsx  # Lista de usuários online
│   └── activity-feed.tsx # Feed de atividades
├── hooks/                # Custom hooks
│   └── use-websocket.ts  # Hook para WebSocket
├── server/               # Servidor WebSocket
│   └── websocket-server.js
├── lib/                  # Utilitários
└── public/              # Assets estáticos
\`\`\`

## 🔧 Scripts Disponíveis

\`\`\`bash
npm run dev          # Desenvolvimento (WebSocket + Next.js)
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run websocket:dev # Apenas WebSocket (desenvolvimento)
npm run websocket:prod # Apenas WebSocket (produção)
\`\`\`

## 🌟 Funcionalidades Avançadas

### WebSocket Events

- `user_join` - Usuário entra no projeto
- `move_task` - Mover tarefa entre colunas
- `create_task` - Criar nova tarefa
- `update_task` - Atualizar tarefa existente
- `delete_task` - Excluir tarefa

### UI/UX Features

- **Animações suaves** durante drag & drop
- **Loading states** para operações assíncronas
- **Toast notifications** para feedback
- **Responsive design** para mobile/desktop
- **Conflict resolution** automática

## 🔒 Segurança

- **CORS** configurado para produção
- **Rate limiting** no servidor WebSocket
- **Input validation** em todas as operações
- **Error handling** robusto

## 📊 Monitoramento

- **Health checks** automáticos
- **Logs estruturados** no servidor
- **Métricas de conexão** em tempo real
- **Graceful shutdown** do servidor

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/kanban-realtime/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/kanban-realtime/wiki)
- **Discord**: [Servidor da Comunidade](https://discord.gg/seu-servidor)

---

Feito com ❤️ usando Next.js e Socket.io
