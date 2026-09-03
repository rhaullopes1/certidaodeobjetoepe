import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { PUBLICOS_SEO } from "@/lib/publicos-seo";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/certidao-de-objeto-e-pe/para`;
const TITLE = "Certidão de Objeto e Pé para o seu caso: motorista, concurso, imóvel";
const DESC =
  "Apareceu um processo no seu nome? Veja como a Certidão de Objeto e Pé resolve em cada situação: caminhoneiro, motorista de aplicativo, concurso público, eleições, imóvel, advogado e mais.";

export const Route = createFileRoute("/certidao-de-objeto-e-pe/para/")({
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
            {
              "@type": "ListItem",
              position: 2,
              name: "Certidão de Objeto e Pé",
              item: `${SITE}/certidao-de-objeto-e-pe`,
            },
            { "@type": "ListItem", position: 3, name: "Para o seu caso", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Certidão de Objeto e Pé por público",
          itemListElement: PUBLICOS_SEO.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.rotulo,
            url: `${URL}/${p.slug}`,
          })),
        }),
      },
    ],
  }),
  component: PublicosHub,
});

function PublicosHub() {
  return (
    <PageShell>
      <section className="w-full px-4 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <nav aria-label="Trilha de navegação" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="px-2">/</span>
            <Link to="/certidao-de-objeto-e-pe" className="hover:text-foreground">
              Certidão de Objeto e Pé
            </Link>
          </nav>

          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Apareceu um processo no seu nome? Veja o que fazer no seu caso
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A Certidão de Objeto e Pé é o documento oficial do tribunal que explica do que trata o
            processo e em que situação ele está. Escolha abaixo a situação mais parecida com a sua.
          </p>

          <Link
            to="/solicitar"
            className="mt-7 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-accent-foreground"
          >
            Solicitar certidão online
          </Link>
          <AlternativasContato className="mt-4 max-w-xl" />

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PUBLICOS_SEO.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/certidao-de-objeto-e-pe/para/$slug"
                  params={{ slug: p.slug }}
                  className="block h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
                >
                  <h2 className="text-base font-bold break-words">{p.rotulo}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.descricao}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
