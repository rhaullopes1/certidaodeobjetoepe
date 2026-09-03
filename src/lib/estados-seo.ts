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
  {
    slug: "ac",
    uf: "AC",
    nome: "Acre",
    tribunal: "TJAC",
    tribunalNome: "Tribunal de Justiça do Acre",
    capital: "Rio Branco",
    cidades: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJAC, da Justiça Federal (TRF1) e do TRT da 14ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Acre a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJAC e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "al",
    uf: "AL",
    nome: "Alagoas",
    tribunal: "TJAL",
    tribunalNome: "Tribunal de Justiça de Alagoas",
    capital: "Maceió",
    cidades: ["Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares"],
    prazo: "3 a 9 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJAL, da Justiça Federal (TRF5) e do TRT da 19ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Alagoas a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJAL e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "am",
    uf: "AM",
    nome: "Amazonas",
    tribunal: "TJAM",
    tribunalNome: "Tribunal de Justiça do Amazonas",
    capital: "Manaus",
    cidades: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJAM, da Justiça Federal (TRF1) e do TRT da 11ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Amazonas a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJAM e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "ap",
    uf: "AP",
    nome: "Amapá",
    tribunal: "TJAP",
    tribunalNome: "Tribunal de Justiça do Amapá",
    capital: "Macapá",
    cidades: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJAP, da Justiça Federal (TRF1) e do TRT da 8ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Amapá a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJAP e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "es",
    uf: "ES",
    nome: "Espírito Santo",
    tribunal: "TJES",
    tribunalNome: "Tribunal de Justiça do Espírito Santo",
    capital: "Vitória",
    cidades: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares", "Colatina"],
    prazo: "2 a 8 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJES, da Justiça Federal (TRF2) e do TRT da 17ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Espírito Santo a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJES e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "ma",
    uf: "MA",
    nome: "Maranhão",
    tribunal: "TJMA",
    tribunalNome: "Tribunal de Justiça do Maranhão",
    capital: "São Luís",
    cidades: ["São Luís", "Imperatriz", "Timon", "Caxias", "Codó"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJMA, da Justiça Federal (TRF1) e do TRT da 16ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Maranhão a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJMA e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "ms",
    uf: "MS",
    nome: "Mato Grosso do Sul",
    tribunal: "TJMS",
    tribunalNome: "Tribunal de Justiça de Mato Grosso do Sul",
    capital: "Campo Grande",
    cidades: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"],
    prazo: "2 a 9 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJMS, da Justiça Federal (TRF3) e do TRT da 24ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Mato Grosso do Sul a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJMS e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "pa",
    uf: "PA",
    nome: "Pará",
    tribunal: "TJPA",
    tribunalNome: "Tribunal de Justiça do Pará",
    capital: "Belém",
    cidades: ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJPA, da Justiça Federal (TRF1) e do TRT da 8ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Pará a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJPA e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "pb",
    uf: "PB",
    nome: "Paraíba",
    tribunal: "TJPB",
    tribunalNome: "Tribunal de Justiça da Paraíba",
    capital: "João Pessoa",
    cidades: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"],
    prazo: "3 a 9 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJPB, da Justiça Federal (TRF5) e do TRT da 13ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Paraíba a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJPB e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "pi",
    uf: "PI",
    nome: "Piauí",
    tribunal: "TJPI",
    tribunalNome: "Tribunal de Justiça do Piauí",
    capital: "Teresina",
    cidades: ["Teresina", "Parnaíba", "Picos", "Floriano", "Piripiri"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJPI, da Justiça Federal (TRF1) e do TRT da 22ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Piauí a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJPI e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "rn",
    uf: "RN",
    nome: "Rio Grande do Norte",
    tribunal: "TJRN",
    tribunalNome: "Tribunal de Justiça do Rio Grande do Norte",
    capital: "Natal",
    cidades: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Caicó"],
    prazo: "3 a 9 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJRN, da Justiça Federal (TRF5) e do TRT da 21ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Rio Grande do Norte a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJRN e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "ro",
    uf: "RO",
    nome: "Rondônia",
    tribunal: "TJRO",
    tribunalNome: "Tribunal de Justiça de Rondônia",
    capital: "Porto Velho",
    cidades: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJRO, da Justiça Federal (TRF1) e do TRT da 14ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Rondônia a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJRO e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "rr",
    uf: "RR",
    nome: "Roraima",
    tribunal: "TJRR",
    tribunalNome: "Tribunal de Justiça de Roraima",
    capital: "Boa Vista",
    cidades: ["Boa Vista", "Rorainópolis", "Caracaraí", "Mucajaí", "Pacaraima"],
    prazo: "4 a 12 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJRR, da Justiça Federal (TRF1) e do TRT da 11ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Roraima a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJRR e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "se",
    uf: "SE",
    nome: "Sergipe",
    tribunal: "TJSE",
    tribunalNome: "Tribunal de Justiça de Sergipe",
    capital: "Aracaju",
    cidades: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância"],
    prazo: "3 a 9 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJSE, da Justiça Federal (TRF5) e do TRT da 20ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Sergipe a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJSE e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
  {
    slug: "to",
    uf: "TO",
    nome: "Tocantins",
    tribunal: "TJTO",
    tribunalNome: "Tribunal de Justiça do Tocantins",
    capital: "Palmas",
    cidades: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
    prazo: "3 a 10 dias úteis",
    intro:
      "Certidão de Objeto e Pé de processos do TJTO, da Justiça Federal (TRF1) e do TRT da 10ª Região, com solicitação 100% online e acompanhamento até a emissão.",
    contexto:
      "Em Tocantins a certidão é exigida com frequência em financiamentos, licitações, concursos públicos, contratações e negócios imobiliários. Identificamos a comarca e a vara responsáveis, protocolamos o requerimento no TJTO e enviamos o documento digital assim que o tribunal o disponibiliza.",
  },
];

export const estadoPorSlug = (slug: string) =>
  ESTADOS_SEO.find((e) => e.slug === slug.toLowerCase());

/** Sistema processual do tribunal estadual, conforme a base de tribunais. */
export function sistemaDoEstado(e: EstadoSeo): string | undefined {
  return TRIBUNAIS.find((t) => t.sigla === e.tribunal)?.sistema;
}

/** Perguntas frequentes específicas por estado (usadas no conteúdo e no schema FAQPage). */
export function faqEstado(e: EstadoSeo): { q: string; a: string }[] {
  return [...faqEstadoBase(e), ...(detalheEstado(e.slug)?.faqLocal ?? [])];
}

function faqEstadoBase(e: EstadoSeo): { q: string; a: string }[] {
  return [
    {
      q: `Como solicitar a Certidão de Objeto e Pé em ${e.nome}?`,
      a: `O pedido é 100% online: informe o número do processo, o nome completo e o CPF da parte envolvida em nosso formulário. Nossa equipe protocola o requerimento no ${e.tribunalNome} (${e.tribunal}) e acompanha até a emissão, com avisos por WhatsApp.`,
    },
    {
      q: `Quanto tempo demora a certidão no ${e.tribunal}?`,
      a: `Em ${e.nome} o prazo médio de emissão é de ${e.prazo}, contado após a confirmação do pagamento. Prazos podem variar conforme a vara, a comarca e o volume de processos do tribunal.`,
    },
    {
      q: `Qual o valor da Certidão de Objeto e Pé em ${e.nome}?`,
      a: `O valor é único para todo o Brasil, inclusive em ${e.nome}, e o total é calculado automaticamente conforme a quantidade de certidões solicitadas (de 1 a 5) antes da finalização do pedido. O pagamento pode ser feito por Pix com confirmação automática.`,
    },
    {
      q: `Preciso de advogado ou ir ao fórum em ${e.capital}?`,
      a: `Não. Qualquer pessoa física ou jurídica pode solicitar a certidão, sem advogado e sem comparecer ao fórum de ${e.capital} ou de qualquer outra comarca de ${e.nome}. Todo o trâmite é feito por nossa equipe.`,
    },
    {
      q: `Vocês atendem todas as comarcas de ${e.nome}?`,
      a: `Sim. Atendemos todas as comarcas de ${e.nome}, incluindo ${e.cidades.slice(0, 4).join(", ")} e demais cidades do estado, além de processos da Justiça Federal e da Justiça do Trabalho.`,
    },
    {
      q: `A certidão emitida em ${e.nome} tem validade oficial?`,
      a: `Sim. O documento é emitido pelo próprio Poder Judiciário, com assinatura e código de autenticidade que pode ser conferido no site do ${e.tribunal}. Ele tem validade em todo o território nacional.`,
    },
    {
      q: `Como recebo a certidão em ${e.nome}?`,
      a: `A certidão é entregue em formato digital (PDF) por e-mail e WhatsApp assim que o tribunal disponibiliza o documento, e também fica disponível na página do seu pedido pelo número de protocolo.`,
    },
  ];
}
