// src/listeners/message.js
const { adicionarAoLote } = require('../services/batch');
const { deveIgnorarMensagem } = require('../utils/filters');
const { verificarSpam } = require('../utils/security');
const { prepararDadosMensagem } = require('../utils/dataPreparer');

function startMessageListener(client) {
  client.onMessage(async (message) => {

    // 1. Filtragem (Filtra o que não interessa)
    if (deveIgnorarMensagem(message)) return;

    // 2. Segurança (Protege contra spam)
    if (verificarSpam(message.from)) return;

    // 3. Preparação (Trata download e formatação)
    const dadosProntos = await prepararDadosMensagem(client, message);

    // 4. Ação (Agrupa para análise)
    adicionarAoLote(client, message.from, dadosProntos);
  });
}

module.exports = { startMessageListener };