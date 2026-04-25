require('dotenv').config();

async function listarModelos() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.error) {
      console.error("❌ Erro na chave ou permissão:", dados.error.message);
      return;
    }

    console.log("✅ Modelos da família 'Flash' disponíveis para a sua chave:");
    dados.models.forEach(modelo => {
      // Filtramos só os modelos rápidos e multimodais (Flash)
      if (modelo.name.includes('flash')) {
        console.log(`-> ${modelo.name.replace('models/', '')}`);
      }
    });
  } catch (erro) {
    console.error("Erro ao conectar:", erro);
  }
}

listarModelos();