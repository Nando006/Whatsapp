// src/utils/filters.js

const BOT_START_TIME = Math.floor(Date.now() / 1000);

/**
 * Valida se uma mensagem deve ser processada pelo bot.
 */
function deveIgnorarMensagem(message) {
  const filtros = [
    message.timestamp < BOT_START_TIME, // Mensagem antiga
    message.isGroupMsg,                // Grupos
    message.isStatus,                  // Status nativo
    message.type === 'sticker',        // Figurinhas
    message.from === 'status@broadcast',
    message.from.includes('@newsletter'),
    message.from.includes('@broadcast')
  ];

  // Se qualquer uma das condições for verdadeira, devemos ignorar (true)
  return filtros.some(condicao => condicao === true);
}

module.exports = { deveIgnorarMensagem };