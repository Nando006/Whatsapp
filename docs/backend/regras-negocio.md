# Backend — Regras de Negócio

## Filtragem de Mensagens

**Onde:** [src/utils/filters.js](../../src/utils/filters.js)

- O bot ignora **qualquer mensagem com timestamp anterior ao momento em que o processo iniciou** (`BOT_START_TIME`). Isso evita processar o backlog de mensagens acumuladas antes do bot estar online.
- **Grupos são bloqueados globalmente.** O campo `message.isGroupMsg` é verificado.
- Stickers (`type === 'sticker'`) não têm conteúdo de texto ou mídia processável e são descartados.
- Mensagens de broadcasts e newsletters são descartadas para evitar respostas indevidas a listas de transmissão.

## Anti-Spam e Rate Limiting

**Onde:** [src/utils/security.js](../../src/utils/security.js)

- Limite: **7 mensagens em uma janela de 5 segundos** por usuário.
- Se o limite for excedido, o usuário é bloqueado por **60 segundos**.
- O bloqueio é em memória (não persiste entre reinicializações do bot).
- O `chatId` é a chave do mapa — cada número de WhatsApp tem sua própria janela independente.

Veja detalhes em: [Proteção contra Spam](../funcionalidades/protecao-spam.md)

## Gerenciamento de Usuários

**Onde:** [src/services/userService.js](../../src/services/userService.js)

- `registrarOuAtualizarUsuario()` é chamado **antes** de qualquer persistência de histórico.
- Usa `UPSERT` com `onConflict: 'whatsapp_id'` — nunca duplica registros.
- O trigger `update_usuarios_updated_at` no banco atualiza `updated_at` automaticamente em cada acesso.

## Processamento em Lote (Debounce)

**Onde:** [src/services/batch.js](../../src/services/batch.js)

- O timer de **8 segundos** reinicia a cada nova mensagem do mesmo usuário.
- O lote é processado **uma única vez** — o buffer é deletado do `Map` antes do processamento começar, evitando processamento duplicado.
- Mensagens de texto são concatenadas com `\n` para formar um único contexto.
- Arquivos de mídia são coletados como lista de caminhos e enviados juntos para a IA.

Veja detalhes em: [Processamento em Lote](../funcionalidades/processamento-em-lote.md)

## Análise por IA (Gemini)

**Onde:** [src/services/ai.js](../../src/services/ai.js)

- O modelo usado é `gemini-2.5-flash` — balanceando capacidade multimodal e velocidade.
- A IA recebe **histórico do banco formatado** como turnos de conversa (`user`/`model`), mantendo continuidade de contexto.
- O `systemInstruction` instrui a IA a tratar os arquivos anexados como áudio/imagem nativa — necessário porque os arquivos são enviados como `inlineData` em base64.
- A função retorna uma mensagem de erro amigável em português se a API do Gemini falhar.

## Persistência do Histórico

**Onde:** [src/services/chatHistoryService.js](../../src/services/chatHistoryService.js)

- Apenas **mensagens de texto** são salvas no histórico. Se o lote for exclusivamente de mídia sem texto, salva `'[Mídia enviada sem texto]'`.
- A consulta de histórico busca apenas os registros da **última 1 hora** (`created_at >= now() - 1h`), ordenados por data crescente.
- O histórico é formatado diretamente para o formato do SDK do Gemini: `{ role: 'user'|'model', parts: [{ text }] }`.

Veja detalhes em: [Histórico de Conversa](../funcionalidades/historico-conversa.md)

## Salvamento e Limpeza de Mídias

**Onde:** [src/services/storage.js](../../src/services/storage.js)

- Mídias são salvas em `downloads/{tipo}/{id_sanitizado}.{ext}`.
- Áudios (tipo `audio` ou `ptt`) são **sempre salvos como `.ogg`**, independente do MIME type reportado pelo WhatsApp.
- Após o envio da resposta, **todos os arquivos temporários são deletados** via `fs.unlink()`. Falhas na limpeza são silenciosas para não interromper o fluxo.
- O nome do arquivo é sanitizado removendo caracteres não alfanuméricos do `message.id`.

## Guard de Broadcast

**Onde:** [src/services/batch.js](../../src/services/batch.js) — função `processarLote`

```js
if (!chatId.includes('@broadcast')) {
  await client.sendText(chatId, respostaIA);
  await salvarMensagem(chatId, 'ia', respostaIA);
}
```

Mesmo que um broadcast passe pelos filtros iniciais, o envio de resposta é bloqueado aqui como segunda camada de segurança.
