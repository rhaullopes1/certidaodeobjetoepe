import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale, MapPin, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { ESTADOS_SEO } from "@/lib/estados-seo";
import { UserMenu } from "@/components/user-menu";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/certidao-de-objeto-e-pe`;
const TITLE = "Certidão de Objeto e Pé: o que é, como pedir e prazos";
const DESC =
  "Guia completo da Certidão de Objeto e Pé: o que é, o que consta, quem pode pedir, prazos por tribunal, custo e como solicitar online em todos os estados do Brasil.";


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
              name: "Certidão de Objeto e Pé",
              item: URL,
            },

          ],
        }),
      },
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

      <main className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
            Certidão de Objeto e Pé: o que é, como pedir e prazos
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A Certidão de Objeto e Pé é o documento oficial do tribunal que descreve o objeto do
            processo (do que se trata, partes e pedido) e o pé (a fase em que ele está hoje).
            Solicitamos a certidão em tribunais estaduais, federais e trabalhistas de todo o Brasil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/solicitar"
              className="inline-flex items-center rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground"
            >
              Solicitar minha certidão
            </Link>
            <a
              href={wpp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-bold"
            >
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>
          <AlternativasContato className="mt-4 max-w-xl" />

          <section className="mt-14 max-w-3xl">
            <h2 className="font-display text-2xl font-bold">O que consta na certidão</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Número do processo no padrão CNJ e classe processual.</li>
              <li>• Vara, foro ou comarca em que o feito tramita.</li>
              <li>• Nome e qualificação das partes.</li>
              <li>• Objeto: resumo do que se discute e valor da causa, quando houver.</li>
              <li>• Data da distribuição e principais movimentações.</li>
              <li>• Pé: situação atual (instrução, sentença, recurso, execução, arquivado, extinto).</li>
              <li>• Data de expedição, assinatura do servidor e código de autenticidade.</li>
            </ul>
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-bold">Quem costuma exigir o documento</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Gerenciadoras de risco e transportadoras (cadastro de motorista), bancos e financeiras
              (análise de crédito), cartórios e compradores de imóvel (due diligence), órgãos
              públicos em licitações, bancas de concurso na investigação social, consulados em
              pedidos de visto e departamentos de compliance em contratações.
            </p>
            <Link
              to="/certidao-de-objeto-e-pe/para"
              className="mt-4 inline-block text-sm font-semibold text-gold underline underline-offset-4"
            >
              Ver a página do seu caso específico
            </Link>
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-bold">Prazo de emissão</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Ramo</th>
                    <th className="py-2 pr-4">Prazo informado</th>
                    <th className="py-2">Observação</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border">
                    <td className="py-2 pr-4">Justiça Estadual</td>
                    <td className="py-2 pr-4">1 a 5 dias úteis, conforme a comarca e o tribunal emissor</td>
                    <td className="py-2">Processos físicos demoram mais</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2 pr-4">Justiça Federal</td>
                    <td className="py-2 pr-4">1 a 5 dias úteis, conforme a comarca e o tribunal emissor</td>
                    <td className="py-2">Varia por seção judiciária e TRF</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2 pr-4">Justiça do Trabalho</td>
                    <td className="py-2 pr-4">1 a 5 dias úteis, conforme a comarca e o tribunal emissor</td>
                    <td className="py-2">PJe agiliza a tramitação</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2 pr-4">Tribunais superiores</td>
                    <td className="py-2 pr-4">1 a 5 dias úteis, conforme a comarca e o tribunal emissor</td>
                    <td className="py-2">Volume alto de pedidos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-bold">Como solicitar</h2>
            <ol className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>1. Informe o número do processo — o sistema identifica tribunal, estado e comarca.</li>
              <li>2. Complete nome, CPF, e-mail e WhatsApp e receba o resumo do pedido.</li>
              <li>3. Pague por Pix ou cartão e acompanhe o protocolo pelo site.</li>
              <li>4. Receba a certidão digital com código de autenticidade do tribunal.</li>
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Não sabe o número do processo ou tem dúvida sobre qual certidão pedir? Veja{" "}
              <Link to="/blog/$slug" params={{ slug: "o-que-e-certidao-de-objeto-e-pe" }} className="text-gold underline underline-offset-4">
                o guia completo do documento
              </Link>{" "}
              ou{" "}
              <Link to="/blog/$slug" params={{ slug: "certidao-objeto-e-pe-x-nada-consta" }} className="text-gold underline underline-offset-4">
                a diferença para a certidão negativa
              </Link>
              .
            </p>
          </section>

          <h2 className="mt-14 font-display text-2xl font-bold">Certidão de Objeto e Pé por estado</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Escolha o estado do processo e veja o tribunal responsável, o sistema processual e o prazo geral de emissão.
          </p>


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
                  <h2 className="mt-3 text-lg font-bold">Certidão de Objeto e Pé em {e.nome} ({e.uf}) — {e.tribunal}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Prazo médio de {e.prazo}. Atendimento em {e.capital} e demais comarcas.
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-14 text-xl font-bold">Páginas por tribunal</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            <li>
              <Link
                to="/certidao-objeto-e-pe-tjsp"
                className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Certidão de Objeto e Pé TJSP
              </Link>
            </li>
            <li>
              <Link
                to="/certidao-objeto-e-pe-tjpe"
                className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Certidão de Objeto e Pé TJPE
              </Link>
            </li>
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
