import { useEffect, useState } from "react";

export type CorLuz = "verde" | "amarela" | "vermelha";
/** 12 luzes (uma por dia desde o pagamento): 1–3 verdes, 4–7 amarelas, 8–12 vermelhas. */
export const CORES: CorLuz[] = [
  "verde", "verde", "verde",
  "amarela", "amarela", "amarela", "amarela",
  "vermelha", "vermelha", "vermelha", "vermelha", "vermelha",
];
export const TOTAL_LUZES = CORES.length;

/** Quantas luzes estão acesas (1 a 12), a partir das horas desde pago_em. */
export function luzesAcesas(pagoEm: string, agora: number): number {
  const horas = Math.max(0, (agora - new Date(pagoEm).getTime()) / 3_600_000);
  return Math.min(TOTAL_LUZES, Math.floor(horas / 24) + 1);
}

const CLASSE: Record<CorLuz, { on: string; off: string }> = {
  verde: { on: "bg-live shadow-[0_0_8px_var(--live)] ring-1 ring-live", off: "bg-live/15" },
  amarela: { on: "bg-alerta shadow-[0_0_8px_var(--alerta)] ring-1 ring-alerta", off: "bg-alerta/15" },
  vermelha: { on: "bg-destructive shadow-[0_0_8px_var(--destructive)] ring-1 ring-destructive", off: "bg-destructive/15" },
};

export function LuzesUrgencia({
  pagoEm,
  className,
}: {
  pagoEm: string | null;
  /** Classe extra (ex.: pílula com fundo local) para garantir contraste em cards coloridos. */
  className?: string;
}) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!pagoEm) return null;
  const n = luzesAcesas(pagoEm, agora);
  const rotulo = `${(n - 1) * 24}h+ — ${n}ª de ${TOTAL_LUZES} luzes acesa`;
  return (
    <span
      role="img"
      aria-label={rotulo}
      title={rotulo}
      className={`inline-flex shrink-0 items-center gap-1${className ? ` ${className}` : ""}`}
    >
      {CORES.map((c, i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < n ? CLASSE[c].on : CLASSE[c].off}`} />
      ))}
    </span>
  );
}
