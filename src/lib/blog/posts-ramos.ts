import type { Post } from "./tipos";

const CTA = "Solicite a certidão do seu processo: informe número, nome completo e CPF da parte. Nós identificamos o juízo, protocolamos o pedido e entregamos o documento digital com código de autenticidade.";

export const POSTS_RAMOS: Post[] = [
  {
    slug: "certidao-de-objeto-e-pe-civel",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé Cível: o que consta e como pedir",
    h1: "Certidão de Objeto e Pé em processos cíveis",
    descricao:
      "Cobranças, indenizações, contratos e execuções: veja o que a Certidão de Objeto e Pé mostra em processos cíveis e quando ela é exigida.",
    resumo: "O ramo mais comum: dívidas, contratos e indenizações sob a ótica da certidão.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Processos cíveis envolvem relações entre particulares e empresas: cobrança, execução de título, indenização por dano moral e material, revisão de contrato, despejo, usucapião e responsabilidade civil." },
      { t: "h", x: "O que a certidão informa" },
      { t: "ul", items: [
        "Classe e assunto (procedimento comum, execução, monitória).",
        "Autor e réu, com qualificação.",
        "Valor da causa e, se houver, valor atualizado da execução.",
        "Existência de penhora, bloqueio de valores ou constrição de bens.",
        "Fase: instrução, sentença, recurso, cumprimento de sentença ou arquivamento.",
      ] },
      { t: "h", x: "Por que costuma ser pedida" },
      { t: "p", x: "Bancos, imobiliárias e gerenciadoras precisam saber se a ação cível tem repercussão patrimonial. Uma ação de dano moral de pequeno valor tem peso muito diferente de uma execução com penhora já efetivada." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "A certidão cível mostra penhora?", a: "Sim, quando há constrição registrada nos autos, a certidão indica a existência de penhora ou bloqueio." },
      { q: "Ação de dano moral aparece?", a: "Sim, com o objeto e a fase. A certidão esclarece se ainda está em discussão ou se já houve decisão." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-criminal",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé Criminal: como funciona",
    h1: "Certidão de Objeto e Pé em processos criminais",
    descricao:
      "Processo criminal apareceu na sua certidão de antecedentes? Entenda o que a Certidão de Objeto e Pé criminal mostra e como solicitá-la.",
    resumo: "O documento mais pedido quando surge apontamento criminal em cadastro ou concurso.",
    atualizado: "2026-08-26",
    leitura: 6,
    blocos: [
      { t: "p", x: "Em matéria criminal, a Certidão de Objeto e Pé é decisiva porque diferencia situações muito distintas: inquérito arquivado, ação em curso, absolvição, extinção da punibilidade ou condenação transitada em julgado." },
      { t: "h", x: "O que costuma constar" },
      { t: "ul", items: [
        "Tipificação imputada (o artigo da lei penal).",
        "Vara criminal e comarca.",
        "Data do fato e da denúncia.",
        "Situação: em instrução, suspenso (art. 89 da Lei 9.099/95), sentenciado, absolvido, prescrito ou arquivado.",
        "Trânsito em julgado e eventual cumprimento de pena ou extinção da punibilidade.",
      ] },
      { t: "h", x: "Situações em que é exigida" },
      { t: "ul", items: [
        "Investigação social em concurso público e posse em cargo.",
        "Cadastro de motorista em gerenciadora de risco.",
        "Porte de arma, credenciamentos e licenças.",
        "Vistos e processos de imigração.",
        "Processos de adoção e habilitação em atividades reguladas.",
      ] },
      { t: "nota", x: "Se o processo tramita em segredo de justiça — comum em crimes contra a dignidade sexual e casos com menores — apenas a parte ou seu advogado consegue a certidão completa." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "A certidão criminal mostra que fui absolvido?", a: "Sim. Ela indica o resultado do processo, incluindo absolvição, extinção da punibilidade ou arquivamento, e se houve trânsito em julgado." },
      { q: "Processo criminal arquivado precisa de certidão?", a: "Frequentemente sim: é justamente a certidão que comprova o arquivamento a quem apontou a ocorrência." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-trabalhista",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé Trabalhista: guia para empresas e trabalhadores",
    h1: "Certidão de Objeto e Pé trabalhista",
    descricao:
      "Reclamação trabalhista: o que a certidão mostra sobre pedidos, acordos, condenação e execução, e como usá-la em due diligence.",
    resumo: "Como o documento é usado por empresas, contadores e trabalhadores.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Na Justiça do Trabalho, a certidão é usada principalmente em duas frentes: due diligence de empresas (compra de participação, contratos com grandes clientes, licitações) e esclarecimento de apontamentos em CNDT." },
      { t: "h", x: "Informações relevantes na certidão trabalhista" },
      { t: "ul", items: [
        "Pedidos formulados na inicial e valor atribuído à causa.",
        "Se houve acordo homologado e se está sendo cumprido.",
        "Sentença e resultado dos recursos (RO, RR, agravos).",
        "Fase de execução, com penhora e depósitos.",
        "Arquivamento definitivo, quando encerrado.",
      ] },
      { t: "h", x: "Uso em auditoria" },
      { t: "p", x: "Auditorias contábeis usam a certidão para classificar o risco das contingências trabalhistas como provável, possível ou remoto, com base na fase real do processo." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Como comprovo que o acordo trabalhista foi cumprido?", a: "A certidão pode certificar a homologação do acordo, os depósitos e a extinção da execução pelo cumprimento." },
      { q: "A CNDT substitui a certidão de objeto e pé?", a: "Não. A CNDT informa apenas a existência de débito em execução definitiva; a objeto e pé descreve o processo e sua fase." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-familia",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé em processos de família",
    h1: "Certidão de Objeto e Pé em Direito de Família",
    descricao:
      "Divórcio, alimentos, guarda e inventário: como pedir certidão em processos de família, muitos deles em segredo de justiça.",
    resumo: "O que muda quando o processo corre em segredo de justiça.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Processos de divórcio, guarda, alimentos, reconhecimento de união estável, investigação de paternidade e inventário costumam tramitar em segredo de justiça, o que restringe a certidão às partes e a seus advogados." },
      { t: "h", x: "O que é possível certificar" },
      { t: "ul", items: [
        "Para as partes: certidão completa, com objeto e fase.",
        "Para terceiros: em regra, apenas certidão do dispositivo da sentença nos casos previstos em lei, como divórcio e partilha.",
        "Para fins registrais: certidão específica para averbação em cartório.",
      ] },
      { t: "h", x: "Usos comuns" },
      { t: "ul", items: [
        "Comprovar a existência de ação de alimentos em análise de crédito.",
        "Instruir inventário com informação sobre partilha em curso.",
        "Averbar divórcio no registro civil e em matrícula de imóvel.",
        "Comprovar estado civil e situação patrimonial em negócios imobiliários.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Processo em segredo de justiça tem certidão?", a: "Sim, mas restrita: em regra apenas às partes e a advogados constituídos, salvo certidão do dispositivo da sentença nas hipóteses legais." },
      { q: "Sou a parte, mas não tenho advogado. Consigo?", a: "Sim. A parte pode requerer diretamente a certidão do seu próprio processo, comprovando identidade." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-execucao-fiscal",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé em execução fiscal",
    h1: "Certidão de Objeto e Pé em execuções fiscais",
    descricao:
      "Dívida ativa municipal, estadual ou federal: como a certidão mostra valor, parcelamento, penhora e suspensão da execução fiscal.",
    resumo: "O documento que explica um dos apontamentos mais frequentes em CNPJ.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Execuções fiscais são ações de cobrança de dívida ativa propostas pela União, estados e municípios. Elas aparecem com frequência em consultas por CNPJ e assustam mais do que deveriam, porque muitas já estão suspensas por parcelamento ou extintas por pagamento." },
      { t: "h", x: "O que a certidão esclarece" },
      { t: "ul", items: [
        "Exequente (Fazenda Nacional, estadual ou municipal) e número da CDA.",
        "Valor originalmente executado.",
        "Se há embargos ou exceção de pré-executividade.",
        "Se a execução está suspensa por parcelamento ou por decisão.",
        "Penhoras, bloqueios e leilões.",
        "Extinção por pagamento, prescrição ou cancelamento da inscrição.",
      ] },
      { t: "nota", x: "Em licitações, é comum a exigência da certidão de objeto e pé de cada execução fiscal apontada, para demonstrar que a exigibilidade está suspensa." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Execução fiscal suspensa impede licitação?", a: "Em geral não, desde que comprovada a suspensão da exigibilidade — e é a certidão que faz essa comprovação." },
      { q: "A certidão informa o valor atualizado?", a: "Informa o valor executado e, quando disponível nos autos, o valor atualizado ou o saldo em execução." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-juizado-especial",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé em Juizado Especial",
    h1: "Certidão de Objeto e Pé nos Juizados Especiais",
    descricao:
      "Juizado Especial Cível, Criminal e da Fazenda Pública: como funciona a certidão em processos de rito sumaríssimo.",
    resumo: "Processos rápidos, certidão igualmente objetiva.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "Os Juizados Especiais julgam causas de menor complexidade — até 40 salários mínimos no cível — e infrações de menor potencial ofensivo no criminal. A certidão segue o mesmo padrão, expedida pela secretaria do juizado." },
      { t: "h", x: "Particularidades" },
      { t: "ul", items: [
        "Muitos processos terminam em acordo na audiência de conciliação; a certidão registra a homologação.",
        "No criminal, é comum a transação penal e a suspensão condicional do processo — situações que a certidão descreve e que não equivalem a condenação.",
        "Recursos vão às Turmas Recursais, e não ao tribunal de segundo grau.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Transação penal é condenação?", a: "Não. A transação penal não gera reincidência nem antecedentes para fins de condenação, e a certidão registra essa natureza." },
      { q: "Juizado emite certidão?", a: "Sim, pela secretaria do juizado onde o processo tramita." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-justica-militar",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé na Justiça Militar",
    h1: "Certidão de Objeto e Pé na Justiça Militar",
    descricao:
      "Justiça Militar da União (STM) e Justiça Militar estadual: como pedir a certidão de processos militares e para que ela serve.",
    resumo: "O ramo menos conhecido — e essencial para militares em concursos e promoções.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "A Justiça Militar julga crimes militares. Na esfera federal, as auditorias militares e o STM; na estadual, as auditorias e os Tribunais de Justiça Militar de São Paulo, Minas Gerais e Rio Grande do Sul, ou os TJs nos demais estados." },
      { t: "h", x: "Quando a certidão é exigida" },
      { t: "ul", items: [
        "Concursos e promoções nas Forças Armadas e nas polícias militares.",
        "Processos administrativos disciplinares.",
        "Transferência para a reserva e habilitações funcionais.",
        "Porte de arma e credenciamentos.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Processo militar aparece em certidão criminal comum?", a: "Nem sempre. Por isso, quando há feito militar, a certidão deve ser pedida à Justiça Militar competente." },
      { q: "O STM emite certidão?", a: "Sim, para os processos que tramitam ou tramitaram naquele tribunal." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-empresas-cnpj",
    categoria: "ramos",
    titulo: "Certidão de Objeto e Pé para empresas (CNPJ)",
    h1: "Certidão de Objeto e Pé para pessoa jurídica",
    descricao:
      "Como empresas usam a certidão em due diligence, licitação, contratos e auditoria de contingências judiciais.",
    resumo: "Contingência judicial explicada em um documento oficial por processo.",
    atualizado: "2026-08-26",
    leitura: 5,
    blocos: [
      { t: "p", x: "Empresas costumam ter processos em vários ramos ao mesmo tempo: cíveis de consumo, trabalhistas, execuções fiscais e, eventualmente, criminais de responsabilidade de dirigentes. A certidão é pedida por processo e serve para dimensionar risco." },
      { t: "h", x: "Onde entra no dia a dia corporativo" },
      { t: "ul", items: [
        "Due diligence em fusões, aquisições e captação de investimento.",
        "Habilitação em licitações e cadastro em grandes clientes.",
        "Auditoria contábil e classificação de contingências.",
        "Renovação de limites bancários e operações de crédito.",
        "Programas de compliance e integridade.",
      ] },
      { t: "h", x: "Como organizar o pedido" },
      { t: "ol", items: [
        "Levante todos os processos por CNPJ nas consultas dos tribunais.",
        "Separe por ramo e tribunal.",
        "Solicite a certidão de cada processo relevante.",
        "Monte o dossiê com negativas + objeto e pé de cada apontamento.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Dá para pedir várias certidões de uma vez?", a: "Sim. Nosso formulário permite solicitar de 1 a 5 certidões no mesmo pedido, com valor progressivo." },
      { q: "Filiais em estados diferentes?", a: "Cada processo é certificado pelo tribunal em que tramita, então o dossiê pode reunir certidões de vários tribunais." },
    ],
  },
];
