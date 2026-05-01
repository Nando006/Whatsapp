require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam as credenciais do Supabase no arquivo .env');
}

/**
 * Configuração do Supabase para conexão com o banco de dados. O cliente é criado usando a URL e a chave de acesso fornecidas nas variáveis de ambiente. O cliente é exportado para ser utilizado em outros módulos da aplicação.
 */
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };