import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { TIPOS_TRIBUNAL, TRIBUNAIS, tribunaisPorTipo } from "@/lib/tribunais";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/tribunais`;
const TITLE = "Certidão de Objeto e Pé em todos os tribunais do Brasil";
const DESC =
  "Lista completa de tribunais atendidos: 27 Tribunais de Justiça, TRF1 a TRF6, TRT1 a TRT24, STF, STJ, TST, STM e TSE. Veja sistema, prazo e como solicitar a certidão.";

export const Route = createFileRoute("/tribunais/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
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
            { "@type": "ListItem", position: 2, name: "Tribunais", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Tribunais atendidos",
          itemListElement: TRIBUNAIS.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Certidão de Objeto e Pé ${t.sigla}`,
            url: `${URL}/${t.slug}`,
          })),
        }),
      },
    ],
  }),
  component: TribunaisHub,
});

function TribunaisHub() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
          Certidão de Objeto e Pé em todos os tribunais do Brasil
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{DESC}</p>

        {TIPOS_TRIBUNAL.map((grupo) => {
          const lista = tribunaisPorTipo(grupo.tipo);
          if (lista.length === 0) return null;
          return (
            <section key={grupo.tipo} className="mt-14">
              <h2 className="font-display text-2xl font-bold">{grupo.titulo}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {grupo.descricao}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((t) => (
                  <li key={t.slug}>
                    <Link
                      to="/tribunais/$sigla"
                      params={{ sigla: t.slug }}
                      className="block h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t.sistema} · {t.prazo}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug">
                        Certidão de Objeto e Pé {t.sigla}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.nome}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
