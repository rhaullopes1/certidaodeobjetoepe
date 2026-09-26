import type { Post } from "./tipos";

const CTA = "Quer resolver sem burocracia? Informe número do processo, nome completo e CPF da parte: acompanhamos o pedido no tribunal e enviamos a certidão digital assim que for expedida.";

export const POSTS_DUVIDAS: Post[] = [
  {
    slug: "quanto-tempo-demora-certidao-de-objeto-e-pe",
    categoria: "duvidas",
    titulo: "Quanto Tempo Demora a Certidão de Objeto e Pé? Prazos",
    h1: "Quanto tempo demora para sair a Certidão de Objeto e Pé",
    descricao:
      "O prazo usual da Certidão de Objeto e Pé é de 1 a 5 dias úteis, conforme a comarca e o tribunal. Veja o que atrasa (processo físico, arquivado) e como pedir.",
    resumo: "O prazo de emissão é de 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "Não existe prazo único. O tempo depende do tribunal, do sistema, do estado do processo e das custas." },
      { t: "tabela", head: ["Situação", "Prazo típico"], rows: [
        ["Processo eletrônico ativo", "1 a 5 dias úteis, conforme a comarca e o tribunal emissor"],
        ["Processo eletrônico arquivado", "1 a 5 dias úteis, conforme a comarca e o tribunal emissor"],
        ["Processo físico em comarca", "1 a 5 dias úteis, conforme a comarca e o tribunal emissor"],
        ["Processo físico arquivado (desarquivamento)", "1 a 5 dias úteis, conforme a comarca e o tribunal emissor"],
        ["Processo em tribunal superior", "1 a 5 dias úteis, conforme a comarca e o tribunal emissor"],
      ] },
      { t: "h", x: "O que atrasa" },
      { t: "ul", items: [
        "Custas não recolhidas ou guia vencida.",
        "Requerimento dirigido à vara errada.",
        "Processo redistribuído ou em carga.",
        "Feriados forenses e recesso.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Tem como acelerar?", a: "Pedido corretamente instruído, com número CNJ certo e custas pagas, é a forma mais eficaz de evitar atraso." },
      { q: "Existe urgência?", a: "Alguns tribunais atendem pedidos urgentes justificados, mas não há regra geral de prioridade." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-e-gratuita",
    categoria: "duvidas",
    titulo: "Certidão de Objeto e Pé é gratuita? Quanto custa",
    h1: "Quanto custa a Certidão de Objeto e Pé",
    descricao:
      "Custas de tribunal, gratuidade de justiça e valor do serviço de assessoria: entenda cada componente do custo.",
    resumo: "O que é taxa do tribunal, o que é serviço, e quando há isenção.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "O custo tem duas partes independentes: as custas do tribunal e, se você optar por assessoria, o valor do serviço." },
      { t: "h", x: "Custas do tribunal" },
      { t: "ul", items: [
        "Alguns tribunais emitem gratuitamente certidões processuais.",
        "Outros cobram taxa fixa por certidão ou valor por página.",
        "Beneficiários da gratuidade de justiça são isentos, mediante decisão nos autos.",
      ] },
      { t: "h", x: "Serviço de assessoria" },
      { t: "p", x: "Nosso serviço tem valor fixo por quantidade de certidões: 1 por R$ 197, 2 por R$ 347, 3 por R$ 497, 4 por R$ 647 e 5 por R$ 797. O valor cobre identificação da vara, protocolo, acompanhamento e entrega digital." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Posso emitir sozinho de graça?", a: "Em tribunais que não cobram custas e em processos eletrônicos públicos, sim. O serviço existe para quem não quer lidar com o trâmite ou tem processo físico/arquivado." },
      { q: "Gratuidade de justiça cobre a certidão?", a: "Sim, quando deferida nos autos, alcança as custas de expedição." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-segredo-de-justica",
    categoria: "duvidas",
    titulo: "Certidão de Objeto e Pé em Segredo de Justiça: Quem Pode Pedir",
    h1: "Certidão de Objeto e Pé em segredo de justiça",
    descricao:
      "Processo em segredo de justiça tem certidão? Veja quem pode pedir a Certidão de Objeto e Pé de processo sigiloso, o que é informado e como comprovar legitimidade.",
    resumo: "Sigilo restringe, mas não elimina o direito à certidão.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "Correm em segredo de justiça, entre outros, processos de família, casos com crianças e adolescentes, crimes contra a dignidade sexual e feitos assim declarados por decisão judicial." },
      { t: "h", x: "Quem tem acesso" },
      { t: "ul", items: [
        "As partes do processo.",
        "Advogados constituídos, com procuração.",
        "Ministério Público e órgãos com previsão legal.",
        "Terceiro com interesse jurídico, mediante autorização do juiz.",
      ] },
      { t: "p", x: "A terceiros, em regra, só se certifica o dispositivo da sentença nas hipóteses previstas em lei, como divórcio e partilha, para fins registrais." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Sou parte, mas não tenho advogado. Consigo?", a: "Sim, requerendo diretamente com documento de identidade." },
      { q: "Empresa pode exigir certidão de processo sigiloso?", a: "Pode pedir, mas o tribunal só fornece a quem tem legitimidade — normalmente a própria parte." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-processo-arquivado",
    categoria: "duvidas",
    titulo: "Processo arquivado: como tirar Certidão de Objeto e Pé",
    h1: "Certidão de Objeto e Pé de processo arquivado",
    descricao:
      "Processos encerrados, físicos e antigos: como localizar os autos, pedir desarquivamento e obter a certidão.",
    resumo: "Arquivado não significa inacessível — muda apenas o caminho.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "Processo arquivado definitivamente continua existindo, e é justamente dele que costuma vir o apontamento em consultas de risco. A certidão de arquivamento é o que resolve o bloqueio." },
      { t: "h", x: "Como proceder" },
      { t: "ol", items: [
        "Localize o processo pela consulta do tribunal ou pelo arquivo da comarca.",
        "Verifique se os autos são eletrônicos ou físicos.",
        "Se físicos e em arquivo geral, requeira o desarquivamento (há custa própria em vários tribunais).",
        "Requeira a certidão indicando objeto, resultado e data do arquivamento.",
      ] },
      { t: "nota", x: "Autos muito antigos podem ter sido eliminados por tabela de temporalidade. Nesse caso, o tribunal expede certidão informando a eliminação — documento igualmente válido para comprovar o encerramento." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Processo eliminado do arquivo, e agora?", a: "O tribunal certifica a eliminação e o registro remanescente, o que costuma ser aceito pelo destinatário." },
      { q: "Desarquivar tem custo?", a: "Na maioria dos tribunais sim, com guia específica além da taxa da certidão." },
    ],
  },
  {
    slug: "posso-pedir-certidao-de-processo-de-terceiro",
    categoria: "duvidas",
    titulo: "Posso pedir certidão de processo de outra pessoa?",
    h1: "Certidão de Objeto e Pé de processo de terceiro",
    descricao:
      "Publicidade dos atos processuais, limites do sigilo e o que se pode obter sobre processo de outra pessoa ou empresa.",
    resumo: "Em regra, sim — os atos processuais são públicos.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "A Constituição estabelece a publicidade dos atos processuais, com restrição apenas quando a defesa da intimidade ou o interesse social exigirem sigilo. Por isso, qualquer pessoa pode obter certidão de processo público." },
      { t: "h", x: "Casos em que é comum" },
      { t: "ul", items: [
        "Comprador verificando processos do vendedor de imóvel.",
        "Empresa avaliando fornecedor ou parceiro.",
        "Investidor em due diligence.",
        "Jornalista e pesquisador.",
      ] },
      { t: "h", x: "Limites" },
      { t: "ul", items: [
        "Processos em segredo de justiça: acesso restrito.",
        "Dados sensíveis podem vir tarjados.",
        "Uso dos dados sujeita-se à LGPD, com finalidade legítima e proporcional.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Preciso justificar o pedido?", a: "Em processo público, normalmente não. Em processo sigiloso, é preciso demonstrar interesse jurídico e obter autorização judicial." },
      { q: "A parte é avisada?", a: "Não há comunicação automática à parte quando um terceiro requer certidão de processo público." },
    ],
  },
  {
    slug: "como-validar-autenticidade-certidao-de-objeto-e-pe",
    categoria: "duvidas",
    titulo: "Como validar a autenticidade da Certidão de Objeto e Pé",
    h1: "Como conferir se a Certidão de Objeto e Pé é autêntica",
    descricao:
      "Código de validação, assinatura digital e conferência no portal do tribunal: como confirmar que a certidão é verdadeira.",
    resumo: "Três verificações simples eliminam risco de documento falso.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "Toda certidão eletrônica traz elementos que permitem conferir sua origem. Quem recebe o documento deve validar antes de aceitá-lo." },
      { t: "h", x: "Como validar" },
      { t: "ol", items: [
        "Localize o código de autenticidade (ou hash) impresso no rodapé da certidão.",
        "Acesse a área de validação de documentos no portal do tribunal emissor.",
        "Informe o código e compare o documento exibido com o PDF recebido.",
        "Verifique a assinatura digital do PDF: deve indicar certificado ICP-Brasil válido.",
      ] },
      { t: "h", x: "Sinais de alerta" },
      { t: "ul", items: [
        "Ausência de código de validação.",
        "Divergência entre o PDF e o resultado da consulta no portal.",
        "Assinatura digital inválida ou expirada no momento da assinatura.",
        "Número de processo que não existe na consulta pública.",
      ] },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Certidão impressa vale?", a: "A cópia impressa vale como reprodução; a validação continua sendo feita pelo código no portal do tribunal." },
      { q: "O código expira?", a: "Alguns tribunais limitam o prazo de consulta do código, geralmente entre 30 dias e alguns anos." },
    ],
  },
  {
    slug: "certidao-de-objeto-e-pe-nome-errado-ou-homonimo",
    categoria: "duvidas",
    titulo: "Homônimo: processo que não é meu aparece na consulta",
    h1: "Certidão de Objeto e Pé em caso de homônimo",
    descricao:
      "Como comprovar que o processo apontado é de outra pessoa com o mesmo nome, usando certidão e conferência de CPF.",
    resumo: "O CPF na certidão é a prova que encerra a confusão.",
    atualizado: "2026-08-26",
    leitura: 4,
    blocos: [
      { t: "p", x: "Consultas por nome geram falsos positivos com frequência. A pessoa é barrada em cadastro, emprego ou crédito por causa de processo de um homônimo." },
      { t: "h", x: "Como resolver" },
      { t: "ol", items: [
        "Obtenha o número exato do processo apontado.",
        "Solicite a Certidão de Objeto e Pé daquele processo.",
        "Confira a qualificação da parte: CPF, filiação e data de nascimento.",
        "Apresente a certidão junto com seus documentos, demonstrando a divergência.",
      ] },
      { t: "nota", x: "Se a certidão não trouxer CPF da parte, é possível requerer ao juízo certidão de negativa de homonímia, prevista em vários tribunais exatamente para esse fim." },
      { t: "cta", x: CTA },
    ],
    faq: [
      { q: "Existe certidão de homonímia?", a: "Sim. Muitos tribunais expedem certidão específica atestando que a pessoa consultada não é a parte do processo." },
      { q: "Preciso de advogado?", a: "Não para o pedido administrativo de certidão. Para retificar registros indevidos, pode ser necessário." },
    ],
  },
];
