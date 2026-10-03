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

describe("visual da operação", () => {
  const base = (status_operacao: string, validado_em: string | null = null) => ({ status_operacao, validado_em });

  it("sem atribuição ou já validada: card normal", () => {
    expect(visualOperacao(undefined)).toBeNull();
    expect(visualOperacao(null)).toBeNull();
    expect(visualOperacao(base("concluido", "2026-01-01"))).toBeNull();
    expect(visualOperacao(base("em_andamento", "2026-01-01"))).toBeNull();
  });

  it("ativa em qualquer etapa antes de concluir: EM OPERAÇÃO", () => {
    for (const status of ["atribuido", "em_andamento", "aguardando_tribunal", "documento_recebido"]) {
      expect(visualOperacao(base(status))?.estado).toBe("em_operacao");
    }
  });

  it("concluído sem validação: AGUARDANDO VALIDAÇÃO", () => {
    expect(visualOperacao(base("concluido"))?.estado).toBe("aguardando_validacao");
    expect(visualOperacao(base("concluido"))?.etiqueta).toBe("Aguardando validação");
  });

  it("devolvida: estado discreto distinto", () => {
    expect(visualOperacao(base("devolvido"))?.estado).toBe("devolvida");
  });

  it("classes de card e selo definidas para cada estado", () => {
    for (const estado of ["em_operacao", "aguardando_validacao", "devolvida"] as const) {
      expect(CLASSE_CARD_OPERACAO[estado]).toBeTruthy();
      expect(CLASSE_SELO_OPERACAO[estado]).toBeTruthy();
    }
  });
});

import { validarPdfOperador, podeConcluirComPdfs, MAX_PDFS_OPERADOR } from "./papeis";

describe("PDF obrigatório na conclusão do operador", () => {
  const pdf = { name: "certidao.pdf", type: "application/pdf" };
  it("não conclui com 0 PDFs", () => expect(podeConcluirComPdfs(0)).toBe(false));
  it("conclui com 1 PDF", () => expect(podeConcluirComPdfs(1)).toBe(true));
  it("aceita até 3 PDFs", () => {
    expect(validarPdfOperador(pdf, 0)).toBeNull();
    expect(validarPdfOperador(pdf, 2)).toBeNull();
    expect(podeConcluirComPdfs(3)).toBe(true);
    expect(MAX_PDFS_OPERADOR).toBe(3);
  });
  it("rejeita o 4º PDF", () => expect(validarPdfOperador(pdf, 3)).toMatch(/Limite/));
  it("rejeita arquivo que não é PDF", () => {
    expect(validarPdfOperador({ name: "foto.jpg", type: "image/jpeg" }, 0)).toMatch(/PDF/);
    expect(validarPdfOperador({ name: "x.pdf", type: "image/png" }, 0)).toMatch(/PDF/);
    expect(validarPdfOperador({ name: "x.exe", type: "application/pdf" }, 0)).toMatch(/PDF/);
  });
  it("validação administrativa continua exigindo apenas concluído pelo operador", () => {
    expect(prox("concluido")).toEqual([]);
    expect(prox("em_andamento").map((e) => e.valor)).toEqual(["concluido"]);
  });
});
