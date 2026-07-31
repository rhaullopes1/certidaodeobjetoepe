export const WHATSAPP_NUMBER = "5511999999999";

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

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
