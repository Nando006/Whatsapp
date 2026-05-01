const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config();

// Inicializa o SDK com a chave do seu .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Função auxiliar para converter o arquivo salvo no formato que a API do Google exige
function formatarArquivoParaIA(caminhoArquivo) {
  let mimeType = mime.lookup(caminhoArquivo);

  // Vamos ignorar a biblioteca e forçar o formato com base na pasta de destino!
  // Se caiu na pasta de áudios (seja .oga, .ogg, .mp3, .bin), nós garantimos que é um áudio OGG
  if (caminhoArquivo.includes('audios')) {
    mimeType = 'audio/ogg';
  } else if (caminhoArquivo.includes('images')) {
    mimeType = mimeType || 'image/jpeg';
  } else if (caminhoArquivo.includes('videos')) {
    mimeType = mimeType || 'video/mp4';
  }

  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(caminhoArquivo)).toString("base64"),
      mimeType: mimeType || 'application/octet-stream'
    },
  };
}

async function analisarComGemini(textoUsuario, caminhosArquivos = [], historico = []) {
  try {
    const promptSistema = `Você é um assistente de IA altamente avançado.
        INSTRUÇÃO CRÍTICA: Você possui capacidade nativa de OUVIR áudios e VER imagens. Os arquivos foram extraídos e enviados em anexo para você nesta requisição.
        Se o usuário tiver enviado um áudio, ESCUTE atentamente o arquivo anexado e responda à pergunta ou comando contido na voz dele.`;

    // 1. Iniciamos o chat com o histórico prévio e o prompt de sistema
    const chat = model.startChat({
      history: historico,
      systemInstruction: promptSistema // O Gemini mais recente permite systemInstruction no startChat
    });

    // 2. Montamos a requisição atual do usuário
    const partesAtual = [];
    
    // Texto atual (seja ele o contexto da batch ou fallback se for áudio)
    partesAtual.push(textoUsuario || '[O usuário enviou uma mensagem de voz/mídia. Analise o arquivo em anexo e responda diretamente.]');

    // Arquivos atuais anexados na batch
    for (const caminho of caminhosArquivos) {
      partesAtual.push(formatarArquivoParaIA(caminho));
    }

    // 3. Enviamos a mensagem para o chat ativo (que já tem o histórico)
    const result = await chat.sendMessage(partesAtual);
    return result.response.text();

  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return "Desculpe, tive um problema para processar sua mensagem agora.";
  }
}

module.exports = { analisarComGemini };