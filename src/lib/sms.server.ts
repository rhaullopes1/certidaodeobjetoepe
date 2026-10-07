const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

/** Envia um SMS pelo Twilio (via conector). Lança erro com a mensagem do provedor. */
export async function enviarSms(para: string, texto: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const de = process.env.TWILIO_FROM_NUMBER;
  if (!lovableKey || !twilioKey) {
    throw new Error("Envio de SMS ainda não conectado. Conecte o Twilio no painel do projeto.");
  }
  if (!de) throw new Error("Número remetente de SMS (TWILIO_FROM_NUMBER) não configurado.");

  const resp = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: para, From: de, Body: texto }),
  });
  const corpo = await resp.text();
  if (!resp.ok) {
    console.error(`Falha no SMS [${resp.status}]: ${corpo}`);
    let msg = corpo;
    try {
      msg = JSON.parse(corpo).message ?? corpo;
    } catch {
      /* mantém texto bruto */
    }
    throw new Error(`Falha no envio do SMS (${resp.status}): ${msg}`);
  }
  return JSON.parse(corpo).sid as string;
}
