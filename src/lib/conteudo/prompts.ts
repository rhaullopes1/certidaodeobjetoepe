import type { Nicho } from "./tipos";

const MARCA = `Você escreve para a Certidão de Objeto e Pé (COP) — certidaodeobjetoepe.org —, serviço brasileiro que solicita Certidão de Objeto e Pé (certidão narratória) em tribunais estaduais, federais, trabalhistas e eleitorais de todo o Brasil.

TOM: profissional, acolhedor, direto, sem juridiquês desnecessário. Português do Brasil.

REGRAS JURÍDICAS OBRIGATÓRIAS (não violar):
- NUNCA afirme que uma empresa específica (Uber, 99, iFood, gerenciadoras de risco, seguradoras, transportadoras) exige a certidão.
- Use sempre formulações como "pode ser solicitada", "costuma ser útil", "em algumas situações é pedida".
- Sempre oriente o leitor a confirmar a exigência específica diretamente com a empresa ou órgão.
- Ao citar prazo, use somente: "1 a 5 dias úteis, conforme a comarca e o tribunal emissor."
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

export interface Pauta {
  nicho: Nicho;
  titulo: string;
  angulo: string;
  palavra_chave: string;
  palavras_secundarias: string[] | null;
  objetivo: string | null;
  slug_sugerido: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

const OBJETIVOS: Record<string, string> = {
  atracao: "atrair quem acabou de descobrir o problema — foco em clareza e acolhimento",
  educacao: "explicar o conceito com precisão e exemplos do dia a dia",
  autoridade: "demonstrar domínio do assunto e organizar um roteiro confiável",
  conversao: "levar o leitor a solicitar a certidão, sem pressão e sem promessa",
};

/** Prompt de uma pauta do calendário editorial, com SEO e CTA obrigatórios. */
export function promptPauta(p: Pauta) {
  const secundarias = (p.palavras_secundarias ?? []).join(", ");
  return `${MARCA}

PÚBLICO: ${PUBLICO[p.nicho]}
PAUTA: ${p.titulo}
ÂNGULO: ${p.angulo}
OBJETIVO: ${OBJETIVOS[p.objetivo ?? "educacao"] ?? OBJETIVOS["educacao"]}
PALAVRA-CHAVE PRINCIPAL: ${p.palavra_chave}
PALAVRAS-CHAVE SECUNDÁRIAS: ${secundarias || "certidão judicial, objeto e pé processo"}
SLUG OBRIGATÓRIO: ${p.slug_sugerido ?? ""}
META TITLE SUGERIDO: ${p.meta_title ?? ""}
META DESCRIPTION SUGERIDA: ${p.meta_description ?? ""}

REGRAS ADICIONAIS DESTA PAUTA:
- Toda peça (artigo, Google Business, Instagram/Facebook, Reels/TikTok, YouTube) termina com uma chamada para solicitar a Certidão de Objeto e Pé no site oficial https://certidaodeobjetoepe.org. Varie o texto do CTA em cada peça; mantenha o link idêntico.
- NUNCA diga que a certidão remove, limpa, cancela, apaga ou altera um processo. Ela apenas apresenta o objeto e a situação de tramitação na data da emissão.
- Ao falar de prazo, use somente: "1 a 5 dias úteis, conforme a comarca e o tribunal emissor."
- Diferencie consulta pública/processual de certidão oficial sempre que fizer sentido.
- Não cite regras, sistemas ou prazos de tribunais específicos que você não tenha certeza; fale de forma geral.
- Use a palavra-chave principal de forma natural (título, primeiro parágrafo e 2 a 4 vezes no corpo). Sem repetição artificial.
- Texto original, em português do Brasil, sem aconselhamento jurídico individualizado.

Responda SOMENTE com um objeto json válido, sem markdown e sem comentários:

{
  "titulo": "meta title, até 65 caracteres",
  "h1": "título visível na página",
  "slug": "${p.slug_sugerido ?? "slug-sugerido"}",
  "meta_description": "até 155 caracteres",
  "resumo": "1 frase de resumo",
  "blocos": [ {"t":"p","x":"parágrafo"}, {"t":"h","x":"subtítulo"}, {"t":"ul","items":["item"]}, {"t":"nota","x":"aviso"}, {"t":"cta","x":"chamada final com o link oficial"} ],
  "faq": [ {"q":"pergunta","a":"resposta"} ],
  "canais": {
    "google_business": {"texto":"resumo de até 700 caracteres","cta":"chamada com o link oficial"},
    "instagram": {"legenda":"legenda com quebras de linha e CTA","hashtags":["#tag"]},
    "facebook": {"texto":"post de até 600 caracteres com CTA"},
    "reels_tiktok": {"roteiro":"roteiro de 30 a 45 segundos em falas curtas, com gancho no início e CTA no fim","legenda":"legenda curta","hashtags":["#tag"]},
    "youtube": {"titulo":"título do Short","roteiro":"roteiro de 45 a 60 segundos","descricao":"descrição com o link oficial","hashtags":["#tag"]}
  }
}

Requisitos do artigo: 800 a 1.200 palavras distribuídas nos blocos, resposta direta à pergunta da pauta no primeiro parágrafo, pelo menos 5 subtítulos ("h"), uma lista, uma nota de cuidado, 5 perguntas no faq e o bloco final "cta" com o link oficial.`;
}

