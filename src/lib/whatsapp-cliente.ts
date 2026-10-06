/**
 * Utilitários para contato rápido via WhatsApp com o cliente a partir do painel.
 * Apenas abre o WhatsApp com mensagem pré-preenchida — NÃO envia automaticamente.
 */

export type PedidoContato = {
  protocolo: string;
  nome_parte: string | null;
  whatsapp: string;
  status: string;
  /** Link de download da certidão emitida, quando já anexada ao pedido. */
  linkCertidao?: string | null;
  /**
   * Link direto de pagamento/continuação (ex.: checkout do gateway).
   * Usado apenas quando o pedido está aguardando pagamento.
   */
  linkPagamento?: string | null;
};

/**
 * Normaliza o número de WhatsApp informado pelo cliente para o formato
 * internacional esperado pelo wa.me (somente dígitos, com DDI 55 para o Brasil).
 * Retorna null quando o número não é utilizável.
 */
export function normalizarWhatsapp(telefone: string): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;

  // Já inclui DDI 55 + DDD + número (12 ou 13 dígitos no Brasil).
  if (/^55\d{10,11}$/.test(digitos)) return digitos;
  // Número nacional com DDD (10 ou 11 dígitos): acrescenta o DDI 55.
  if (/^\d{10,11}$/.test(digitos)) return `55${digitos}`;
  // Outro formato internacional já com DDI válido (apenas dígitos, >= 8).
  if (digitos.length >= 8 && digitos.length <= 15) return digitos;
  return null;
}

/** Link oficial do perfil da empresa no Google para avaliações de clientes. */
export const LINK_AVALIACAO_GOOGLE = "https://g.page/r/CdVwgtTtww0_EAE/review";

/** Link seguro já existente para o cliente acompanhar/pagar o próprio pedido. */
export function linkDoPedido(protocolo: string): string {
  return `https://certidaodeobjetoepe.org/pedido/${encodeURIComponent(protocolo)}`;
}


/**
 * Monta a mensagem pré-preenchida conforme o status do pedido.
 * Nunca afirma algo que não esteja confirmado pelo status.
 */
export function mensagemWhatsapp(p: PedidoContato): string {
  const nome = p.nome_parte?.trim() || "tudo bem";
  const link = linkDoPedido(p.protocolo);

  // Quando a certidão já está anexada ao pedido, a mensagem entrega o
  // documento com o link direto para download.
  if (p.linkCertidao) {
    return (
      `Olá, ${nome}! A sua Certidão de Objeto e Pé (protocolo ${p.protocolo}) está pronta. ` +
      `Você pode baixar o documento em PDF neste link: ${p.linkCertidao} ` +
      `(link válido por 7 dias — recomendamos salvar o arquivo). ` +
      `Também enviamos uma cópia para o seu e-mail. ` +
      `Se o nosso atendimento te ajudou, você poderia deixar uma avaliação de 5 estrelas no Google? ` +
      `Leva menos de 30 segundos: ${LINK_AVALIACAO_GOOGLE} Muito obrigado pela confiança!`
    );
  }

  switch (p.status) {
    case "aguardando_pagamento":
      return mensagemRecuperacaoCurta(p.nome_parte, link);
    case "pago":
      return (
        `Olá, ${nome}! Recebemos o pagamento do seu pedido (protocolo ${p.protocolo}). ` +
        `Estamos dando andamento à emissão da Certidão de Objeto e Pé. Em caso de dúvida, é só responder aqui.`
      );
    case "em_analise":
      return (
        `Olá, ${nome}! Seu pedido (protocolo ${p.protocolo}) está em análise. ` +
        `Estamos conferindo os dados do processo informado. Qualquer dúvida, estou à disposição.`
      );
    case "protocolado":
      return (
        `Olá, ${nome}! O pedido da sua Certidão de Objeto e Pé (protocolo ${p.protocolo}) ` +
        `foi protocolado junto ao tribunal responsável. Acompanhe pelo link: ${link}`
      );
    case "emitida":
      return (
        `Olá, ${nome}! A sua Certidão de Objeto e Pé (protocolo ${p.protocolo}) foi emitida ` +
        `e enviada para o seu e-mail. ` +
        `Se o nosso atendimento te ajudou, você poderia deixar uma avaliação de 5 estrelas no Google? ` +
        `Leva menos de 30 segundos: ${LINK_AVALIACAO_GOOGLE} ` +
        `Muito obrigado pela confiança!`
      );

    case "cancelado":
    case "expirado":
      return (
        `Olá, ${nome}! O pedido (protocolo ${p.protocolo}) foi cancelado/expirado. ` +
        `Se quiser retomar a solicitação, posso ajudar por aqui.`
      );
    default:
      return (
        `Olá, ${nome}! Sobre o seu pedido (protocolo ${p.protocolo}): ` +
        `posso ajudar com alguma informação? Acompanhe pelo link: ${link}`
      );
  }
}

/**
 * Monta o link wa.me para o cliente, ou null quando não há número válido.
 * O link abre a conversa com a mensagem pré-preenchida — o envio é manual.
 */
export function linkWhatsappCliente(p: PedidoContato): string | null {
  const numero = normalizarWhatsapp(p.whatsapp);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemWhatsapp(p))}`;
}

/**
 * Mensagem de recuperação manual de pagamento (painel /admin/recuperacao).
 * Nunca afirma que o pagamento foi recebido; inclui valor e link de pagamento.
 */
export function mensagemWhatsappRecuperacao(p: {
  nome_parte: string | null;
  protocolo: string;
  valorFormatado: string;
  linkPagamento: string;
}): string {
  return mensagemRecuperacaoCurta(p.nome_parte, linkDoPedido(p.protocolo));
}

/** Texto aprovado de recuperação: curto, com o link do pedido do cliente. */
function mensagemRecuperacaoCurta(nomeParte: string | null, link: string): string {
  const primeiro = nomeParte?.trim().split(/\s+/)[0];
  const saudacao = primeiro ? `Olá, ${primeiro}!` : "Olá!";
  return (
    `${saudacao} Recebemos seu pedido.\n\n` +
    `Falta apenas a confirmação para protocolarmos sua certidão no lote de hoje. ` +
    `Você pode pagar por Pix ou em até 3x no cartão, segue link do seu pedido abaixo:\n` +
    link
  );
}

/** Link wa.me da recuperação manual, ou null sem número válido. Envio manual. */
export function linkWhatsappRecuperacao(p: {
  nome_parte: string | null;
  protocolo: string;
  valorFormatado: string;
  linkPagamento: string;
  whatsapp: string;
}): string | null {
  const numero = normalizarWhatsapp(p.whatsapp);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemWhatsappRecuperacao(p))}`;
}

/** Mensagem de pedido voluntário de avaliação no Google (sem incentivo). */
export function mensagemWhatsappAvaliacao(p: { nome_parte: string | null }): string {
  const nome = p.nome_parte?.trim();
  const saudacao = nome ? `Olá, ${nome}! 😊` : "Olá! 😊";
  return (
    `${saudacao}\n\n` +
    `Obrigado por confiar na Certidão de Objeto e Pé.\n\n` +
    `Se você puder compartilhar como foi sua experiência com nosso atendimento, sua avaliação no Google nos ajuda muito e leva menos de 1 minuto. ⭐\n\n` +
    `Avalie nossa empresa:\n${LINK_AVALIACAO_GOOGLE}\n\n` +
    `Muito obrigado pela confiança! 🙏`
  );
}

/** Link wa.me com a mensagem de avaliação, ou null sem número válido. Envio manual. */
export function linkWhatsappAvaliacao(p: { nome_parte: string | null; whatsapp: string }): string | null {
  const numero = normalizarWhatsapp(p.whatsapp);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemWhatsappAvaliacao(p))}`;
}

/** Mensagem da oferta relâmpago de 30% (válida só hoje), com link do pedido. */
export function mensagemOfertaRelampago(p: {
  nome: string | null;
  protocolo: string;
  valorOriginalCentavos: number;
  valorOfertaCentavos: number;
}): string {
  const nome = p.nome?.trim().split(/\s+/)[0];
  const brl = (c: number) =>
    (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: c % 100 ? 2 : 0 });
  return (
    `${nome ? `Olá, ${nome}!` : "Olá!"} Ainda precisa da Certidão de Objeto e Pé?\n\n` +
    `⚡ OFERTA EXCLUSIVA — SÓ HOJE 30% OFF\n\n` +
    `🔥 De ${brl(p.valorOriginalCentavos)} por ${brl(p.valorOfertaCentavos)} no Pix\n\n` +
    `ou 3x no cartão.\n\n` +
    `👉 Finalize aqui:\n\n` +
    `https://certidaodeobjetoepe.org/pedido/${p.protocolo}\n\n` +
    `⏰ Válido SOMENTE até 23h59 DE HOJE!`
  );
}
