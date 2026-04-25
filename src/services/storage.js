const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

async function saveMedia(message, base64Data) {
  let mimeType = message.mimetype || 'application/octet-stream';
  let base64Conteudo = base64Data;
  
  if (base64Data.includes('base64,')) {
    // Corta a string exatamente onde está escrito 'base64,' e pega só os dados brutos (índice 1)
    base64Conteudo = base64Data.split('base64,')[1];
  }

  // Agora sim, o buffer vai gerar um arquivo 100% puro e saudável!
  const buffer = Buffer.from(base64Conteudo, 'base64');
  let extension = mime.extension(mimeType) || 'bin';

  // Mantemos a garantia de que áudios serão salvos como .ogg
  if (message.type === 'audio' || message.type === 'ptt') {
    extension = 'ogg';
  }

  let folderName = 'documents';
  if (message.type === 'image') folderName = 'images';
  if (message.type === 'video') folderName = 'videos';
  if (message.type === 'audio' || message.type === 'ptt') folderName = 'audios';

  const safeFileName = `${message.id.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
  const destPath = path.join(__dirname, '../../downloads', folderName, safeFileName);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);

  console.log(`💾 Arquivo salvo com sucesso em: ${destPath}`);
  return destPath;
}

module.exports = { saveMedia };