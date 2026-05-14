# Visão Geral do Projeto

## O que é este projeto?

Um **bot de WhatsApp com Inteligência Artificial** que responde mensagens de texto, áudios, imagens e documentos usando o modelo **Google Gemini 2.5 Flash**. O bot mantém memória contextual das conversas, lembrando do que foi dito na última hora para responder de forma coerente.

## Por que ele existe?

Automatizar interações no WhatsApp com uma IA capaz de:
- Entender e responder mensagens de texto
- **Transcrever e responder áudios** (mensagens de voz)
- **Analisar imagens e documentos** enviados
- **Manter contexto** entre mensagens, sem esquecer o que foi dito anteriormente

## Stack de Tecnologia

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| WhatsApp | [WPPConnect](https://github.com/wppconnect-team/wppconnect) | Conexão com o WhatsApp Web |
| IA | Google Gemini 2.5 Flash | Processamento de texto, áudio e imagens |
| Banco de Dados | Supabase (PostgreSQL) | Persistência de usuários e histórico de conversas |
| Runtime | Node.js | Orquestração de todos os serviços |

## Fluxo Resumido

```
Usuário → WhatsApp → Bot escuta → Filtra → Anti-spam → Registra no DB
→ Agrupa mensagens (8s) → Busca histórico → Gemini processa → Responde
```

## Navegação da Documentação

- [Arquitetura e Estrutura de Arquivos](./arquitetura-estrutura.md)
- [Configuração do Ambiente](./configuracao-ambiente.md)
- [Backend — Serviços e Lógica](./backend/visao-geral.md)
- [Banco de Dados — Tabelas e Regras](./banco-de-dados/visao-geral.md)
- **Funcionalidades:**
  - [Histórico de Conversa](./funcionalidades/historico-conversa.md)
  - [Processamento em Lote](./funcionalidades/processamento-em-lote.md)
  - [Proteção contra Spam](./funcionalidades/protecao-spam.md)
