/**
 * Emissão automática da Certidão de Antecedentes Criminais Federal.
 *
 * A consulta é gratuita: o pedido nasce com status `gratuito` (sem cobrança e
 * sem pago_em) e a emissão é disparada logo após o registro. Pedidos antigos
 * pagos (`pago`/`emitido`) continuam aceitos para retentativas. Todo o fluxo é idempotente: a tabela
 * `emissoes_antecedentes` tem uma linha única por pedido e cada etapa (emissão,
 * e-mail, WhatsApp) só roda enquanto a marca de conclusão estiver vazia.
 */

import { EMAIL_CONTATO } from "./site";

export const TIPO_ANTECEDENTES = "antecedentes_pf";

const MAX_TENTATIVAS = 5;
const BACKOFF_MINUTOS = [2, 10, 30, 120, 360];

type PedidoAntecedentes = {
  id: string;
  protocolo: string;
  status: string;
  tipo: string;
  nome_parte: string | null;
  cpf: string;
  email: string;
  whatsapp: string;
  ant_nome_mae: string | null;
  ant_nome_pai: string | null;
  ant_uf_nascimento: string | null;
  ant_nascimento: string | null;
};

const COLUNAS =
  "id, protocolo, status, tipo, nome_parte, cpf, email, whatsapp, ant_nome_mae, ant_nome_pai, ant_uf_nascimento, ant_nascimento";

export type ResultadoProcessamento =
  | { acao: "ignorado"; motivo: string }
  | { acao: "emitida"; protocolo: string; email: boolean; whatsapp: boolean }
  | { acao: "falhou"; protocolo: string; erro: string; definitivo: boolean };

/** Garante que o pedido tenha uma linha de controle de emissão. */
async function garantirLinha(pedidoId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("emissoes_antecedentes")
    .upsert({ pedido_id: pedidoId }, { onConflict: "pedido_id", ignoreDuplicates: true });
}

/**
 * Processa a emissão de um pedido pago. Chamar quantas vezes for preciso:
 * só age quando há trabalho pendente.
 */
export async function processarEmissaoAntecedentes(
  pedidoId: string,
): Promise<ResultadoProcessamento> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: pedido } = await supabaseAdmin
    .from("pedidos")
    .select(COLUNAS)
    .eq("id", pedidoId)
    .maybeSingle<PedidoAntecedentes>();

  if (!pedido) return { acao: "ignorado", motivo: "pedido_nao_encontrado" };
  if (pedido.tipo !== TIPO_ANTECEDENTES) return { acao: "ignorado", motivo: "outro_tipo" };
  // `gratuito`: consulta gratuita; `pago`/`emitido`: pedidos pagos antigos.
  if (!["gratuito", "pago", "emitido"].includes(pedido.status)) {
    return { acao: "ignorado", motivo: "pagamento_nao_confirmado" };
  }

  await garantirLinha(pedido.id);

  const agora = new Date().toISOString();
  const { data: linha } = await supabaseAdmin
    .from("emissoes_antecedentes")
    .select("*")
    .eq("pedido_id", pedido.id)
    .maybeSingle();

  if (!linha) return { acao: "ignorado", motivo: "sem_linha_de_controle" };

  // Já emitida: só completa os envios que ainda faltam.
  if (linha.status === "emitida") {
    const envios = await enviarEntrega(pedido, linha);
    return { acao: "emitida", protocolo: pedido.protocolo, ...envios };
  }

  if (linha.status === "falhou_definitivo") {
    return {
      acao: "falhou",
      protocolo: pedido.protocolo,
      erro: linha.erro ?? "Emissão encerrada após erro definitivo.",
      definitivo: true,
    };
  }

  if (linha.status === "processando") {
    // Trava simples contra execução dupla; libera sozinha após 5 minutos.
    const desde = new Date(linha.updated_at as string).getTime();
    if (Date.now() - desde < 5 * 60 * 1000) {
      return { acao: "ignorado", motivo: "em_processamento" };
    }
  }

  if (linha.proxima_tentativa_em && linha.proxima_tentativa_em > agora) {
    return { acao: "ignorado", motivo: "aguardando_nova_tentativa" };
  }

  if ((linha.tentativas ?? 0) >= MAX_TENTATIVAS) {
    await supabaseAdmin
      .from("emissoes_antecedentes")
      .update({ status: "falhou_definitivo" })
      .eq("pedido_id", pedido.id);
    return {
      acao: "falhou",
      protocolo: pedido.protocolo,
      erro: "Limite de tentativas atingido.",
      definitivo: true,
    };
  }

  // Reserva a execução: nenhuma outra chamada passa daqui enquanto durar.
  const tentativa = (linha.tentativas ?? 0) + 1;
  const { data: reservado } = await supabaseAdmin
    .from("emissoes_antecedentes")
    .update({ status: "processando", tentativas: tentativa })
    .eq("pedido_id", pedido.id)
    .eq("status", linha.status)
    .select("pedido_id")
    .maybeSingle();

  if (!reservado) return { acao: "ignorado", motivo: "reservado_por_outra_execucao" };

  if (!pedido.ant_nascimento || !pedido.nome_parte) {
    await marcarFalha(pedido, "Pedido sem nome ou data de nascimento.", true, tentativa);
    return {
      acao: "falhou",
      protocolo: pedido.protocolo,
      erro: "Pedido sem nome ou data de nascimento.",
      definitivo: true,
    };
  }

  const { emitirAntecedentesPF } = await import("./infosimples.server");
  const resultado = await emitirAntecedentesPF({
    nome: pedido.nome_parte,
    birthdate: pedido.ant_nascimento,
    cpf: pedido.cpf,
    nomeMae: pedido.ant_nome_mae,
    nomePai: pedido.ant_nome_pai,
    ufNascimento: pedido.ant_uf_nascimento,
  });

  if (!resultado.ok) {
    await marcarFalha(pedido, resultado.erro, resultado.permanente, tentativa, resultado.bruto);
    return {
      acao: "falhou",
      protocolo: pedido.protocolo,
      erro: resultado.erro,
      definitivo: resultado.permanente || tentativa >= MAX_TENTATIVAS,
    };
  }

  const c = resultado.certidao;
  const { data: atualizada } = await supabaseAdmin
    .from("emissoes_antecedentes")
    .update({
      status: "emitida",
      certidao_codigo: c.certidaoCodigo,
      certidao_numero: c.numero,
      emissao_datahora: c.emissaoDatahora,
      validade_data: c.validadeData,
      mensagem: c.mensagem,
      site_receipt: c.siteReceipt,
      negativa: c.negativa,
      erro: null,
      proxima_tentativa_em: null,
      emitida_em: new Date().toISOString(),
      payload: resultado.bruto as never,
    })
    .eq("pedido_id", pedido.id)
    .select("*")
    .maybeSingle();

  await registrarAndamento(
    pedido.id,
    "Certidão de Antecedentes Criminais emitida automaticamente pela Polícia Federal.",
    `Número ${c.numero ?? "—"} · emitida em ${c.emissaoDatahora ?? "—"} · válida até ${c.validadeData ?? "—"}`,
  );

  const envios = await enviarEntrega(pedido, atualizada ?? linha);
  return { acao: "emitida", protocolo: pedido.protocolo, ...envios };
}

async function marcarFalha(
  pedido: PedidoAntecedentes,
  erro: string,
  permanente: boolean,
  tentativa: number,
  bruto?: unknown,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const definitivo = permanente || tentativa >= MAX_TENTATIVAS;
  const minutos = BACKOFF_MINUTOS[Math.min(tentativa - 1, BACKOFF_MINUTOS.length - 1)]!;

  await supabaseAdmin
    .from("emissoes_antecedentes")
    .update({
      status: definitivo ? "falhou_definitivo" : "falhou",
      erro: erro.slice(0, 2000),
      payload: (bruto ?? null) as never,
      proxima_tentativa_em: definitivo
        ? null
        : new Date(Date.now() + minutos * 60 * 1000).toISOString(),
    })
    .eq("pedido_id", pedido.id);

  await registrarAndamento(
    pedido.id,
    definitivo
      ? "Não foi possível emitir a certidão automaticamente. Atendimento manual necessário."
      : "Tentativa de emissão automática sem sucesso. Nova tentativa programada.",
    `Tentativa ${tentativa}: ${erro.slice(0, 500)}`,
  );
}

/** Entrega a certidão por e-mail e WhatsApp, cada canal só uma vez. */
async function enviarEntrega(
  pedido: PedidoAntecedentes,
  linha: Record<string, unknown>,
): Promise<{ email: boolean; whatsapp: boolean }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const link = `https://certidaodeobjetoepe.org/pedido/${pedido.protocolo}`;
  const pdf = (linha["site_receipt"] as string | null) ?? null;
  const numero = (linha["certidao_numero"] as string | null) ?? null;
  const emissao = (linha["emissao_datahora"] as string | null) ?? null;
  const validade = (linha["validade_data"] as string | null) ?? null;
  const mensagem = (linha["mensagem"] as string | null) ?? null;

  let email = Boolean(linha["email_enviado_em"]);
  let whatsapp = Boolean(linha["whatsapp_enviado_em"]);

  if (!email && pedido.email) {
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const r = await sendTemplateEmail("antecedentes-pronta", pedido.email, {
        idempotencyKey: `antecedentes-pronta-${pedido.protocolo}`,
        replyTo: EMAIL_CONTATO,
        templateData: {
          protocolo: pedido.protocolo,
          nome: pedido.nome_parte ?? undefined,
          numero,
          emissao,
          validade,
          mensagem,
          pdfUrl: pdf,
          url: link,
        },
      });
      if (r.sent || r.reason === "recipient_suppressed") {
        email = true;
        await supabaseAdmin
          .from("emissoes_antecedentes")
          .update({ email_enviado_em: new Date().toISOString() })
          .eq("pedido_id", pedido.id);
      }
    } catch (e) {
      console.error("Falha ao enviar e-mail da certidão de antecedentes", e);
    }
  }

  if (!whatsapp && pedido.whatsapp) {
    try {
      const { enviarTextoWhatsapp, paraE164Brasil } = await import(
        "./antecedentes.whatsapp.server"
      );
      const texto = [
        `Olá${pedido.nome_parte ? `, ${pedido.nome_parte.split(" ")[0]}` : ""}! Sua Certidão de Antecedentes Criminais Federal está pronta.`,
        numero ? `Número da certidão: ${numero}` : null,
        validade ? `Válida até: ${validade}` : null,
        pdf ? `PDF da certidão: ${pdf}` : null,
        `Acompanhe o pedido ${pedido.protocolo} em ${link}`,
      ]
        .filter(Boolean)
        .join("\n");

      const envio = await enviarTextoWhatsapp(paraE164Brasil(pedido.whatsapp), texto);
      if (envio.configurado && envio.ok) {
        whatsapp = true;
        await supabaseAdmin
          .from("emissoes_antecedentes")
          .update({ whatsapp_enviado_em: new Date().toISOString() })
          .eq("pedido_id", pedido.id);
      } else if (!envio.configurado) {
        await registrarAndamento(
          pedido.id,
          "Certidão pronta — envio por WhatsApp pendente.",
          "WhatsApp automático não configurado: enviar manualmente pelo painel.",
        );
      }
    } catch (e) {
      console.error("Falha ao enviar WhatsApp da certidão de antecedentes", e);
    }
  }

  // Pedidos pagos antigos passam a emitido. Consultas gratuitas mantêm o status
  // `gratuito` (fora da fila de entregas e da receita); a conclusão fica em
  // emissoes_antecedentes.
  await supabaseAdmin
    .from("pedidos")
    .update({ status: "emitido" })
    .eq("id", pedido.id)
    .eq("status", "pago");

  return { email, whatsapp };
}

async function registrarAndamento(
  pedidoId: string,
  observacao: string,
  observacaoInterna?: string,
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("pedido_andamentos").insert({
      pedido_id: pedidoId,
      status: "emissao_antecedentes",
      observacao,
      observacao_interna: observacaoInterna ?? null,
    });
  } catch (e) {
    console.error("Falha ao registrar andamento da emissão", e);
  }
}

/** Reprocessa consultas (gratuitas ou pagas antigas) cuja emissão ainda não concluiu (retentativas). */
export async function reprocessarEmissoesPendentes(limite = 20) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const agora = new Date().toISOString();

  const { data } = await supabaseAdmin
    .from("emissoes_antecedentes")
    .select("pedido_id, status, proxima_tentativa_em")
    .in("status", ["pendente", "falhou", "processando"])
    .or(`proxima_tentativa_em.is.null,proxima_tentativa_em.lte.${agora}`)
    .order("created_at", { ascending: true })
    .limit(limite);

  const resultados: ResultadoProcessamento[] = [];
  for (const linha of data ?? []) {
    resultados.push(await processarEmissaoAntecedentes(linha.pedido_id));
  }
  return resultados;
}
