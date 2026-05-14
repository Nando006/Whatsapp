# Configuração do Ambiente

## Pré-requisitos

- Node.js >= 20.0.0
- Uma conta no [Supabase](https://supabase.com) com um projeto criado
- Uma chave de API do [Google AI Studio](https://aistudio.google.com) (Gemini)

## 1. Instalar Dependências

```bash
npm install
```

## 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o `.env` com os valores reais:

```env
# Chave da API do Google Gemini
GEMINI_API_KEY=sua_chave_aqui

# Credenciais do Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=sua_anon_key_aqui
```

> A `SUPABASE_KEY` deve ser a **anon key** pública do projeto, encontrada em Project Settings → API.

## 3. Configurar o Banco de Dados

Execute os scripts SQL no **SQL Editor** do Supabase, na seguinte ordem:

```
1. sql/function/updated_at.sql     → Cria a função de trigger
2. sql/tables/usuarios.sql         → Cria a tabela de usuários
3. sql/tables/historico_mensagens.sql → Cria a tabela de histórico
```

Veja a estrutura completa em [Banco de Dados — Arquitetura](./banco-de-dados/arquitetura-estrutura.md).

## 4. Iniciar o Bot

```bash
node src/app.js
```

Na primeira execução, um **QR Code** será exibido no terminal. Escaneie-o com o WhatsApp do número que será o bot:

```
WhatsApp → Dispositivos Conectados → Conectar um dispositivo
```

A sessão é salva na pasta `tokens/` e reutilizada nas próximas execuções.

## Arquivos que NÃO devem ser commitados

O `.gitignore` já exclui os seguintes itens críticos:

| Arquivo/Pasta | Motivo |
|---|---|
| `.env` | Contém chaves secretas |
| `tokens/` | Sessão autenticada do WhatsApp |
| `downloads/` | Mídias temporárias dos usuários |
| `node_modules/` | Dependências reinstaladas via npm |
