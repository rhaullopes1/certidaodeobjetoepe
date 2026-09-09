import { createFileRoute } from "@tanstack/react-router";

// A Stripe avisa aqui quando um pagamento muda de status.
// 1) A assinatura do aviso é conferida antes de qualquer leitura do conteúdo.
// 2) Cada evento só produz efeito uma vez (índice único por provedor/evento).
// 3) Mesmo assim, o pagamento é confirmado consultando a API da Stripe.
export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpoBruto = await request.text();
        const { assinaturaStripeValida, temSegredoWebhookStripe, consultarCheckout } = await import(
          "@/lib/stripe.server"
        );

        if (!temSegredoWebhookStripe()) {
          console.error("STRIPE_WEBHOOK_SECRET não configurado — aviso recusado");
          return new Response("webhook não configurado", { status: 503 });
        }

        const assinatura = request.headers.get("stripe-signature");
        if (!(await assinaturaStripeValida(corpoBruto, assinatura))) {
          return new Response("assinatura inválida", { status: 400 });
        }

        let payload: {
          id?: string;
          type?: string;
          data?: { object?: { id?: string; object?: string; metadata?: Record<string, string> } };
        };
        try {
          payload = JSON.parse(corpoBruto) as typeof payload;
        } catch {
          return new Response("payload inválido", { status: 400 });
        }

        const objeto = payload?.data?.object;
        const tipo = payload?.type ?? "";
        const eventoId = payload?.id ?? null;
        const sessionId = objeto?.object === "checkout.session" ? objeto?.id : undefined;

        if (!sessionId || !tipo.startsWith("checkout.session")) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotência: o índice único por (provedor, evento_id) impede repetição.
        if (eventoId) {
          const { error: duplicado } = await supabaseAdmin.from("webhook_eventos").insert({
            provedor: "stripe",
            evento_id: eventoId,
            tipo,
            payment_id: sessionId,
            resultado: "recebido",
            payload: payload as unknown as import("@/integrations/supabase/types").Json,
          });
          if (duplicado) {
            if (duplicado.code === "23505") return new Response("ok");
            console.error("Falha ao registrar evento de webhook", duplicado);
          }
        }

        /** Atualiza o resultado do evento; nunca quebra o processamento. */
        const registrarResultado = async (resultado: string) => {
          try {
            if (eventoId) {
              await supabaseAdmin
                .from("webhook_eventos")
                .update({ resultado })
                .eq("provedor", "stripe")
                .eq("evento_id", eventoId);
            } else {
              await supabaseAdmin.from("webhook_eventos").insert({
                provedor: "stripe",
                tipo,
                payment_id: sessionId,
                resultado,
                payload: payload as unknown as import("@/integrations/supabase/types").Json,
              });
            }
          } catch (e) {
            console.error("Falha ao registrar evento de webhook", e);
          }
        };

        let situacao: Awaited<ReturnType<typeof consultarCheckout>>;
        try {
          situacao = await consultarCheckout(sessionId);
        } catch (e) {
          console.error("Falha ao confirmar pagamento na Stripe", e);
          await registrarResultado("erro_consulta_api");
          return new Response("erro ao consultar", { status: 502 });
        }

        if (!situacao.pago) {
          if (!situacao.expirado) {
            await registrarResultado("ignorado_status_intermediario");
            return new Response("ok");
          }
          // Link vencido não cancela o pedido: apenas limpamos a sessão para
          // que um novo link de pagamento seja gerado quando o cliente voltar.
          const limpar = supabaseAdmin
            .from("pedidos")
            .update({ stripe_session_id: null, checkout_url: null, pix_expira_em: null });
          await (situacao.referenceId
            ? limpar.eq("protocolo", situacao.referenceId)
            : limpar.eq("stripe_session_id", sessionId));
          await registrarResultado("link_vencido_liberado_para_novo");
          return new Response("ok");
        }

        const patch = { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() };

        const query = supabaseAdmin.from("pedidos").update(patch);
        const { error } = situacao.referenceId
          ? await query.eq("protocolo", situacao.referenceId)
          : await query.eq("stripe_session_id", sessionId);

        if (error) {
          console.error("Falha ao atualizar pedido pelo webhook", error);
          await registrarResultado("erro_ao_gravar");
          return new Response("erro ao gravar", { status: 500 });
        }

        await registrarResultado("pedido_marcado_pago");
        return new Response("ok");
      },
    },
  },
});
