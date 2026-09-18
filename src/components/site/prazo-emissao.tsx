import { Clock } from "lucide-react";
import { PRAZO_EMISSAO } from "@/lib/site";

export function PrazoEmissao({
  className = "",
  variante = "claro",
}: {
  className?: string;
  variante?: "claro" | "escuro";
}) {
  const escuro = variante === "escuro";
  return (
    <p
      className={`flex items-start gap-2 rounded-xl p-4 text-sm ${
        escuro
          ? "border border-primary-foreground/15 text-primary-foreground/80"
          : "bg-secondary/60 text-muted-foreground"
      } ${className}`}
    >
      <Clock
        className={`mt-0.5 h-4 w-4 shrink-0 ${escuro ? "text-accent" : "text-accent"}`}
        aria-hidden
      />
      <span>{PRAZO_EMISSAO}</span>
    </p>
  );
}
