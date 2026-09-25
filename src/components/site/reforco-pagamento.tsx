import { ShieldCheck, Landmark, Lock, Clock3 } from "lucide-react";

/**
 * Passo a passo curto para pagar o Pix pelo app do banco.
 * Reduz a hesitação de quem nunca usou "Pix copia e cola".
 */
export function PassosPix({
  confirmacaoAutomatica = true,
  className = "",
}: {
  confirmacaoAutomatica?: boolean;
  className?: string;
}) {
  const passos = [
    "Toque em “Copiar código Pix” logo abaixo.",
    "Abra o app do seu banco e escolha Pix › Pix Copia e Cola.",
    "Cole o código e confirme o pagamento.",
    confirmacaoAutomatica
      ? "Pronto: esta página muda sozinha para “Pagamento confirmado” em poucos segundos."
      : "Envie o comprovante pelo WhatsApp para a equipe confirmar seu pedido.",
  ];

  return (
    <ol className={`space-y-2.5 rounded-2xl bg-card/70 p-4 ${className}`}>
      {passos.map((texto, i) => (
        <li key={i} className="flex gap-3 text-sm leading-snug">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {i + 1}
          </span>
          <span className="text-muted-foreground">{texto}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Selos de confiança exibidos junto às opções de pagamento.
 */
export function SelosPagamento({ className = "" }: { className?: string }) {
  const itens = [
    {
      Icone: Landmark,
      titulo: "Documento oficial do tribunal",
      texto:
        "A certidão é emitida pelo próprio tribunal responsável pelo processo (estadual, federal, trabalhista ou eleitoral).",
    },
    {
      Icone: Clock3,
      titulo: "Triagem começa após a confirmação",
      texto:
        "Assim que o pagamento é confirmado, sua solicitação entra na fila de protocolo junto ao tribunal.",
    },
    {
      Icone: Lock,
      titulo: "Ambiente seguro",
      texto:
        "Conexão criptografada e seus dados usados apenas para emitir a certidão solicitada.",
    },
    {
      Icone: ShieldCheck,
      titulo: "Acompanhamento pelo protocolo",
      texto:
        "Você acompanha cada etapa pelo número do protocolo e recebe avisos por e-mail e WhatsApp.",
    },
  ];

  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {itens.map(({ Icone, titulo, texto }) => (
        <div key={titulo} className="rounded-2xl bg-secondary px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Icone className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
            {titulo}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{texto}</p>
        </div>
      ))}
    </div>
  );
}
