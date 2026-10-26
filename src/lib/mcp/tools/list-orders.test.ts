import { describe, it, expect, vi, beforeEach } from "vitest";

const calls: { eq: [string, unknown][] } = { eq: [] };
let roles: string[] = [];

function pedidosQuery() {
  const rows = [{ protocolo: "COP-1", status: "pago", created_at: "2026-10-01", uf: "SP", quantidade: 1, nome: "X", cpf: "123" }];
  const q: Record<string, unknown> = {
    select: () => q, order: () => q, range: () => q,
    eq: (c: string, v: unknown) => { calls.eq.push([c, v]); return q; },
    then: (r: (v: unknown) => unknown) => r({ data: rows, error: null }),
  };
  return q;
}

vi.mock("../supabase", () => ({
  supabaseForUser: () => ({
    from: (t: string) => t === "user_roles"
      ? { select: () => ({ eq: async () => ({ data: roles.map((role) => ({ role })), error: null }) }) }
      : pedidosQuery(),
  }),
}));

import tool from "./list-orders";

const ctx = { getUserId: () => "user-1" } as never;
const run = () => (tool as unknown as { handler: (a: unknown, c: unknown) => Promise<{ structuredContent: { pedidos: Record<string, unknown>[] } }> })
  .handler({ limite: 20, offset: 0 }, ctx);

describe("listar_pedidos", () => {
  beforeEach(() => { calls.eq = []; });

  it("cliente sempre filtrado pelo próprio user_id", async () => {
    roles = [];
    await run();
    expect(calls.eq).toContainEqual(["user_id", "user-1"]);
  });

  it("operador é recusado", async () => {
    roles = ["operador_certidao"];
    await expect(run()).rejects.toThrow();
  });

  it("não retorna dados pessoais", async () => {
    roles = [];
    const r = await run();
    expect(Object.keys(r.structuredContent.pedidos[0]).sort()).toEqual(["criado_em", "protocolo", "quantidade", "status", "uf"]);
  });
});
