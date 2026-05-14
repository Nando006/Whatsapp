# Banco de Dados — Visão Geral

## O que armazenamos?

O banco de dados (Supabase/PostgreSQL) armazena dois tipos de informação:

1. **Usuários** — cada número de WhatsApp que já interagiu com o bot
2. **Histórico de mensagens** — cada turno de conversa (usuário e IA), usado para manter contexto

## Por que precisamos de persistência?

O bot precisa de **memória entre sessões e reinicializações**. Sem banco de dados:
- A IA não saberia o que foi dito anteriormente
- Reiniciar o bot apagaria todo o contexto das conversas em andamento

Com o banco, a IA recupera as mensagens da última 1 hora antes de responder, garantindo continuidade natural da conversa.

## Tecnologia

**Supabase** — plataforma BaaS (Backend-as-a-Service) sobre PostgreSQL, usada pelos SDKs JavaScript via `@supabase/supabase-js`.

A autenticação usa a **anon key** pública do projeto. As operações são feitas por tabela, sem RPC ou Edge Functions neste momento.

## Navegação

- [Estrutura das Tabelas](./arquitetura-estrutura.md)
- [Regras de Negócio do Banco](./regras-negocio.md)
- [Histórico de Conversa — Funcionalidade](../funcionalidades/historico-conversa.md)
