/** Conteúdo das landing pages dos Tribunais Regionais Federais (SEO de alta intenção). */
export interface TrfSeo {
  sigla: string;
  slugTribunal: string;
  path: string;
  nome: string;
  regiao: string;
  sede: string;
  sistema: string;
  prazo: string;
  estados: string[];
  ufsSlugs: string[];
  intro: string;
  contexto: string;
  assuntos: string[];
}

export const TRFS_SEO: TrfSeo[] = [
  {
    sigla: "TRF3",
    slugTribunal: "trf3",
    path: "/certidao-objeto-e-pe-trf3",
    nome: "Tribunal Regional Federal da 3ª Região",
    regiao: "3ª Região",
    sede: "São Paulo",
    sistema: "PJe",
    prazo: "3 a 10 dias úteis",
    estados: ["São Paulo", "Mato Grosso do Sul"],
    ufsSlugs: ["sp", "ms"],
    intro:
      "Certidão de Objeto e Pé de processos da Justiça Federal que tramitam no TRF3, com jurisdição sobre São Paulo e Mato Grosso do Sul. Você informa o número do processo e nossa equipe cuida do requerimento no PJe até a emissão.",
    contexto:
      "O TRF3 concentra o maior volume de ações previdenciárias e de execuções fiscais federais do país. A Certidão de Objeto e Pé é exigida com frequência em revisões de benefício do INSS, financiamentos com a Caixa, habilitação em licitações federais e regularização de imóveis com origem em processo federal.",
    assuntos: [
      "Ações previdenciárias contra o INSS",
      "Execuções fiscais da União",
      "Ações contra a Caixa Econômica Federal",
      "Mandados de segurança e ações tributárias",
      "Processos criminais federais",
    ],
  },
  {
    sigla: "TRF1",
    slugTribunal: "trf1",
    path: "/certidao-objeto-e-pe-trf1",
    nome: "Tribunal Regional Federal da 1ª Região",
    regiao: "1ª Região",
    sede: "Brasília",
    sistema: "PJe",
    prazo: "4 a 12 dias úteis",
    estados: [
      "Acre",
      "Amazonas",
      "Amapá",
      "Bahia",
      "Distrito Federal",
      "Goiás",
      "Maranhão",
      "Mato Grosso",
      "Pará",
      "Piauí",
      "Rondônia",
      "Roraima",
      "Tocantins",
    ],
    ufsSlugs: ["df", "ba", "go", "mt"],
    intro:
      "Certidão de Objeto e Pé de processos da Justiça Federal no TRF1, o tribunal com a maior jurisdição do país, abrangendo 13 estados e o Distrito Federal.",
    contexto:
      "Por atender 14 unidades da federação, o TRF1 reúne desde ações previdenciárias e assistenciais até grandes execuções fiscais e ações ambientais. Localizamos a subseção judiciária correta, protocolamos o pedido no PJe e acompanhamos até a expedição da certidão.",
    assuntos: [
      "Benefícios previdenciários e assistenciais (INSS)",
      "Execuções fiscais federais",
      "Ações ambientais e agrárias",
      "Ações contra autarquias e universidades federais",
      "Processos criminais federais",
    ],
  },
  {
    sigla: "TRF2",
    slugTribunal: "trf2",
    path: "/certidao-objeto-e-pe-trf2",
    nome: "Tribunal Regional Federal da 2ª Região",
    regiao: "2ª Região",
    sede: "Rio de Janeiro",
    sistema: "eproc",
    prazo: "3 a 10 dias úteis",
    estados: ["Rio de Janeiro", "Espírito Santo"],
    ufsSlugs: ["rj", "es"],
    intro:
      "Certidão de Objeto e Pé de processos da Justiça Federal no TRF2, com jurisdição sobre o Rio de Janeiro e o Espírito Santo, no sistema eproc.",
    contexto:
      "No TRF2 a certidão costuma ser exigida em concursos e posses em cargos públicos federais, em processos previdenciários e em ações envolvendo a União e suas autarquias. Cuidamos do requerimento e enviamos o documento digital.",
    assuntos: [
      "Ações previdenciárias e revisões de benefício",
      "Concursos e nomeações em cargos federais",
      "Execuções fiscais e ações tributárias",
      "Ações cíveis contra a União e autarquias",
      "Processos criminais federais",
    ],
  },
  {
    sigla: "TRF4",
    slugTribunal: "trf4",
    path: "/certidao-objeto-e-pe-trf4",
    nome: "Tribunal Regional Federal da 4ª Região",
    regiao: "4ª Região",
    sede: "Porto Alegre",
    sistema: "eproc",
    prazo: "2 a 9 dias úteis",
    estados: ["Rio Grande do Sul", "Santa Catarina", "Paraná"],
    ufsSlugs: ["rs", "sc", "pr"],
    intro:
      "Certidão de Objeto e Pé de processos da Justiça Federal no TRF4, com jurisdição sobre Rio Grande do Sul, Santa Catarina e Paraná, no sistema eproc.",
    contexto:
      "O TRF4 é referência em processo eletrônico, o que costuma reduzir o prazo de emissão. A certidão é muito usada em financiamentos, contratações empresariais e comprovação da fase de ações previdenciárias e tributárias.",
    assuntos: [
      "Ações previdenciárias (INSS)",
      "Ações tributárias e execuções fiscais",
      "Ações contra a Caixa e o Banco do Brasil",
      "Improbidade e processos criminais federais",
      "Ações de servidores públicos federais",
    ],
  },
  {
    sigla: "TRF5",
    slugTribunal: "trf5",
    path: "/certidao-objeto-e-pe-trf5",
    nome: "Tribunal Regional Federal da 5ª Região",
    regiao: "5ª Região",
    sede: "Recife",
    sistema: "PJe",
    prazo: "3 a 11 dias úteis",
    estados: ["Alagoas", "Ceará", "Paraíba", "Pernambuco", "Rio Grande do Norte", "Sergipe"],
    ufsSlugs: ["pe", "ce"],
    intro:
      "Certidão de Objeto e Pé de processos da Justiça Federal no TRF5, com jurisdição sobre Alagoas, Ceará, Paraíba, Pernambuco, Rio Grande do Norte e Sergipe.",
    contexto:
      "Atendemos todas as subseções judiciárias da 5ª Região, incluindo processos previdenciários, ações do FGTS e execuções fiscais federais. O pedido é feito no PJe e acompanhado até a emissão.",
    assuntos: [
      "Ações previdenciárias e assistenciais",
      "Ações sobre FGTS e contas vinculadas",
      "Execuções fiscais federais",
      "Ações de servidores públicos federais",
      "Processos criminais federais",
    ],
  },
  {
    sigla: "TRF6",
    slugTribunal: "trf6",
    path: "/certidao-objeto-e-pe-trf6",
    nome: "Tribunal Regional Federal da 6ª Região",
    regiao: "6ª Região",
    sede: "Belo Horizonte",
    sistema: "PJe",
    prazo: "3 a 10 dias úteis",
    estados: ["Minas Gerais"],
    ufsSlugs: ["mg"],
    intro:
      "Certidão de Objeto e Pé de processos da Justiça Federal em Minas Gerais, hoje sob jurisdição do TRF6, criado a partir do desmembramento do TRF1.",
    contexto:
      "Com a criação do TRF6, os processos federais mineiros passaram a tramitar em uma estrutura própria. Identificamos a subseção judiciária, verificamos se o processo já foi redistribuído e protocolamos o requerimento no PJe.",
    assuntos: [
      "Ações previdenciárias (INSS)",
      "Execuções fiscais federais",
      "Ações ambientais e minerárias",
      "Ações de servidores públicos federais",
      "Processos criminais federais",
    ],
  },
];

export const trfPorSigla = (sigla: string) =>
  TRFS_SEO.find((t) => t.sigla.toLowerCase() === sigla.toLowerCase());

/** Perguntas frequentes específicas por TRF (conteúdo visível e schema FAQPage). */
export function faqTrf(t: TrfSeo): { q: string; a: string }[] {
  const estados = t.estados.join(", ");
  return [
    {
      q: `Como solicitar a Certidão de Objeto e Pé no ${t.sigla}?`,
      a: `Informe o número do processo no padrão CNJ, o nome completo e o CPF ou CNPJ da parte envolvida em nosso formulário online. Nossa equipe identifica a subseção judiciária no sistema ${t.sistema}, protocola o requerimento no ${t.nome} e acompanha até a emissão.`,
    },
    {
      q: `Quanto tempo demora a certidão no ${t.sigla}?`,
      a: `O prazo médio é de ${t.prazo} após a confirmação do pagamento. Processos arquivados, com carga ou em grau de recurso podem levar mais tempo, conforme a secretaria responsável.`,
    },
    {
      q: `Quais estados são atendidos pelo ${t.sigla}?`,
      a: `A jurisdição do ${t.sigla} abrange ${estados}. Processos de outros estados tramitam em outro Tribunal Regional Federal, e também atendemos todos eles.`,
    },
    {
      q: `A certidão do ${t.sigla} serve para processo do INSS?`,
      a: `Sim. Ações previdenciárias contra o INSS tramitam na Justiça Federal e a Certidão de Objeto e Pé descreve o objeto da ação e a fase atual, incluindo sentença, recurso e cumprimento de sentença.`,
    },
    {
      q: `Preciso de advogado para pedir a certidão na Justiça Federal?`,
      a: `Não. A certidão pode ser requerida por qualquer interessado, salvo em processos que tramitam em segredo de justiça, cujo acesso é restrito às partes e a seus procuradores.`,
    },
    {
      q: `Qual a diferença entre a certidão do ${t.sigla} e uma certidão negativa?`,
      a: `A certidão negativa apenas informa se existem ou não processos em nome de uma pessoa. A Certidão de Objeto e Pé é específica de um processo e descreve o que se discute nele e em que fase ele está.`,
    },
    {
      q: `A certidão emitida pelo ${t.sigla} tem validade oficial?`,
      a: `Sim. O documento é expedido pela própria Justiça Federal, com código de autenticidade conferível no portal do tribunal, e tem validade em todo o território nacional.`,
    },
  ];
}
