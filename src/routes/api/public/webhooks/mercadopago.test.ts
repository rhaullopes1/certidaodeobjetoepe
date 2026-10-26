import { createHmac } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Estado simulado do banco e do Mercado Pago (nada real é acessado).
const estado = vi.hoisted(() => ({
  pedido: null as null | { id: string; protocolo: string; status: string },
  updates: [] as Array<{ patch: Record<string, unknown>; filtros: string[] }>,
  eventos: [] as Array<Record<string, unknown>>,
  consulta: vi.fn(),
  emissao: vi.fn(),
}));

vi.mock("@/lib/mercadopago.server", () => ({ consultarCobranca: estado.consulta }));
vi.mock("@/lib/antecedentes.server", () => ({ processarEmissaoAntecedentes: estado.emissao }));
vi.mock("@/integrations/supabase/client.server", () => {
  const from = (tabela: string) => {
    if (tabela === "webhook_eventos") {
      return { insert: async (row: Record<string, unknown>) => (estado.eventos.push(row), { error: null }) };
    }
    return {
      select: () => {
        const q = { eq: () => q, maybeSingle: async () => ({ data: estado.pedido }) };
        return q;
      },
      update: (patch: Record<string, unknown>) => {
        const reg = { patch, filtros: [] as string[] };
        estado.updates.push(reg);
        const q = {
          eq: (c: string, v: string) => (reg.filtros.push(`eq:${c}=${v}`), q),
          neq: (c: string, v: string) => (reg.filtros.push(`neq:${c}=${v}`), q),
          then: (r: (v: { error: null }) => unknown) => r({ error: null }),
        };
        return q;
      },
    };
  };
  return { supabaseAdmin: { from } };
});

const SEGREDO = "segredo-de-teste";
const { Route } = await import("./mercadopago");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const POST = (Route.options as any).server.handlers.POST as (a: { request: Request }) => Promise<Response>;

function requisicao(paymentId: string, assinaturaValida = true) {
  const ts = "1700000000";
  const reqId = "req-1";
  const v1 = assinaturaValida
    ? createHmac("sha256", SEGREDO).update(`id:${paymentId};request-id:${reqId};ts:${ts};`).digest("hex")
    : "0".repeat(64);
  return new Request(`https://x.test/api/public/webhooks/mercadopago?data.id=${paymentId}&type=payment`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": reqId },
    body: JSON.stringify({ type: "payment", data: { id: paymentId } }),
  });
}

const resultados = () => estado.eventos.map((e) => e.resultado);

beforeEach(() => {
  process.env["MERCADOPAGO_WEBHOOK_SECRET"] = SEGREDO;
  estado.pedido = { id: "p1", protocolo: "COP-TESTE", status: "aguardando_pagamento" };
  estado.updates = [];
  estado.eventos = [];
  estado.consulta.mockReset();
  estado.emissao.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("webhook Mercado Pago", () => {
  it("sem segredo configurado recusa com 503 e não consulta a API", async () => {
    delete process.env["MERCADOPAGO_WEBHOOK_SECRET"];
    const res = await POST({ request: requisicao("123") });
    expect(res.status).toBe(503);
    expect(estado.consulta).not.toHaveBeenCalled();
  });

  it("sem cabeçalho de assinatura responde 401", async () => {
    const req = new Request("https://x.test/api/public/webhooks/mercadopago?data.id=123", {
      method: "POST",
      body: JSON.stringify({ type: "payment", data: { id: "123" } }),
    });
    const res = await POST({ request: req });
    expect(res.status).toBe(401);
    expect(estado.consulta).not.toHaveBeenCalled();
  });

  it("assinatura válida + pagamento aprovado marca o pedido como pago", async () => {
    estado.consulta.mockResolvedValue({ status: "approved", pago: true, referenceId: "COP-TESTE", pagoEm: "2026-10-26T00:00:00Z" });
    const res = await POST({ request: requisicao("123") });
    expect(res.status).toBe(200);
    const pago = estado.updates.find((u) => u.patch.status === "pago");
    expect(pago?.patch.pago_em).toBe("2026-10-26T00:00:00Z");
    expect(pago?.filtros).toContain("neq:status=pago");
    expect(resultados()).toContain("pedido_marcado_pago");
    expect(estado.emissao).toHaveBeenCalledWith("p1");
  });

  it("assinatura inválida: comportamento atual segue, mas o status vem só da API", async () => {
    estado.consulta.mockResolvedValue({ status: "pending", pago: false, referenceId: "COP-TESTE" });
    const res = await POST({ request: requisicao("123", false) });
    expect(res.status).toBe(200);
    expect(estado.consulta).toHaveBeenCalledWith("123");
    expect(estado.updates.some((u) => u.patch.status === "pago")).toBe(false);
    expect(console.error).toHaveBeenCalledWith("Assinatura inválida no webhook do Mercado Pago", expect.anything());
  });

  it("falha na consulta à API responde 502 e não altera o pedido", async () => {
    estado.consulta.mockRejectedValue(new Error("Mercado Pago respondeu 500"));
    const res = await POST({ request: requisicao("123") });
    expect(res.status).toBe(502);
    expect(estado.updates).toHaveLength(0);
    expect(resultados()).toEqual(["erro_consulta_api"]);
  });

  it("pedido já pago não é reprocessado (idempotência)", async () => {
    estado.pedido = { id: "p1", protocolo: "COP-TESTE", status: "pago" };
    estado.consulta.mockResolvedValue({ status: "approved", pago: true, referenceId: "COP-TESTE" });
    const res = await POST({ request: requisicao("123") });
    expect(res.status).toBe(200);
    expect(estado.updates.some((u) => "status" in u.patch)).toBe(false);
    expect(resultados()).toEqual(["ja_processado"]);
    expect(estado.emissao).not.toHaveBeenCalled();
  });

  it("estorno de pedido não pago cancela o pedido", async () => {
    estado.consulta.mockResolvedValue({ status: "refunded", pago: false, referenceId: "COP-TESTE" });
    await POST({ request: requisicao("123") });
    expect(estado.updates.find((u) => u.patch.status === "cancelado")).toBeTruthy();
    expect(resultados()).toContain("pedido_marcado_cancelado");
    expect(estado.emissao).not.toHaveBeenCalled();
  });

  it("estorno após pagamento não reverte pedido pago", async () => {
    estado.pedido = { id: "p1", protocolo: "COP-TESTE", status: "pago" };
    estado.consulta.mockResolvedValue({ status: "refunded", pago: false, referenceId: "COP-TESTE" });
    await POST({ request: requisicao("123") });
    expect(estado.updates.some((u) => u.patch.status === "cancelado")).toBe(false);
    expect(resultados()).toEqual(["ja_processado"]);
  });

  it("Pix vencido não cancela o pedido", async () => {
    estado.consulta.mockResolvedValue({ status: "cancelled", pago: false, referenceId: "COP-TESTE" });
    await POST({ request: requisicao("123") });
    expect(estado.updates.some((u) => "status" in u.patch)).toBe(false);
    expect(resultados()).toEqual(["ignorado_status_intermediario"]);
  });
});
