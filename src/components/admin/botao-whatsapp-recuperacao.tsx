/**
 * Botão de recuperação manual de pagamento via WhatsApp (painel /admin/recuperacao).
 * Abre o wa.me com mensagem pré-preenchida — o envio continua manual.
 * Fica indisponível quando o pedido não tem um número de WhatsApp válido.
 */
import { MessageCircle } from "lucide-react";

import { linkWhatsappRecuperacao, normalizarWhatsapp } from "@/lib/whatsapp-cliente";

export type LinhaRecuperacaoWhatsApp = {
  clienteNome: string | null;
  protocolo: string;
  valorFormatado: string;
  linkPagamento: string | null;
  whatsapp: string | null;
};

export function BotaoWhatsAppRecuperacao({ linha }: { linha: LinhaRecuperacaoWhatsApp }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors";

  if (!linha.whatsapp || !normalizarWhatsapp(linha.whatsapp)) {
    return (
      <span
        className={`${base} cursor-not-allowed border-white/10 text-white/30`}
        title="Número de WhatsApp não disponível para este pedido"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </span>
    );
  }

  const link = linkWhatsappRecuperacao({
    nome_parte: linha.clienteNome,
    protocolo: linha.protocolo,
    valorFormatado: linha.valorFormatado,
    linkPagamento:
      linha.linkPagamento ??
      `https://certidaodeobjetoepe.org/pedido/${encodeURIComponent(linha.protocolo)}`,
    whatsapp: linha.whatsapp,
  });

  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} border-green-400/30 text-green-300 hover:bg-green-400/10`}
      title="Abrir WhatsApp com mensagem de recuperação pré-preenchida (envio manual)"
    >
      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
    </a>
  );
}
