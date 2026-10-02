import { describe, expect, it } from "vitest";
import { ehPdf, extrairDadosNarratoria, sha256Hex } from "./cpn-documento";

describe("documento oficial CPN", () => {
  it("aceita só arquivos com assinatura PDF", () => {
    expect(ehPdf(new TextEncoder().encode("%PDF-1.4 ..."))).toBe(true);
    expect(ehPdf(new TextEncoder().encode("<html>"))).toBe(false);
    expect(ehPdf(new Uint8Array())).toBe(false);
  });
  it("sem texto → nada extraído (sem preenchimento artificial)", () => {
    expect(extrairDadosNarratoria("", "1")).toEqual({ textoExtraido: false, processos: [], processoConfere: null, numeroCertidao: null, codigoSeguranca: null, mencionaNarratoria: false });
  });
  it("texto sem os campos → campos nulos", () => {
    const d = extrairDadosNarratoria("Documento qualquer sem dados", "1502191-61.2023.8.26.0543");
    expect(d.textoExtraido).toBe(true);
    expect(d.processos).toEqual([]);
    expect(d.processoConfere).toBeNull();
    expect(d.numeroCertidao).toBeNull();
    expect(d.codigoSeguranca).toBeNull();
  });
  it("detecta processo divergente", () => {
    const d = extrairDadosNarratoria("Processo 0000001-00.2025.8.26.0100", "1502191-61.2023.8.26.0543");
    expect(d.processoConfere).toBe(false);
  });
  it("hash SHA-256 determinístico", async () => {
    expect(await sha256Hex(new TextEncoder().encode("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
