import type { Post } from "./tipos";

const CTA = "Precisa apresentar a certidão a uma empresa, banco ou órgão público? Envie número do processo, nome e CPF da parte e cuidamos de todo o trâmite junto ao tribunal.";

export const POSTS_USOS: Post[] = [
  {
    slug: "certidao-de-objeto-e-pe-para-motorista-gerenciadora-de-risco",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé para motoristas e gerenciadoras de risco",
    h1: "Certidão de Objeto e Pé para motoristas e gerenciadoras de risco",
    descricao:
      "Cadastro bloqueado por processo? Veja como a Certidão de Objeto e Pé libera o motorista na gerenciadora de risco e nas transportadoras.",
    resumo: "O uso número 1 do documento: destravar cadastro de motorista profissional.",
    atualizado: "2026-08-26",
    leitura: 6,
    blocos: [
      { t: "p", x: "Gerenciadoras de risco consultam bancos de dados judiciais antes de liberar um motorista para transporte de carga. Quando aparece qualquer processo — mesmo antigo, arquivado ou sem condenação — o cadastro é bloqueado até que se esclareça do que se trata." },
      { t: "h", x: "Por que a certidão resolve" },
      { t: "p", x: "A consulta que a gerenciadora faz mostra apenas número, classe e nome. Ela não diz se houve absolvição, arquivamento ou prescrição. A Certidão de Objeto e Pé é o documento oficial que traduz o apontamento e permite ao analista aprovar o cadastro." },
      { t: "h", x: "Passo a passo para liberar o cadastro" },
      { t: "ol", items: [
        "Peça à gerenciadora ou à transportadora a relação exata dos processos apontados.",
        "Confirme o número CNJ de cada um.",
        "Solicite a Certidão de Objeto e Pé de cada processo apontado.",
        "Envie as certidões junto com documentos pessoais para nova análise.",
        "Guarde os PDFs: eles serão pedidos novamente em outras contratações.",
      ] },
      { t: "nota", x: "Certidão vencida é motivo comum de nova recusa. A maioria das gerenciadoras aceita documentos com até 30 a 90 dias de emissão." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Processo antigo e arquivado ainda bloqueia?", a: "Bloqueia enquanto não houver comprovação. A certidão que atesta o arquivamento normalmente resolve a pendência." },
      { q: "Quantas certidões preciso?", a: "Uma para cada processo apontado. Nosso pedido aceita de 1 a 5 certidões com valor progressivo." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-compra-de-imovel",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé na compra de imóvel",
    h1: "Certidão de Objeto e Pé na compra e venda de imóveis",
    descricao:
      "Comprar imóvel de quem tem processo: como a certidão afasta o risco de fraude à execução e viabiliza o financiamento.",
    resumo: "A peça que falta no dossiê de certidões do vendedor.",
    atualizado: "2026-08-26",
    leitura: 6,
    blocos: [
      { t: "p", x: "Na compra de imóvel, o comprador levanta certidões do vendedor nas justiças estadual, federal e trabalhista. Quando alguma sai positiva, o negócio trava — e é a Certidão de Objeto e Pé que permite avaliar o risco real." },
      { t: "h", x: "O risco que se quer afastar" },
      { t: "p", x: "A fraude à execução ocorre quando o vendedor aliena bem enquanto responde a ação capaz de levá-lo à insolvência. O negócio pode ser declarado ineficaz. Por isso, o comprador precisa saber o objeto, o valor e a fase de cada processo do vendedor." },
      { t: "h", x: "O que analisar em cada certidão" },
      { t: "ul", items: [
        "Valor da causa ou da execução frente ao patrimônio do vendedor.",
        "Existência de penhora ou indisponibilidade de bens.",
        "Fase: ação em início tem risco diferente de execução com constrição.",
        "Se o imóvel objeto do negócio está listado nos autos.",
      ] },
      { t: "nota", x: "Cartórios e bancos costumam exigir a certidão de objeto e pé como condição para lavrar escritura e liberar financiamento quando há apontamento." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Toda certidão positiva impede a compra?", a: "Não. Muitas ações não têm repercussão patrimonial. A certidão é justamente o que permite essa distinção." },
      { q: "Quem paga a certidão?", a: "Em regra o vendedor, mas é comum o comprador antecipar para agilizar o negócio." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-financiamento-e-credito",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé para financiamento e análise de crédito",
    h1: "Certidão de Objeto e Pé em financiamento e crédito",
    descricao:
      "Bancos e financeiras pedem a certidão quando aparece processo na análise. Veja o que a instituição avalia e como agilizar a aprovação.",
    resumo: "Como o documento destrava crédito imobiliário, consórcio e limites bancários.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Na análise de crédito, o comitê precisa medir o risco de o proponente perder patrimônio ou renda. Processos identificados na consulta geram exigência documental — quase sempre a Certidão de Objeto e Pé." },
      { t: "h", x: "O que o banco observa" },
      { t: "ul", items: [
        "Natureza do processo: consumo, família, execução ou criminal.",
        "Valor envolvido comparado à renda e ao patrimônio.",
        "Existência de penhora sobre bens ou bloqueio de valores.",
        "Fase processual e chance de repercussão financeira imediata.",
      ] },
      { t: "h", x: "Como acelerar" },
      { t: "ol", items: [
        "Peça a lista exata de apontamentos ao gerente ou ao analista.",
        "Solicite as certidões de todos os processos listados de uma vez.",
        "Envie os PDFs assinados, não prints de consulta processual.",
        "Se houver acordo ou pagamento, junte também o comprovante." ,
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Print da consulta serve?", a: "Normalmente não. Instituições exigem documento oficial assinado pelo tribunal, com código de autenticidade." },
      { q: "Ação em que sou autor atrapalha?", a: "Em regra não, e a certidão deixa claro que você figura no polo ativo, não como devedor." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-licitacao",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé em licitações públicas",
    h1: "Certidão de Objeto e Pé para habilitação em licitação",
    descricao:
      "Como usar a certidão para comprovar a situação de processos apontados na habilitação jurídica e fiscal de licitações.",
    resumo: "O documento que sustenta a habilitação quando surge apontamento judicial.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Na habilitação, a comissão exige certidões negativas. Quando alguma sai positiva, a empresa precisa demonstrar que o apontamento não configura impedimento — por suspensão de exigibilidade, parcelamento, garantia ou discussão judicial em curso." },
      { t: "h", x: "Situações típicas" },
      { t: "tabela", head: ["Apontamento", "O que a certidão demonstra"], rows: [
        ["Execução fiscal", "Parcelamento ativo, garantia ou suspensão da exigibilidade"],
        ["Processo trabalhista", "Fase, acordo cumprido ou depósito recursal"],
        ["Recuperação judicial", "Plano homologado e cumprimento em curso"],
        ["Ação cível", "Objeto sem repercussão em idoneidade da empresa"],
      ] },
      { t: "nota", x: "Prazos de licitação são curtos. Levante os processos e solicite as certidões antes da abertura da sessão, não depois da exigência." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Recuperação judicial impede licitar?", a: "Não automaticamente. Com plano homologado e certidão que comprove a situação, a participação costuma ser admitida conforme o edital." },
      { q: "Preciso de certidão de todos os processos?", a: "Dos processos apontados nas certidões positivas exigidas pelo edital." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-concurso-publico",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé para concurso público e investigação social",
    h1: "Certidão de Objeto e Pé em concurso público",
    descricao:
      "Aprovado e barrado na investigação social? Veja como a certidão comprova arquivamento, absolvição ou extinção da punibilidade.",
    resumo: "A etapa que reprova mais candidato do que a prova: a investigação social.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Concursos de carreiras policiais, militares, judiciárias e do Ministério Público têm fase de investigação social. Qualquer apontamento judicial deve ser declarado e comprovado documentalmente." },
      { t: "h", x: "O que apresentar" },
      { t: "ul", items: [
        "Certidões negativas das justiças estadual, federal, eleitoral e militar (quando exigida).",
        "Certidão de Objeto e Pé de cada processo apontado.",
        "Comprovante de cumprimento de transação penal ou de suspensão condicional, se houver.",
      ] },
      { t: "nota", x: "Omitir processo é mais grave do que tê-lo. Declarar e comprovar a situação com certidão é o caminho seguro." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Processo em curso elimina o candidato?", a: "Depende do edital e da natureza do fato. A certidão que demonstra a fase e a inexistência de condenação costuma preservar a candidatura." },
      { q: "Preciso de certidão de processo cível?", a: "Se o edital exigir a comprovação, sim — inclusive de execuções e ações de família em alguns casos." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-visto-e-imigracao",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé para visto, cidadania e imigração",
    h1: "Certidão de Objeto e Pé para processos de imigração",
    descricao:
      "Consulados pedem comprovação de antecedentes. Entenda quando a Certidão de Objeto e Pé é exigida, com apostila e tradução juramentada.",
    resumo: "Documento com apostila de Haia para uso no exterior.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Vistos de residência, cidadania e processos de imigração exigem comprovação de antecedentes criminais. Se aparecer processo, o consulado normalmente pede documento oficial que descreva o feito e sua conclusão." },
      { t: "h", x: "Fluxo completo para uso no exterior" },
      { t: "ol", items: [
        "Emitir a Certidão de Objeto e Pé no tribunal competente.",
        "Apostilar o documento em cartório autorizado (Convenção de Haia).",
        "Providenciar tradução juramentada para o idioma exigido.",
        "Apostilar também a tradução, quando o país destinatário exigir.",
      ] },
      { t: "nota", x: "Consulados costumam aceitar documentos com no máximo 90 dias de emissão. Planeje a ordem: certidão, apostila, tradução." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Certidão digital pode ser apostilada?", a: "Sim. O cartório verifica o código de autenticidade e apostila o documento." },
      { q: "Preciso traduzir antes ou depois de apostilar?", a: "Em regra, apostila-se a certidão, traduz-se e, se exigido, apostila-se a tradução." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-para-emprego-e-contratacao",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé em processos de contratação",
    h1: "Certidão de Objeto e Pé em contratação e background check",
    descricao:
      "Background check corporativo: quando a empresa pode pedir a certidão, quais os limites legais e como o candidato deve responder.",
    resumo: "Os limites entre triagem legítima e discriminação.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Background check é prática comum em funções de confiança, manuseio de valores, segurança e cargos com acesso a dados sensíveis. A exigência de certidões deve guardar relação direta com a atividade." },
      { t: "h", x: "Limites" },
      { t: "ul", items: [
        "A jurisprudência trabalhista considera abusiva a exigência genérica de antecedentes criminais.",
        "Consulta a processos trabalhistas do candidato para recusa é vista como discriminatória e gera indenização.",
        "Funções específicas (vigilante, motorista de valores, cuidador) têm respaldo legal ou regulatório.",
      ] },
      { t: "h", x: "Se você é o candidato" },
      { t: "p", x: "Havendo apontamento, apresentar a Certidão de Objeto e Pé que demonstre arquivamento, absolvição ou irrelevância do objeto costuma ser mais eficiente do que discutir a exigência." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Empresa pode exigir antecedentes de qualquer cargo?", a: "Não. A exigência precisa ser compatível com a natureza da função, sob pena de ser considerada discriminatória." },
      { q: "Posso me recusar a apresentar?", a: "Pode, mas avalie o custo prático. Muitas vezes a certidão esclarece o caso a seu favor." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-due-diligence",
    categoria: "usos",
    titulo: "Certidão de Objeto e Pé em due diligence de M&A",
    h1: "Certidão de Objeto e Pé em due diligence",
    descricao:
      "Como estruturar o levantamento de processos e certidões em operações de fusão, aquisição e investimento.",
    resumo: "Do levantamento de apontamentos ao dossiê de contingências.",
    atualizado: "2026-08-26",
    leitura: 6,
    blocos: [
      { t: "p", x: "Em M&A, o comprador precisa quantificar passivos judiciais. Certidões negativas não bastam: quando há processos, o valuation depende de conhecer objeto, valor e fase de cada um." },
      { t: "h", x: "Roteiro de levantamento" },
      { t: "ol", items: [
        "Consultar CNPJ da target e de suas controladas nos tribunais estaduais, federais e trabalhistas.",
        "Consultar CPF dos sócios administradores, quando houver risco de responsabilização.",
        "Classificar os processos por ramo e materialidade.",
        "Solicitar Certidão de Objeto e Pé dos processos relevantes.",
        "Consolidar em matriz de contingência com provisão sugerida.",
      ] },
      { t: "h", x: "Matriz de risco" },
      { t: "tabela", head: ["Fase na certidão", "Leitura de risco"], rows: [
        ["Inicial / citação", "Risco possível, provisão baixa"],
        ["Sentença desfavorável", "Risco provável, provisão relevante"],
        ["Trânsito em julgado", "Risco certo, provisão integral"],
        ["Execução com penhora", "Impacto imediato de caixa"],
        ["Arquivado / extinto", "Sem contingência"],
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Certidão substitui parecer jurídico?", a: "Não. Ela alimenta o parecer com dados oficiais sobre objeto e fase de cada processo." },
      { q: "Com que frequência atualizar?", a: "Em operações longas, a cada 60 a 90 dias, até o fechamento." },
    ],
  },
];
