import { useEffect, useState } from "react";

export type CorLuz = "verde" | "amarela" | "vermelha";
const CORES: CorLuz[] = ["verde", "verde", "amarela", "amarela", "vermelha", "vermelha", "vermelha"];

/** Quantas das 7 luzes estão acesas (1 a 7), a partir das horas desde pago_em. */
export function luzesAcesas(pagoEm: string, agora: number): number {
  const horas = Math.max(0, (agora - new Date(pagoEm).getTime()) / 3_600_000);
  return Math.min(7, Math.floor(horas / 24) + 1);
}

const CLASSE: Record<CorLuz, { on: string; off: string }> = {
  verde: { on: "bg-live shadow-[0_0_6px_var(--live)]", off: "bg-live/20" },
  amarela: { on: "bg-alerta shadow-[0_0_6px_var(--alerta)]", off: "bg-alerta/20" },
  vermelha: { on: "bg-destructive shadow-[0_0_6px_var(--destructive)]", off: "bg-destructive/20" },
};

export function LuzesUrgencia({ pagoEm }: { pagoEm: string | null }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!pagoEm) return null;
  const n = luzesAcesas(pagoEm, agora);
  const rotulo = `${(n - 1) * 24}h+ — ${n}ª luz acesa`;
  return (
    <span role="img" aria-label={rotulo} title={rotulo} className="inline-flex items-center gap-1">
      {CORES.map((c, i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i < n ? CLASSE[c].on : CLASSE[c].off}`} />
      ))}
    </span>
  );
}
