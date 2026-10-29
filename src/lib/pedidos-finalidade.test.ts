import { describe, expect, it } from "vitest";
import { FINALIDADES, finalidadeField } from "./pedidos.schema";

// Estes valores precisam bater com a constraint pedidos_finalidade_check do banco.
// Se o formulário aceitar uma finalidade que o banco rejeita, o pedido cai em contingência.
const FINALIDADES_ACEITAS_PELO_BANCO = [
  "caminhoneiro_motorista",
  "motorista_app",
  "transacao_imobiliaria",
  "advogado",
  "concurso_publico",
  "financiamento_bancario",
  "outro",
] as const;

describe("finalidade do pedido", () => {
  it("aceita todas as finalidades permitidas pela regra do banco", () => {
    for (const valor of FINALIDADES_ACEITAS_PELO_BANCO) {
      expect(finalidadeField.safeParse(valor).success, valor).toBe(true);
    }
  });

  it("não oferece no formulário nenhuma finalidade fora da regra do banco", () => {
    expect(Object.keys(FINALIDADES).sort()).toEqual(
      [...FINALIDADES_ACEITAS_PELO_BANCO].sort(),
    );
  });

  it("rejeita finalidade desconhecida", () => {
    expect(finalidadeField.safeParse("qualquer_coisa").success).toBe(false);
  });
});
