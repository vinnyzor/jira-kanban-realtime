#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Iniciando deploy do servidor WebSocket...")

// Verificar se Railway CLI está instalado
try {
  execSync("railway --version", { stdio: "ignore" })
} catch (error) {
  console.error("❌ Railway CLI não encontrado. Instale com: npm install -g @railway/cli")
  process.exit(1)
}

// Verificar se está logado no Railway
try {
  execSync("railway whoami", { stdio: "ignore" })
} catch (error) {
  console.error("❌ Não está logado no Railway. Execute: railway login")
  process.exit(1)
}

// Verificar se existe projeto Railway
const hasProject = fs.existsSync(".railway")

if (!hasProject) {
  console.log("📦 Criando novo projeto no Railway...")
  execSync("railway new", { stdio: "inherit" })
}

// Configurar variáveis de ambiente
console.log("⚙️ Configurando variáveis de ambiente...")
execSync("railway variables set NODE_ENV=production", { stdio: "inherit" })
execSync("railway variables set PORT=3001", { stdio: "inherit" })

// Deploy
console.log("🚀 Fazendo deploy...")
execSync("railway up", { stdio: "inherit" })

// Obter URL do projeto
try {
  const domain = execSync("railway domain", { encoding: "utf8" }).trim()
  const websocketUrl = `wss://${domain}`

  console.log("\n✅ Deploy concluído!")
  console.log(`🌐 URL do WebSocket: ${websocketUrl}`)
  console.log("\n📝 Próximos passos:")
  console.log(`1. Configure a variável NEXT_PUBLIC_WEBSOCKET_URL=${websocketUrl} na Vercel`)
  console.log("2. Faça o deploy do frontend: vercel --prod")
  console.log("3. Teste a aplicação!")
} catch (error) {
  console.log("\n✅ Deploy concluído!")
  console.log("🔧 Configure o domínio personalizado no Railway Dashboard")
}
