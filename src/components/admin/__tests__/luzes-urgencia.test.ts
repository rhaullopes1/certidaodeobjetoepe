import { describe, expect, it } from "vitest";
import { CORES, luzesAcesas } from "../luzes-urgencia";
const base = Date.parse("2026-10-01T12:00:00Z");
const h = (x: number) => base + x * 3_600_000;
describe("luzesAcesas", () => {
  it.each([[0,1],[23.9,1],[24,2],[48,3],[72,4],[144,7],[167.9,7],[168,8],[264,12],[1000,12]])("%sh → %s", (x, n) => {
    expect(luzesAcesas("2026-10-01T12:00:00Z", h(x))).toBe(n);
  });
});
describe("cores", () => {
  it("2 verdes, 3 amarelas, 7 vermelhas", () => {
    expect(CORES.filter((c) => c === "verde")).toHaveLength(2);
    expect(CORES.filter((c) => c === "amarela")).toHaveLength(3);
    expect(CORES.filter((c) => c === "vermelha")).toHaveLength(7);
    expect(CORES).toHaveLength(12);
  });
});
