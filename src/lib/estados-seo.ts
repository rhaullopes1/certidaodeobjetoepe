/** Conteúdo das landing pages locais (SEO por estado). */
export interface EstadoSeo {
  slug: string;
  uf: string;
  nome: string;
  tribunal: string;
  tribunalNome: string;
  capital: string;
  cidades: string[];
  prazo: string;
  intro: string;
  contexto: string;
}

export const ESTADOS_SEO: EstadoSeo[] = [
  {
    slug: "sp",
    uf: "SP",
    nome: "São Paulo",
    tribunal: "TJSP",
    tribunalNome: "Tribunal de Justiça de São Paulo",
    capital: "São Paulo",
    cidades: ["São Paulo", "Campinas", "Guarulhos", "Santos", "Ribeirão Preto", "São Bernardo do Campo", "Sorocaba", "Osasco"],
    prazo: "1 a 7 dias úteis",
    intro:
      "Solicite a Certidão de Objeto e Pé de processos que tramitam no TJSP, na Justiça Federal da 3ª Região e no TRT da 2ª e 15ª Regiões, sem sair de casa.",
    contexto:
      "São Paulo concentra o maior volume de processos judiciais do país, o que torna comum a exigência da certidão em financiamentos, concursos, licitações e transferências de veículos. Cuidamos do protocolo no fórum ou no sistema eletrônico correto e acompanhamos até a emissão.",
  },
  {
    slug: "mg",
    uf: "MG",
    nome: "Minas Gerais",
    tribunal: "TJMG",
    tribunalNome: "Tribunal de Justiça de Minas Gerais",
    capital: "Belo Horizonte",
    cidades: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Uberaba", "Governador Valadares"],
    prazo: "2 a 8 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJMG, da Justiça Federal da 6ª Região e do TRT da 3ª Região, com pedido 100% online.",
    contexto:
      "No TJMG a certidão costuma ser exigida por seguradoras, bancos e empresas em processos de contratação. Nossa equipe identifica a comarca e a vara corretas e protocola o pedido em seu nome.",
  },
  {
    slug: "ba",
    uf: "BA",
    nome: "Bahia",
    tribunal: "TJBA",
    tribunalNome: "Tribunal de Justiça da Bahia",
    capital: "Salvador",
    cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Ilhéus", "Lauro de Freitas"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Peça sua Certidão de Objeto e Pé de processos do TJBA, da Justiça Federal da 1ª Região e do TRT da 5ª Região com acompanhamento por WhatsApp.",
    contexto:
      "Comarcas do interior da Bahia frequentemente exigem protocolo presencial ou pedido por sistema próprio. Fazemos esse trâmite por você e entregamos o documento em formato digital.",
  },
  {
    slug: "df",
    uf: "DF",
    nome: "Distrito Federal",
    tribunal: "TJDFT",
    tribunalNome: "Tribunal de Justiça do Distrito Federal e Territórios",
    capital: "Brasília",
    cidades: ["Brasília", "Taguatinga", "Ceilândia", "Gama", "Sobradinho", "Águas Claras", "Samambaia", "Planaltina"],
    prazo: "1 a 5 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJDFT, da Justiça Federal da 1ª Região e do TRT da 10ª Região, solicitada online.",
    contexto:
      "Em Brasília a certidão é muito requisitada em processos seletivos públicos, posse em cargos e habilitação em licitações. Emitimos com o resumo do objeto e a fase atual do processo.",
  },
  {
    slug: "pe",
    uf: "PE",
    nome: "Pernambuco",
    tribunal: "TJPE",
    tribunalNome: "Tribunal de Justiça de Pernambuco",
    capital: "Recife",
    cidades: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Garanhuns"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Solicite a Certidão de Objeto e Pé de processos do TJPE, da Justiça Federal da 5ª Região e do TRT da 6ª Região.",
    contexto:
      "Atendemos tanto processos da capital quanto das comarcas do agreste e sertão pernambucano, com envio digital do documento assim que o tribunal libera.",
  },
  {
    slug: "go",
    uf: "GO",
    nome: "Goiás",
    tribunal: "TJGO",
    tribunalNome: "Tribunal de Justiça de Goiás",
    capital: "Goiânia",
    cidades: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Catalão"],
    prazo: "2 a 8 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJGO, da Justiça Federal da 1ª Região e do TRT da 18ª Região, sem burocracia.",
    contexto:
      "Motoristas, transportadoras e empresas do agronegócio em Goiás usam a certidão para comprovar a situação real de um processo perante clientes e seguradoras.",
  },
  {
    slug: "pr",
    uf: "PR",
    nome: "Paraná",
    tribunal: "TJPR",
    tribunalNome: "Tribunal de Justiça do Paraná",
    capital: "Curitiba",
    cidades: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo"],
    prazo: "2 a 7 dias úteis",
    intro:
      "Peça a Certidão de Objeto e Pé de processos do TJPR, da Justiça Federal da 4ª Região e do TRT da 9ª Região.",
    contexto:
      "No Paraná a certidão é frequentemente pedida em processos de crédito imobiliário e em contratações empresariais. Localizamos o processo e protocolamos o pedido oficialmente.",
  },
  {
    slug: "rs",
    uf: "RS",
    nome: "Rio Grande do Sul",
    tribunal: "TJRS",
    tribunalNome: "Tribunal de Justiça do Rio Grande do Sul",
    capital: "Porto Alegre",
    cidades: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Novo Hamburgo", "São Leopoldo"],
    prazo: "2 a 8 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJRS, da Justiça Federal da 4ª Região e do TRT da 4ª Região, com pedido online.",
    contexto:
      "Atendemos todas as comarcas gaúchas, incluindo processos antigos arquivados que exigem desarquivamento para emissão da certidão.",
  },
  {
    slug: "rj",
    uf: "RJ",
    nome: "Rio de Janeiro",
    tribunal: "TJRJ",
    tribunalNome: "Tribunal de Justiça do Rio de Janeiro",
    capital: "Rio de Janeiro",
    cidades: ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda"],
    prazo: "1 a 7 dias úteis",
    intro:
      "Solicite a Certidão de Objeto e Pé de processos do TJRJ, da Justiça Federal da 2ª Região e do TRT da 1ª Região.",
    contexto:
      "No Rio de Janeiro a certidão é exigida com frequência em concursos, posse em cargos públicos e negociações imobiliárias.",
  },
  {
    slug: "sc",
    uf: "SC",
    nome: "Santa Catarina",
    tribunal: "TJSC",
    tribunalNome: "Tribunal de Justiça de Santa Catarina",
    capital: "Florianópolis",
    cidades: ["Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú", "Chapecó", "Itajaí", "Criciúma", "São José"],
    prazo: "1 a 6 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJSC, da Justiça Federal da 4ª Região e do TRT da 12ª Região.",
    contexto:
      "Atendemos empresas e pessoas físicas em todo o estado, com envio do documento digital por e-mail e WhatsApp.",
  },
  {
    slug: "mt",
    uf: "MT",
    nome: "Mato Grosso",
    tribunal: "TJMT",
    tribunalNome: "Tribunal de Justiça de Mato Grosso",
    capital: "Cuiabá",
    cidades: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Sorriso", "Lucas do Rio Verde"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Peça a Certidão de Objeto e Pé de processos do TJMT, da Justiça Federal da 1ª Região e do TRT da 23ª Região.",
    contexto:
      "Transportadoras e produtores rurais em Mato Grosso costumam precisar da certidão para contratos, financiamentos e liberação de cargas.",
  },
  {
    slug: "ce",
    uf: "CE",
    nome: "Ceará",
    tribunal: "TJCE",
    tribunalNome: "Tribunal de Justiça do Ceará",
    capital: "Fortaleza",
    cidades: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJCE, da Justiça Federal da 5ª Região e do TRT da 7ª Região, solicitada online.",
    contexto:
      "Atendemos as comarcas da capital e do interior cearense, cuidando do protocolo e do acompanhamento até a emissão do documento.",
  },
];

export const estadoPorSlug = (slug: string) =>
  ESTADOS_SEO.find((e) => e.slug === slug.toLowerCase());
