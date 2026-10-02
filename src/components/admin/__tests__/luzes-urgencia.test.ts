import { describe, expect, it } from "vitest";
import { luzesAcesas } from "../luzes-urgencia";
const base = Date.parse("2026-10-01T12:00:00Z");
const h = (x: number) => base + x * 3_600_000;
describe("luzesAcesas", () => {
  it.each([[0,1],[23.9,2-1],[24,2],[47.9,2],[48,3],[72,4],[96,5],[120,6],[143.9,6],[144,7],[1000,7]])("%sh → %s", (x, n) => {
    expect(luzesAcesas("2026-10-01T12:00:00Z", h(x))).toBe(n);
  });
});
