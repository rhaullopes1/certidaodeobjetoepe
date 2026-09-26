import { createFileRoute, Link } from "@tanstack/react-router";
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
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL, TABELA_PRECOS, formatarBRL } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { UserMenu } from "@/components/user-menu";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/certidao-objeto-e-pe-tjsp`;
const TITLE = "Certidão de Objeto e Pé TJSP | Solicite Online";
const DESC =
  "Certidão de Objeto e Pé no TJSP: solicite online processos do Tribunal de Justiça de São Paulo, sem advogado e sem ir ao fórum. Prazo de emissão de 1 a 5 dias úteis, conforme a comarca e o tribunal emissor e suporte por WhatsApp.";

const FAQ_TJSP: { q: string; a: string }[] = [
  {
    q: "Como pedir a Certidão de Objeto e Pé no TJSP?",
    a: "Informe o número do processo (formato CNJ), o nome completo e o CPF da parte envolvida em nosso formulário online. Nossa equipe identifica o foro e a vara no sistema e-SAJ do TJSP, protocola o requerimento e acompanha até a emissão do documento.",
  },
  {
    q: "Quanto tempo demora a certidão no Tribunal de Justiça de São Paulo?",
    a: "O prazo de emissão é de 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.",
  },
  {
    q: "Qual o valor da Certidão de Objeto e Pé do TJSP?",
    a: "O valor é por certidão e o total é calculado automaticamente conforme a quantidade solicitada (de 1 a 5), com desconto progressivo. Ele é apresentado no resumo do pedido logo após o preenchimento da solicitação, antes de qualquer pagamento, que pode ser feito por Pix com confirmação automática.",
  },
  {
    q: "Preciso de advogado ou ir ao fórum em São Paulo?",
    a: "Não. Qualquer pessoa física ou jurídica pode solicitar a certidão, sem advogado e sem comparecer ao fórum. Cuidamos de todo o trâmite junto ao TJSP.",
  },
  {
    q: "A certidão emitida pelo TJSP tem validade oficial?",
    a: "Sim. O documento é emitido pelo próprio Tribunal de Justiça de São Paulo, com código de autenticidade conferível no portal e-SAJ, e tem validade em todo o território nacional.",
  },
  {
    q: "Vocês atendem processos de qualquer comarca do TJSP?",
    a: "Sim. Atendemos as comarcas da capital e do interior, incluindo São Paulo, Campinas, Guarulhos, Santos, Ribeirão Preto, São Bernardo do Campo, Sorocaba e Osasco.",
  },
  {
    q: "Processos de processos criminais e cíveis do TJSP também têm certidão?",
    a: "Sim. A Certidão de Objeto e Pé pode ser emitida para processos cíveis, criminais, de família e de execução, descrevendo o objeto discutido e a fase atual do andamento.",
  },
];

export const Route = createFileRoute("/certidao-objeto-e-pe-tjsp")({
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
          "@type": "Service",
          name: "Certidão de Objeto e Pé no TJSP",
          serviceType: "Solicitação de certidão judicial",
          areaServed: { "@type": "State", name: "São Paulo" },
          provider: { "@type": "Organization", name: "Certidão Objeto e Pé", url: SITE },
          url: URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${URL}#faq`,
          inLanguage: "pt-BR",
          mainEntity: FAQ_TJSP.map((item) => ({
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
            {
              "@type": "ListItem",
              position: 2,
              name: "Estados atendidos",
              item: `${SITE}/certidao-de-objeto-e-pe`,
            },
            { "@type": "ListItem", position: 3, name: "TJSP", item: URL },
          ],
        }),
      },
    ],
  }),
  component: TjspPage,
});

function TjspPage() {
  const wpp = whatsappLink(
    "Olá! Preciso de uma Certidão de Objeto e Pé de um processo do TJSP (São Paulo).",
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
              <span className="font-semibold text-foreground">TJSP</span>
            </nav>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              São Paulo · TJSP
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              Certidão de Objeto e Pé TJSP: solicite online no Tribunal de Justiça de São Paulo
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Emitimos a Certidão de Objeto e Pé de processos que tramitam no TJSP, em qualquer foro
              da capital ou do interior. Você informa o número do processo e nossa equipe cuida do
              protocolo no e-SAJ e do acompanhamento até a emissão.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <FileText className="h-5 w-5" />
                Solicitar certidão do TJSP
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
            <InfoCard icon={<Landmark className="h-5 w-5 text-gold" />} titulo="Tribunal">
              Tribunal de Justiça de São Paulo (TJSP), com protocolo pelo portal e-SAJ ou no cartório
              da vara quando o processo é físico.
            </InfoCard>
            <InfoCard icon={<Clock className="h-5 w-5 text-gold" />} titulo="Prazo médio">
              1 a 5 dias úteis, conforme a comarca e o tribunal emissor.
            </InfoCard>
            <InfoCard icon={<CheckCircle2 className="h-5 w-5 text-gold" />} titulo="Valor">
              Valor por certidão, com desconto progressivo até
              5 certidões.
            </InfoCard>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Requisitos do TJSP para emitir a Certidão de Objeto e Pé
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                O TJSP exige o número do processo no padrão CNJ e a identificação correta da parte
                (nome completo e CPF ou CNPJ). Processos em segredo de justiça só permitem emissão
                às partes e a seus procuradores. Em processos físicos ou arquivados, o pedido é
                dirigido ao cartório da vara e pode depender de desarquivamento, o que altera o
                prazo.
              </p>
              <ol className="mt-8 space-y-5">
                {[
                  "Envie o número do processo, o nome completo e o CPF da parte envolvida.",
                  "Confirmamos o foro, a vara e a situação do processo no e-SAJ e geramos seu protocolo.",
                  "Você paga por Pix com confirmação automática e acompanha o andamento pelo site.",
                  "A certidão emitida pelo TJSP é enviada em PDF por e-mail e WhatsApp.",
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
              <h2 className="text-lg font-bold">Comarcas do TJSP atendidas</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendemos todos os foros do estado de São Paulo, incluindo:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[
                  "São Paulo",
                  "Campinas",
                  "Guarulhos",
                  "Santos",
                  "Ribeirão Preto",
                  "São Bernardo do Campo",
                  "Sorocaba",
                  "Osasco",
                  "São José dos Campos",
                  "Bauru",
                ].map((cidade) => (
                  <li
                    key={cidade}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {cidade}
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
              Perguntas frequentes sobre a Certidão de Objeto e Pé no TJSP
            </h2>
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {FAQ_TJSP.map((item) => (
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
            <h2 className="text-xl font-bold">Outras páginas úteis</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              <li>
                <Link
                  to="/certidao-de-objeto-e-pe/$uf"
                  params={{ uf: "sp" }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Certidão em São Paulo (SP)
                </Link>
              </li>
              <li>
                <Link
                  to="/certidao-de-objeto-e-pe"
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Todos os estados atendidos
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
            <Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos</Link>
          </div>
        </div>
      </footer>

      <a
        href={wpp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Solicitar certidão do TJSP pelo WhatsApp"
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
