import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ShieldCheck, Scale } from "lucide-react";
import {
  PRAZO_EMISSAO,
  EMAIL_CONTATO,
  PHONE_DISPLAY,
  PHONE_TEL,
  whatsappLink,
} from "@/lib/site";

export const Route = createFileRoute("/garantia")({
  component: Garantia,
  head: () => ({
    meta: [
      { title: "Garantia de 5 dias úteis | Certidão de Objeto e Pé" },
      {
        name: "description",
        content:
          "Sua Certidão de Objeto e Pé em até 5 dias úteis após a confirmação do pagamento, ou devolvemos 100% do valor. Veja como a garantia funciona.",
      },
      { property: "og:title", content: "Garantia de 5 dias úteis ou dinheiro de volta" },
      {
        property: "og:description",
        content:
          "Entregamos sua certidão em até 5 dias úteis ou devolvemos todo o valor pago. Entenda as regras e exceções.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://certidaodeobjetoepe.org/garantia" },
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/garantia" }],
  }),
});

const PONTOS = [
  {
    titulo: "O prazo começa quando o pagamento é confirmado",
    texto:
      "Assim que o Pix ou o cartão é aprovado, começam a contar os dias úteis. Você recebe um aviso por e-mail com o número de acompanhamento do seu pedido.",
  },
  {
    titulo: "Você acompanha cada passo",
    texto:
      "Na página de acompanhamento dá para ver, a qualquer momento, se o pedido já foi enviado ao tribunal e quando a certidão foi emitida.",
  },
  {
    titulo: "Passou do prazo? Devolvemos tudo",
    texto:
      `Se a certidão não estiver na sua mão em até ${GARANTIA_DIAS_UTEIS} dias úteis, basta pedir: devolvemos 100% do valor pago, pelo mesmo meio de pagamento, sem burocracia.`,
  },
];

const EXCECOES = [
  "Processos que correm em segredo de justiça, em que o tribunal só entrega a certidão às partes ou ao advogado constituído.",
  "Dados informados com erro (número do processo, nome ou CPF que não correspondem ao processo).",
  "Períodos de indisponibilidade do sistema do tribunal, greve ou suspensão de prazos — nesses casos o relógio fica pausado e avisamos você.",
];

function Garantia() {
  return (
    <div className="min-h-dvh bg-secondary/40">
      <header className="surface-navy">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-foreground/15">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-sm font-bold">Certidão Objeto e Pé</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          <ShieldCheck className="h-3.5 w-3.5" />
          Garantia de prazo
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">{GARANTIA_TITULO}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          A gente sabe que quem pede uma certidão normalmente está com pressa: um financiamento,
          uma contratação, uma seguradora esperando. Por isso assumimos um compromisso simples e
          por escrito.
        </p>

        <div className="mt-10 space-y-4">
          {PONTOS.map((p) => (
            <div key={p.titulo} className="card-premium p-6">
              <p className="flex items-start gap-3 font-display text-lg font-bold">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                {p.titulo}
              </p>
              <p className="mt-2 pl-8 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-xl font-bold">Quando o prazo pode não valer</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            São situações que dependem do tribunal e fogem do nosso controle. Em todas elas
            avisamos você antes e, se preferir cancelar, devolvemos o valor.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {EXCECOES.map((e) => (
              <li key={e} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl bg-secondary p-6">
          <h2 className="font-display text-xl font-bold">Como pedir a devolução</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Fale com a gente pelo WhatsApp, pelo telefone {PHONE_DISPLAY} ou pelo e-mail{" "}
            {EMAIL_CONTATO}, informando o seu número de acompanhamento. A devolução é feita em até
            5 dias úteis pelo mesmo meio de pagamento.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={whatsappLink("Olá! Quero falar sobre a garantia de prazo do meu pedido.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Falar no WhatsApp
            </a>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center justify-center rounded-full border border-input bg-card px-5 py-3 text-sm font-bold transition-colors hover:bg-secondary"
            >
              Ligar {PHONE_DISPLAY}
            </a>
            <Link
              to="/solicitar"
              className="inline-flex items-center justify-center rounded-full border border-input bg-card px-5 py-3 text-sm font-bold transition-colors hover:bg-secondary"
            >
              Solicitar certidão
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
