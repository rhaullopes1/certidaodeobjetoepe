import { createFileRoute } from "@tanstack/react-router";

// Mercado Pago avisa aqui quando um pagamento muda de status.
// Nunca confiamos no corpo recebido: consultamos o pagamento na API antes de gravar.
// Enquanto MERCADOPAGO_PIX_ENABLED estiver desativado nenhum pedido usa este fluxo.
export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          type?: string;
          topic?: string;
          action?: string;
          data?: { id?: string | number };
          id?: string | number;
          resource?: string;
        } = {};
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          payload = {};
        }

        const url = new URL(request.url);
        const recurso = payload?.resource?.split("/").pop();
        const paymentId =
          payload?.data?.id?.toString() ??
          url.searchParams.get("data.id") ??
          url.searchParams.get("id") ??
          (recurso && /^\d+$/.test(recurso) ? recurso : undefined) ??
          (typeof payload?.id === "number" ? String(payload.id) : undefined);

        const tipo =
          payload?.type ??
          payload?.topic ??
          url.searchParams.get("type") ??
          url.searchParams.get("topic") ??
          "payment";

        // Só tratamos notificações de pagamento; o resto é confirmado com 200
        // para o Mercado Pago não reenfileirar indefinidamente.
        if (!paymentId || (tipo !== "payment" && tipo !== "merchant_order" && !tipo.includes("payment"))) {
          return new Response("ok");
        }
        if (tipo === "merchant_order") return new Response("ok");

        // Autenticação do chamador: assinatura HMAC do Mercado Pago.
        // Sem segredo configurado, nenhuma notificação é processada.
        const segredo = process.env["MERCADOPAGO_WEBHOOK_SECRET"];
        if (!segredo) {
          console.error("MERCADOPAGO_WEBHOOK_SECRET ausente — webhook recusado");
          return new Response("webhook não configurado", { status: 503 });
        }
        const assinatura = request.headers.get("x-signature") ?? "";
        const partes = Object.fromEntries(
          assinatura
            .split(",")
            .map((p) => p.split("=").map((v) => v.trim()))
            .filter((p) => p.length === 2) as [string, string][],
        );
        const ts = partes["ts"];
        const v1 = partes["v1"];
        if (!ts || !v1) return new Response("assinatura ausente", { status: 401 });

        const requestId = request.headers.get("x-request-id") ?? "";
        // Pela documentação, o id do manifesto vem do parâmetro data.id da URL
        // (em minúsculas quando alfanumérico); usamos o do corpo como reserva.
        const idManifesto = (url.searchParams.get("data.id") ?? paymentId).toLowerCase();
        const manifesto = `id:${idManifesto};${requestId ? `request-id:${requestId};` : ""}ts:${ts};`;
        const { createHmac, timingSafeEqual } = await import("crypto");
        const esperado = createHmac("sha256", segredo).update(manifesto).digest("hex");
        const a = Buffer.from(esperado);
        const b = Buffer.from(v1);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          console.error("Assinatura inválida no webhook do Mercado Pago", { paymentId });
          return new Response("assinatura inválida", { status: 401 });
        }

        const { consultarCobranca } = await import("@/lib/mercadopago.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        /** Registra cada notificação autenticada; reenvios do mesmo aviso não duplicam. */
        const registrarEvento = async (resultado: string) => {
          try {
            await supabaseAdmin.from("webhook_eventos").insert({
              provedor: "mercadopago",
              tipo,
              payment_id: paymentId,
              evento_id: `mercadopago:${paymentId}:${requestId || ts}`,
              resultado,
              payload: payload as unknown as import("@/integrations/supabase/types").Json,
            });
          } catch (e) {
            console.error("Falha ao registrar evento de webhook (ignorado)", e);
          }
        };

        let situacao: Awaited<ReturnType<typeof consultarCobranca>>;
        try {
          situacao = await consultarCobranca(paymentId);
        } catch (e) {
          console.error("Falha ao confirmar pagamento no Mercado Pago", e);
          await registrarEvento("erro_consulta_api");
          // 502 faz o Mercado Pago reenviar a notificação.
          return new Response("erro ao consultar", { status: 502 });
        }

        // Localiza o pedido: primeiro pelo protocolo (external_reference),
        // depois pelo ID do pagamento já gravado.
        const buscarPedido = async () => {
          if (situacao.referenceId) {
            const { data } = await supabaseAdmin
              .from("pedidos")
              .select("id, protocolo, status")
              .eq("protocolo", situacao.referenceId)
              .maybeSingle();
            if (data) return data;
          }
          const { data } = await supabaseAdmin
            .from("pedidos")
            .select("id, protocolo, status")
            .eq("mercadopago_payment_id", paymentId)
            .maybeSingle();
          return data ?? null;
        };

        const pedido = await buscarPedido();
        if (!pedido) {
          await registrarEvento("pedido_nao_encontrado");
          return new Response("ok");
        }

        const base = {
          mercadopago_payment_id: paymentId,
          mercadopago_status: situacao.status,
          mercadopago_external_reference: situacao.referenceId ?? pedido.protocolo,
        };

        if (!situacao.pago && !situacao.cancelado) {
          await supabaseAdmin.from("pedidos").update(base).eq("id", pedido.id);
          await registrarEvento("ignorado_status_intermediario");
          return new Response("ok");
        }

        // Idempotência: pedido já pago não é reprocessado nem revertido.
        if (pedido.status === "pago") {
          await supabaseAdmin.from("pedidos").update(base).eq("id", pedido.id);
          await registrarEvento("ja_processado");
          return new Response("ok");
        }

        const patch = situacao.pago
          ? { ...base, status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() }
          : { ...base, status: "cancelado" };

        // Update condicional: se outro caminho marcou "pago" no meio tempo, nada muda.
        const { error } = await supabaseAdmin
          .from("pedidos")
          .update(patch)
          .eq("id", pedido.id)
          .neq("status", "pago");

        if (error) {
          console.error("Falha ao atualizar pedido pelo webhook", error);
          await registrarEvento("erro_ao_gravar");
          return new Response("erro ao gravar", { status: 500 });
        }

        await registrarEvento(situacao.pago ? "pedido_marcado_pago" : "pedido_marcado_cancelado");
        return new Response("ok");
      },
    },
  },
});
