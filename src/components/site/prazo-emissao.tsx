import { Clock } from "lucide-react";
import { PRAZO_EMISSAO } from "@/lib/site";

export function PrazoEmissao({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground ${className}`}
    >
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span>{PRAZO_EMISSAO}</span>
    </p>
  );
}
