import { Link } from "@tanstack/react-router";
import {
  Scale,
  MessageCircle,
  Phone,
  Landmark,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL, TABELA_PRECOS, formatarBRL } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { UserMenu } from "@/components/user-menu";
import { faqTrf, type TrfSeo } from "@/lib/trf-seo";
import { estadoPorSlug } from "@/lib/estados-seo";

const SITE = "https://certidaodeobjetoepe.org";

/** Metadados e structured data da landing page de um TRF. */
export function trfHead(t: TrfSeo) {
  const url = `${SITE}${t.path}`;
  const title = `Certidão de Objeto e Pé ${t.sigla} | Justiça Federal Online`;
  const description = `Certidão de Objeto e Pé no ${t.sigla} (${t.nome}): solicite online processos da Justiça Federal em ${t.estados.join(", ")}. Prazo de ${t.prazo}, sem advogado e sem ir à subseção.`;
  const faq = faqTrf(t);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "pt-BR", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Certidão de Objeto e Pé no ${t.sigla}`,
          serviceType: "Solicitação de certidão judicial na Justiça Federal",
          areaServed: t.estados.map((nome) => ({ "@type": "State", name: nome })),
          provider: { "@type": "Organization", name: "Certidão Objeto e Pé", url: SITE },
          url,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          inLanguage: "pt-BR",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE },
            { "@type": "ListItem", position: 2, name: "Tribunais", item: `${SITE}/tribunais` },
            { "@type": "ListItem", position: 3, name: t.sigla, item: url },
          ],
        }),
      },
    ],
  };
}

export function TrfLanding({ trf: t }: { trf: TrfSeo }) {
  const wpp = whatsappLink(
    `Olá! Preciso de uma Certidão de Objeto e Pé de um processo da Justiça Federal no ${t.sigla}.`,
  );
  const faq = faqTrf(t);
  const estadosLinks = t.ufsSlugs.map((slug) => estadoPorSlug(slug)).filter((e) => !!e);

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl surface-navy">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="truncate font-display text-base font-bold">Certidão Objeto e Pé</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main>
        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-6xl">
            <nav aria-label="Trilha" className="text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">Início</Link>
              <span className="px-2">/</span>
              <Link to="/tribunais" className="hover:underline">Tribunais</Link>
              <span className="px-2">/</span>
              <span className="font-semibold text-foreground">{t.sigla}</span>
            </nav>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Landmark className="h-4 w-4 text-gold" />
              Justiça Federal · {t.regiao}
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              Certidão de Objeto e Pé {t.sigla}: processos da Justiça Federal online
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{t.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <FileText className="h-5 w-5" />
                Solicitar certidão do {t.sigla}
              </Link>
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold hover:bg-secondary"
              >
                <Phone className="h-4 w-4 text-gold" />
                {PHONE_DISPLAY}
              </a>
            </div>
            <AlternativasContato className="mt-4" />
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-3">
            <InfoCard icon={<Landmark className="h-5 w-5 text-gold" />} titulo="Tribunal e sistema">
              {t.nome}, com sede em {t.sede}. Requerimentos pelo sistema {t.sistema}.
            </InfoCard>
            <InfoCard icon={<Clock className="h-5 w-5 text-gold" />} titulo="Prazo médio">
              {t.prazo} após a confirmação do pagamento; processos arquivados podem exigir
              desarquivamento.
            </InfoCard>
            <InfoCard icon={<CheckCircle2 className="h-5 w-5 text-gold" />} titulo="Valor">
              A partir de {formatarBRL(TABELA_PRECOS[1]!)} por certidão, com desconto progressivo até
              5 certidões.
            </InfoCard>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Como funciona o pedido no {t.sigla}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.contexto}</p>
              <ol className="mt-8 space-y-5">
                {[
                  "Envie o número do processo (padrão CNJ), o nome completo e o CPF ou CNPJ da parte.",
                  `Confirmamos a subseção judiciária e a vara no sistema ${t.sistema} e geramos seu protocolo.`,
                  "Você paga por Pix com confirmação automática e acompanha o andamento pelo site.",
                  "A certidão expedida pela Justiça Federal é enviada em PDF por e-mail.",
                ].map((passo, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full surface-navy text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{passo}</p>
                  </li>
                ))}
              </ol>

              <h2 className="mt-12 text-2xl font-bold sm:text-3xl">
                Processos mais comuns no {t.sigla}
              </h2>
              <ul className="mt-5 space-y-3">
                {t.assuntos.map((assunto) => (
                  <li key={assunto} className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {assunto}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">Jurisdição do {t.sigla}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendemos processos federais nos seguintes estados:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.estados.map((estado) => (
                  <li
                    key={estado}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {estado}
                  </li>
                ))}
              </ul>
              <Link
                to="/solicitar"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                Iniciar solicitação
              </Link>
            </aside>
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Perguntas frequentes sobre a Certidão de Objeto e Pé no {t.sigla}
            </h2>
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {faq.map((item) => (
                <details key={item.q} className="group px-6 py-5">
                  <summary className="cursor-pointer list-none text-base font-semibold">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xl font-bold">Conteúdo relacionado</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              <li>
                <Link
                  to="/tribunais/$sigla"
                  params={{ sigla: t.slugTribunal }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Página do {t.sigla}
                </Link>
              </li>
              {estadosLinks.map((e) => (
                <li key={e.slug}>
                  <Link
                    to="/certidao-de-objeto-e-pe/$uf"
                    params={{ uf: e.slug }}
                    className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Certidão em {e.nome} ({e.uf})
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/blog/$slug"
                  params={{ slug: "certidao-de-objeto-e-pe-justica-federal" }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Guia: certidão na Justiça Federal
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/$slug"
                  params={{ slug: "certidao-de-objeto-e-pe-pje" }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Como emitir no PJe
                </Link>
              </li>
              <li>
                <Link
                  to="/tribunais"
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Todos os tribunais atendidos
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="surface-navy px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Certidão Objeto e Pé — atendimento em todo o Brasil.</p>
          <div className="flex gap-4">
            <Link to="/garantia" className="hover:text-primary-foreground">Garantia</Link>
            <Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos</Link>
          </div>
        </div>
      </footer>

      <a
        href={wpp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Solicitar certidão do ${t.sigla} pelo WhatsApp`}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-accent-foreground shadow-xl lg:hidden"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>
    </div>
  );
}

function InfoCard({
  icon,
  titulo,
  children,
}: {
  icon: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {titulo}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
