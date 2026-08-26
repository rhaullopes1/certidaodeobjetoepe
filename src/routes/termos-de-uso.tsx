import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos-de-uso")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Termos de Uso | Certidão de Objeto e Pé" },
      {
        name: "description",
        content:
          "Condições do serviço de assessoria para solicitação de Certidão de Objeto e Pé.",
      },
      { property: "og:title", content: "Termos de Uso" },
      {
        property: "og:description",
        content: "Condições do serviço de assessoria para obtenção de certidões judiciais.",
      },
      { property: "og:url", content: "/termos-de-uso" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/termos-de-uso" }],
  }),
});

function Page() {
  return (
    <main className="min-h-dvh bg-background px-5 py-16 sm:px-8">
      <article className="mx-auto w-full max-w-3xl">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Voltar para o início
        </Link>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Termos de Uso</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Prestamos serviço de assessoria administrativa para solicitação e
            acompanhamento de certidões junto a tribunais brasileiros. Não
            oferecemos consultoria jurídica nem representação processual.
          </p>
          <p>
            Os prazos de emissão dependem exclusivamente do tribunal
            responsável. Atuamos para agilizar e acompanhar o pedido, sem
            controle sobre o tempo de resposta do órgão.
          </p>
          <p>
            A certidão emitida reflete as informações constantes nos sistemas do
            tribunal na data da emissão e não altera, suspende ou exclui
            qualquer processo.
          </p>
          <p>
            Valores, condições e prazos são informados antes da contratação por
            meio do nosso canal de atendimento.
          </p>
        </div>
      </article>
    </main>
  );
}
