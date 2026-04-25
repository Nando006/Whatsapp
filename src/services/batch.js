// Cuida exclusivamente da "caixa de espera" (Buffer). Decide quando o lote está pronto e chama a IA
const fs = require('fs').promises;
const { analisarComGemini } = require('./ai');

const messageBuffer = new Map();

async function adicionarAoLote(client, chatId, messageData) {
  if (!messageBuffer.has(chatId)) {
    messageBuffer.set(chatId, { messages: [], timer: null });
  }

  const session = messageBuffer.get(chatId);
  session.messages.push(messageData);

  console.log(`⏳ Mensagem de ${chatId} no buffer. Total: ${session.messages.length}`);

  clearTimeout(session.timer);
  session.timer = setTimeout(() => processarLote(client, chatId), 8000);
}

async function processarLote(cliente, chatId) {
  const session = messageBuffer.get(chatId);
  if (!session) return;

  const messages = [...session.messages];
  messageBuffer.delete(chatId);

  console.log(`🚀 Processando lote de ${messages.length} mensagens para ${chatId}`);

  let contextoTexto = "";
  let caminhosArquivos = [];

  for (const msg of messages) {
    if (msg.caminho) {
      if (['image', 'document', 'audio', 'ptt'].includes(msg.type)) {
        caminhosArquivos.push(msg.caminho);
      }
    } else if (msg.type === 'chat') {
      contextoTexto += `${msg.body}\n`;
    }
  }

  const respostaIA = await analisarComGemini(contextoTexto, caminhosArquivos);

  // Fail-safe de segurança
  if (!chatId.includes('@broadcast')) {
    await client.sendText(chatId, respostaIA);
    console.log(`✅ Resposta enviada para ${chatId}!`);
  }

  // Limpeza automática
  for (const caminho of caminhosArquivos) {
    try { await fs.unlink(caminho); } catch (e) { }
  }
}

module.exports = { adicionarAoLote };