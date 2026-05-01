const { supabase } = require('../config/supabase');

async function salvarMensagem(whatsappId, remetente, conteudo) {
  const textoParaSalvar = conteudo.trim() || '[Mídia enviada sem texto]';

  const { error } = await supabase
    .from('historico_mensagens')
    .insert([
      {
        whatsapp_id: whatsappId,
        remetente: remetente,
        conteudo: textoParaSalvar
      }
    ]);

  if (error) {
    console.error(`Erro no Supabase (Salvar Mensagem - ${remetente}):`, error.message);
  }
}

async function buscarHistoricoRecente(whatsappId) {
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: historico, error } = await supabase
    .from('historico_mensagens')
    .select('remetente, conteudo')
    .eq('whatsapp_id', whatsappId)
    .gte('created_at', umaHoraAtras)
    .order('created_at', { ascending: true });

  if (error || !historico || historico.length === 0) return [];

  return historico.map(msg => ({
    role: msg.remetente === 'ia' ? 'model' : 'user',
    parts: [{ text: msg.conteudo }]
  }));
}

module.exports = { salvarMensagem, buscarHistoricoRecente };