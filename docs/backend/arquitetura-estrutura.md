# Backend — Arquitetura e Estrutura

## Camadas da Aplicação

```
src/
├── app.js              ← Ponto de entrada (boot)
├── config/             ← Clientes de serviços externos
├── listeners/          ← Eventos do WhatsApp (entrada de dados)
├── services/           ← Lógica de negócio
└── utils/              ← Funções auxiliares puras
```

## Detalhamento por Arquivo

### `src/app.js`
Inicializa o cliente WPPConnect com a sessão `"Sys"`. Ao conectar, chama `startMessageListener(client)` passando a instância do cliente para o listener.

```js
// Sessão persistida em ./tokens
wppconnect.create({ session: 'Sys', puppeteerOptions: { userDataDir: './tokens' } })
```

### `src/config/supabase.js`
Cria e exporta a instância singleton do cliente Supabase. Falha explicitamente na inicialização se `SUPABASE_URL` ou `SUPABASE_KEY` estiverem ausentes.

### `src/listeners/message.js`
Orquestra o pipeline completo para cada mensagem recebida:
1. `deveIgnorarMensagem()` — descarta mensagens inválidas
2. `verificarSpam()` — bloqueia usuários abusivos
3. `registrarOuAtualizarUsuario()` — garante o usuário no banco
4. `prepararDadosMensagem()` — baixa mídias e normaliza dados
5. `adicionarAoLote()` — enfileira para processamento em batch

### `src/services/ai.js`
Integração com o Google Gemini 2.5 Flash usando **chat com histórico**. Recebe o histórico formatado do banco e inicia uma sessão de chat com ele, garantindo continuidade contextual.

```js
const chat = model.startChat({ history: historico, systemInstruction: promptSistema });
const result = await chat.sendMessage(partesAtual);
```

### `src/services/batch.js`
Implementa um buffer por usuário com **debounce de 8 segundos**. Se o usuário enviar várias mensagens rápidas, todas são agrupadas em um único lote enviado à IA.

Veja: [Processamento em Lote](../funcionalidades/processamento-em-lote.md)

### `src/services/chatHistoryService.js`
Duas operações no Supabase:
- `salvarMensagem(whatsappId, remetente, conteudo)` — persiste cada turno da conversa
- `buscarHistoricoRecente(whatsappId)` — retorna as mensagens da **última 1 hora**, formatadas para o SDK do Gemini

Veja: [Histórico de Conversa](../funcionalidades/historico-conversa.md)

### `src/services/userService.js`
`registrarOuAtualizarUsuario(whatsappId)` — faz um `UPSERT` na tabela `usuarios`. Cria o usuário na primeira mensagem, atualiza `updated_at` nas seguintes.

### `src/services/storage.js`
Salva mídias recebidas em `downloads/{tipo}/`, com nome de arquivo sanitizado a partir do `message.id`. Áudios são sempre salvos como `.ogg`.

### `src/utils/filters.js`
Retorna `true` (ignorar) para: mensagens antigas ao boot, grupos, status, stickers, broadcasts e newsletters.

### `src/utils/security.js`
Rate limiting em memória: máximo de **7 mensagens em 5 segundos**. Se excedido, bloqueia o usuário por **60 segundos**.

Veja: [Proteção contra Spam](../funcionalidades/protecao-spam.md)

### `src/utils/dataPreparer.js`
Detecta se a mensagem tem mídia válida (exceto stickers), faz o download via `client.downloadMedia()` e delega o salvamento para `storage.js`. Retorna um objeto padronizado `{ type, body, caminho }`.

## Veja também

- [Pipeline de Processamento](./endpoints.md)
- [Regras de Negócio](./regras-negocio.md)
