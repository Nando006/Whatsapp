# Banco de Dados — Arquitetura e Estrutura

## Diagrama de Entidade-Relacionamento

```
┌─────────────────────────┐         ┌────────────────────────────────────┐
│        usuarios          │         │        historico_mensagens          │
├─────────────────────────┤         ├────────────────────────────────────┤
│ id          BIGINT (PK) │         │ id          BIGINT (PK)            │
│ whatsapp_id VARCHAR(50) │◄────────│ whatsapp_id VARCHAR(50) (FK)       │
│ created_at  TIMESTAMPTZ │         │ remetente   VARCHAR(10)            │
│ updated_at  TIMESTAMPTZ │         │ conteudo    TEXT                   │
└─────────────────────────┘         │ created_at  TIMESTAMPTZ           │
                                    └────────────────────────────────────┘
```

## Tabela: `usuarios`

**Arquivo SQL:** [sql/tables/usuarios.sql](../../sql/tables/usuarios.sql)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-gerado | Identificador interno |
| `whatsapp_id` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Ex: `5511999999999@c.us` |
| `created_at` | `TIMESTAMPTZ` | default `now()` | Primeira interação |
| `updated_at` | `TIMESTAMPTZ` | default `now()` | Última interação (auto-atualizado) |

**Trigger:** `update_usuarios_updated_at` — executa `BEFORE UPDATE` e chama `update_updated_at_column()`.

## Tabela: `historico_mensagens`

**Arquivo SQL:** [sql/tables/historico_mensagens.sql](../../sql/tables/historico_mensagens.sql)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-gerado | Identificador interno |
| `whatsapp_id` | `VARCHAR(50)` | FK → `usuarios.whatsapp_id`, NOT NULL | Quem enviou/recebeu |
| `remetente` | `VARCHAR(10)` | NOT NULL | `'usuario'` ou `'ia'` |
| `conteudo` | `TEXT` | NOT NULL | Texto da mensagem |
| `created_at` | `TIMESTAMPTZ` | default `now()` | Momento do envio |

## Função: `update_updated_at_column()`

**Arquivo SQL:** [sql/function/updated_at.sql](../../sql/function/updated_at.sql)

Trigger genérico em PL/pgSQL que define `NEW.updated_at = now()` antes de qualquer `UPDATE`. Pode ser reutilizado em qualquer tabela que tenha uma coluna `updated_at`.

## Scripts de Instalação

Execute no SQL Editor do Supabase na ordem abaixo:

```sql
-- 1. Função de trigger (deve existir antes das tabelas que a referenciam)
\i sql/function/updated_at.sql

-- 2. Tabela de usuários (deve existir antes do histórico pela FK)
\i sql/tables/usuarios.sql

-- 3. Tabela de histórico
\i sql/tables/historico_mensagens.sql
```

## Veja também

- [Regras de Negócio do Banco](./regras-negocio.md)
- [Histórico de Conversa — Funcionalidade](../funcionalidades/historico-conversa.md)
