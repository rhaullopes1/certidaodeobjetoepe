/**
 * Páginas de venda por público (nichos). Conteúdo estático, sem dependências de runtime.
 * Regra editorial: nada de exigência afirmada sem fonte oficial; quando a exigência
 * varia conforme o órgão, o texto usa "pode ser solicitada".
 */

export interface PublicoSecao {
  h2: string;
  paragrafos: string[];
  lista?: string[];
}

export interface PublicoSeo {
  slug: string;
  /** Rótulo curto usado no hub e nos links internos. */
  rotulo: string;
  titulo: string;
  h1: string;
  descricao: string;
  resumo: string;
  /** Situações concretas que levam esse público a precisar da certidão. */
  gatilhos: string[];
  secoes: PublicoSecao[];
  faq: { q: string; a: string }[];
  fontes?: { nome: string; url: string }[];
}

const PRECOS =
  "R$ 297 por 1 certidão, R$ 497 por 2, R$ 697 por 3, R$ 897 por 4 e R$ 997 por 5 certidões.";

const COMO_PEDIR: PublicoSecao = {
  h2: "Como pedir a sua certidão",
  paragrafos: [
    "O pedido é 100% online e leva menos de três minutos. Você acompanha tudo pelo número de protocolo e recebe a certidão em PDF por e-mail.",
  ],
  lista: [
    "1. Informe o número do processo (padrão CNJ, 20 dígitos) — o site já identifica tribunal, estado e cidade.",
    "2. Informe o nome completo e o CPF da parte relacionada ao processo.",
    "3. Confira o resumo do pedido e o valor: " + PRECOS,
    "4. Pague com cartão de crédito, Apple Pay, Google Pay ou Pix.",
    "5. Receba o protocolo por e-mail e acompanhe até a entrega da certidão.",
  ],
};

const FAQ_COMUM = [
  {
    q: "O que exatamente vem na Certidão de Objeto e Pé?",
    a: "A certidão é emitida pelo próprio tribunal e informa o objeto do processo (do que ele trata), as partes envolvidas e a fase atual — se está em andamento, suspenso, arquivado, com acordo ou com sentença.",
  },
  {
    q: "Quanto custa?",
    a: `Os valores são fechados, sem surpresa: ${PRECOS} O pagamento é feito no site, com cartão, carteiras digitais ou Pix.`,
  },
  {
    q: "Preciso ir ao fórum?",
    a: "Não. Nós protocolamos o pedido junto ao tribunal competente e entregamos a certidão em PDF por e-mail.",
  },
  {
    q: "E se eu não souber o número do processo?",
    a: "Fale com a nossa equipe pelo WhatsApp ou pelo telefone antes de pedir. Com o nome completo e o CPF conseguimos orientar como localizar o número correto.",
  },
];

export const PUBLICOS_SEO: PublicoSeo[] = [
  {
    slug: "caminhoneiro",
    rotulo: "Caminhoneiro e motorista profissional",
    titulo: "Certidão de Objeto e Pé para Caminhoneiro | Cadastro Liberado",
    h1: "Apareceu um processo no seu cadastro de motorista? Resolva com a Certidão de Objeto e Pé",
    descricao:
      "Motorista de caminhão bloqueado na gerenciadora de risco ou na transportadora? A Certidão de Objeto e Pé mostra oficialmente do que trata o processo e em que situação ele está. Pedido online.",
    resumo:
      "Consultas de antecedentes feitas por transportadoras e gerenciadoras de risco mostram apenas que existe um processo — sem dizer qual é o assunto nem se ele já terminou. A Certidão de Objeto e Pé, emitida pelo tribunal, é o documento que esclarece isso e destrava o cadastro.",
    gatilhos: [
      "Cadastro reprovado ou bloqueado por gerenciadora de risco",
      "Transportadora pediu esclarecimento sobre apontamento judicial",
      "Processo antigo, arquivado ou já resolvido continua aparecendo na consulta",
      "Contratação como agregado ou motorista autônomo travada na análise documental",
    ],
    secoes: [
      {
        h2: "Por que a consulta de antecedentes trava o seu cadastro",
        paragrafos: [
          "A checagem feita por transportadoras e gerenciadoras de risco costuma indicar apenas a existência de um processo com o seu nome ou CPF. Ela não diz se o caso foi arquivado, se houve absolvição, se houve acordo ou se você sequer é o réu — pode ser testemunha, autor ou homônimo.",
          "Sem essa informação, o analista trabalha com o pior cenário e o cadastro fica parado. A Certidão de Objeto e Pé resolve exatamente esse ponto: é o tribunal quem declara o objeto e a fase atual do processo.",
        ],
      },
      {
        h2: "O que a certidão comprova no seu caso",
        paragrafos: [
          "Com a certidão em mãos você entrega ao setor de cadastro um documento oficial, e não uma explicação verbal.",
        ],
        lista: [
          "Qual é o assunto do processo (o objeto)",
          "Em que posição você aparece nele",
          "A fase atual: em andamento, suspenso, arquivado, extinto ou com sentença",
          "A existência ou não de condenação até a data da emissão",
        ],
      },
      COMO_PEDIR,
    ],
    faq: [
      {
        q: "A certidão desbloqueia o meu cadastro automaticamente?",
        a: "Não existe garantia automática: quem decide é a empresa ou a gerenciadora de risco. O que a certidão faz é dar a ela a informação oficial que falta para analisar o seu caso com base em fatos.",
      },
      {
        q: "Meu processo já foi arquivado. Vale a pena pedir?",
        a: "Sim. É justamente nesse caso que a certidão mais ajuda, porque ela registra que o processo está arquivado ou extinto — informação que a consulta simples não mostra.",
      },
      ...FAQ_COMUM,
    ],
  },
  {
    slug: "motorista-de-aplicativo",
    rotulo: "Motorista de aplicativo (Uber e 99)",
    titulo: "Certidão de Objeto e Pé para Motorista de Aplicativo | Conta Bloqueada",
    h1: "Conta bloqueada no aplicativo por causa de um processo? Esclareça oficialmente",
    descricao:
      "Motorista de Uber ou 99 com conta bloqueada após a análise de antecedentes. A Certidão de Objeto e Pé mostra do que trata o processo e em que fase ele está. Solicite online.",
    resumo:
      "A análise de segurança dos aplicativos identifica a existência de processo, mas não o conteúdo dele. A Certidão de Objeto e Pé é o documento oficial do tribunal que descreve o objeto e a situação atual do caso — é o que costuma ser pedido para reavaliar a conta.",
    gatilhos: [
      "Conta desativada após atualização da checagem de antecedentes",
      "Cadastro novo reprovado na análise de segurança",
      "Aplicativo pediu documento que comprove a situação do processo",
      "Processo antigo que você acreditava encerrado voltou a aparecer",
    ],
    secoes: [
      {
        h2: "O que costuma acontecer no bloqueio",
        paragrafos: [
          "A plataforma recebe um retorno indicando processo no seu CPF e suspende a conta por precaução. Como o retorno não descreve o caso, o suporte não consegue avaliar sozinho e pede um documento que explique a situação processual.",
          "A Certidão de Objeto e Pé é emitida pelo próprio tribunal onde o processo tramita e traz essa descrição de forma oficial.",
        ],
      },
      {
        h2: "Como usar a certidão no recurso",
        paragrafos: [
          "Anexe o PDF da certidão na resposta ao suporte, junto de uma explicação curta e objetiva.",
        ],
        lista: [
          "Informe o número do processo e o tribunal",
          "Aponte na certidão a fase atual (arquivado, suspenso, absolvição, acordo)",
          "Se houver mais de um processo, peça uma certidão para cada um",
          "Guarde o protocolo do atendimento para acompanhar a reanálise",
        ],
      },
      COMO_PEDIR,
    ],
    faq: [
      {
        q: "Preciso de uma certidão por processo?",
        a: "Sim. Cada certidão trata de um processo específico. No formulário você pode pedir até cinco de uma vez, com desconto progressivo.",
      },
      {
        q: "Em quanto tempo recebo?",
        a: "O prazo depende do tribunal onde o processo tramita. Assim que o pedido é confirmado, você acompanha cada etapa pelo protocolo e recebe a certidão em PDF por e-mail.",
      },
      ...FAQ_COMUM,
    ],
  },
  {
    slug: "concurso-publico",
    rotulo: "Concurso público e investigação social",
    titulo: "Certidão de Objeto e Pé para Concurso Público e Investigação Social",
    h1: "Investigação social do concurso encontrou um processo? Esclareça com a certidão",
    descricao:
      "Candidato de concurso da PM, Polícia Civil, PF, PRF, polícia penal, bombeiros ou guarda municipal com certidão criminal positiva. A Certidão de Objeto e Pé detalha o processo. Peça online.",
    resumo:
      "Concursos com investigação social e análise de vida pregressa exigem certidões criminais. Quando a certidão vem positiva, é a Certidão de Objeto e Pé que mostra do que trata o processo e em que fase ele está — permitindo que a comissão avalie o caso concreto.",
    gatilhos: [
      "Certidão criminal saiu positiva na fase de investigação social",
      "Comissão do concurso pediu esclarecimento sobre processo em andamento",
      "Processo antigo, arquivado ou com absolvição ainda consta nos registros",
      "Cargo exige análise de vida pregressa (segurança pública e Forças Armadas)",
    ],
    secoes: [
      {
        h2: "Certidão positiva não é eliminação automática",
        paragrafos: [
          "Uma certidão criminal positiva indica que existe registro processual, e não que houve condenação. A comissão precisa saber qual é o processo, qual a sua posição nele e qual a fase atual para decidir.",
          "A Certidão de Objeto e Pé entrega exatamente essa informação, assinada pelo tribunal. Ela costuma ser apresentada junto de uma justificativa escrita do candidato.",
        ],
      },
      {
        h2: "Monte a sua defesa documental",
        paragrafos: [
          "Reúna o conjunto completo antes do prazo do edital — pedidos de última hora costumam esbarrar no prazo do tribunal.",
        ],
        lista: [
          "Certidão de Objeto e Pé de cada processo apontado",
          "Cópia da sentença ou da decisão de arquivamento, quando houver",
          "Declaração do candidato explicando o contexto de forma objetiva",
          "Comprovante de cumprimento de acordo, se aplicável",
        ],
      },
      COMO_PEDIR,
    ],
    faq: [
      {
        q: "Serve para qualquer concurso?",
        a: "A certidão é um documento geral do tribunal e pode ser apresentada em qualquer processo seletivo que peça esclarecimento sobre a situação de um processo judicial. Sempre confira o que o seu edital exige.",
      },
      {
        q: "Preciso pedir certidão de todos os tribunais?",
        a: "Não. Você precisa da certidão do tribunal onde tramita cada processo apontado. Informando o número do processo, identificamos o tribunal automaticamente.",
      },
      ...FAQ_COMUM,
    ],
  },
  {
    slug: "candidato-eleicoes-2026",
    rotulo: "Candidato e registro de candidatura",
    titulo: "Certidão de Objeto e Pé para Candidato nas Eleições 2026",
    h1: "Registro de candidatura com certidão criminal positiva: o que apresentar",
    descricao:
      "Candidato a vereador, prefeito, deputado, senador ou governador com certidão criminal positiva precisa detalhar a situação de cada processo. Solicite a Certidão de Objeto e Pé online.",
    resumo:
      "No registro de candidatura, certidões criminais positivas costumam exigir documento complementar que informe a situação atual de cada processo — papel da Certidão de Objeto e Pé (também chamada de certidão circunstanciada, ou de narrativa, conforme o tribunal).",
    gatilhos: [
      "Certidão criminal exigida no registro de candidatura veio positiva",
      "Partido ou advogado eleitoral pediu certidão circunstanciada dos processos",
      "Impugnação de candidatura por falta de esclarecimento processual",
      "Pré-campanha: levantamento preventivo da situação judicial do pré-candidato",
    ],
    secoes: [
      {
        h2: "Por que o documento é pedido no registro",
        paragrafos: [
          "As certidões criminais entregues no registro apenas apontam a existência de processos. Diante de uma certidão positiva, a Justiça Eleitoral costuma pedir a Certidão de Objeto e Pé (ou certidão circunstanciada) para conhecer o objeto e a situação atual de cada processo — o TRE-CE, por exemplo, orienta expressamente nesse sentido para as Eleições 2026.",
          "O próprio TSE disponibiliza requerimento específico de Certidão de Objeto e Pé, inclusive para processos eleitorais.",
        ],
      },
      {
        h2: "Prepare a documentação antes do prazo",
        paragrafos: [
          "O prazo de registro é curto e não espera o tribunal. Antecipar o pedido é a diferença entre juntar o documento a tempo e enfrentar uma diligência.",
        ],
        lista: [
          "Levante todos os processos apontados nas certidões criminais",
          "Peça uma Certidão de Objeto e Pé por processo",
          "Entregue ao advogado eleitoral junto do restante da documentação",
          "Guarde os PDFs para eventuais impugnações",
        ],
      },
      COMO_PEDIR,
    ],
    faq: [
      {
        q: "Certidão circunstanciada e Certidão de Objeto e Pé são a mesma coisa?",
        a: "Na prática, cumprem a mesma função: descrever o objeto e a situação atual do processo. O nome varia conforme o tribunal, e o requerimento do TSE trata expressamente de Certidão de Objeto e Pé.",
      },
      {
        q: "Atendem processos eleitorais e criminais?",
        a: "Sim. Informe o número do processo e identificamos o tribunal competente, seja ele estadual, federal, trabalhista ou eleitoral.",
      },
      ...FAQ_COMUM,
    ],
    fontes: [
      { nome: "TSE — requerimento de Certidão de Objeto e Pé", url: "https://www.tse.jus.br" },
      { nome: "TRE-CE — orientações de registro de candidatura", url: "https://www.tre-ce.jus.br" },
    ],
  },
  {
    slug: "advogado",
    rotulo: "Advogados e escritórios",
    titulo: "Certidão de Objeto e Pé para Advogados e Escritórios | Pedido Terceirizado",
    h1: "Terceirize a obtenção de Certidão de Objeto e Pé do seu escritório",
    descricao:
      "Escritórios e departamentos jurídicos que precisam de Certidão de Objeto e Pé em qualquer tribunal do país. Pedido online, protocolo de acompanhamento e entrega em PDF.",
    resumo:
      "Solicitar certidão em tribunal fora da sua base consome tempo do escritório com deslocamento, sistemas diferentes e filas de protocolo. Você informa o número do processo e nós cuidamos de todo o trâmite, em qualquer tribunal do Brasil.",
    gatilhos: [
      "Processo tramita em comarca ou tribunal fora da sua atuação",
      "Cliente precisa da certidão com prazo curto",
      "Volume de pedidos que não compensa alocar equipe interna",
      "Instrução de registro de candidatura, licitação, concurso ou due diligence",
    ],
    secoes: [
      {
        h2: "Como funciona para escritórios",
        paragrafos: [
          "O fluxo é o mesmo do cliente final, com a vantagem de pedir até cinco certidões no mesmo protocolo e acompanhar tudo pela área do cliente.",
        ],
        lista: [
          "Pedido único com vários processos, inclusive de tribunais diferentes",
          "Protocolo de acompanhamento e histórico de andamentos",
          "Comprovante em PDF para anexar à pasta do cliente",
          "Preço fechado por certidão, sem custo de deslocamento",
        ],
      },
      {
        h2: "Onde a certidão é mais usada na rotina jurídica",
        paragrafos: [
          "Além das demandas do dia a dia contencioso, a certidão aparece com frequência em instruções documentais.",
        ],
        lista: [
          "Registro de candidatura e matéria eleitoral",
          "Habilitação em licitações e credenciamentos",
          "Due diligence imobiliária e societária",
          "Concursos públicos e procedimentos de idoneidade em conselhos profissionais",
        ],
      },
      COMO_PEDIR,
    ],
    faq: [
      {
        q: "Posso pedir em nome do cliente?",
        a: "Sim. Basta informar os dados da parte relacionada ao processo. O contato de acompanhamento pode ser o do escritório.",
      },
      {
        q: "Emitem nota fiscal?",
        a: "Sim. Fale com a nossa equipe pelo e-mail de contato informando os dados de faturamento.",
      },
      ...FAQ_COMUM,
    ],
  },
  {
    slug: "compra-e-venda-de-imovel",
    rotulo: "Compra e venda de imóvel",
    titulo: "Certidão de Objeto e Pé na Compra e Venda de Imóvel | Due Diligence",
    h1: "Apareceu processo contra o vendedor do imóvel? Entenda o risco antes de assinar",
    descricao:
      "Na due diligence de compra e venda de imóvel, certidões positivas do vendedor exigem análise. A Certidão de Objeto e Pé mostra o objeto e a fase de cada processo. Peça online.",
    resumo:
      "Certidões de distribuição mostram que existe processo contra o vendedor, mas não dizem se ele envolve valores capazes de gerar penhora, indisponibilidade ou fraude à execução. A Certidão de Objeto e Pé traz o objeto e a situação atual de cada processo, base para decidir com segurança.",
    gatilhos: [
      "Certidão de distribuição do vendedor veio positiva",
      "Banco pediu esclarecimento de processo na análise do financiamento",
      "Compra de imóvel de pessoa jurídica ou de espólio",
      "Suspeita de execução, penhora ou indisponibilidade sobre o patrimônio",
    ],
    secoes: [
      {
        h2: "O que checar antes de assinar",
        paragrafos: [
          "O risco real de uma compra não está na existência do processo, e sim no seu objeto e na sua fase. Uma ação de cobrança em fase de execução tem peso muito diferente de um processo de família já arquivado.",
        ],
        lista: [
          "Objeto do processo e valor envolvido",
          "Fase atual: conhecimento, execução, recurso ou arquivado",
          "Se o vendedor figura como autor ou réu",
          "Existência de constrição patrimonial já determinada",
        ],
      },
      {
        h2: "Como a certidão entra na negociação",
        paragrafos: [
          "Com o documento oficial em mãos, comprador, corretor e advogado avaliam o mesmo conjunto de fatos. Isso encurta a negociação e evita desistências por insegurança.",
          "Em muitos casos, a certidão mostra que o processo apontado não oferece risco à transação — e o negócio segue.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: [
      {
        q: "Posso pedir certidão de processo em nome do vendedor?",
        a: "Sim. A certidão é emitida a partir do número do processo e dos dados da parte relacionada a ele.",
      },
      {
        q: "E se houver vários processos?",
        a: "Peça uma certidão por processo. O formulário aceita até cinco no mesmo pedido, com valor progressivo.",
      },
      ...FAQ_COMUM,
    ],
  },
  {
    slug: "certidao-criminal-positiva",
    rotulo: "Certidão criminal positiva",
    titulo: "Certidão Criminal Positiva: o Que Fazer e Como Esclarecer o Processo",
    h1: "Sua certidão criminal veio positiva? Descubra do que se trata o processo",
    descricao:
      "Certidão criminal positiva significa que existe registro de processo — não que houve condenação. A Certidão de Objeto e Pé mostra o objeto e a fase atual. Solicite online.",
    resumo:
      "Uma certidão positiva só informa que existe processo vinculado ao seu nome ou CPF. Para saber qual é o assunto, qual a sua posição e se já houve decisão, o documento correto é a Certidão de Objeto e Pé, emitida pelo tribunal.",
    gatilhos: [
      "Certidão emitida para emprego, concurso ou cadastro veio positiva",
      "Você não reconhece o processo apontado",
      "Suspeita de homonímia (mesmo nome, pessoa diferente)",
      "Necessidade de comprovar que não houve condenação",
    ],
    secoes: [
      {
        h2: "Positiva não é sinônimo de condenação",
        paragrafos: [
          "O sistema aponta a existência de registro, seja ele um inquérito arquivado, um processo suspenso, uma absolvição ou um caso ainda em andamento. Quem lê a certidão sem contexto tende a presumir o pior.",
          "A Certidão de Objeto e Pé transforma esse apontamento genérico em informação verificável: objeto, partes e fase atual.",
        ],
      },
      {
        h2: "Passos recomendados",
        paragrafos: ["Siga esta ordem para resolver o assunto sem retrabalho."],
        lista: [
          "Anote o número de cada processo apontado na certidão",
          "Peça uma Certidão de Objeto e Pé por processo",
          "Verifique se você é mesmo a parte indicada",
          "Entregue o documento a quem pediu o esclarecimento",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "processo-arquivado",
    rotulo: "Processo arquivado ou encerrado",
    titulo: "Processo Arquivado Continua Aparecendo? Comprove com a Certidão",
    h1: "Processo arquivado, extinto ou prescrito ainda aparece no seu nome",
    descricao:
      "Processo já encerrado que continua aparecendo em consultas. A Certidão de Objeto e Pé, emitida pelo tribunal, registra a fase atual do processo. Solicite online.",
    resumo:
      "Consultas de antecedentes não distinguem processo ativo de processo encerrado. A Certidão de Objeto e Pé é o documento que declara oficialmente que o caso foi arquivado, extinto, prescrito ou concluído com decisão favorável.",
    gatilhos: [
      "Processo arquivado há anos ainda aparece em consulta",
      "Absolvição ou acordo cumprido que não é reconhecido pelo cadastro",
      "Cadastro, contratação ou crédito travado por processo antigo",
      "Necessidade de comprovar prescrição ou extinção",
    ],
    secoes: [
      {
        h2: "Por que o registro continua visível",
        paragrafos: [
          "O encerramento de um processo não apaga o registro da sua existência: ele permanece na base do tribunal com a respectiva movimentação. A consulta simples mostra o registro; a certidão mostra o desfecho.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "entregador",
    rotulo: "Entregador e plataformas",
    titulo: "Certidão de Objeto e Pé para Entregador e Motoboy de Aplicativo",
    h1: "Cadastro de entregador bloqueado por apontamento judicial",
    descricao:
      "Entregador, motoboy ou prestador de plataforma com cadastro travado na análise de antecedentes. A Certidão de Objeto e Pé esclarece o processo. Peça online.",
    resumo:
      "Plataformas de entrega e logística fazem checagem de antecedentes antes de liberar o cadastro. Quando aparece um processo, pode ser solicitada documentação que esclareça a situação — e a Certidão de Objeto e Pé é o documento oficial que cumpre esse papel.",
    gatilhos: [
      "Cadastro reprovado na análise de segurança da plataforma",
      "Conta suspensa após recheque de antecedentes",
      "Contratação por operador logístico travada na documentação",
      "Processo antigo que precisa ser explicado",
    ],
    secoes: [
      {
        h2: "O que a plataforma precisa saber",
        paragrafos: [
          "A informação que falta na análise é sempre a mesma: qual é o processo e em que fase ele está. Como a exigência varia de empresa para empresa, confirme no canal de suporte qual documento deve ser anexado antes de enviar.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "licitacao",
    rotulo: "Licitações e habilitação",
    titulo: "Certidão de Objeto e Pé em Licitação e Habilitação de Empresas",
    h1: "Apontamento judicial na habilitação da licitação: como esclarecer",
    descricao:
      "Empresas, sócios e administradores com processo apontado na fase de habilitação. A Certidão de Objeto e Pé descreve o objeto e a situação do processo. Solicite online.",
    resumo:
      "Na habilitação, certidões positivas da empresa ou dos sócios geram diligência. A Certidão de Objeto e Pé permite demonstrar do que trata o processo e em que fase ele está, dentro do prazo apertado do certame.",
    gatilhos: [
      "Comissão de licitação abriu diligência sobre processo apontado",
      "Certidão de distribuição da empresa ou dos sócios veio positiva",
      "Credenciamento ou cadastro de fornecedor travado",
      "Necessidade de instruir recurso administrativo",
    ],
    secoes: [
      {
        h2: "Prazo de diligência é curto",
        paragrafos: [
          "Diligências costumam ter prazo de poucos dias úteis. Solicitar a certidão assim que o apontamento aparece evita perder a habilitação por falta de documento.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "empresa-e-socios",
    rotulo: "Empresários e sócios",
    titulo: "Certidão de Objeto e Pé para Empresa, Sócios e Administradores",
    h1: "Processo no nome da empresa ou dos sócios: esclareça com documento oficial",
    descricao:
      "Empresários, sócios e administradores que precisam explicar processos em crédito, sociedade, venda de empresa ou due diligence. Peça a Certidão de Objeto e Pé online.",
    resumo:
      "Em análises de crédito, entrada de sócio, fusão ou venda de participação, um processo listado sem contexto vira obstáculo. A Certidão de Objeto e Pé descreve o objeto e a fase, permitindo avaliar risco real.",
    gatilhos: [
      "Due diligence societária ou venda de participação",
      "Entrada de investidor ou novo sócio",
      "Análise de crédito empresarial",
      "Processos que precisam ser mapeados pelo jurídico interno",
    ],
    secoes: [
      {
        h2: "Transformar 'existe processo' em informação útil",
        paragrafos: [
          "Listas de processos sem descrição levam a desconto no preço ou à interrupção da negociação. Com a certidão, cada processo passa a ter objeto, fase e posição das partes documentados pelo tribunal.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "financiamento",
    rotulo: "Financiamento e crédito",
    titulo: "Certidão de Objeto e Pé para Financiamento e Análise de Crédito",
    h1: "Processo apareceu na análise do financiamento? Esclareça a situação",
    descricao:
      "Financiamento imobiliário, crédito empresarial ou consórcio travado por processo judicial. A Certidão de Objeto e Pé mostra o objeto e a fase do processo. Solicite online.",
    resumo:
      "Bancos e financeiras avaliam risco. Um processo sem descrição pesa contra você mesmo quando não tem relação com dívida. A Certidão de Objeto e Pé fornece a informação oficial que o analista precisa.",
    gatilhos: [
      "Financiamento imobiliário em análise com pendência judicial",
      "Crédito empresarial condicionado a esclarecimento",
      "Consórcio contemplado aguardando análise documental",
      "Processo trabalhista ou cível apontado na consulta do banco",
    ],
    secoes: [
      {
        h2: "O que o analista quer verificar",
        paragrafos: [
          "A pergunta do crédito é sempre sobre risco patrimonial: o processo pode gerar penhora ou dívida relevante? A certidão responde com objeto, fase e situação atual.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "rh-e-compliance",
    rotulo: "RH, compliance e background check",
    titulo: "Certidão de Objeto e Pé para RH, Compliance e Background Check",
    h1: "Background check com apontamento judicial: decida com base em fato",
    descricao:
      "RH, compliance e gerenciadoras de risco que precisam avaliar processos apontados em checagem de antecedentes. Solicite a Certidão de Objeto e Pé online, em qualquer tribunal.",
    resumo:
      "Checagens de antecedentes retornam a existência de processos, sem descrever o conteúdo. Para decidir contratação, credenciamento ou homologação com segurança jurídica, a Certidão de Objeto e Pé traz objeto e fase atual direto do tribunal.",
    gatilhos: [
      "Triagem de candidatos com apontamento judicial",
      "Credenciamento de prestadores e terceirizados",
      "Programa de compliance e homologação de fornecedores",
      "Reanálise de motoristas e profissionais cadastrados",
    ],
    secoes: [
      {
        h2: "Decisão documentada reduz risco",
        paragrafos: [
          "Registrar a certidão no dossiê mostra que a decisão foi baseada em informação oficial, e não em presunção — ponto relevante em auditorias e em eventuais questionamentos.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "oab",
    rotulo: "Inscrição na OAB",
    titulo: "Certidão de Objeto e Pé para Inscrição na OAB",
    h1: "Inscrição na OAB com processo em andamento: o que apresentar",
    descricao:
      "Bacharel que precisa esclarecer processo judicial no pedido de inscrição na OAB. A Certidão de Objeto e Pé descreve o objeto e a fase. Solicite online.",
    resumo:
      "O exame de idoneidade da inscrição pode pedir esclarecimento sobre processos apontados nas certidões criminais. Seccionais como a OAB-MA preveem a apresentação da Certidão de Objeto e Pé nessas situações.",
    gatilhos: [
      "Certidão criminal positiva no pedido de inscrição",
      "Comissão pediu esclarecimento sobre processo em andamento",
      "Processo de improbidade que precisa ser detalhado",
      "Transferência de seccional com nova análise documental",
    ],
    secoes: [
      {
        h2: "Confira a exigência da sua seccional",
        paragrafos: [
          "Cada seccional define a lista documental do pedido de inscrição. Verifique no edital ou no regulamento local quais certidões são exigidas e para quais processos.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
    fontes: [{ nome: "OAB — seccionais", url: "https://www.oab.org.br" }],
  },
  {
    slug: "corretor-de-imoveis",
    rotulo: "Corretor de imóveis e CRECI",
    titulo: "Certidão de Objeto e Pé para Corretor de Imóveis e CRECI",
    h1: "Corretor de imóveis: certidão sobre processo ético-disciplinar ou judicial",
    descricao:
      "Corretores e imobiliárias que precisam de certidão sobre a situação de processo. O CRECI-SP tem procedimento específico de Certidão de Objeto e Pé. Solicite online.",
    resumo:
      "Corretores e imobiliárias lidam com dois cenários: a própria situação disciplinar ou judicial e a análise de processos das partes na intermediação. Em ambos, a Certidão de Objeto e Pé descreve objeto e fase atual.",
    gatilhos: [
      "Processo ético-disciplinar no conselho",
      "Habilitação em cadastro de parceiros e incorporadoras",
      "Due diligence de vendedor com certidão positiva",
      "Necessidade de comprovar situação de processo ao cliente",
    ],
    secoes: [
      {
        h2: "Dois usos na rotina do corretor",
        paragrafos: [
          "O primeiro é pessoal ou da imobiliária, em procedimentos do conselho. O segundo é operacional: garantir que o processo apontado contra o vendedor não inviabiliza a venda.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
    fontes: [{ nome: "CRECI-SP", url: "https://www.crecisp.gov.br" }],
  },
  {
    slug: "recuperacao-judicial",
    rotulo: "Recuperação judicial",
    titulo: "Certidão de Objeto e Pé em Recuperação Judicial",
    h1: "Recuperação judicial: comprove o objeto e a fase dos processos",
    descricao:
      "Empresas em recuperação judicial, credores e investidores que precisam documentar a situação de processos. Solicite a Certidão de Objeto e Pé online.",
    resumo:
      "Em recuperações judiciais, a Certidão de Objeto e Pé aparece com frequência na instrução: ela descreve o objeto e a fase de processos relacionados à empresa, aos sócios ou aos créditos discutidos.",
    gatilhos: [
      "Instrução do pedido de recuperação",
      "Habilitação ou impugnação de crédito",
      "Análise de investidor interessado em ativos",
      "Prestação de informações ao administrador judicial",
    ],
    secoes: [
      {
        h2: "Documento por processo",
        paragrafos: [
          "Cada processo relevante exige a sua própria certidão. Organize a lista antes de pedir para evitar diligências posteriores.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "inventario",
    rotulo: "Inventário e sucessões",
    titulo: "Certidão de Objeto e Pé para Inventário e Partilha",
    h1: "Inventário com processos em aberto: esclareça antes da partilha",
    descricao:
      "Herdeiros, inventariantes e advogados de sucessões que precisam documentar processos do espólio ou dos herdeiros. Peça a Certidão de Objeto e Pé online.",
    resumo:
      "Antes da partilha, processos ligados ao falecido, ao espólio ou aos herdeiros precisam ser compreendidos. A Certidão de Objeto e Pé informa objeto e fase atual de cada um.",
    gatilhos: [
      "Processos em nome do falecido ou do espólio",
      "Venda de bem do espólio com certidão positiva",
      "Herdeiro com processo que pode afetar o quinhão",
      "Instrução documental do inventário judicial",
    ],
    secoes: [
      {
        h2: "Evite surpresa depois da partilha",
        paragrafos: [
          "Um processo em fase de execução pode alcançar bens partilhados. Levantar a situação antes protege herdeiros e compradores.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
  {
    slug: "processo-trabalhista",
    rotulo: "Processo trabalhista",
    titulo: "Certidão de Objeto e Pé de Processo Trabalhista",
    h1: "Comprove a situação do seu processo trabalhista",
    descricao:
      "Trabalhadores, ex-funcionários e empresas que precisam comprovar acordo, pagamento ou encerramento de reclamação trabalhista. Solicite a Certidão de Objeto e Pé online.",
    resumo:
      "Reclamações trabalhistas aparecem em consultas de crédito, cadastro e contratação. A Certidão de Objeto e Pé, emitida pelo Tribunal Regional do Trabalho, descreve o objeto e a fase — inclusive acordo cumprido ou arquivamento.",
    gatilhos: [
      "Acordo homologado que precisa ser comprovado",
      "Empresa precisa demonstrar situação de reclamações em curso",
      "Cadastro de fornecedor com apontamento trabalhista",
      "Processo encerrado que continua aparecendo",
    ],
    secoes: [
      {
        h2: "Vale para as duas pontas",
        paragrafos: [
          "Tanto o trabalhador quanto a empresa podem precisar do documento: o primeiro para comprovar o andamento do seu caso, a segunda para responder a cadastros e auditorias.",
        ],
      },
      COMO_PEDIR,
    ],
    faq: FAQ_COMUM,
  },
];

export const PUBLICO_POR_SLUG = new Map(PUBLICOS_SEO.map((p) => [p.slug, p]));
