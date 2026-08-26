import type { Categoria } from "./tipos";

export const CATEGORIAS: Categoria[] = [
  {
    slug: "conceito",
    nome: "Conceito",
    titulo: "Certidão de Objeto e Pé: o que é, para que serve e diferenças",
    descricao:
      "Guias sobre o que é a Certidão de Objeto e Pé, o que ela mostra, validade, custo e as diferenças para inteiro teor, narratória e nada consta.",
    intro:
      "Comece por aqui se você ainda tem dúvidas sobre o que é a Certidão de Objeto e Pé, quando ela é exigida e como se diferencia das demais certidões judiciais.",
  },
  {
    slug: "tribunais",
    nome: "Tribunais e sistemas",
    titulo: "Como emitir Certidão de Objeto e Pé em cada tribunal e sistema",
    descricao:
      "Passo a passo da Certidão de Objeto e Pé nos sistemas e-SAJ, PJe, Projudi e eproc, na Justiça Estadual, Federal, do Trabalho e nos tribunais superiores.",
    intro:
      "Cada tribunal brasileiro usa um sistema processual diferente. Aqui estão os guias práticos por sistema e por ramo da Justiça.",
  },
  {
    slug: "ramos",
    nome: "Ramos da Justiça",
    titulo: "Certidão de Objeto e Pé por ramo: cível, criminal, trabalhista e federal",
    descricao:
      "Como funciona a Certidão de Objeto e Pé em processos cíveis, criminais, trabalhistas, federais, de família, execução fiscal e juizados especiais.",
    intro:
      "O conteúdo da certidão muda conforme o ramo da Justiça em que o processo tramita. Veja o que esperar em cada um deles.",
  },
  {
    slug: "usos",
    nome: "Quando é exigida",
    titulo: "Quem pede a Certidão de Objeto e Pé e em quais situações",
    descricao:
      "Situações em que a Certidão de Objeto e Pé é exigida: gerenciadora de risco, imóvel, financiamento, licitação, concurso, visto e admissão.",
    intro:
      "Empresas, bancos, cartórios e órgãos públicos pedem a certidão em contextos específicos. Entenda cada um e o que costuma ser aceito.",
  },
  {
    slug: "duvidas",
    nome: "Dúvidas frequentes",
    titulo: "Dúvidas sobre Certidão de Objeto e Pé: prazo, custo e casos especiais",
    descricao:
      "Respostas objetivas sobre prazo, valor, gratuidade, processo sigiloso, arquivado, físico antigo, pedido em nome de terceiro e validação.",
    intro:
      "As perguntas que mais recebemos no atendimento, respondidas de forma direta e prática.",
  },
];

export const categoriaPorSlug = (slug: string) =>
  CATEGORIAS.find((c) => c.slug === slug);
