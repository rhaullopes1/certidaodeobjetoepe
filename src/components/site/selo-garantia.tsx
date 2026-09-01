import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { GARANTIA_DIAS_UTEIS, GARANTIA_TITULO } from "@/lib/site";

/**
 * Selo de garantia de prazo, reutilizado na home, no formulário,
 * no resumo do pedido e no acompanhamento.
 */
export function SeloGarantia({
  variante = "claro",
  comLink = true,
  className = "",
}: {
  variante?: "claro" | "escuro";
  comLink?: boolean;
  className?: string;
}) {
  const cor =
    variante === "escuro"
      ? "border-gold/40 bg-white/5 text-primary-foreground"
      : "border-accent/30 bg-accent/5 text-foreground";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${cor} ${className}`}
    >
      <ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden />
      <p className="min-w-0 font-semibold">
        {GARANTIA_TITULO}
        {comLink && (
          <>
            {" "}
            <Link
              to="/garantia"
              className="font-medium underline underline-offset-4 opacity-80 hover:opacity-100"
            >
              como funciona
            </Link>
          </>
        )}
      </p>
      <span className="sr-only">Prazo de {GARANTIA_DIAS_UTEIS} dias úteis</span>
    </div>
  );
}
