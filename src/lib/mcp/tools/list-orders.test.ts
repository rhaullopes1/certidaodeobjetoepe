import { describe, it, expect, vi, beforeEach } from "vitest";

const calls: { eq: [string, unknown][]; range: [number, number][] } = { eq: [], range: [] };
let roles: string[] = [];
let rolesError: unknown = null;
let pedidosError: unknown = null;

function pedidosQuery() {
  const rows = [{ protocolo: "COP-1", status: "pago", created_at: "2026-10-01", uf: "SP", quantidade: 1, nome: "X", cpf: "123" }];
  const q: Record<string, unknown> = {
    select: () => q, order: () => q,
    range: (a: number, b: number) => { calls.range.push([a, b]); return q; },
    eq: (c: string, v: unknown) => { calls.eq.push([c, v]); return q; },
    then: (r: (v: unknown) => unknown) => r(pedidosError ? { data: null, error: pedidosError } : { data: rows, error: null }),
  };
  return q;
}

vi.mock("../supabase", () => ({
  supabaseForUser: () => ({
    from: (t: string) => t === "user_roles"
      ? { select: () => ({ eq: async () => (rolesError ? { data: null, error: rolesError } : { data: roles.map((role) => ({ role })), error: null }) }) }
      : pedidosQuery(),
  }),
}));

import tool from "./list-orders";

type Schema = { safeParse: (v: unknown) => { success: boolean } };
type T = { inputSchema: Record<"status" | "limite" | "offset" | "protocolo", Schema>; handler: (a: unknown, c: unknown) => Promise<{ structuredContent: { pedidos: Record<string, unknown>[] } }> };
const t = tool as unknown as T;
const ctx = { getUserId: () => "user-1" } as never;
const run = (extra: Record<string, unknown> = {}, c: unknown = ctx) => t.handler({ limite: 20, offset: 0, ...extra }, c);

describe("listar_pedidos", () => {
  beforeEach(() => { calls.eq = []; calls.range = []; roles = []; rolesError = null; pedidosError = null; });

  it("cliente sempre filtrado pelo próprio user_id", async () => {
    await run();
    expect(calls.eq).toContainEqual(["user_id", "user-1"]);
  });

  it("operador é recusado", async () => {
    roles = ["operador_certidao"];
    await expect(run()).rejects.toThrow();
  });

  it("não retorna dados pessoais", async () => {
    const r = await run();
    expect(Object.keys(r.structuredContent.pedidos[0]).sort()).toEqual(["criado_em", "protocolo", "quantidade", "status", "uf"]);
  });

  it("equipe e admin não recebem filtro por user_id", async () => {
    for (const r of ["equipe", "admin"]) {
      calls.eq = []; roles = [r];
      await run();
      expect(calls.eq.find(([c]) => c === "user_id")).toBeUndefined();
    }
  });

  it("aceita os estados reais emitido e gratuito e mantém os antigos", () => {
    for (const s of ["emitido", "gratuito", "emitida", "aguardando_pagamento", "pago", "cancelado", "expirado", "em_analise", "protocolado"]) {
      expect(t.inputSchema.status.safeParse(s).success).toBe(true);
    }
    expect(t.inputSchema.status.safeParse("inventado").success).toBe(false);
  });

  it("filtro de status chega à consulta", async () => {
    await run({ status: "gratuito" });
    expect(calls.eq).toContainEqual(["status", "gratuito"]);
  });

  it("limite aceita só 1 a 50", () => {
    expect(t.inputSchema.limite.safeParse(1).success).toBe(true);
    expect(t.inputSchema.limite.safeParse(50).success).toBe(true);
    expect(t.inputSchema.limite.safeParse(0).success).toBe(false);
    expect(t.inputSchema.limite.safeParse(51).success).toBe(false);
    expect(t.inputSchema.limite.safeParse(2.5).success).toBe(false);
  });

  it("offset aceita só 0 a 10000", () => {
    expect(t.inputSchema.offset.safeParse(0).success).toBe(true);
    expect(t.inputSchema.offset.safeParse(10000).success).toBe(true);
    expect(t.inputSchema.offset.safeParse(-1).success).toBe(false);
    expect(t.inputSchema.offset.safeParse(10001).success).toBe(false);
  });

  it("protocolo recusa vazio e acima de 80 caracteres", () => {
    expect(t.inputSchema.protocolo.safeParse("").success).toBe(false);
    expect(t.inputSchema.protocolo.safeParse("   ").success).toBe(false);
    expect(t.inputSchema.protocolo.safeParse("a".repeat(81)).success).toBe(false);
    expect(t.inputSchema.protocolo.safeParse("COP-1").success).toBe(true);
  });

  it("protocolo é consultado em maiúsculas", async () => {
    await run({ protocolo: "cop-abc" });
    expect(calls.eq).toContainEqual(["protocolo", "COP-ABC"]);
  });

  it("recusa chamada sem usuário identificado", async () => {
    await expect(run({}, { getUserId: () => undefined })).rejects.toThrow("Entre na sua conta");
  });

  it("falha ao ler papéis bloqueia a consulta", async () => {
    rolesError = { message: "detalhe interno" };
    await expect(run()).rejects.toThrow("Não foi possível verificar suas permissões.");
    expect(calls.range).toHaveLength(0);
  });

  it("erro na consulta não expõe detalhes internos", async () => {
    pedidosError = { message: "relation secreta xyz" };
    const err = await run().catch((e: Error) => e);
    expect((err as Error).message).toBe("Não foi possível consultar os pedidos. Tente novamente.");
  });

  it("paginação usa offset e limite", async () => {
    await run({ offset: 40, limite: 20 });
    expect(calls.range).toEqual([[40, 59]]);
  });
});
