# Backend — Visão Geral

## O que é o Backend?

O backend é uma aplicação **Node.js orientada a eventos**, sem servidor HTTP. Ele vive conectado ao WhatsApp Web via WPPConnect e reage a cada mensagem recebida passando-a por um pipeline de processamento.

## Por que essa arquitetura?

WhatsApp não expõe uma API REST pública. O WPPConnect simula uma sessão do WhatsApp Web via Puppeteer, permitindo capturar e enviar mensagens de forma programática. Como tudo é baseado em eventos (`onMessage`), não faz sentido ter um servidor HTTP — o bot simplesmente "escuta" e "responde".

## Responsabilidades

| Módulo | O que faz |
|---|---|
| `app.js` | Inicializa a sessão WPPConnect e entrega o cliente para os listeners |
| `listeners/` | Ponto de entrada de cada mensagem — orquestra o pipeline |
| `services/` | Lógica de negócio isolada (IA, banco, buffer, storage) |
| `utils/` | Funções puras de suporte (filtros, segurança, preparo de dados) |
| `config/` | Configuração de serviços externos (Supabase) |

## Navegação

- [Arquitetura e Estrutura Detalhada](./arquitetura-estrutura.md)
- [Pipeline de Processamento (Eventos)](./endpoints.md)
- [Regras de Negócio](./regras-negocio.md)
- [Visão Geral do Projeto](../visao-geral.md)
