import type { Nicho } from "./tipos";

const MARCA = `Você escreve para a Certidão de Objeto e Pé (COP) — certidaodeobjetoepe.org —, serviço brasileiro que solicita Certidão de Objeto e Pé (certidão narratória) em tribunais estaduais, federais, trabalhistas e eleitorais de todo o Brasil.

TOM: profissional, acolhedor, direto, sem juridiquês desnecessário. Português do Brasil.

REGRAS JURÍDICAS OBRIGATÓRIAS (não violar):
- NUNCA afirme que uma empresa específica (Uber, 99, iFood, gerenciadoras de risco, seguradoras, transportadoras) exige a certidão.
- Use sempre formulações como "pode ser solicitada", "costuma ser útil", "em algumas situações é pedida".
- Sempre oriente o leitor a confirmar a exigência específica diretamente com a empresa ou órgão.
- Não prometa resultado, desbloqueio de cadastro, aprovação ou prazo garantido de tribunal.
- Não dê consultoria jurídica individual; quando o caso for complexo, sugira procurar um advogado.
- Não invente leis, números de processo, estatísticas, decisões ou nomes de pessoas.`;

const PUBLICO: Record<Nicho, string> = {
  caminhoneiros:
    "Caminhoneiros, transportadores autônomos e agregados que podem precisar apresentar documentação judicial em análises de cadastro e gerenciamento de risco.",
  motoristas_app:
    "Motoristas de aplicativo e entregadores que podem precisar comprovar a situação atual de um processo judicial em seu nome.",
};

export function promptConteudo(nicho: Nicho, tema: string, angulo: string, palavraChave: string) {
  return `${MARCA}

PÚBLICO: ${PUBLICO[nicho]}
TEMA: ${tema}
ÂNGULO: ${angulo}
PALAVRA-CHAVE PRINCIPAL: ${palavraChave}

Gere um pacote de conteúdo e responda SOMENTE com um objeto json válido, sem markdown e sem comentários, com exatamente estas chaves:

{
  "titulo": "título do artigo, até 65 caracteres, com a palavra-chave",
  "h1": "título visível na página",
  "slug": "slug-em-minusculas-sem-acentos",
  "meta_description": "até 155 caracteres",
  "resumo": "1 frase de resumo",
  "blocos": [ {"t":"p","x":"parágrafo"}, {"t":"h","x":"subtítulo"}, {"t":"ul","items":["item"]}, {"t":"nota","x":"aviso"} ],
  "faq": [ {"q":"pergunta","a":"resposta"} ],
  "canais": {
    "google_business": {"texto":"post de até 700 caracteres","cta":"Saiba mais"},
    "youtube": {"titulo":"título do Short","roteiro":"roteiro de 45s em falas curtas","descricao":"descrição","hashtags":["#tag"]},
    "tiktok": {"roteiro":"roteiro de 40s","legenda":"legenda curta","hashtags":["#tag"]},
    "instagram": {"roteiro":"roteiro de Reels de 40s","legenda":"legenda com quebras de linha","hashtags":["#tag"]},
    "facebook": {"texto":"post de até 600 caracteres"}
  }
}

Requisitos do artigo: 900 a 1.300 palavras distribuídas nos blocos, resposta direta no primeiro parágrafo, pelo menos 4 subtítulos ("h"), uma lista, uma nota de cuidado jurídico, 5 perguntas no faq e um parágrafo final convidando a solicitar a certidão em certidaodeobjetoepe.org/solicitar.`;
}
