/** Páginas-guia de intenção alta (SEO). Conteúdo estático, sem dependências de runtime. */

export interface GuiaSecao {
  h2: string;
  paragrafos: string[];
  lista?: string[];
}

export interface GuiaSeo {
  slug: string;
  titulo: string;
  h1: string;
  descricao: string;
  resumo: string;
  secoes: GuiaSecao[];
  faq: { q: string; a: string }[];
}

const PRECOS =
  "R$ 297 por 1 certidão, R$ 497 por 2, R$ 697 por 3, R$ 897 por 4 e R$ 997 por 5 certidões.";

export const GUIAS_SEO: GuiaSeo[] = [
  {
    slug: "como-solicitar-certidao-de-objeto-e-pe",
    titulo: "Como Solicitar Certidão de Objeto e Pé Online (Passo a Passo)",
    h1: "Como solicitar a Certidão de Objeto e Pé online: passo a passo",
    descricao:
      "Passo a passo para pedir a Certidão de Objeto e Pé online: dados necessários, prazos por tribunal, pagamento por Pix ou cartão e acompanhamento por protocolo.",
    resumo:
      "Você informa o número do processo, o nome completo e o CPF da parte, paga por Pix ou cartão e acompanha a emissão pelo número de protocolo. Todo o pedido é digital, sem ida ao fórum.",
    secoes: [
      {
        h2: "O que você precisa antes de pedir",
        paragrafos: [
          "Reúna as informações abaixo antes de abrir o formulário. Com elas, o pedido leva menos de três minutos e evita retrabalho no tribunal.",
        ],
        lista: [
          "Número do processo (formato CNJ, com 20 dígitos)",
          "Estado e cidade onde o processo tramita",
          "Nome completo da parte relacionada ao processo",
          "CPF dessa parte",
          "E-mail e WhatsApp para receber o protocolo e a certidão",
        ],
      },
      {
        h2: "Passo a passo da solicitação",
        paragrafos: [
          "O fluxo é o mesmo para processos estaduais, federais e trabalhistas. A diferença fica por conta do prazo de cada tribunal.",
        ],
        lista: [
          "1. Abra a página de solicitação e informe os dados do processo.",
          "2. Confira o resumo do pedido e o valor calculado pela quantidade de certidões.",
          "3. Pague por Pix (QR Code ou copia e cola) ou por cartão de crédito.",
          "4. Receba o número de protocolo por e-mail, junto do comprovante em PDF.",
          "5. Acompanhe o andamento pelo protocolo na página de acompanhamento.",
        ],
      },
      {
        h2: "E se o número do processo estiver incompleto?",
        paragrafos: [
          "Se você tem apenas o nome da parte ou um número antigo, ainda é possível localizar o processo. Nesses casos, envie o que você tem por WhatsApp ou e-mail: nossa equipe faz a busca no tribunal correspondente antes de confirmar o pedido.",
          "Processos que correm em segredo de justiça só permitem a emissão para as partes ou para advogado constituído nos autos.",
        ],
      },
      {
        h2: "Prazo de emissão",
        paragrafos: [
          "Na maioria dos tribunais estaduais, a certidão sai entre 1 e 7 dias úteis. Justiça Federal e Justiça do Trabalho costumam ficar entre 2 e 10 dias úteis. Processos físicos e arquivados podem levar mais tempo, porque dependem do desarquivamento pela vara.",
        ],
      },
    ],
    faq: [
      {
        q: "Preciso de advogado para pedir a Certidão de Objeto e Pé?",
        a: "Não. Qualquer pessoa pode solicitar a certidão de um processo público. Advogado só é necessário em processos que correm em segredo de justiça.",
      },
      {
        q: "Consigo pedir a certidão sem sair de casa?",
        a: "Sim. O pedido, o pagamento e a entrega são 100% digitais. A certidão é enviada em PDF para o e-mail informado.",
      },
      {
        q: "Como acompanho o meu pedido?",
        a: "Pelo número de protocolo, na página de acompanhamento. Ele mostra o status atual, a data de cada etapa e o comprovante em PDF.",
      },
    ],
  },
  {
    slug: "quanto-custa-certidao-de-objeto-e-pe",
    titulo: "Quanto Custa a Certidão de Objeto e Pé? Preços e Prazos 2026",
    h1: "Quanto custa a Certidão de Objeto e Pé?",
    descricao:
      "Tabela de preços da Certidão de Objeto e Pé: R$ 297 por certidão, com desconto progressivo até 5 certidões. Veja o que está incluso, prazos e formas de pagamento.",
    resumo: `O valor do serviço completo é ${PRECOS} O preço já inclui o protocolo no tribunal, o acompanhamento e o envio da certidão em PDF.`,
    secoes: [
      {
        h2: "Tabela de preços",
        paragrafos: [
          "O valor é por certidão e cai conforme a quantidade solicitada no mesmo pedido. Não há mensalidade, taxa de adesão nem cobrança extra após a confirmação.",
        ],
        lista: [
          "1 certidão — R$ 297,00",
          "2 certidões — R$ 497,00",
          "3 certidões — R$ 697,00",
          "4 certidões — R$ 897,00",
          "5 certidões — R$ 997,00",
        ],
      },
      {
        h2: "O que está incluso no valor",
        paragrafos: [
          "O preço cobre o serviço completo, do protocolo à entrega. Você não precisa acompanhar o processo nem ir ao fórum.",
        ],
        lista: [
          "Conferência dos dados do processo antes do protocolo",
          "Protocolo no tribunal ou no sistema eletrônico correto",
          "Acompanhamento do pedido até a emissão",
          "Envio da certidão em PDF por e-mail",
          "Comprovante do pedido em PDF e acompanhamento por protocolo",
        ],
      },
      {
        h2: "Existem custas do tribunal?",
        paragrafos: [
          "A maioria dos tribunais emite a Certidão de Objeto e Pé sem custas para o cidadão. Quando o tribunal cobra taxa própria — o que ocorre em alguns estados e em processos físicos que exigem desarquivamento —, informamos o valor antes de qualquer cobrança adicional. Nada é cobrado sem a sua confirmação.",
        ],
      },
      {
        h2: "Formas de pagamento",
        paragrafos: [
          "Você pode pagar por Pix, com QR Code e código copia e cola gerados na hora, ou por cartão de crédito. O Pix é confirmado automaticamente em poucos minutos e o pedido segue para protocolo assim que o pagamento é identificado.",
        ],
      },
    ],
    faq: [
      {
        q: "O valor é por processo ou por certidão?",
        a: "Por certidão. Cada certidão corresponde a um processo, com número, nome completo e CPF da parte informados no pedido.",
      },
      {
        q: "E se o tribunal não emitir a certidão?",
        a: "Se a emissão não for possível por impedimento do próprio processo, entramos em contato para tratar o caso individualmente antes de qualquer nova cobrança.",
      },
      {
        q: "O pagamento por Pix é confirmado na hora?",
        a: "Na prática, sim: a confirmação costuma chegar em poucos minutos e o status muda automaticamente para pago na página de acompanhamento.",
      },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-concurso-publico",
    titulo: "Certidão de Objeto e Pé para Concurso Público: Como Apresentar",
    h1: "Certidão de Objeto e Pé para concurso público",
    descricao:
      "Como usar a Certidão de Objeto e Pé na investigação social de concursos públicos: quando ela é exigida, o que ela comprova e prazo de emissão.",
    resumo:
      "Na investigação social de concursos, a certidão explica o conteúdo e a fase de um processo que apareceu na sua certidão de distribuição — e costuma ser o documento que evita a eliminação do candidato.",
    secoes: [
      {
        h2: "Por que a banca pede essa certidão",
        paragrafos: [
          "A certidão de distribuição apenas informa que existe um processo em nome do candidato, sem dizer do que se trata. A Certidão de Objeto e Pé complementa essa informação: descreve o objeto do processo e a fase atual, permitindo que a banca avalie se há algo incompatível com o cargo.",
          "É comum que um processo cível corriqueiro — uma cobrança, um inventário, uma ação de família — apareça na distribuição e gere pedido de esclarecimento. A certidão resolve exatamente esse ponto.",
        ],
      },
      {
        h2: "Quando ela é exigida",
        paragrafos: ["A exigência aparece com mais frequência nestes casos:"],
        lista: [
          "Concursos das carreiras policiais e de segurança pública",
          "Carreiras jurídicas e do Ministério Público",
          "Fase de investigação social ou sindicância de vida pregressa",
          "Posse em cargos públicos em geral, quando aparece processo na distribuição",
        ],
      },
      {
        h2: "Cuidados com o prazo do edital",
        paragrafos: [
          "Editais costumam exigir certidão emitida há menos de 30, 60 ou 90 dias. Verifique essa janela antes de pedir e confira também se o edital exige certidão de mais de um foro (estadual e federal, por exemplo). Se o processo for de outra comarca, é preciso pedir a certidão no tribunal em que ele tramita.",
        ],
      },
    ],
    faq: [
      {
        q: "A certidão apaga o processo do meu nome?",
        a: "Não. Ela apenas documenta oficialmente o que o processo discute e em que fase está. Muitas eliminações ocorrem por falta de explicação, não pela existência do processo.",
      },
      {
        q: "Preciso de uma certidão por processo?",
        a: "Sim. Cada processo gera uma certidão própria, com número, partes e andamento específicos.",
      },
      {
        q: "Quanto tempo demora para receber?",
        a: "Em geral de 1 a 7 dias úteis nos tribunais estaduais e de 2 a 10 dias úteis na Justiça Federal e do Trabalho.",
      },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-licitacao",
    titulo: "Certidão de Objeto e Pé para Licitação e Habilitação Jurídica",
    h1: "Certidão de Objeto e Pé para licitação",
    descricao:
      "Certidão de Objeto e Pé exigida em licitações públicas: quando o pregoeiro pede, o que ela comprova sobre processos da empresa e prazo de emissão.",
    resumo:
      "Em licitações, a certidão esclarece processos que aparecem nas certidões negativas da empresa ou dos sócios, evitando inabilitação por informação incompleta.",
    secoes: [
      {
        h2: "Onde ela entra na habilitação",
        paragrafos: [
          "A habilitação jurídica e a qualificação econômico-financeira exigem certidões de distribuição cível e de falência/recuperação judicial. Quando algum processo aparece, o pregoeiro costuma solicitar a Certidão de Objeto e Pé para conhecer o objeto e a fase daquele feito antes de decidir sobre a habilitação.",
          "Sem esse esclarecimento, um processo sem qualquer relação com a capacidade de contratar pode gerar inabilitação ou diligência que atrasa o certame.",
        ],
      },
      {
        h2: "Situações mais comuns",
        paragrafos: [],
        lista: [
          "Ação cível em nome da empresa que aparece na certidão de distribuição",
          "Processo em nome de sócio ou administrador",
          "Recuperação judicial em andamento, para comprovar a fase e o plano homologado",
          "Execução fiscal cuja fase precisa ser demonstrada",
        ],
      },
      {
        h2: "Prazo e organização documental",
        paragrafos: [
          "Peça a certidão assim que a certidão de distribuição apontar o processo, e não na véspera da sessão. Como o prazo depende do tribunal, o ideal é iniciar o pedido com pelo menos 10 dias úteis de antecedência em relação à data de entrega dos envelopes ou do envio da documentação no portal.",
        ],
      },
    ],
    faq: [
      {
        q: "A certidão serve para processos em nome da empresa e dos sócios?",
        a: "Sim. Basta informar o número do processo e os dados da parte relacionada, seja pessoa física ou jurídica.",
      },
      {
        q: "Quantas certidões preciso pedir?",
        a: "Uma por processo apontado na certidão de distribuição. É possível pedir até cinco certidões no mesmo pedido, com desconto progressivo.",
      },
      {
        q: "A certidão vale em licitações de qualquer esfera?",
        a: "Sim. É documento oficial emitido pelo Judiciário e aceito em licitações municipais, estaduais e federais.",
      },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-compra-de-imovel",
    titulo: "Certidão de Objeto e Pé na Compra de Imóvel: Por Que Exigir",
    h1: "Certidão de Objeto e Pé na compra de imóvel",
    descricao:
      "Como a Certidão de Objeto e Pé protege a compra de imóvel: identifica o objeto e a fase de processos do vendedor e evita fraude à execução.",
    resumo:
      "Antes de assinar, a certidão mostra se um processo do vendedor pode atingir o imóvel — o principal filtro contra fraude à execução e penhora posterior.",
    secoes: [
      {
        h2: "O risco que ela evita",
        paragrafos: [
          "Se o vendedor responde a execução ou ação que possa levar à penhora, a venda pode ser declarada fraude à execução mesmo depois da escritura registrada. A certidão de distribuição revela a existência do processo; a Certidão de Objeto e Pé revela o que se discute e em que fase o feito está — informação decisiva para avaliar o risco.",
        ],
      },
      {
        h2: "O que verificar",
        paragrafos: [],
        lista: [
          "Natureza do processo: execução, cobrança, trabalhista, fiscal ou familiar",
          "Valor discutido em comparação ao patrimônio do vendedor",
          "Existência de penhora, arresto ou indisponibilidade de bens",
          "Fase atual: conhecimento, execução ou recurso",
        ],
      },
      {
        h2: "Quando pedir",
        paragrafos: [
          "O momento certo é entre a proposta e a assinatura do contrato, junto das certidões de distribuição do vendedor nas comarcas em que ele residiu nos últimos cinco anos e na Justiça Federal e do Trabalho. Financiamentos bancários costumam exigir esse conjunto na análise jurídica.",
        ],
      },
    ],
    faq: [
      {
        q: "O banco pede essa certidão no financiamento?",
        a: "Com frequência, sim. A análise jurídica do financiamento costuma pedir esclarecimento sobre qualquer processo do vendedor apontado nas certidões.",
      },
      {
        q: "Preciso pedir em mais de um tribunal?",
        a: "Depende de onde os processos tramitam. Cada certidão é emitida pelo tribunal do respectivo processo — estadual, federal ou trabalhista.",
      },
      {
        q: "Quanto tempo a certidão fica válida?",
        a: "Não há prazo legal único. Cartórios e bancos costumam aceitar certidões emitidas nos últimos 30 a 90 dias.",
      },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-visto-e-cidadania",
    titulo: "Certidão de Objeto e Pé para Visto, Cidadania e Documentos no Exterior",
    h1: "Certidão de Objeto e Pé para visto e cidadania",
    descricao:
      "Certidão de Objeto e Pé para processos de visto, residência e cidadania: quando é exigida, como usar com apostila de Haia e prazo de emissão.",
    resumo:
      "Consulados e órgãos de imigração pedem a certidão quando aparece processo em nome do requerente, para entender o objeto e a fase antes de decidir sobre o pedido.",
    secoes: [
      {
        h2: "Quando o consulado pede",
        paragrafos: [
          "A exigência aparece principalmente em pedidos de visto de residência, naturalização e cidadania por descendência, quando a certidão de antecedentes ou de distribuição indica processo em nome do requerente. A Certidão de Objeto e Pé traduz aquele registro em informação concreta: do que se trata e em que fase está.",
        ],
      },
      {
        h2: "Apostila de Haia e tradução",
        paragrafos: [
          "Para uso no exterior, a certidão normalmente precisa de apostilamento em cartório autorizado e, em muitos casos, de tradução juramentada para o idioma do país de destino. Confirme a exigência com o consulado antes de iniciar, porque isso define se você precisa da via física ou se a via digital assinada é suficiente.",
        ],
      },
      {
        h2: "Planejamento de prazo",
        paragrafos: [
          "Some o prazo de emissão pelo tribunal (1 a 10 dias úteis), o apostilamento e a tradução juramentada. Para agendamentos consulares, o ideal é iniciar o pedido com 30 dias de antecedência.",
        ],
      },
    ],
    faq: [
      {
        q: "A certidão digital é aceita no exterior?",
        a: "Depende do país. Muitos aceitam a via digital assinada, outros exigem via física apostilada. Confirme com o consulado antes de pedir.",
      },
      {
        q: "Vocês fazem o apostilamento?",
        a: "Não. Entregamos a certidão emitida pelo tribunal em PDF; o apostilamento é feito em cartório autorizado.",
      },
      {
        q: "Processo arquivado também precisa de certidão?",
        a: "Sim, e é justamente nesses casos que a certidão ajuda: ela comprova que o processo foi encerrado e como foi encerrado.",
      },
    ],
  },
];

export const GUIA_POR_SLUG = new Map(GUIAS_SEO.map((g) => [g.slug, g]));
