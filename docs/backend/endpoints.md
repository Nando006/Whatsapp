# Backend — Pipeline de Processamento de Mensagens

> Este projeto não expõe endpoints HTTP. O equivalente aqui é o **pipeline de eventos** disparado a cada mensagem recebida do WhatsApp.

## Evento: `onMessage`

**Disparado por:** WPPConnect, a cada mensagem recebida no WhatsApp  
**Orquestrado em:** [src/listeners/message.js](../../src/listeners/message.js)

---

### Etapa 1 — Filtragem

**Função:** `deveIgnorarMensagem(message)`  
**Arquivo:** [src/utils/filters.js](../../src/utils/filters.js)

Descarta a mensagem sem processar se qualquer uma das condições abaixo for verdadeira:

| Condição | Motivo |
|---|---|
| `message.timestamp < BOT_START_TIME` | Mensagem é anterior ao início do bot (backlog) |
| `message.isGroupMsg` | Grupos não são suportados |
| `message.isStatus` | Status nativo do WhatsApp |
| `message.type === 'sticker'` | Figurinhas não têm conteúdo processável |
| `message.from === 'status@broadcast'` | Transmissões de status |
| `message.from.includes('@newsletter')` | Canais/newsletters |
| `message.from.includes('@broadcast')` | Listas de transmissão |

---

### Etapa 2 — Anti-Spam

**Função:** `verificarSpam(message.from)`  
**Arquivo:** [src/utils/security.js](../../src/utils/security.js)

Verifica o rate limit em memória para o `chatId`. Bloqueia se exceder o limite.

Veja os limites em: [Proteção contra Spam](../funcionalidades/protecao-spam.md)

---

### Etapa 3 — Registro de Usuário

**Função:** `registrarOuAtualizarUsuario(message.from)`  
**Arquivo:** [src/services/userService.js](../../src/services/userService.js)

Faz um `UPSERT` na tabela `usuarios` garantindo que o remetente existe no banco antes de qualquer persistência de histórico.

---

### Etapa 4 — Preparação da Mensagem

**Função:** `prepararDadosMensagem(client, message)`  
**Arquivo:** [src/utils/dataPreparer.js](../../src/utils/dataPreparer.js)

**Entrada:** mensagem bruta do WPPConnect  
**Saída:** `{ type: string, body: string, caminho: string | null }`

Se for mídia (imagem, áudio, vídeo, documento):
1. Chama `client.downloadMedia(message.id)` → retorna base64
2. Delega para `saveMedia()` em [src/services/storage.js](../../src/services/storage.js)
3. Retorna o caminho do arquivo salvo em `downloads/{tipo}/`

---

### Etapa 5 — Buffer em Lote

**Função:** `adicionarAoLote(client, chatId, dadosProntos)`  
**Arquivo:** [src/services/batch.js](../../src/services/batch.js)

Empilha a mensagem no buffer do usuário e reinicia o timer de **8 segundos**. Quando o timer expira sem novas mensagens, dispara o processamento.

Veja: [Processamento em Lote](../funcionalidades/processamento-em-lote.md)

---

### Etapa 6 — Processamento do Lote (disparo assíncrono)

**Função:** `processarLote(client, chatId)` — interna ao batch  
**Arquivo:** [src/services/batch.js](../../src/services/batch.js)

Sequência ao processar um lote:

```
1. Consolida textos e caminhos de arquivos do buffer
2. salvarMensagem(chatId, 'usuario', contextoTexto)   → Supabase
3. buscarHistoricoRecente(chatId)                     → última 1h do Supabase
4. analisarComGemini(texto, arquivos, historico)      → Gemini 2.5 Flash
5. client.sendText(chatId, respostaIA)                → WhatsApp
6. salvarMensagem(chatId, 'ia', respostaIA)           → Supabase
7. fs.unlink(caminho) para cada arquivo temporário    → limpeza
```

**Guard:** O envio só ocorre se `chatId` não contiver `@broadcast`.

---

## Diagrama de Sequência Completo

```
Usuário (WhatsApp)
    │
    ├─► onMessage()
    │       │
    │       ├─[filtro]──► descarta (sem resposta)
    │       ├─[spam]───► descarta (sem resposta)
    │       │
    │       ├─► registrarOuAtualizarUsuario()
    │       ├─► prepararDadosMensagem()
    │       └─► adicionarAoLote()
    │                   │
    │                   └─ (aguarda 8s sem novas msgs)
    │                               │
    │                               ├─► salvarMensagem('usuario')
    │                               ├─► buscarHistoricoRecente()
    │                               ├─► analisarComGemini()
    │                               ├─► client.sendText()
    │                               ├─► salvarMensagem('ia')
    │                               └─► fs.unlink() [mídias]
    │
    ◄── resposta do bot
```
