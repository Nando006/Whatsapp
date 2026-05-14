const wppconnect = require('@wppconnect-team/wppconnect');

// ==========================================
// EDITE AQUI ANTES DE EXECUTAR
// ==========================================
const MENSAGEM_PADRAO = 'Olá! Aqui vai sua mensagem geral.';

const NUMEROS = [
  { numero: '5511999999999', mensagem: 'Oi João! Mensagem personalizada pra você.' },
  { numero: '5521988888888' }, // sem mensagem → usa MENSAGEM_PADRAO
  '5541977777777',             // string simples → também usa MENSAGEM_PADRAO
];
// ==========================================

const INTERVALO_MS = 10000; // 10 segundos

function formatarNumero(numero) {
  const limpo = numero.replace(/\D/g, '');
  return `${limpo}@c.us`;
}

function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enviarEmMassa(client, numeros, mensagem) {
  const total = numeros.length;
  console.log(`📋 Iniciando envio para ${total} número(s)...\n`);

  for (let i = 0; i < numeros.length; i++) {
    const item = numeros[i];
    const numero = typeof item === 'string' ? item : item.numero;
    const texto = (typeof item === 'object' && item.mensagem) ? item.mensagem : mensagem;
    const chatId = formatarNumero(numero);

    try {
      await client.sendText(chatId, texto);
      console.log(`✅ [${i + 1}/${total}] Enviado para ${chatId}`);
    } catch (erro) {
      console.error(`❌ [${i + 1}/${total}] Falha para ${chatId}:`, erro.message);
    }

    if (i < numeros.length - 1) {
      console.log(`⏳ Aguardando ${INTERVALO_MS / 1000}s antes do próximo...`);
      await aguardar(INTERVALO_MS);
    }
  }

  console.log('\n🎉 Envio em massa concluído!');
}

wppconnect.create({
  session: 'Sys',
  puppeteerOptions: { userDataDir: './tokens' },
  catchQR: (base64Qr, asciiQR) => {
    console.log('QR Code necessário (sessão expirada):\n', asciiQR);
  },
}).then(async (client) => {
  await enviarEmMassa(client, NUMEROS, MENSAGEM_PADRAO);
  await client.close();
  process.exit(0);
}).catch((erro) => {
  console.error('❌ Erro ao iniciar sessão:', erro);
  process.exit(1);
});
