# Banco de Dados — Regras de Negócio

## Chave de Identificação de Usuário

O campo `whatsapp_id` é a chave natural do sistema. O formato é definido pelo WPPConnect:

```
5511999999999@c.us   ← contatos individuais
5511999999999@g.us   ← grupos (nunca chegam ao banco — filtrados antes)
```

O campo é `VARCHAR(50)` com constraint `UNIQUE`, garantindo que cada número apareça apenas uma vez.

## UPSERT como Padrão de Acesso

Toda vez que um usuário envia uma mensagem, o serviço executa:

```js
supabase.from('usuarios').upsert(
  { whatsappId: whatsappId },
  { onConflict: 'whatsapp_id' }
)
```

- Se o usuário é novo → `INSERT`
- Se já existe → `UPDATE` (o trigger atualiza `updated_at` automaticamente)

Isso elimina a necessidade de verificar a existência antes de inserir.

## Janela de Histórico

A consulta de histórico usa um filtro temporal fixo:

```js
const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
// WHERE created_at >= umaHoraAtras
```

**Implicação:** Mensagens com mais de 1 hora são ignoradas no contexto da IA. Conversas retomadas após esse intervalo começam "do zero" para a IA.

## Ordenação do Histórico

O histórico é buscado em ordem **crescente de `created_at`**:

```sql
ORDER BY created_at ASC
```

Isso é obrigatório — o SDK do Gemini espera os turnos de conversa em ordem cronológica para montar o histórico corretamente.

## Formato de Saída para o Gemini

O `chatHistoryService` não retorna os dados brutos do banco. Ele já os transforma para o formato exigido pelo SDK:

```js
// Entrada do banco:
{ remetente: 'usuario', conteudo: 'Olá!' }

// Saída para o Gemini:
{ role: 'user', parts: [{ text: 'Olá!' }] }

// Remetente 'ia' → role: 'model'
// Remetente 'usuario' → role: 'user'
```

## Conteúdo de Mídias no Histórico

Quando o lote processado contém apenas mídia (sem texto), o conteúdo salvo é:

```
'[Mídia enviada sem texto]'
```

Isso garante que o registro no banco nunca fique vazio, mantendo a rastreabilidade da interação.

## Veja também

- [Estrutura das Tabelas](./arquitetura-estrutura.md)
- [chatHistoryService.js](../../src/services/chatHistoryService.js)
