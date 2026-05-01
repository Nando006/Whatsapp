// src/listeners/message.js
const { adicionarAoLote } = require('../services/batch');
const { deveIgnorarMensagem } = require('../utils/filters');
const { verificarSpam } = require('../utils/security');
const { prepararDadosMensagem } = require('../utils/dataPreparer');
const { registrarOuAtualizarUsuario } = require('../services/userService');

function startMessageListener(client) {
  client.onMessage(async (message) => {

    // Filtragem (Filtra o que não interessa)
    if (deveIgnorarMensagem(message)) return;

    // Segurança (Protege contra spam)
    if (verificarSpam(message.from)) return;

    // Registrar mensagem no banco de dados
    await registrarOuAtualizarUsuario(message.from);

    // Preparação (Trata download e formatação)
    const dadosProntos = await prepararDadosMensagem(client, message);

    // Ação (Agrupa para análise)
    adicionarAoLote(client, message.from, dadosProntos);
  });
}

module.exports = { startMessageListener };