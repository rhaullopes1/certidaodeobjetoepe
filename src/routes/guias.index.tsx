import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { GUIAS_SEO } from "@/lib/guias-seo";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/guias`;
const TITLE = "Guias da Certidão de Objeto e Pé: Como Pedir, Preços e Usos";
const DESC =
  "Guias práticos sobre a Certidão de Objeto e Pé: passo a passo da solicitação, quanto custa, uso em concurso público, licitação, compra de imóvel e visto.";

export const Route = createFileRoute("/guias/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "pt-BR", href: URL },
      { rel: "alternate", hrefLang: "x-default", href: URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE },
            { "@type": "ListItem", position: 2, name: "Guias", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Guias da Certidão de Objeto e Pé",
          itemListElement: GUIAS_SEO.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: g.h1,
            url: `${URL}/${g.slug}`,
          })),
        }),
      },
    ],
  }),
  component: GuiasHub,
});

function GuiasHub() {
  return (
    <PageShell>
      <section className="w-full px-4 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Guias
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight break-words sm:text-4xl">
            Guias da Certidão de Objeto e Pé
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Respostas diretas para quem precisa da certidão: como pedir, quanto custa e como usar o
            documento em concurso público, licitação, compra de imóvel e processos de visto.
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {GUIAS_SEO.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/guias/$slug"
                  params={{ slug: g.slug }}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
                >
                  <BookOpen className="h-5 w-5 text-gold" />
                  <h2 className="mt-3 text-lg font-bold break-words">{g.h1}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.resumo}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Pronto para solicitar?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              O pedido é online e leva menos de três minutos. Você recebe protocolo e comprovante em
              PDF logo após o pagamento.
            </p>
            <Link
              to="/solicitar"
              className="mt-5 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-accent-foreground"
            >
              Solicitar certidão
            </Link>
            <AlternativasContato className="mt-4" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
