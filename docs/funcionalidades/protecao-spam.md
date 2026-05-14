# Funcionalidade: Proteção contra Spam

## O que é?

Um sistema de **rate limiting em memória** que detecta e bloqueia usuários que enviam mensagens em volume abusivo, protegendo a cota da API do Gemini e garantindo disponibilidade para todos.

## Como funciona?

### Janela deslizante

Para cada usuário, o sistema rastreia:
- `count` — quantidade de mensagens na janela atual
- `startTime` — quando a janela começou
- `blockedUntil` — até quando o usuário está bloqueado (0 = não bloqueado)

A janela tem **5 segundos**. Se o usuário enviar mais de **7 mensagens** nessa janela, é bloqueado por **60 segundos**.

### Fluxo de verificação

```
verificarSpam(chatId)
│
├─► Está bloqueado? (now < blockedUntil)
│       └─► sim → retorna true (ignorar mensagem)
│
├─► Janela expirou? (now - startTime > 5000ms)
│       └─► sim → reseta contador (count = 1)
│
└─► Incrementa contador
        └─► count > 7?
                └─► sim → define blockedUntil = now + 60s → retorna true
                └─► não → retorna false (processar normalmente)
```

### Comportamento durante o bloqueio

Mensagens enviadas durante o período de bloqueio são **silenciosamente descartadas** — o bot não responde e não notifica o usuário. O bloqueio é automático.

## Parâmetros

| Parâmetro | Valor | Constante |
|---|---|---|
| Limite de mensagens | 7 | `CONFIG.MAX_MESSAGES` |
| Janela de tempo | 5 segundos | `CONFIG.TIME_WINDOW` |
| Tempo de bloqueio | 60 segundos | `CONFIG.PENALTY_TIME` |

## Limitações

- **Em memória:** o estado de bloqueio não persiste. Reiniciar o bot libera todos os usuários bloqueados.
- **Por processo:** em caso de múltiplas instâncias do bot, cada uma teria seu próprio contador.

## Implementação Técnica

- **Utilitário:** [src/utils/security.js](../../src/utils/security.js)
- **Chamado em:** [src/listeners/message.js](../../src/listeners/message.js) — Etapa 2 do pipeline
- **Regras do pipeline:** [backend/endpoints.md](../backend/endpoints.md)
