import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Indicador de monitoramento do Pix. Reflete apenas o status real devolvido
 * pelo servidor (confirmado pelo webhook do Mercado Pago) — nunca simula.
 */
export function PixLive({
  estado,
  className,
}: {
  estado: "aguardando" | "confirmado" | "erro";
  className?: string;
}) {
  if (estado === "erro") {
    return (
      <div
        role="status"
        className={cn("rounded-xl border border-destructive/40 bg-destructive/5 p-3", className)}
      >
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" /> Atenção
        </p>
        <p className="mt-1 text-sm font-semibold">Não foi possível confirmar o pagamento</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Estamos verificando a situação do pagamento. Não realize um novo pagamento antes de
          consultar o suporte.
        </p>
      </div>
    );
  }

  const confirmado = estado === "confirmado";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl border p-3 transition-colors duration-500",
        confirmado ? "border-live/50 bg-live/10" : "border-live/30 bg-live/5",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-live">
        {confirmado ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-60 motion-safe:animate-ping [animation-duration:1.8s]" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
          </span>
        )}
        {confirmado ? "Pagamento confirmado" : "Live • Pagamento monitorado"}
      </p>
      <p className="mt-1 text-sm font-semibold">
        {confirmado ? "Pagamento confirmado" : "Aguardando confirmação do Pix"}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {confirmado
          ? "Pagamento recebido. Iniciando sua solicitação automaticamente."
          : "Estamos verificando seu pagamento automaticamente em tempo real. Assim que confirmado, sua solicitação será iniciada imediatamente."}
      </p>
      {!confirmado && (
        <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
          Você não precisa atualizar esta página.
        </p>
      )}
    </div>
  );
}
