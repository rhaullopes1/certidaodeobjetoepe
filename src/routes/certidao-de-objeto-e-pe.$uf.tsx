import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Scale,
  MessageCircle,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Landmark,
  FileText,
} from "lucide-react";
import {
  whatsappLink,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/site";
import { ESTADOS_SEO, estadoPorSlug, faqEstado, sistemaDoEstado } from "@/lib/estados-seo";
import { detalheEstado } from "@/lib/estados-detalhes";
import { UserMenu } from "@/components/user-menu";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { TjpeLanding, tjpeHead } from "@/components/site/tjpe-landing";

const SITE = "https://certidaodeobjetoepe.org";

export const Route = createFileRoute("/certidao-de-objeto-e-pe/$uf")({
  loader: ({ params }) => {
    const estado = estadoPorSlug(params.uf);
    if (!estado) throw notFound();
    return { estado };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Estado não encontrado | Certidão de Objeto e Pé" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const e = loaderData.estado;
    if (e.slug === "pe") return tjpeHead();
    const title = `Certidão de Objeto e Pé ${e.uf} (${e.tribunal}): Pedido Online`;
    const description = `Precisa da Certidão de Objeto e Pé em ${e.nome}? Fazemos o pedido ao ${e.tribunal}, Justiça Federal ou do Trabalho e acompanhamos até a emissão. Prazo usual: 1 a 5 dias úteis.`;
    const url = `${SITE}/certidao-de-objeto-e-pe/${params.uf}`;

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
            name: `Certidão de Objeto e Pé em ${e.nome}`,
            serviceType: "Solicitação de certidão judicial",
            areaServed: { "@type": "State", name: e.nome },
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
            mainEntity: faqEstado(e).map((item) => ({
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
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: SITE,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Estados atendidos",
                item: `${SITE}/certidao-de-objeto-e-pe`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: e.nome,
                item: url,
              },
            ],
          }),
        },
      ],
    };
  },
  component: EstadoPage,
  notFoundComponent: EstadoNaoEncontrado,
});

function EstadoNaoEncontrado() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Estado não encontrado</h1>
        <Link to="/certidao-de-objeto-e-pe" className="mt-4 inline-block text-sm font-semibold underline">
          Ver todos os estados atendidos
        </Link>
      </div>
    </div>
  );
}

function EstadoPage() {
  const { estado } = Route.useLoaderData();
  if (estado.slug === "pe") return <TjpeLanding />;
  return <EstadoPageGenerica />;
}

function EstadoPageGenerica() {
  const { estado: e } = Route.useLoaderData();
  const detalhe = detalheEstado(e.slug);
  const sistema = sistemaDoEstado(e);
  const wpp = whatsappLink(
    `Olá! Preciso de uma Certidão de Objeto e Pé de um processo em ${e.nome} (${e.tribunal}).`,
  );

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
              <Link to="/certidao-de-objeto-e-pe" className="hover:underline">Estados</Link>
              <span className="px-2">/</span>
              <span className="font-semibold text-foreground">{e.nome}</span>
            </nav>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              {e.nome} · {e.tribunal}
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              Certidão de Objeto e Pé em {e.nome} ({e.uf})
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{e.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
              </a>
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <FileText className="h-5 w-5" />
                Solicitar online
              </Link>
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
            <InfoCard icon={<Landmark className="h-5 w-5 text-gold" />} titulo="Tribunal">
              {e.tribunalNome} ({e.tribunal}), além da Justiça Federal e do Trabalho no estado.
            </InfoCard>
            <InfoCard icon={<Clock className="h-5 w-5 text-gold" />} titulo="Prazo médio">
              {e.prazo}, conforme a comarca e a situação do processo.
            </InfoCard>
            <InfoCard icon={<CheckCircle2 className="h-5 w-5 text-gold" />} titulo="Valor">
              Valor por certidão, com desconto progressivo até 5 certidões, apresentado no resumo do pedido antes do pagamento.
            </InfoCard>
          </div>
        </section>

        {detalhe && (
          <section className="px-5 py-16 sm:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Como funciona a Certidão de Objeto e Pé no {e.tribunal}
              </h2>
              <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sistema processual
                  </dt>
                  <dd className="mt-2 text-sm font-medium">
                    {sistema ?? "Processo eletrônico do tribunal"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Justiça Federal
                  </dt>
                  <dd className="mt-2 text-sm font-medium">{detalhe.trf}</dd>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Justiça do Trabalho
                  </dt>
                  <dd className="mt-2 text-sm font-medium">{detalhe.trt}</dd>
                </div>
              </dl>
              <h3 className="mt-10 text-lg font-bold">
                O que muda no atendimento em {e.nome}
              </h3>
              <ul className="mt-4 space-y-3">
                {detalhe.particularidades.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}


        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Como solicitar a Certidão de Objeto e Pé em {e.nome}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{e.contexto}</p>
              <ol className="mt-8 space-y-5">
                {[
                  `Envie o número do processo, o nome completo e o CPF da parte envolvida.`,
                  `Confirmamos a comarca e a vara responsável no ${e.tribunal} e geramos seu protocolo.`,
                  `Você paga com Pix ou cartão e acompanha o andamento pelo site e pelo WhatsApp.`,
                  `A certidão emitida é enviada em formato digital para seu e-mail e WhatsApp.`,
                ].map((passo, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full surface-navy text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{passo}</p>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">
                Certidão de Objeto e Pé nas cidades de {e.nome}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendemos {e.capital} e todas as comarcas do estado, incluindo:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {e.cidades.map((cidade) => (
                  <li
                    key={cidade}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {cidade}
                  </li>
                ))}
              </ul>
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir orçamento no WhatsApp
              </a>
            </aside>
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Perguntas frequentes sobre a Certidão de Objeto e Pé em {e.uf}
            </h2>
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {faqEstado(e).map((item) => (
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
                  params={{ sigla: e.tribunal.toLowerCase() }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Página do {e.tribunal}
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/$slug"
                  params={{ slug: "certidao-de-objeto-e-pe-justica-estadual" }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Certidão na Justiça Estadual
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/$slug"
                  params={{ slug: "como-emitir-certidao-de-objeto-e-pe" }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Como emitir a certidão
                </Link>
              </li>
              <li>
                <Link
                  to="/blog/$slug"
                  params={{ slug: "quanto-tempo-demora-certidao-de-objeto-e-pe" }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Quanto tempo demora
                </Link>
              </li>
              <li>
                <Link
                  to="/tribunais"
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Todos os tribunais
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xl font-bold">Certidão de Objeto e Pé em outros estados</h2>

            <ul className="mt-5 flex flex-wrap gap-2">
              {ESTADOS_SEO.filter((o) => o.slug !== e.slug).map((o) => (
                <li key={o.slug}>
                  <Link
                    to="/certidao-de-objeto-e-pe/$uf"
                    params={{ uf: o.slug }}
                    className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    {o.nome} ({o.uf})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
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

      <a
        href={wpp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Solicitar certidão em ${e.nome} pelo WhatsApp`}
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
