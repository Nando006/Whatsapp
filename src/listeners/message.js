const { saveMedia } = require('../services/storage');
const { analisarComGemini } = require('../services/ai');

const messageBuffer = new Map();
const rateLimit = new Map();

// Registra o timestamp de quando o arquivo foi carregado (em segundos, como WhatsApp usa)
const BOT_START_TIME = Math.floor(Date.now() / 1000);

const MAX_MESSAGES = 7;
const TIME_WINDOW = 5000;
const PENALTY_TIME = 60000;

function startMessageListener(client) {
  client.onMessage(async (message) => {
    // Se o tempo da mensagem for menor que o tempo que bot ligou, ignoramos.
    if (message.timestamp < BOT_START_TIME) {
      return;
    }

    // Filtro melhorado para ignorar Grupos, Status e Canais/Newsletters
    if (
      message.isGroupMsg ||
      message.from === 'status@broadcast' ||
      message.from.includes('@newsletter') ||
      message.from.includes('@broadcast')
    ) {
      return;
    }

    const chatId = message.from;
    const now = Date.now();

    // ==========================================
    // 1. CAMADA DE SEGURANÇA (RATE LIMITER)
    // ==========================================
    let rateData = rateLimit.get(chatId) || { count: 0, startTime: now, blockedUntil: 0 };

    if (now < rateData.blockedUntil) return;

    if (now - rateData.startTime > TIME_WINDOW) {
      rateData.count = 1;
      rateData.startTime = now;
    } else {
      rateData.count++;
      if (rateData.count > MAX_MESSAGES) {
        console.warn(`🚨 SPAM DETECTADO de ${chatId}. Ignorando por ${PENALTY_TIME / 1000} segundos.`);
        rateData.blockedUntil = now + PENALTY_TIME;
        if (messageBuffer.has(chatId)) {
          clearTimeout(messageBuffer.get(chatId).timer);
          messageBuffer.delete(chatId);
        }
        rateLimit.set(chatId, rateData);
        return;
      }
    }
    rateLimit.set(chatId, rateData);

    // ==========================================
    // 2. DOWNLOAD IMEDIATO (Corrige o erro msgChunks)
    // ==========================================
    let caminhoSalvo = null;
    const isMediaFile = message.isMedia || ['image', 'video', 'document', 'audio', 'ptt'].includes(message.type);

    if (isMediaFile) {
      try {
        console.log(`📥 Baixando mídia (${message.type}) em tempo real...`);
        // Passamos message.id explicitamente para garantir a referência correta
        const base64Data = await client.downloadMedia(message.id);
        caminhoSalvo = await saveMedia(message, base64Data);
      } catch (error) {
        console.error(`❌ Erro ao baixar mídia instantânea:`, error);
      }
    }

    // ==========================================
    // 3. LÓGICA DE BUFFERING (Agrupamento)
    // ==========================================
    if (!messageBuffer.has(chatId)) {
      messageBuffer.set(chatId, { messages: [], timer: null });
    }

    const userSession = messageBuffer.get(chatId);

    // Salvamos apenas um objeto leve no buffer, em vez da mensagem gigante do WhatsApp
    userSession.messages.push({
      type: message.type,
      body: message.body,
      caminho: caminhoSalvo // Vai ser null se for texto, ou o path do arquivo se for mídia
    });

    console.log(`⏳ Mensagem de ${chatId} adicionada ao buffer. Total: ${userSession.messages.length}`);

    clearTimeout(userSession.timer);

    userSession.timer = setTimeout(async () => {
      const batch = [...userSession.messages];
      messageBuffer.delete(chatId);

      console.log(`\n🚀 Iniciando processamento do lote: ${batch.length} mensagens de ${chatId}`);

      // Agora passamos o chatId como parâmetro também
      await processarLote(client, chatId, batch);

    }, 8000);
  });
}

// Atualizamos os parâmetros para receber o chatId direto
async function processarLote(client, chatId, messages) {
  let contextoTexto = "";
  let caminhosArquivos = [];

  // 1. Varre o lote. Como já baixamos os arquivos, só precisamos separá-los!
  for (const msg of messages) {
    if (msg.caminho) {
      // Se a mensagem tem um caminho, é uma mídia que já foi salva
      if (['image', 'document', 'audio', 'ptt'].includes(msg.type)) {
        caminhosArquivos.push(msg.caminho);
      }
    } else if (msg.type === 'chat' && msg.body) {
      contextoTexto += `${msg.body}\n`;
    }
  }

  console.log(`\n🧠 Enviando dados para o Gemini (Textos: ${contextoTexto.length > 0}, Arquivos: ${caminhosArquivos.length})...`);

  // 2. Chama a IA
  const respostaIA = await analisarComGemini(contextoTexto, caminhosArquivos);

  // 3. Responde o usuário
  await client.sendText(chatId, respostaIA);

  console.log(`✅ Resposta enviada com sucesso para ${chatId}!\n`);
}

module.exports = { startMessageListener };