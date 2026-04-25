// src/utils/dataPreparer.js
const { saveMedia } = require('../services/storage');

/**
 * Prepara e normaliza os dados da mensagem, realizando o download se houver mídia.
 */
async function prepararDadosMensagem(client, message) {
  let caminhoSalvo = null;
  const tiposMidiaPermitidos = ['image', 'video', 'document', 'audio', 'ptt'];

  // Verifica se a mensagem contém mídia e se o tipo é um dos que queremos processar
  const temMidiaValida = (message.isMedia || tiposMidiaPermitidos.includes(message.type)) && message.type !== 'sticker';

  if (temMidiaValida) {
    try {
      // Faz o download e salva usando o serviço de storage que já temos
      const base64Data = await client.downloadMedia(message.id);
      caminhoSalvo = await saveMedia(message, base64Data);
    } catch (error) {
      console.error(`❌ Erro ao preparar mídia (${message.type}):`, error);
    }
  }

  // Retorna o objeto "limpo" para ser usado no lote
  return {
    type: message.type,
    body: message.body,
    caminho: caminhoSalvo
  };
}

module.exports = { prepararDadosMensagem };