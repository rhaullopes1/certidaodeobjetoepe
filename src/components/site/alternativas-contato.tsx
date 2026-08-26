import { PHONE_DISPLAY, PHONE_TEL, EMAIL_CONTATO } from "@/lib/site";

/**
 * Alternativas visíveis ao CTA de WhatsApp: o número é um 0800 e links wa.me
 * podem não abrir conversa — sempre oferecemos ligação e e-mail ao lado.
 */
export function AlternativasContato({
  tom = "claro",
  className = "",
}: {
  tom?: "claro" | "escuro";
  className?: string;
}) {
  const cor = tom === "escuro" ? "text-primary-foreground/70" : "text-muted-foreground";
  const link =
    tom === "escuro"
      ? "font-semibold text-primary-foreground underline decoration-primary-foreground/40 underline-offset-4 hover:decoration-primary-foreground"
      : "font-semibold text-foreground underline decoration-accent/50 underline-offset-4 hover:decoration-accent";
  return (
    <p className={`text-xs leading-relaxed ${cor} ${className}`}>
      Não abriu o WhatsApp? Ligue{" "}
      <a href={PHONE_TEL} className={link}>
        {PHONE_DISPLAY}
      </a>{" "}
      ou escreva para{" "}
      <a href={`mailto:${EMAIL_CONTATO}`} className={link}>
        {EMAIL_CONTATO}
      </a>
      .
    </p>
  );
}
