/**
 * Utilitários para contato rápido via WhatsApp com o cliente a partir do painel.
 * Apenas abre o WhatsApp com mensagem pré-preenchida — NÃO envia automaticamente.
 */

export type PedidoContato = {
  protocolo: string;
  nome_parte: string | null;
  whatsapp: string;
  status: string;
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

  switch (p.status) {
    case "aguardando_pagamento":
      return (
        `Olá, ${nome}! Tudo bem? Recebemos sua solicitação de Certidão de Objeto e Pé, ` +
        `protocolo ${p.protocolo}. Verificamos que o pagamento ainda não foi concluído. ` +
        `Posso te ajudar a finalizar seu pedido? Você pode conferir o resumo e o Pix neste link: ${link}`
      );
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
        `e enviada para o seu e-mail. Precisando de algo mais, é só chamar.`
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
