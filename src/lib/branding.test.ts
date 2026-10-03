import { describe, expect, it } from "vitest";
import {
  BRANDING_COMERCIAL,
  BRANDING_OPERACIONAL,
  normalizarHost,
  resolverBranding,
  rotaPermitidaNoPortal,
} from "./branding";

const CFG = "portal.exemplo.test, ops.exemplo.test";

describe("branding por host", () => {
  it("host comercial mantém branding atual", () => {
    expect(resolverBranding("www.certidaodeobjetoepe.org", CFG)).toBe(BRANDING_COMERCIAL);
    expect(resolverBranding("certidaodeobjetoepe.org", CFG).sufixoTitulo).toContain("Certidão de Objeto e Pé");
  });

  it("sem host operacional configurado, tudo é comercial", () => {
    expect(resolverBranding("portal.exemplo.test", "")).toBe(BRANDING_COMERCIAL);
    expect(resolverBranding("portal.exemplo.test", undefined)).toBe(BRANDING_COMERCIAL);
  });

  it("host operacional usa branding neutro (com porta, maiúsculas e lista)", () => {
    expect(resolverBranding("Portal.Exemplo.Test:443", CFG)).toBe(BRANDING_OPERACIONAL);
    expect(resolverBranding("ops.exemplo.test", CFG)).toBe(BRANDING_OPERACIONAL);
    expect(normalizarHost("https://Portal.Exemplo.Test/x")).toBe("portal.exemplo.test");
  });

  it("modo operacional não carrega marca, scripts nem links comerciais", () => {
    const b = resolverBranding("portal.exemplo.test", CFG);
    expect(JSON.stringify(b)).not.toMatch(/Certid[aã]o de Objeto|R\$|checkout|mercado/i);
    expect(b.scriptsComerciais).toBe(false);
    expect(b.linksComerciais).toBe(false);
  });

  it("Admin no host comercial preserva marca e scripts", () => {
    const b = resolverBranding("certidaodeobjetoepe.org", CFG);
    expect(b.scriptsComerciais).toBe(true);
    expect(b.linksComerciais).toBe(true);
  });

  it("portal operacional só permite /auth e /operacao*", () => {
    expect(rotaPermitidaNoPortal("/operacao")).toBe(true);
    expect(rotaPermitidaNoPortal("/operacao/historico")).toBe(true);
    expect(rotaPermitidaNoPortal("/auth")).toBe(true);
    for (const p of ["/", "/solicitar", "/admin", "/minha-conta", "/operacaox", "/pedido/X"]) {
      expect(rotaPermitidaNoPortal(p)).toBe(false);
    }
  });
});
