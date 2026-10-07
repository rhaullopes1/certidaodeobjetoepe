/**
 * Modelos de SMS de recuperação (painel /admin/recuperacao).
 * Os textos ficam sem acentos para caber em 1 SMS (160 caracteres GSM);
 * acentos forçam o limite de 70 caracteres e cobram mensagens extras.
 */
export type EtapaSms = 1 | 2 | 3;

export const MODELOS_SMS: Record<EtapaSms, { titulo: string; texto: string }> = {
  1: {
    titulo: "Etapa 1 — Dúvidas / plantão",
    texto:
      "[Certidao Objeto e Pe] {{nome}}, seu pedido {{protocolo}} aguarda confirmacao. Duvidas? Fale no WhatsApp pelo link: {{link}}",
  },
  2: {
    titulo: "Etapa 2 — Condição especial",
    texto:
      "[Certidao Objeto e Pe] {{nome}}, liberamos condicao especial no pedido {{protocolo}}. Chame nosso plantao no WhatsApp: {{link}}",
  },
  3: {
    titulo: "Etapa 3 — Último aviso",
    texto:
      "[Certidao Objeto e Pe] Ultimo aviso: o pedido {{protocolo}} sai do lote hoje. Fale com a equipe no WhatsApp: {{link}}",
  },
};

function semAcentos(t: string) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function linkPedidoSms(protocolo: string) {
  return `certidaodeobjetoepe.org/pedido/${encodeURIComponent(protocolo)}`;
}

export function montarSms(
  etapa: EtapaSms,
  dados: { nome: string | null; protocolo: string },
) {
  const nome = semAcentos((dados.nome ?? "").trim().split(/\s+/)[0] || "Ola");
  return semAcentos(
    MODELOS_SMS[etapa].texto
      .replace("{{nome}}", nome)
      .replace("{{protocolo}}", dados.protocolo)
      .replace("{{link}}", linkPedidoSms(dados.protocolo)),
  );
}

/** Converte telefone brasileiro para E.164 (+55DDDNUMERO). Retorna null se inválido. */
export function telefoneE164(valor: string | null | undefined) {
  const d = (valor ?? "").replace(/\D/g, "");
  if (!d) return null;
  const local = d.startsWith("55") && d.length >= 12 ? d.slice(2) : d;
  if (local.length !== 10 && local.length !== 11) return null;
  return `+55${local}`;
}

/** Sugere a etapa do SMS a partir da etapa de e-mail já enviada. */
export function etapaSmsSugerida(etapaEmail: number): EtapaSms {
  if (etapaEmail >= 3) return 3;
  if (etapaEmail === 2) return 2;
  return 1;
}
