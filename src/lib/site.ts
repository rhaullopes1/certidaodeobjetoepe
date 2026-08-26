export const WHATSAPP_NUMBER = "558000004604";
export const YOUTUBE_CHANNEL = "https://youtube.com/@certidaodeobjetoepe";
export const INSTAGRAM_PROFILE = "https://www.instagram.com/certidaodeobjetoe";
export const FACEBOOK_PAGE = "https://www.facebook.com/certidaoobjetoepe";

/** Tabela de preços por quantidade de certidões (em centavos). */
export const TABELA_PRECOS: Record<number, number> = {
  1: 29700,
  2: 49700,
  3: 69700,
  4: 89700,
  5: 99700,
};

export const QUANTIDADE_MAXIMA = 5;

export const precoCentavos = (quantidade: number) =>
  TABELA_PRECOS[Math.min(Math.max(Math.trunc(quantidade) || 1, 1), QUANTIDADE_MAXIMA)]!;

export const formatarBRL = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const PIX = {
  chave: "29125265000106",
  nome: "BR BROKERS",
  cidade: "BALNEARIO CAMBORIU",
};

export const PHONE_DISPLAY = "0800 000 4604";
export const PHONE_TEL = "tel:+558000004604";
export const EMAIL_CONTATO = "certidaoobjetoepe@gmail.com";

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const STATUS_PEDIDO: Record<
  string,
  { label: string; descricao: string; tom: "pendente" | "pago" | "cancelado" }
> = {
  aguardando_pagamento: {
    label: "Pagamento pendente",
    descricao: "Estamos aguardando a confirmação do seu pagamento.",
    tom: "pendente",
  },
  pago: {
    label: "Pagamento confirmado",
    descricao: "Pagamento confirmado. Seu pedido foi enviado ao tribunal.",
    tom: "pago",
  },
  em_analise: {
    label: "Em análise",
    descricao: "Nossa equipe está conferindo os dados do processo informado.",
    tom: "pendente",
  },
  protocolado: {
    label: "Protocolado no tribunal",
    descricao: "O pedido da certidão foi protocolado junto ao tribunal responsável.",
    tom: "pendente",
  },
  emitida: {
    label: "Certidão emitida",
    descricao: "A certidão foi emitida e enviada para o seu e-mail e WhatsApp.",
    tom: "pago",
  },
  cancelado: {
    label: "Pedido cancelado",
    descricao: "Este pedido foi cancelado. Fale conosco pelo WhatsApp se precisar retomar.",
    tom: "cancelado",
  },
  expirado: {
    label: "Pedido expirado",
    descricao:
      "Este pedido ficou sem pagamento por mais de 7 dias e expirou. Faça uma nova solicitação ou fale conosco.",
    tom: "cancelado",
  },
};

/** Dias sem pagamento até o pedido expirar automaticamente. */
export const DIAS_PARA_EXPIRAR = 7;

/** Etapas que a equipe pode aplicar no painel administrativo, na ordem do fluxo. */
export const FLUXO_STATUS = [
  "aguardando_pagamento",
  "pago",
  "em_analise",
  "protocolado",
  "emitida",
  "cancelado",
] as const;

export const statusPedido = (status: string) =>
  STATUS_PEDIDO[status] ?? {
    label: status,
    descricao: "Status do pedido em atualização.",
    tom: "pendente" as const,
  };

export const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export const FAQ = [
  {
    q: "O que é Certidão de Objeto e Pé?",
    a: "É um documento oficial emitido pelo Poder Judiciário que apresenta um resumo do processo: o assunto discutido (objeto) e a fase atual em que ele se encontra (pé).",
  },
  {
    q: "Quanto tempo demora?",
    a: "O prazo depende do tribunal responsável. Em geral, a emissão ocorre entre 1 e 10 dias úteis. Você é avisado por WhatsApp em cada etapa.",
  },
  {
    q: "Preciso de advogado para solicitar?",
    a: "Não. Qualquer pessoa pode solicitar a certidão. Nossa equipe cuida do pedido junto ao tribunal e do acompanhamento até a emissão.",
  },
  {
    q: "Posso solicitar online?",
    a: "Sim. Todo o atendimento é digital: você envia os dados pelo formulário ou WhatsApp e recebe o documento em formato digital.",
  },
  {
    q: "Quais informações aparecem na certidão?",
    a: "Número do processo, vara e comarca, partes envolvidas, assunto discutido e a situação atual do andamento processual.",
  },
  {
    q: "Posso solicitar de qualquer estado?",
    a: "Sim. Atendemos todos os estados do Brasil, em tribunais estaduais, federais e trabalhistas.",
  },
  {
    q: "Qual o valor do serviço?",
    a: "O valor varia conforme o tribunal e o tipo de processo. Envie os dados pelo WhatsApp e informamos o orçamento antes de qualquer pagamento.",
  },
  {
    q: "A certidão remove o processo do meu nome?",
    a: "Não. A certidão não exclui nem altera o processo: ela apenas documenta oficialmente do que se trata e em que fase está, o que costuma esclarecer dúvidas de empresas e seguradoras.",
  },
];
