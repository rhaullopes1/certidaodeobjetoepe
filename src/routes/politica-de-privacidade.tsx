import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-de-privacidade")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Certidão de Objeto e Pé" },
      {
        name: "description",
        content:
          "Saiba como tratamos os dados enviados para solicitação de Certidão de Objeto e Pé.",
      },
      { property: "og:title", content: "Política de Privacidade" },
      {
        property: "og:description",
        content: "Como tratamos os dados enviados em solicitações de certidões judiciais.",
      },
      { property: "og:url", content: "/politica-de-privacidade" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/politica-de-privacidade" }],
  }),
});

function Page() {
  return (
    <div className="min-h-dvh bg-background px-5 py-16 sm:px-8">
      <article className="mx-auto w-full max-w-3xl">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Voltar para o início
        </Link>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Política de Privacidade</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Coletamos apenas os dados necessários para realizar a solicitação da
            certidão junto ao tribunal responsável: nome, WhatsApp, e-mail,
            número do processo, estado e observações informadas por você.
          </p>
          <p>
            Esses dados são utilizados exclusivamente para atendimento,
            protocolo do pedido e envio do documento. Não vendemos nem
            compartilhamos informações com terceiros sem finalidade ligada ao
            serviço contratado.
          </p>
          <p>
            Você pode solicitar a qualquer momento a correção ou exclusão dos
            seus dados pelo nosso canal de WhatsApp, conforme a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>
      </article>
    </div>
  );
}
