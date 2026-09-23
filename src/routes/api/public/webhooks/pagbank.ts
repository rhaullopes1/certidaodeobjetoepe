import { createFileRoute } from "@tanstack/react-router";

// PagBank avisa aqui sempre que uma cobrança muda de status.
// A confirmação nunca confia no corpo recebido: consultamos o pedido na API do PagBank.
export const Route = createFileRoute("/api/public/webhooks/pagbank")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { id?: string; reference_id?: string };
        try {
          payload = (await request.json()) as { id?: string; reference_id?: string };
        } catch {
          return new Response("payload inválido", { status: 400 });
        }

        const orderId = payload?.id;
        if (!orderId) return new Response("sem id", { status: 400 });

        const { consultarCobranca } = await import("@/lib/pagbank.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let situacao: Awaited<ReturnType<typeof consultarCobranca>>;
        try {
          situacao = await consultarCobranca(orderId);
        } catch (e) {
          console.error("Falha ao confirmar cobrança no PagBank", e);
          return new Response("erro ao consultar", { status: 502 });
        }

        if (!situacao.pago && !situacao.cancelado) {
          return new Response("ok");
        }

        const patch = situacao.pago
          ? { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() }
          : { status: "cancelado" };

        // Só usamos a referência confirmada pela API do PagBank. O reference_id
        // enviado no corpo do webhook não é confiável: qualquer um poderia
        // apontar um pagamento real para o protocolo de outro cliente.
        const referencia = situacao.referenceId ?? null;
        const query = supabaseAdmin.from("pedidos").update(patch);
        const { error } = referencia
          ? await query.eq("protocolo", referencia)
          : await query.eq("pagbank_order_id", orderId);

        if (error) {
          console.error("Falha ao atualizar pedido pelo webhook", error);
          return new Response("erro ao gravar", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});