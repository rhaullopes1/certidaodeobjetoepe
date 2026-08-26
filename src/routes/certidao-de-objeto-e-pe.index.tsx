import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale, MapPin, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { ESTADOS_SEO } from "@/lib/estados-seo";
import { UserMenu } from "@/components/user-menu";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/certidao-de-objeto-e-pe`;
const TITLE = "Certidão de Objeto e Pé por Estado | Atendimento Nacional";
const DESC =
  "Veja como solicitar a Certidão de Objeto e Pé em cada estado: SP, MG, BA, DF, PE, GO, PR, RS, RJ, SC, MT e CE. Pedido online e atendimento por WhatsApp.";

export const Route = createFileRoute("/certidao-de-objeto-e-pe/")({
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
          "@type": "ItemList",
          name: "Certidão de Objeto e Pé por estado",
          itemListElement: ESTADOS_SEO.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Certidão de Objeto e Pé em ${e.nome}`,
            url: `${URL}/${e.slug}`,
          })),
        }),
      },
    ],
  }),
  component: EstadosHub,
});

function EstadosHub() {
  const wpp = whatsappLink("Olá! Gostaria de solicitar uma Certidão de Objeto e Pé.");
  return (
    <div className="min-h-screen bg-background">
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

      <main className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
            Certidão de Objeto e Pé por estado
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Atendemos processos de tribunais estaduais, federais e trabalhistas em todo o Brasil.
            Escolha o estado do processo e veja prazos, tribunal responsável e como solicitar.
          </p>
          <a
            href={wpp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </a>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ESTADOS_SEO.map((e) => (
              <li key={e.slug}>
                <Link
                  to="/certidao-de-objeto-e-pe/$uf"
                  params={{ uf: e.slug }}
                  className="block h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <MapPin className="h-4 w-4 text-gold" />
                    {e.uf} · {e.tribunal}
                  </div>
                  <h2 className="mt-3 text-lg font-bold">Certidão de Objeto e Pé em {e.nome}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Prazo médio de {e.prazo}. Atendimento em {e.capital} e demais comarcas.
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="surface-navy px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Certidão Objeto e Pé — atendimento em todo o Brasil.</p>
          <div className="flex gap-4">
            <Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
