# Arquitetura e Estrutura de Arquivos

## Visão Macro

O sistema é orientado a eventos. Não há servidor HTTP — tudo começa quando uma mensagem chega pelo WhatsApp.

```
┌─────────────────────────────────────────────────────────────┐
│                        ENTRADA                              │
│   WhatsApp ──► WPPConnect Client ──► src/listeners/message  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      PIPELINE                               │
│  1. filters.js    → Descarta stickers, grupos, status       │
│  2. security.js   → Rate limit (7 msg / 5s → block 60s)    │
│  3. userService   → Upsert do usuário no Supabase           │
│  4. dataPreparer  → Download e normalização de mídias       │
│  5. batch.js      → Agrupa mensagens (debounce de 8s)       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSAMENTO IA                         │
│  chatHistoryService → busca histórico (última 1h)           │
│  ai.js              → Gemini 2.5 Flash com histórico        │
│  chatHistoryService → salva resposta da IA                  │
│  storage.js         → limpeza de arquivos temporários       │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
/
├── src/
│   ├── app.js                    # Ponto de entrada — inicializa WPPConnect
│   ├── config/
│   │   └── supabase.js           # Instância do cliente Supabase
│   ├── listeners/
│   │   └── message.js            # Orquestra o pipeline de cada mensagem
│   ├── services/
│   │   ├── ai.js                 # Integração com Gemini (chat com histórico)
│   │   ├── batch.js              # Buffer e debounce de mensagens
│   │   ├── chatHistoryService.js # Salvar e buscar histórico no Supabase
│   │   ├── storage.js            # Download e salvamento de mídias
│   │   └── userService.js        # Registro e atualização de usuários
│   └── utils/
│       ├── dataPreparer.js       # Normaliza mensagem (texto + mídia)
│       ├── filters.js            # Regras de filtragem de mensagens
│       └── security.js           # Rate limiting anti-spam
├── sql/
│   ├── function/
│   │   └── updated_at.sql        # Trigger para atualizar updated_at
│   └── tables/
│       ├── usuarios.sql          # DDL da tabela de usuários
│       └── historico_mensagens.sql # DDL da tabela de histórico
├── downloads/                    # Mídias temporárias (limpas após processamento)
│   ├── audios/
│   ├── images/
│   ├── videos/
│   └── documents/
├── tokens/                       # Sessão do WPPConnect (não commitar)
├── .env.example                  # Variáveis de ambiente necessárias
└── package.json
```

## Princípio de Responsabilidade Única

Cada arquivo tem exatamente uma responsabilidade:

| Arquivo | Responsabilidade |
|---|---|
| `app.js` | Boot — cria a sessão WPPConnect |
| `listeners/message.js` | Orquestração do pipeline |
| `services/batch.js` | Gerencia o buffer de mensagens |
| `services/ai.js` | Faz a chamada para o Gemini |
| `services/chatHistoryService.js` | I/O de histórico no banco |
| `services/userService.js` | I/O de usuários no banco |
| `services/storage.js` | Salva arquivos de mídia no disco |
| `utils/filters.js` | Decide o que ignorar |
| `utils/security.js` | Rate limit por usuário |
| `utils/dataPreparer.js` | Normaliza a mensagem recebida |

## Veja também

- [Backend — Regras de Negócio](./backend/regras-negocio.md)
- [Banco de Dados — Estrutura](./banco-de-dados/arquitetura-estrutura.md)
