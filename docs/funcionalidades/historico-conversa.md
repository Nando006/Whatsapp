# Funcionalidade: Histórico de Conversa

## O que é?

O bot mantém **memória das últimas mensagens** de cada usuário. Antes de responder, ele recupera as mensagens trocadas na última hora e as repassa para a IA como contexto, permitindo conversas coerentes e contínuas.

## Por que isso importa?

Sem histórico, cada mensagem seria tratada de forma isolada. Com ele:
- O usuário pode fazer perguntas de acompanhamento ("e quanto ao segundo ponto?")
- A IA lembra de informações fornecidas anteriormente ("como eu disse, meu nome é João")
- A conversa flui de forma natural, como um chat real

## Como funciona?

### 1. Salvar cada turno

Toda mensagem processada — do usuário e da IA — é salva na tabela `historico_mensagens`:

```
Usuário envia → salvarMensagem(chatId, 'usuario', texto)
IA responde  → salvarMensagem(chatId, 'ia', resposta)
```

### 2. Buscar o histórico antes de responder

Antes de chamar a IA, o sistema busca os turnos da última 1 hora:

```
buscarHistoricoRecente(chatId)
→ Supabase: SELECT WHERE created_at >= (agora - 1h) ORDER BY created_at ASC
→ Retorna lista formatada para o Gemini
```

### 3. Enviar para a IA com contexto

O histórico é passado ao iniciar o chat com o Gemini:

```js
model.startChat({
  history: historico,  // ← turnos anteriores
  systemInstruction: "..."
})
```

O Gemini recebe o contexto completo e responde considerando tudo que foi dito.

## Janela de Tempo

| Parâmetro | Valor |
|---|---|
| Janela de histórico | **Última 1 hora** |
| Conversas mais antigas | Ignoradas (IA começa sem contexto) |

## Implementação Técnica

- **Serviço:** [src/services/chatHistoryService.js](../../src/services/chatHistoryService.js)
- **Tabela:** [historico_mensagens](../banco-de-dados/arquitetura-estrutura.md)
- **Integração:** [src/services/ai.js](../../src/services/ai.js) — `model.startChat({ history })`
- **Regras de banco:** [banco-de-dados/regras-negocio.md](../banco-de-dados/regras-negocio.md)
