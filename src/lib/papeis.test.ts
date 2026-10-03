import { describe, expect, it } from "vitest";
import {
  atribuicaoAtiva,
  CLASSE_CARD_OPERACAO,
  CLASSE_SELO_OPERACAO,
  destinoPosLogin,
  ehAdministrativo,
  ehOperador,
  podeEnviarParaOperacao,
  visualOperacao,
} from "./papeis";

describe("papéis", () => {
  it("operador não passa como equipe", () => {
    expect(ehAdministrativo(["operador_certidao"])).toBe(false);
    expect(ehOperador(["operador_certidao"])).toBe(true);
    expect(ehAdministrativo(["admin"])).toBe(true);
    expect(ehAdministrativo(["equipe"])).toBe(true);
  });
  it("destino após login", () => {
    expect(destinoPosLogin(["operador_certidao"])).toBe("/operacao");
    expect(destinoPosLogin(["admin"])).toBe("/minha-conta");
    expect(destinoPosLogin([])).toBe("/minha-conta");
  });
  it("não duplica atribuição ativa e só envia pedido pago não encerrado", () => {
    const ativa = { status_operacao: "em_andamento", validado_em: null };
    expect(atribuicaoAtiva(ativa)).toBe(true);
    expect(atribuicaoAtiva({ status_operacao: "devolvido", validado_em: null })).toBe(false);
    expect(atribuicaoAtiva({ status_operacao: "concluido", validado_em: "2026-01-01" })).toBe(false);
    expect(podeEnviarParaOperacao("pago", [])).toBe(true);
    expect(podeEnviarParaOperacao("pago", [ativa])).toBe(false);
    expect(podeEnviarParaOperacao("aguardando_pagamento", [])).toBe(false);
    expect(podeEnviarParaOperacao("emitida", [])).toBe(false);
    expect(podeEnviarParaOperacao("pago", [{ status_operacao: "devolvido", validado_em: null }])).toBe(true);
  });
});

import { proximasEtapasOperador as prox, REMUNERACAO_OPERADOR_CENTAVOS } from "./papeis";
describe("fluxo do operador", () => {
  it("só avança e nunca valida", () => {
    expect(prox("atribuido").map((e) => e.valor)).toEqual(["em_andamento"]);
    expect(prox("em_andamento").map((e) => e.valor)).toEqual(["concluido"]);
    expect(prox("concluido")).toEqual([]);
    expect(REMUNERACAO_OPERADOR_CENTAVOS).toBe(8000);
  });
});
