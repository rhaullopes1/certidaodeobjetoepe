import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { PUBLICOS_SEO, PUBLICO_POR_SLUG } from "@/lib/publicos-seo";

const SITE = "https://certidaodeobjetoepe.org";

export const Route = createFileRoute("/certidao-de-objeto-e-pe/para/$slug")({
  loader: ({ params }) => {
    const publico = PUBLICO_POR_SLUG.get(params.slug);
    if (!publico) throw notFound();
    return {
      publico,
      relacionados: PUBLICOS_SEO.filter((p) => p.slug !== publico.slug).slice(0, 3),
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Página não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.publico;
    const url = `${SITE}/certidao-de-objeto-e-pe/para/${params.slug}`;
    return {
      meta: [
        { title: p.titulo },
        { name: "description", content: p.descricao },
        { property: "og:title", content: p.titulo },
        { property: "og:description", content: p.descricao },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p.titulo },
        { name: "twitter:description", content: p.descricao },
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
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE },
              {
                "@type": "ListItem",
                position: 2,
                name: "Para o seu caso",
                item: `${SITE}/certidao-de-objeto-e-pe/para`,
              },
              { "@type": "ListItem", position: 3, name: p.rotulo, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: p.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: PublicoPage,
});

function PublicoPage() {
  const { publico, relacionados } = Route.useLoaderData();

  return (
    <PageShell>
      <article className="w-full px-4 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <nav aria-label="Trilha de navegação" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="px-2">/</span>
            <Link to="/certidao-de-objeto-e-pe/para" className="hover:text-foreground">
              Para o seu caso
            </Link>
          </nav>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight break-words sm:text-4xl">
            {publico.h1}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{publico.resumo}</p>

          <Link
            to="/solicitar"
            className="mt-7 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-accent-foreground"
          >
            Solicitar certidão online
          </Link>
          <AlternativasContato className="mt-4" />

          <section className="mt-12">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Quando você precisa</h2>
            <ul className="mt-4 space-y-2">
              {publico.gatilhos.map((g) => (
                <li key={g} className="flex gap-3 text-base leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="break-words">{g}</span>
                </li>
              ))}
            </ul>
          </section>

          {publico.secoes.map((s) => (
            <section key={s.h2} className="mt-12">
              <h2 className="font-display text-xl font-bold break-words sm:text-2xl">{s.h2}</h2>
              {s.paragrafos.map((t) => (
                <p key={t} className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {t}
                </p>
              ))}
              {s.lista ? (
                <ul className="mt-4 space-y-2">
                  {s.lista.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed text-muted-foreground"
                    >
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span className="break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="mt-14">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Perguntas frequentes</h2>
            <dl className="mt-6 space-y-6">
              {publico.faq.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
                  <dt className="font-semibold break-words">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {publico.fontes?.length ? (
            <section className="mt-14">
              <h2 className="font-display text-xl font-bold sm:text-2xl">Fontes oficiais</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {publico.fontes.map((f) => (
                  <li key={f.url}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground underline decoration-accent/50 underline-offset-4 hover:text-foreground"
                    >
                      {f.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-14">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Veja também</h2>
            <ul className="mt-5 space-y-3">
              {relacionados.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/certidao-de-objeto-e-pe/para/$slug"
                    params={{ slug: r.slug }}
                    className="block rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold break-words transition-colors hover:bg-secondary"
                  >
                    {r.rotulo}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/guias"
                  className="block rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Guias: como solicitar a Certidão de Objeto e Pé
                </Link>
              </li>
              <li>
                <Link
                  to="/certidao-de-objeto-e-pe"
                  className="block rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Certidão de Objeto e Pé por estado
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
