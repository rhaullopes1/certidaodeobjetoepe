// Envio de mensagens automáticas de WhatsApp via Twilio.
// Sem credenciais configuradas, as funções apenas registram um aviso e seguem em silêncio,
// para nunca quebrar o fluxo de criação/confirmação de pedidos.

type Certidao = { numeroProcesso: string; nomeParte: string; cpf: string };

export type PedidoNotificacao = {
  protocolo: string;
  quantidade: number;
  valorCentavos: number;
  email: string;
  whatsapp: string;
  certidoes: Certidao[];
  observacoes?: string | null;
};

function moeda(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function soDigitos(v: string) {
  return v.replace(/\D+/g, "");
}

/** Normaliza para E.164 brasileiro: +55DDDNUMERO */
function paraE164(valor: string) {
  let d = soDigitos(valor);
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (!d.startsWith("55")) d = `55${d}`;
  if (d.length < 12 || d.length > 13) return null;
  return `+${d}`;
}

async function enviar(paraE164Numero: string, corpo: string) {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_WHATSAPP_FROM"];
  if (!sid || !token || !from) {
    console.warn("WhatsApp não enviado: credenciais Twilio ausentes.");
    return false;
  }
  const fromNumero = from.startsWith("whatsapp:") ? from : `whatsapp:${paraE164(from) ?? from}`;

  const body = new URLSearchParams({
    From: fromNumero,
    To: `whatsapp:${paraE164Numero}`,
    Body: corpo,
  });

  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!resp.ok) {
    const erro = await resp.text();
    console.error(`Twilio WhatsApp falhou [${resp.status}]: ${erro}`);
    return false;
  }
  return true;
}

function resumoCertidoes(pedido: PedidoNotificacao) {
  return pedido.certidoes
    .map(
      (c, i) =>
        `${i + 1}) Processo: ${c.numeroProcesso}\n   Parte: ${c.nomeParte}\n   CPF: ${c.cpf}`,
    )
    .join("\n");
}

/** Resumo completo do pedido para o administrador. */
export async function notificarAdminNovoPedido(pedido: PedidoNotificacao) {
  const destino = paraE164(process.env["ADMIN_WHATSAPP"] ?? "");
  if (!destino) {
    console.warn("WhatsApp do admin não configurado (ADMIN_WHATSAPP).");
    return;
  }
  const texto = [
    `🆕 NOVO PEDIDO — ${pedido.protocolo}`,
    ``,
    `Certidões: ${pedido.quantidade}`,
    `Valor: ${moeda(pedido.valorCentavos)}`,
    `E-mail: ${pedido.email}`,
    `WhatsApp: ${pedido.whatsapp}`,
    ``,
    resumoCertidoes(pedido),
    pedido.observacoes ? `\nObservações: ${pedido.observacoes}` : "",
    ``,
    `Status: aguardando pagamento`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await enviar(destino, texto);
  } catch (e) {
    console.error("Falha ao notificar admin no WhatsApp", e);
  }
}

/** Confirmação de recebimento da solicitação para o cliente. */
export async function notificarClientePedidoRecebido(pedido: PedidoNotificacao, urlPedido: string) {
  const destino = paraE164(pedido.whatsapp);
  if (!destino) return;
  const texto = [
    `Olá! Recebemos sua solicitação de Certidão de Objeto e Pé. ✅`,
    ``,
    `Protocolo: ${pedido.protocolo}`,
    `Certidões: ${pedido.quantidade}`,
    `Valor: ${moeda(pedido.valorCentavos)}`,
    ``,
    `Acompanhe o pedido e pague via Pix aqui:`,
    urlPedido,
    ``,
    `Assim que o pagamento for identificado, iniciamos a solicitação junto ao tribunal.`,
  ].join("\n");

  try {
    await enviar(destino, texto);
  } catch (e) {
    console.error("Falha ao notificar cliente no WhatsApp", e);
  }
}

/** Aviso de pagamento confirmado (cliente + admin). */
export async function notificarPagamentoConfirmado(pedido: {
  protocolo: string;
  whatsapp: string;
  valorCentavos: number;
}) {
  const cliente = paraE164(pedido.whatsapp);
  const admin = paraE164(process.env["ADMIN_WHATSAPP"] ?? "");
  const tarefas: Promise<unknown>[] = [];

  if (cliente) {
    tarefas.push(
      enviar(
        cliente,
        [
          `💚 Pagamento confirmado!`,
          ``,
          `Protocolo: ${pedido.protocolo}`,
          `Valor: ${moeda(pedido.valorCentavos)}`,
          ``,
          `Já iniciamos a solicitação da sua certidão. Avisamos por aqui quando ela for emitida.`,
        ].join("\n"),
      ),
    );
  }
  if (admin) {
    tarefas.push(
      enviar(
        admin,
        `💰 PAGAMENTO CONFIRMADO — ${pedido.protocolo} (${moeda(pedido.valorCentavos)})`,
      ),
    );
  }

  try {
    await Promise.all(tarefas);
  } catch (e) {
    console.error("Falha ao notificar pagamento confirmado", e);
  }
}
