import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Linha compacta de status do Pix. Reflete apenas o status real devolvido
 * pelo servidor (confirmado pelo webhook do Mercado Pago) — nunca simula.
 */
export function PixLive({
  estado,
  className,
}: {
  estado: "aguardando" | "confirmado" | "erro";
  className?: string;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-6 flex-wrap items-center justify-center gap-x-1.5 text-center text-[13px] leading-tight",
        className,
      )}
    >
      {estado === "erro" ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="font-bold text-destructive">Não foi possível confirmar agora</span>
        </>
      ) : estado === "confirmado" ? (
        <>
          <Check className="h-3.5 w-3.5 shrink-0 text-live" />
          <span className="font-bold uppercase tracking-wide text-live">Pagamento confirmado</span>
        </>
      ) : (
        <>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-60 motion-safe:animate-ping [animation-duration:1.8s]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
          </span>
          <span className="font-bold tracking-wide text-live">LIVE</span>
          <span className="text-muted-foreground">Aguardando confirmação do Pix</span>
        </>
      )}
    </p>
  );
}
