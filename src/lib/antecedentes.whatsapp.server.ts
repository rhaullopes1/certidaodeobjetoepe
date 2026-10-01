/**
 * Envio automático da certidão por WhatsApp.
 *
 * Depende de uma conexão WhatsApp Business ligada ao projeto (connector da
 * Lovable). Sem as credenciais, a função devolve `configurado: false` e o
 * restante do fluxo segue normalmente — a equipe envia manualmente pelo painel.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

export function temWhatsappAutomatico() {
  return Boolean(process.env["LOVABLE_API_KEY"] && process.env["WHATSAPP_API_KEY"]);
}

export type EnvioWhatsapp =
  | { configurado: false }
  | { configurado: true; ok: true; messageId: string | null }
  | { configurado: true; ok: false; erro: string };

/** `destino` em E.164 somente dígitos, sem o "+" (ex.: 5547999999999). */
export async function enviarTextoWhatsapp(
  destino: string,
  texto: string,
): Promise<EnvioWhatsapp> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const whatsappKey = process.env["WHATSAPP_API_KEY"];
  if (!lovableKey || !whatsappKey) return { configurado: false };

  const numero = destino.replace(/\D/g, "");
  if (numero.length < 10) {
    return { configurado: true, ok: false, erro: "Número de WhatsApp inválido." };
  }

  try {
    const resposta = await fetch(`${GATEWAY_URL}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": whatsappKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: numero,
        type: "text",
        text: { body: texto, preview_url: true },
      }),
    });

    const corpo = await resposta.text();
    if (!resposta.ok) {
      console.error(`Envio WhatsApp falhou [${resposta.status}]: ${corpo}`);
      return { configurado: true, ok: false, erro: `HTTP ${resposta.status}: ${corpo.slice(0, 500)}` };
    }

    let messageId: string | null = null;
    try {
      const json = JSON.parse(corpo) as { messages?: Array<{ id?: string }> };
      messageId = json.messages?.[0]?.id ?? null;
    } catch {
      /* resposta sem corpo JSON não invalida o envio */
    }
    return { configurado: true, ok: true, messageId };
  } catch (e) {
    return { configurado: true, ok: false, erro: String(e) };
  }
}

/** Normaliza para E.164 brasileiro quando o número vem só com DDD. */
export function paraE164Brasil(whatsapp: string) {
  const d = whatsapp.replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}
