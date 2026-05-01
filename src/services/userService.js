const { supabase } = require('../config/supabase');

async function registrarOuAtualizarUsuario(whatsappId) {
  const { error } = await supabase
    .from('usuarios')
    .upsert(
      { whatsappId: whatsappId },
      { onConflict: 'whatsapp_id' }
    );

    if (error) {
      console.error('Erro no Supabase (Atualizar Usuário):', error.message);
    }
}

module.exports = { registrarOuAtualizarUsuario };