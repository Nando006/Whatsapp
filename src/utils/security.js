// src/utils/security.js

const rateLimitMap = new Map();

const CONFIG = {
  MAX_MESSAGES: 7,       // Limite de mensagens
  TIME_WINDOW: 5000,     // Janela de 5 segundos
  PENALTY_TIME: 60000    // Castigo de 60 segundos
};

/**
 * Verifica se o usuário excedeu o limite de mensagens.
 * @param {string} chatId - ID do usuário.
 * @returns {boolean} - Retorna 'true' se o usuário estiver bloqueado.
 */
function verificarSpam(chatId) {
  const now = Date.now();
  let rateData = rateLimitMap.get(chatId) || { count: 0, startTime: now, blockedUntil: 0 };

  // 1. Verifica se o usuário ainda está no período de castigo
  if (now < rateData.blockedUntil) {
    return true;
  }

  // 2. Reseta o contador se a janela de tempo expirou
  if (now - rateData.startTime > CONFIG.TIME_WINDOW) {
    rateData.count = 1;
    rateData.startTime = now;
  } else {
    rateData.count++;

    // 3. Verifica se estourou o limite
    if (rateData.count > CONFIG.MAX_MESSAGES) {
      console.warn(`🚨 SPAM DETECTADO de ${chatId}. Bloqueado por ${CONFIG.PENALTY_TIME / 1000}s.`);
      rateData.blockedUntil = now + CONFIG.PENALTY_TIME;
      rateLimitMap.set(chatId, rateData);
      return true;
    }
  }

  rateLimitMap.set(chatId, rateData);
  return false;
}

module.exports = { verificarSpam };