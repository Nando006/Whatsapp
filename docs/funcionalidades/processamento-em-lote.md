# Funcionalidade: Processamento em Lote (Batching)

## O que é?

O bot não responde cada mensagem imediatamente. Ele **agrupa** as mensagens de um mesmo usuário enviadas em sequência rápida e as processa **de uma vez**, como um único contexto para a IA.

## Por que isso existe?

Pessoas naturalmente enviam mensagens fragmentadas:

```
"Oi!"
"Tenho uma dúvida"
"pode me ajudar com uma receita de bolo?"
[foto do bolo]
```

Sem batching, a IA receberia 4 chamadas separadas e responderia 4 vezes, quebrando a conversa. Com batching, tudo chega como um único lote coerente.

## Como funciona?

### Timer de Debounce

Cada usuário tem um timer de **8 segundos** no servidor. A cada nova mensagem:
- Se não existe timer → cria e inicia os 8s
- Se já existe timer → **reinicia** os 8s

Quando o timer expira sem novas mensagens → processa o lote.

```
msg 1 ──► [buffer] ──► timer 8s
msg 2 ──► [buffer] ──► reinicia timer ──► 8s
msg 3 ──► [buffer] ──► reinicia timer ──► 8s
                                              │
                                              ▼
                                       processarLote()
```

### Consolidação do Lote

Ao processar, o buffer é separado em:

- **Texto:** todas as mensagens `type === 'chat'` são concatenadas com `\n`
- **Mídias:** caminhos dos arquivos salvos (imagens, áudios, documentos, vídeos)

Ambos são enviados juntos para a IA em uma única chamada.

### Isolamento por Usuário

Cada `chatId` (número WhatsApp) tem seu próprio buffer independente. Usuários simultâneos não interferem entre si.

## Parâmetros

| Parâmetro | Valor |
|---|---|
| Timer de debounce | **8 segundos** |
| Estrutura de buffer | `Map<chatId, { messages[], timer }>` |
| Tipos de mídia incluídos | `image`, `document`, `audio`, `ptt` |

## Implementação Técnica

- **Serviço:** [src/services/batch.js](../../src/services/batch.js)
- **Pipeline completo:** [backend/endpoints.md](../backend/endpoints.md)
