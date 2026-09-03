/**
 * Conteúdo específico de cada estado — usado para diferenciar as landing pages
 * de UF (evita páginas quase idênticas, que o Google costuma rastrear e não indexar).
 *
 * `sistema` NÃO é definido aqui: vem de src/lib/tribunais.ts, que é a fonte
 * única dos sistemas processuais usados por cada tribunal.
 */
export interface EstadoDetalhe {
  /** Justiça Federal que atende o estado. */
  trf: string;
  /** Tribunal(is) Regional(is) do Trabalho com jurisdição no estado. */
  trt: string;
  /** Observações operacionais reais do atendimento no estado. */
  particularidades: string[];
  /** Perguntas frequentes exclusivas do estado. */
  faqLocal: { q: string; a: string }[];
}

export const ESTADOS_DETALHES: Record<string, EstadoDetalhe> = {
  sp: {
    trf: "TRF da 3ª Região",
    trt: "TRT da 2ª Região (capital e Grande São Paulo) e TRT da 15ª Região (interior, com sede em Campinas)",
    particularidades: [
      "São Paulo tem o maior acervo processual do país, e o mesmo nome de parte costuma aparecer em várias comarcas. Antes de protocolar, conferimos número, foro e vara para não emitir certidão de processo homônimo.",
      "Processos anteriores à digitalização do e-SAJ muitas vezes só existem em papel no arquivo da comarca; nesses casos o pedido segue por requerimento ao cartório da vara e o prazo é maior.",
      "Nos foros da capital (Barra Funda, Central João Mendes, Santo Amaro, Penha, Itaquera) é comum a certidão sair no mesmo dia útil quando o processo é eletrônico e não está em segredo de justiça.",
    ],
    faqLocal: [
      {
        q: "A certidão do TJSP serve para gerenciadora de risco (Buonny, Pamcary)?",
        a: "Sim. As gerenciadoras aceitam a Certidão de Objeto e Pé emitida pelo TJSP porque ela descreve o assunto do processo e a fase atual, que é exatamente o que falta na consulta pública que bloqueou o cadastro do motorista.",
      },
      {
        q: "Consigo certidão de processo criminal antigo do interior de São Paulo?",
        a: "Sim. Em comarcas do interior com processos físicos arquivados, o requerimento é feito ao cartório da vara de origem. O prazo costuma passar de 7 dias úteis e avisamos você assim que o cartório responde.",
      },
    ],
  },
  mg: {
    trf: "TRF da 6ª Região, criado em 2022 exclusivamente para Minas Gerais",
    trt: "TRT da 3ª Região",
    particularidades: [
      "Minas tem mais de 290 comarcas, muitas delas de vara única. Nas menores, a certidão depende do escrivão da vara e o prazo varia mais do que na capital.",
      "Processos antigos do TJMG ainda podem estar no sistema Themis; conferimos em qual sistema o feito tramita antes de protocolar.",
      "Desde 2022 os processos federais mineiros são julgados pelo TRF6, e não mais pelo TRF1 — isso muda o tribunal ao qual a certidão deve ser pedida.",
    ],
    faqLocal: [
      {
        q: "Meu processo federal em MG é do TRF1 ou do TRF6?",
        a: "Processos federais de Minas Gerais passaram para o TRF da 6ª Região. Feitos muito antigos podem ter histórico no TRF1, mas o pedido de certidão hoje é direcionado ao TRF6, e nós identificamos isso pelo número do processo.",
      },
      {
        q: "Atendem comarcas pequenas do interior de Minas?",
        a: "Sim, todas as comarcas mineiras, incluindo as de vara única. Nesses casos o pedido é protocolado diretamente na secretaria da vara e o prazo médio fica mais próximo de 8 dias úteis.",
      },
    ],
  },
  ba: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 5ª Região",
    particularidades: [
      "Na Bahia é frequente o processo estar em comarca do interior distante de Salvador, com atendimento presencial limitado — protocolamos eletronicamente sempre que o sistema permite.",
      "Execuções fiscais estaduais antigas costumam ter movimentação parada há anos; a certidão é justamente o documento que comprova essa situação para bancos e cartórios.",
      "Pedidos que envolvem processos de família em segredo de justiça exigem comprovação de interesse da parte, o que orientamos no momento do envio.",
    ],
    faqLocal: [
      {
        q: "Preciso ir a Salvador para pedir a certidão do TJBA?",
        a: "Não. Todo o trâmite é feito à distância, inclusive para processos de comarcas do interior como Feira de Santana, Vitória da Conquista e Juazeiro.",
      },
      {
        q: "A certidão do TJBA vale para regularizar imóvel?",
        a: "Sim. Cartórios de registro de imóveis na Bahia costumam pedir a Certidão de Objeto e Pé quando aparece ação em nome do vendedor, para verificar se o processo pode gerar penhora ou fraude à execução.",
      },
    ],
  },
  df: {
    trf: "TRF da 1ª Região, com sede em Brasília",
    trt: "TRT da 10ª Região (Distrito Federal e Tocantins)",
    particularidades: [
      "O TJDFT é o único tribunal estadual mantido pela União e concentra todas as circunscrições judiciárias do DF, o que torna o trâmite mais rápido e padronizado.",
      "Em Brasília é comum a exigência da certidão em processos seletivos e investigação social de concursos federais, com prazo curto de entrega ao órgão.",
      "Processos federais e do TJDFT tramitam na mesma cidade, mas são tribunais diferentes: verificamos o número único antes de protocolar.",
    ],
    faqLocal: [
      {
        q: "A certidão do TJDFT serve para investigação social de concurso?",
        a: "Sim. É o documento normalmente aceito pelas comissões de concurso para explicar o teor e a fase de um processo que apareceu na certidão criminal do candidato.",
      },
      {
        q: "Quanto tempo demora no TJDFT?",
        a: "Por ser um tribunal totalmente eletrônico e concentrado, o TJDFT costuma ser um dos mais rápidos do país; a maioria dos pedidos sai dentro do prazo médio informado nesta página.",
      },
    ],
  },
  pe: {
    trf: "TRF da 5ª Região, com sede em Recife",
    trt: "TRT da 6ª Região",
    particularidades: [
      "Recife é sede do TRF5, o que facilita pedidos de certidão de processos federais de todo o Nordeste que tramitam em segundo grau.",
      "No TJPE, processos das comarcas do Agreste e do Sertão podem exigir contato direto com a secretaria da vara quando o feito é físico.",
      "A certidão é bastante exigida em Pernambuco para liberação de cadastro em transportadoras e para licitações municipais.",
    ],
    faqLocal: [
      {
        q: "Atendem processos do interior de Pernambuco?",
        a: "Sim, todas as comarcas, incluindo Caruaru, Petrolina, Garanhuns e Serra Talhada, além dos processos federais e trabalhistas do estado.",
      },
      {
        q: "Posso pedir certidão de processo que já foi arquivado no TJPE?",
        a: "Pode. A certidão de processo arquivado é uma das mais pedidas, porque descreve o desfecho — sentença, acordo ou extinção — que a consulta pública não mostra.",
      },
    ],
  },
  go: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 18ª Região",
    particularidades: [
      "Goiás é rota de transporte rodoviário pesado, e a certidão é rotineiramente exigida por gerenciadoras de risco para liberar motoristas com processo em aberto.",
      "Boa parte do acervo do TJGO tramita em sistema próprio de processo eletrônico, o que costuma reduzir o prazo de emissão em relação a estados com processos físicos.",
      "Em comarcas agrícolas do sudoeste goiano são comuns execuções de dívida rural, cuja fase atual só fica clara na Certidão de Objeto e Pé.",
    ],
    faqLocal: [
      {
        q: "A certidão do TJGO libera cadastro de caminhoneiro?",
        a: "Na prática, sim: a gerenciadora bloqueia o cadastro quando encontra processo sem detalhe. A certidão informa o assunto e a fase, permitindo a análise e a liberação do perfil.",
      },
      {
        q: "Atendem Goiânia e o interior de Goiás?",
        a: "Sim, todas as comarcas goianas, incluindo Anápolis, Rio Verde, Aparecida de Goiânia e Luziânia.",
      },
    ],
  },
  pr: {
    trf: "TRF da 4ª Região",
    trt: "TRT da 9ª Região",
    particularidades: [
      "O Paraná foi um dos primeiros estados a digitalizar em massa o acervo judicial, o que costuma tornar a emissão mais rápida.",
      "Processos federais paranaenses tramitam no TRF4, que utiliza o eproc — sistema diferente do usado pela Justiça Estadual, com procedimento próprio de requerimento.",
      "Em comarcas de fronteira, como Foz do Iguaçu, é comum a certidão ser pedida para fins de visto e residência no exterior.",
    ],
    faqLocal: [
      {
        q: "Certidão de processo federal no Paraná é pedida ao TJPR?",
        a: "Não. Processos federais são do TRF4 e da Justiça Federal do Paraná; identificamos isso pelo número único e protocolamos no tribunal correto.",
      },
      {
        q: "A certidão do TJPR serve para consulado ou visto?",
        a: "Sim, é comumente aceita para explicar a natureza e a situação de um processo em pedidos de visto e de cidadania, normalmente acompanhada de tradução juramentada.",
      },
    ],
  },
  rs: {
    trf: "TRF da 4ª Região, com sede em Porto Alegre",
    trt: "TRT da 4ª Região",
    particularidades: [
      "O Rio Grande do Sul usa o eproc tanto na Justiça Estadual quanto na Federal, o que padroniza o requerimento e costuma acelerar a resposta.",
      "Porto Alegre é sede do TRF4, então processos federais gaúchos em segundo grau são resolvidos no próprio estado.",
      "Em comarcas da serra e da fronteira, processos antigos digitalizados podem ter numeração anterior ao padrão CNJ, o que exige conferência extra.",
    ],
    faqLocal: [
      {
        q: "Meu processo é antigo e o número não segue o padrão atual. Dá para pedir?",
        a: "Dá. Basta enviar o número como consta na sua consulta ou no documento; localizamos o feito e fazemos a correspondência com a numeração única antes de protocolar.",
      },
      {
        q: "Atendem processos trabalhistas no RS?",
        a: "Sim. Reclamações trabalhistas gaúchas tramitam no TRT da 4ª Região e a certidão é emitida com o assunto e a fase da execução.",
      },
    ],
  },
  rj: {
    trf: "TRF da 2ª Região, com sede no Rio de Janeiro",
    trt: "TRT da 1ª Região",
    particularidades: [
      "O TJRJ mantém parte do acervo em sistemas distintos conforme a época do processo; verificamos onde o feito está antes de requerer a certidão.",
      "No Rio é frequente a exigência da certidão por seguradoras e por administradoras de imóveis em contratos de locação e compra e venda.",
      "Processos federais fluminenses ficam no TRF2, que também atende o Espírito Santo.",
    ],
    faqLocal: [
      {
        q: "A certidão do TJRJ é aceita em compra e venda de imóvel?",
        a: "Sim. Quando aparece ação em nome do vendedor, o cartório e o banco pedem a Certidão de Objeto e Pé para verificar se há risco de penhora ou de fraude à execução.",
      },
      {
        q: "Atendem comarcas da Baixada e do interior fluminense?",
        a: "Sim: Duque de Caxias, Nova Iguaçu, São Gonçalo, Niterói, Campos dos Goytacazes, Petrópolis e demais comarcas do estado.",
      },
    ],
  },
  sc: {
    trf: "TRF da 4ª Região",
    trt: "TRT da 12ª Região",
    particularidades: [
      "Santa Catarina usa o eproc na Justiça Estadual e na Federal, com requerimento eletrônico e prazo geralmente curto.",
      "Em cidades portuárias e industriais, como Itajaí, Joinville e Blumenau, a certidão é muito pedida em processos de compliance e admissão.",
      "Processos de comarcas menores podem ter movimentação lenta; a certidão registra exatamente a última fase, o que resolve exigências de bancos.",
    ],
    faqLocal: [
      {
        q: "A certidão do TJSC serve para admissão em empresa?",
        a: "Serve. Departamentos de RH e áreas de compliance costumam aceitar a certidão para entender o teor e o desfecho de um processo apontado na checagem de antecedentes.",
      },
      {
        q: "Atendem processos federais catarinenses?",
        a: "Sim. Eles tramitam na Justiça Federal de Santa Catarina e no TRF da 4ª Região; o procedimento é o mesmo, feito integralmente por nós.",
      },
    ],
  },
  mt: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 23ª Região",
    particularidades: [
      "Mato Grosso concentra grandes execuções ligadas ao agronegócio, em que a certidão é usada para demonstrar a fase real da dívida.",
      "Distâncias entre comarcas são grandes; por isso praticamente todo o pedido é feito de forma eletrônica.",
      "A certidão é frequentemente exigida de motoristas e transportadoras que operam nos corredores de escoamento de grãos.",
    ],
    faqLocal: [
      {
        q: "Atendem comarcas distantes de Cuiabá?",
        a: "Sim: Rondonópolis, Sinop, Várzea Grande, Sorriso, Tangará da Serra e demais comarcas, sem necessidade de deslocamento seu.",
      },
      {
        q: "Serve para liberar cadastro em transportadora?",
        a: "Sim. É o documento que a área de risco costuma pedir para entender o processo que travou o cadastro do motorista.",
      },
    ],
  },
  ce: {
    trf: "TRF da 5ª Região",
    trt: "TRT da 7ª Região",
    particularidades: [
      "No Ceará a certidão é muito procurada em anos eleitorais, para instruir registro de candidatura junto ao TRE-CE.",
      "Comarcas do sertão cearense ainda têm acervo físico relevante, o que pode alongar o prazo em processos antigos.",
      "Fortaleza concentra as varas de maior movimento, com emissão normalmente mais rápida.",
    ],
    faqLocal: [
      {
        q: "A certidão serve para registro de candidatura no Ceará?",
        a: "Sim. Quando aparece processo em nome do pré-candidato, a Justiça Eleitoral costuma exigir a Certidão de Objeto e Pé para verificar o teor e a fase, inclusive para fins de Ficha Limpa.",
      },
      {
        q: "Atendem o interior do Ceará?",
        a: "Sim: Juazeiro do Norte, Sobral, Caucaia, Maracanaú, Crato e todas as demais comarcas do estado.",
      },
    ],
  },
  ac: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 14ª Região (Acre e Rondônia)",
    particularidades: [
      "O Acre tem número reduzido de comarcas, o que costuma tornar o contato com as varas mais direto e o prazo mais previsível.",
      "Processos de comarcas do interior podem depender do expediente local; acompanhamos e avisamos qualquer atraso.",
      "A certidão é bastante usada por servidores e candidatos a concursos estaduais no estado.",
    ],
    faqLocal: [
      {
        q: "Atendem comarcas fora de Rio Branco?",
        a: "Sim, incluindo Cruzeiro do Sul, Sena Madureira, Tarauacá e Feijó.",
      },
      {
        q: "Processo trabalhista no Acre é do TRT de qual região?",
        a: "Do TRT da 14ª Região, que abrange Acre e Rondônia.",
      },
    ],
  },
  al: {
    trf: "TRF da 5ª Região",
    trt: "TRT da 19ª Região",
    particularidades: [
      "Alagoas tem acervo concentrado em Maceió e em poucas comarcas de médio porte, o que simplifica a localização do processo.",
      "Execuções de dívidas do setor sucroalcooleiro são comuns e costumam exigir a certidão para negociação bancária.",
      "Pedidos de candidatos a concursos e de motoristas de aplicativo estão entre os mais frequentes no estado.",
    ],
    faqLocal: [
      {
        q: "Atendem Arapiraca e demais comarcas alagoanas?",
        a: "Sim, todas as comarcas do estado, além dos processos federais e trabalhistas de Alagoas.",
      },
      {
        q: "Consigo certidão de processo em segredo de justiça?",
        a: "Somente se você for parte ou tiver procuração; nesse caso o requerimento é instruído com a comprovação exigida pelo tribunal.",
      },
    ],
  },
  am: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 11ª Região (Amazonas e Roraima)",
    particularidades: [
      "No Amazonas várias comarcas do interior só são acessíveis por via fluvial ou aérea; por isso o pedido eletrônico é a regra.",
      "Processos ligados à Zona Franca de Manaus envolvem com frequência execuções fiscais federais, de competência da Justiça Federal.",
      "O prazo pode variar mais do que a média nacional em comarcas do interior com estrutura reduzida.",
    ],
    faqLocal: [
      {
        q: "Atendem comarcas do interior do Amazonas?",
        a: "Sim: Parintins, Itacoatiara, Manacapuru, Coari e demais comarcas, sem que você precise se deslocar.",
      },
      {
        q: "Processo da Zona Franca é estadual ou federal?",
        a: "Depende do assunto. Questões tributárias e aduaneiras federais tramitam na Justiça Federal; identificamos pelo número único antes de protocolar.",
      },
    ],
  },
  ap: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 8ª Região (Pará e Amapá)",
    particularidades: [
      "O Amapá tem poucas comarcas e acervo majoritariamente eletrônico, o que costuma manter o prazo dentro da média.",
      "A certidão é muito pedida por candidatos a concursos e por servidores em processos de investigação social.",
      "Processos trabalhistas amapaenses são julgados pelo TRT da 8ª Região, com sede em Belém.",
    ],
    faqLocal: [
      {
        q: "Atendem Santana e Laranjal do Jari?",
        a: "Sim, todas as comarcas amapaenses.",
      },
      {
        q: "Quanto tempo demora no TJAP?",
        a: "Normalmente dentro do prazo médio indicado nesta página, já que a maior parte do acervo é eletrônica.",
      },
    ],
  },
  es: {
    trf: "TRF da 2ª Região (Espírito Santo e Rio de Janeiro)",
    trt: "TRT da 17ª Região",
    particularidades: [
      "O Espírito Santo tem forte atividade portuária e logística, e a certidão é rotina em contratações de motoristas e transportadoras.",
      "Comarcas do interior capixaba são próximas entre si, o que costuma agilizar diligências quando o processo é físico.",
      "Processos federais capixabas são julgados pelo TRF2, sediado no Rio de Janeiro.",
    ],
    faqLocal: [
      {
        q: "Atendem Vila Velha, Serra e Cariacica?",
        a: "Sim, além de Vitória, Linhares, Colatina, Cachoeiro de Itapemirim e demais comarcas.",
      },
      {
        q: "A certidão serve para o setor portuário?",
        a: "Sim. É usada com frequência em credenciamento de motoristas e prestadores em portos e terminais.",
      },
    ],
  },
  ma: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 16ª Região",
    particularidades: [
      "No Maranhão a OAB e órgãos de classe pedem a certidão em processos de inscrição e de regularidade profissional.",
      "Comarcas do interior podem ter acervo físico, com prazo maior de resposta.",
      "São Luís concentra as varas de maior volume e emissão mais rápida.",
    ],
    faqLocal: [
      {
        q: "Atendem Imperatriz e o interior maranhense?",
        a: "Sim: Imperatriz, Timon, Caxias, Codó e demais comarcas do estado.",
      },
      {
        q: "Serve para inscrição em órgão de classe?",
        a: "Sim. Conselhos profissionais costumam exigir a certidão quando aparece processo no nome do inscrito, para avaliar o teor e a fase.",
      },
    ],
  },
  ms: {
    trf: "TRF da 3ª Região (Mato Grosso do Sul e São Paulo)",
    trt: "TRT da 24ª Região",
    particularidades: [
      "Mato Grosso do Sul é corredor logístico para o Centro-Oeste e para o Paraguai, com alta demanda de certidões para motoristas.",
      "Execuções ligadas ao agronegócio e a financiamentos rurais são frequentes nas comarcas do interior.",
      "Processos federais sul-mato-grossenses são julgados pelo TRF3, com sede em São Paulo.",
    ],
    faqLocal: [
      {
        q: "Atendem Dourados, Três Lagoas e Corumbá?",
        a: "Sim, além de Campo Grande e das demais comarcas do estado.",
      },
      {
        q: "Meu processo federal no MS é do TRF3?",
        a: "Sim. A Justiça Federal do Mato Grosso do Sul integra a 3ª Região, com segundo grau em São Paulo.",
      },
    ],
  },
  pa: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 8ª Região (Pará e Amapá)",
    particularidades: [
      "O Pará tem comarcas muito distantes entre si; o requerimento eletrônico evita deslocamento e reduz o prazo.",
      "Conflitos possessórios e ambientais são comuns e costumam exigir a certidão para financiamento e regularização fundiária.",
      "Belém concentra o maior volume de processos e as varas com resposta mais rápida.",
    ],
    faqLocal: [
      {
        q: "Atendem Ananindeua, Santarém e Marabá?",
        a: "Sim, além de Belém, Castanhal, Parauapebas e demais comarcas paraenses.",
      },
      {
        q: "A certidão ajuda em regularização de imóvel rural?",
        a: "Ajuda. Ela mostra o assunto e a fase de ações que recaem sobre o imóvel ou sobre o proprietário, informação exigida por bancos e cartórios.",
      },
    ],
  },
  pb: {
    trf: "TRF da 5ª Região",
    trt: "TRT da 13ª Região",
    particularidades: [
      "A Paraíba tem acervo predominantemente eletrônico, o que costuma manter os prazos estáveis.",
      "A certidão é bastante pedida em concursos públicos estaduais e municipais, na fase de investigação social.",
      "Campina Grande e João Pessoa concentram as varas de maior movimento.",
    ],
    faqLocal: [
      {
        q: "Atendem Campina Grande e Patos?",
        a: "Sim, além de João Pessoa, Santa Rita, Bayeux e demais comarcas paraibanas.",
      },
      {
        q: "Serve para investigação social de concurso na Paraíba?",
        a: "Sim. É o documento normalmente aceito para esclarecer o teor e a fase de um processo apontado na certidão criminal.",
      },
    ],
  },
  pi: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 22ª Região",
    particularidades: [
      "No Piauí, Teresina concentra a maior parte do acervo e das varas especializadas.",
      "Comarcas do interior podem ter processos físicos antigos, com prazo maior para emissão.",
      "A certidão é frequente em processos de financiamento habitacional e em concursos estaduais.",
    ],
    faqLocal: [
      {
        q: "Atendem Parnaíba, Picos e Floriano?",
        a: "Sim, além de Teresina e das demais comarcas piauienses.",
      },
      {
        q: "Consigo certidão de processo já arquivado no TJPI?",
        a: "Sim. A certidão indica o desfecho do processo arquivado, que é o que costuma faltar na consulta pública.",
      },
    ],
  },
  rn: {
    trf: "TRF da 5ª Região",
    trt: "TRT da 21ª Região",
    particularidades: [
      "O Rio Grande do Norte tem acervo concentrado em Natal, Mossoró e Parnamirim.",
      "A certidão é bastante pedida por candidatos a concursos das polícias civil e militar do estado.",
      "Processos federais potiguares são julgados pelo TRF5, sediado em Recife.",
    ],
    faqLocal: [
      {
        q: "Atendem Mossoró e o interior do RN?",
        a: "Sim, todas as comarcas do estado, incluindo Parnamirim, Caicó e Currais Novos.",
      },
      {
        q: "Serve para concurso da polícia?",
        a: "Sim. É o documento usado para explicar o assunto e a fase de um processo apontado na investigação social do candidato.",
      },
    ],
  },
  ro: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 14ª Região (Rondônia e Acre)",
    particularidades: [
      "Rondônia é rota de transporte de cargas para o Norte, com demanda recorrente de certidões para motoristas bloqueados em gerenciadoras de risco.",
      "Execuções rurais e ambientais são comuns nas comarcas do interior.",
      "Porto Velho concentra as varas de maior movimento e prazos mais previsíveis.",
    ],
    faqLocal: [
      {
        q: "Atendem Ji-Paraná, Vilhena e Ariquemes?",
        a: "Sim, além de Porto Velho, Cacoal e demais comarcas rondonienses.",
      },
      {
        q: "A certidão libera cadastro de motorista em Rondônia?",
        a: "Ela fornece à gerenciadora o assunto e a fase do processo, que é a informação que faltava para a análise e a liberação do cadastro.",
      },
    ],
  },
  rr: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 11ª Região (Roraima e Amazonas)",
    particularidades: [
      "Roraima tem o menor número de comarcas do país, o que torna a localização do processo bastante direta.",
      "A proximidade com a fronteira gera pedidos ligados a imigração e a documentação para o exterior.",
      "O acervo é majoritariamente eletrônico, com prazos dentro da média nacional.",
    ],
    faqLocal: [
      {
        q: "Atendem comarcas fora de Boa Vista?",
        a: "Sim, incluindo Rorainópolis, Caracaraí e Mucajaí.",
      },
      {
        q: "A certidão serve para processo de imigração?",
        a: "Serve para explicar oficialmente o teor e a fase de um processo; para uso no exterior, geralmente é preciso tradução juramentada e apostilamento.",
      },
    ],
  },
  se: {
    trf: "TRF da 5ª Região",
    trt: "TRT da 20ª Região",
    particularidades: [
      "Sergipe é o menor estado do país em território, com comarcas próximas e trâmite geralmente ágil.",
      "Aracaju concentra as varas cíveis e criminais de maior volume.",
      "A certidão é comum em processos de financiamento imobiliário e em admissões em empresas do polo industrial.",
    ],
    faqLocal: [
      {
        q: "Atendem Nossa Senhora do Socorro, Lagarto e Itabaiana?",
        a: "Sim, além de Aracaju e das demais comarcas sergipanas.",
      },
      {
        q: "Quanto tempo demora no TJSE?",
        a: "Normalmente dentro do prazo médio indicado nesta página, variando conforme a vara e a existência de processo físico.",
      },
    ],
  },
  to: {
    trf: "TRF da 1ª Região",
    trt: "TRT da 10ª Região (Tocantins e Distrito Federal)",
    particularidades: [
      "O Tocantins foi um dos primeiros estados com processo integralmente eletrônico, o que costuma reduzir o prazo de emissão.",
      "Execuções ligadas ao agronegócio e a financiamentos rurais são frequentes nas comarcas do interior.",
      "Processos trabalhistas tocantinenses são julgados pelo TRT da 10ª Região, com sede em Brasília.",
    ],
    faqLocal: [
      {
        q: "Atendem Araguaína, Gurupi e Porto Nacional?",
        a: "Sim, além de Palmas e das demais comarcas do estado.",
      },
      {
        q: "Processo trabalhista no Tocantins é julgado onde?",
        a: "No TRT da 10ª Região, que abrange Tocantins e Distrito Federal, com sede em Brasília.",
      },
    ],
  },
};

export const detalheEstado = (slug: string): EstadoDetalhe | undefined =>
  ESTADOS_DETALHES[slug];
