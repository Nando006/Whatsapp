const wppconnect = require('@wppconnect-team/wppconnect');
const { startMessageListener } = require('./listeners/message');

wppconnect.create({
  session: 'Sys',
  // Redireciona a criação dos tokens de sessão para a pasta "tokens"
  puppeteerOptions: { userDataDir: './tokens' },
  catchQR: (base64Qr, asciiQR) => {
    console.log(asciiQR); // Mostra o QR Code no terminal
  },
}).then((client) => {
  console.log('WPPConnect inicializado com sucesso!');
  // Chama o escutador passando a instância do cliente
  startMessageListener(client);
}).catch((error) => console.log('Erro ao criar sessão:', error));