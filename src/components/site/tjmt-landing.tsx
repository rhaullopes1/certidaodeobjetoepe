import { Link } from "@tanstack/react-router";
import { Scale, MessageCircle, Phone, MapPin, Landmark, FileText, Truck, Info } from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { UserMenu } from "@/components/user-menu";

const SITE = "https://certidaodeobjetoepe.org";
export const TJMT_URL = `${SITE}/certidao-de-objeto-e-pe/mt`;
const URL = TJMT_URL;
const TITLE = "Certidão de Objeto e Pé TJMT: Como Solicitar";
const DESC =
  "Como solicitar a Certidão de Objeto e Pé de processos do TJMT (Mato Grosso): quem emite, dados necessários, PJe, segredo de justiça e acompanhamento do pedido.";

const COMARCAS = [
  "Cuiabá",
  "Várzea Grande",
  "Rondonópolis",
  "Sinop",
  "Tangará da Serra",
  "Cáceres",
  "Sorriso",
  "Lucas do Rio Verde",
];

const FAQ_TJMT: { q: string; a: string }[] = [
  {
    q: "O que é a Certidão de Objeto e Pé no TJMT?",
    a: "É um documento oficial do Tribunal de Justiça de Mato Grosso que apresenta o resumo de uma ação judicial: a natureza da ação, as partes envolvidas e a situação atual do processo, esteja ele em andamento ou arquivado.",
  },
  {
    q: "Quem emite a certidão?",
    a: "O próprio Tribunal de Justiça de Mato Grosso (TJMT). O certidaodeobjetoepe.org não é órgão público: fazemos a solicitação por você, orientamos e acompanhamos o pedido até a emissão.",
  },
  {
    q: "Que dados preciso informar para pedir?",
    a: "O número do processo e o nome da parte. Com isso localizamos a comarca e a unidade onde o processo tramita ou tramitou. Se você não tiver o número, fale com a nossa equipe antes de pedir.",
  },
  {
    q: "Quanto tempo demora?",
    a: "O prazo de emissão é de 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.",
  },
  {
    q: "Processo em segredo de justiça tem certidão?",
    a: "O acesso a processos em segredo de justiça é restrito. O TJMT informa que o segredo de justiça é um dos casos que impedem a emissão automática on-line da certidão; nessas situações, a emissão depende da análise da unidade judicial e da legitimidade de quem pede.",
  },
  {
    q: "Atendem comarcas do interior de Mato Grosso?",
    a: "Sim. Atendemos processos de qualquer comarca do estado, como Cuiabá, Várzea Grande, Rondonópolis, Sinop, Sorriso e Lucas do Rio Verde, sem necessidade de deslocamento.",
  },
];

export function tjmtHead() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
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
          "@type": "WebPage",
          "@id": `${URL}#webpage`,
          url: URL,
          name: TITLE,
          description: DESC,
          inLanguage: "pt-BR",
          about: { "@type": "GovernmentOrganization", name: "Tribunal de Justiça do Estado de Mato Grosso" },
          publisher: { "@id": `${SITE}/#organization` },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${URL}#faq`,
          inLanguage: "pt-BR",
          mainEntity: FAQ_TJMT.map((item) => ({
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
            { "@type": "ListItem", position: 2, name: "Estados atendidos", item: `${SITE}/certidao-de-objeto-e-pe` },
            { "@type": "ListItem", position: 3, name: "Mato Grosso (TJMT)", item: URL },
          ],
        }),
      },
    ],
  };
}

export function TjmtLanding() {
  const wpp = whatsappLink(
    "Olá! Preciso de uma Certidão de Objeto e Pé de um processo do TJMT (Mato Grosso).",
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
              <span className="font-semibold text-foreground">Mato Grosso (TJMT)</span>
            </nav>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              Mato Grosso · TJMT
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              Certidão de Objeto e Pé no TJMT
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              A Certidão de Objeto e Pé é emitida pelo Tribunal de Justiça de Mato Grosso (TJMT). Não
              somos órgão público: fazemos a solicitação por você, orientamos sobre os dados
              necessários e acompanhamos o pedido até a emissão, em qualquer comarca do estado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <FileText className="h-5 w-5" />
                Solicitar Certidão do TJMT
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
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">O que é a Certidão de Objeto e Pé no TJMT?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Segundo o TJMT, é um documento oficial que apresenta o resumo de uma ação judicial: a
                natureza da ação, as partes envolvidas e a situação atual do processo. Pode se referir
                a ações cíveis ou criminais, em andamento ou arquivadas, e mostra em que fase o processo
                está.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Quem emite?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                O Tribunal de Justiça de Mato Grosso é o órgão responsável pela emissão da certidão. O
                certidaodeobjetoepe.org não é órgão público e não emite certidões: prestamos o serviço
                de solicitação, orientação e acompanhamento do pedido junto ao tribunal.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Como solicitar a certidão do TJMT</h2>
              <ol className="mt-6 space-y-5">
                {[
                  "Informe o número do processo e o nome da parte no nosso formulário.",
                  "Localizamos a comarca e a unidade onde o processo tramita ou tramitou e geramos seu protocolo.",
                  "Fazemos o pedido ao TJMT e acompanhamos até a emissão.",
                  "A certidão emitida pelo tribunal é enviada a você em PDF.",
                ].map((passo, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full surface-navy text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{passo}</p>
                  </li>
                ))}
              </ol>

              <h3 className="mt-10 text-lg font-bold">Quais informações são necessárias?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O essencial é o número do processo e o nome da parte. Não sabe o número? Fale com a
                nossa equipe antes de pedir, para orientarmos como localizá-lo.
              </p>

              <h3 className="mt-8 text-lg font-bold">PJe e demais sistemas do TJMT</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O TJMT tramita processos eletrônicos no PJe (1º e 2º grau) e também usa outros sistemas,
                como o PROJUDI e o SEEU. No PJe, as unidades judiciais do 1º e do 2º grau contam com uma
                função que gera a Certidão de Objeto e Pé de forma automática.
              </p>

              <h3 className="mt-8 text-lg font-bold">Processos físicos e arquivados</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A certidão pode se referir a processos em andamento ou arquivados. Processos físicos
                seguem com consulta própria no portal do TJMT. Nesses casos, o atendimento depende da
                unidade judicial e pode levar mais tempo.
              </p>

              <h3 className="mt-8 text-lg font-bold">Segredo de justiça</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Processos em segredo de justiça têm acesso restrito. O TJMT informa que o segredo de
                justiça impede a emissão automática on-line da certidão. Nesses casos, a emissão depende
                da análise da unidade judicial e da legitimidade de quem faz o pedido.
              </p>
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Landmark className="h-5 w-5 text-gold" />
                Comarcas do TJMT atendidas
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendemos processos de qualquer comarca de Mato Grosso, incluindo:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {COMARCAS.map((cidade) => (
                  <li
                    key={cidade}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {cidade}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Prazo de emissão: 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.
              </p>
              <Link
                to="/solicitar"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                Solicitar Certidão de Objeto e Pé
              </Link>
            </aside>
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Truck className="h-4 w-4 text-gold" />
              Transporte e logística
            </div>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Certidão de Objeto e Pé para Caminhoneiros em Mato Grosso
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Em determinadas situações, um caminhoneiro ou transportador pode precisar apresentar
              documentos relacionados a processos judiciais. Nesses casos, a Certidão de Objeto e Pé
              pode ser um dos documentos solicitados, conforme a finalidade e a exigência da
              instituição.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              O próprio TJMT cita, como exemplo, a apresentação do documento a bancos em contratos de
              financiamento. Também pode ser pedido por empresas que analisam cadastros e querem
              entender a situação de um processo apontado.
            </p>
            <p className="mt-3 flex gap-2 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-gold" />
              A certidão não é exigida de todos os caminhoneiros. Ela apenas informa o objeto e a
              situação do processo; não remove nem encerra o processo.
            </p>
            <Link
              to="/certidao-de-objeto-e-pe/para/$slug"
              params={{ slug: "caminhoneiro" }}
              className="mt-5 inline-block text-sm font-semibold text-primary underline underline-offset-4"
            >
              Saiba mais sobre a certidão para caminhoneiros
            </Link>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Perguntas frequentes sobre a Certidão de Objeto e Pé no TJMT
            </h2>
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {FAQ_TJMT.map((item) => (
                <details key={item.q} className="group px-6 py-5">
                  <summary className="cursor-pointer list-none text-base font-semibold">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xl font-bold">Outras páginas úteis</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {[
                { to: "/certidao-de-objeto-e-pe" as const, label: "Certidão de Objeto e Pé: guia principal" },
                { to: "/certidao-objeto-e-pe-trf1" as const, label: "Justiça Federal em MT (TRF1)" },
                { to: "/tribunais" as const, label: "Todos os tribunais atendidos" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    {l.label}
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
        aria-label="Falar sobre certidão do TJMT pelo WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-accent-foreground shadow-xl lg:hidden"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>
    </div>
  );
}
