/**
 * Botão de contato manual com o cliente pelo WhatsApp.
 * Abre a conversa com a mensagem pré-preenchida — o envio continua manual.
 * Quando o pedido já tem a certidão anexada, a mensagem inclui o link
 * direto para o cliente baixar o documento.
 */
import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";

import { linkCertidaoParaCliente } from "@/lib/admin";
import { linkWhatsappCliente, normalizarWhatsapp } from "@/lib/whatsapp-cliente";

export type PedidoWhatsApp = {
  id: string;
  protocolo: string;
  nome_parte: string | null;
  whatsapp: string;
  status: string;
};

export function BotaoWhatsAppCliente({
  pedido,
  destaque = false,
  className = "",
}: {
  pedido: PedidoWhatsApp;
  destaque?: boolean;
  className?: string;
}) {
  const [carregando, setCarregando] = useState(false);
  const numeroOk = normalizarWhatsapp(pedido.whatsapp) !== null;
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors";

  if (!numeroOk) {
    return (
      <span
        className={`${base} cursor-not-allowed bg-secondary/60 text-muted-foreground/50 ${className}`}
        title="Número de WhatsApp não disponível para este pedido"
      >
        <MessageCircle className="h-4 w-4 opacity-60" /> WhatsApp indisponível
      </span>
    );
  }

  const cor = destaque
    ? "bg-accent/20 text-accent ring-1 ring-accent/40 hover:bg-accent/30"
    : "bg-secondary text-foreground hover:bg-secondary/70";

  async function abrir() {
    if (carregando) return;
    setCarregando(true);
    // Abre a aba antes do await: navegadores bloqueiam janelas abertas
    // depois de uma operação assíncrona. Sem a feature "noopener" (que faz
    // window.open retornar null e abre uma aba vazia), e com o opener
    // cortado em seguida por segurança — mesmo padrão de abrir-em-nova-aba.
    const aba = window.open("about:blank", "_blank");
    if (aba) aba.opener = null;
    let linkCertidao: string | null = null;
    try {
      linkCertidao = await linkCertidaoParaCliente(pedido.id);
    } catch {
      linkCertidao = null;
    }
    const url = linkWhatsappCliente({
      protocolo: pedido.protocolo,
      nome_parte: pedido.nome_parte,
      whatsapp: pedido.whatsapp,
      status: pedido.status,
      linkCertidao,
    });
    setCarregando(false);
    if (!url) {
      aba?.close();
      return;
    }
    if (aba && !aba.closed) aba.location.href = url;
    else window.location.href = url;
  }

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={carregando}
      className={`${base} ${cor} disabled:opacity-70 ${className}`}
      title="Abrir WhatsApp com mensagem pré-preenchida (envio manual)"
    >
      {carregando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      WhatsApp
    </button>
  );
}
