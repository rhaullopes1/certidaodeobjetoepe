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

import * as papeisMod from "./papeis";
import {
  proximasEtapasOperador as prox, proximaAcaoOperador, ordenarFilaOperador, nivelIdade, precisaAtencao,
  CHECKLIST_MANUAL, MOTIVOS_PENDENCIA, duracao, mediana,
} from "./papeis";
describe("fluxo do operador", () => {
  it("recebido só inicia; nunca pula para concluído", () => {
    expect(prox("atribuido").map((e) => e.valor)).toEqual(["em_andamento"]);
  });
  it("etapas intermediárias seguem a regra do banco", () => {
    expect(prox("em_andamento").map((e) => e.valor).sort()).toEqual(["aguardando_tribunal", "concluido", "documento_recebido"]);
    expect(prox("aguardando_tribunal").map((e) => e.valor).sort()).toEqual(["documento_recebido", "em_andamento"]);
    expect(prox("documento_recebido").map((e) => e.valor)).toEqual(["concluido"]);
  });
  it("concluído/devolvido: operador não age e não valida", () => {
    expect(prox("concluido")).toEqual([]);
    expect(prox("devolvido")).toEqual([]);
    expect(prox("atribuido").some((e) => (e.valor as string) === "validado")).toBe(false);
  });
});

describe("cockpit operacional sem dados financeiros", () => {
  const agora = new Date("2026-10-10T12:00:00Z");
  const dias = (d: number) => new Date(agora.getTime() - d * 86_400_000).toISOString();
  it("não exporta remuneração nem valores no módulo do operador", () => {
    const chaves = Object.keys(papeisMod).join(" ");
    expect(chaves).not.toMatch(/REMUNERA|PRECO|VALOR_|CENTAVOS/i);
  });
  it("próxima ação nunca é inválida para a etapa", () => {
    expect(proximaAcaoOperador({ status_operacao: "atribuido", atribuido_em: dias(0) })).toBe("Iniciar operação");
    expect(proximaAcaoOperador({ status_operacao: "em_andamento", atribuido_em: dias(0), pdfs: 0 })).toBe("Anexar certidão");
    expect(proximaAcaoOperador({ status_operacao: "em_andamento", atribuido_em: dias(0), pdfs: 1 })).toBe("Concluir operação");
    expect(proximaAcaoOperador({ status_operacao: "em_andamento", atribuido_em: dias(0), pendencia_motivo: "outro", pdfs: 1 })).toBe("Resolver pendência");
    expect(proximaAcaoOperador({ status_operacao: "concluido", atribuido_em: dias(0) })).toBe("Aguardando validação");
  });
  it("fila ordena pendência e idade antes, concluídas por último", () => {
    const l = ordenarFilaOperador([
      { id: "c", status_operacao: "concluido", atribuido_em: dias(9) },
      { id: "n", status_operacao: "em_andamento", atribuido_em: dias(0) },
      { id: "v", status_operacao: "em_andamento", atribuido_em: dias(5) },
      { id: "p", status_operacao: "em_andamento", atribuido_em: dias(0), pendencia_motivo: "segredo_justica" },
    ], agora);
    expect(l.map((x) => x.id)).toEqual(["p", "v", "n", "c"]);
    expect(precisaAtencao(l[0], agora)).toBe(true);
    expect(precisaAtencao(l[2], agora)).toBe(false);
  });
  it("faixas de idade e utilitários", () => {
    expect([nivelIdade(0), nivelIdade(2), nivelIdade(4)]).toEqual(["normal", "atencao", "critica"]);
    expect(duracao(dias(1), agora.toISOString())).toBe("1d 0h");
    expect(mediana([3, 1, 2])).toBe(2);
    expect(mediana([])).toBeNull();
  });
  it("checklist manual não inclui itens derivados e motivos cobrem os 7 casos", () => {
    expect(CHECKLIST_MANUAL.map((c) => c.chave)).not.toContain("pdf_anexado");
    expect(MOTIVOS_PENDENCIA).toHaveLength(7);
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
