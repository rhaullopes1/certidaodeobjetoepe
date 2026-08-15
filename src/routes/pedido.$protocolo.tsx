import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Check, Loader2, MessageCircle, Scale, FileText } from "lucide-react";
import { consultarPedido } from "@/lib/pedidos.functions";
import { whatsappLink, PIX, statusPedido, formatarBRL } from "@/lib/site";

export const Route = createFileRoute("/pedido/$protocolo")({
  component: PedidoPage,
  head: () => ({
    meta: [
      { title: "Pedido e pagamento Pix | Certidão de Objeto e Pé" },
      {
        name: "description",
        content:
          "Acompanhe o resumo do seu pedido de Certidão de Objeto e Pé e pague com Pix copia e cola ou QR Code.",
      },
      { property: "og:title", content: "Pedido e pagamento Pix | Certidão de Objeto e Pé" },
      {
        property: "og:description",
        content: "Resumo do pedido, número de protocolo e pagamento por Pix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{valor}</span>
    </div>
  );
}

function PedidoPage() {
  const { protocolo } = Route.useParams();
  const buscar = useServerFn(consultarPedido);
  const { data, isPending, isError } = useQuery({
    queryKey: ["pedido", protocolo],
    queryFn: () => buscar({ data: { protocolo } }),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!data?.pixCopiaECola) return;
    QRCode.toDataURL(data.pixCopiaECola, { width: 480, margin: 1 })
      .then(setQr)
      .catch((e) => console.error(e));
  }, [data?.pixCopiaECola]);

  async function copiar() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.pixCopiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="surface-navy">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-foreground/15">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-sm font-bold">Certidão Objeto e Pé</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        {isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando pedido...
          </p>
        )}

        {(isError || (!isPending && !data)) && (
          <div className="card-premium p-8">
            <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Confira o número de protocolo informado ou faça uma nova solicitação.
            </p>
            <Link
              to="/solicitar"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Nova solicitação
            </Link>
          </div>
        )}

        {data && (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground/80">
              <FileText className="h-3.5 w-3.5" /> Pedido registrado
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
              Protocolo {data.protocolo}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Guarde este número. O pedido é enviado ao tribunal após a confirmação do pagamento.
            </p>

            {(() => {
              const st = statusPedido(data.status);
              const cores =
                st.tom === "pago"
                  ? "border-accent/40 bg-accent/10 text-accent-foreground"
                  : st.tom === "cancelado"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-border bg-secondary text-foreground";
              return (
                <div className={`mt-6 flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4 ${cores}`}>
                  <span className="relative flex h-2.5 w-2.5">
                    {st.tom === "pendente" && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                    )}
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{st.label}</p>
                    <p className="text-xs opacity-80">{st.descricao}</p>
                  </div>
                  <span className="ml-auto text-[11px] uppercase tracking-[0.14em] opacity-70">
                    Atualiza automaticamente
                  </span>
                </div>
              );
            })()}

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <section className="card-premium p-6 sm:p-8">
                <h2 className="text-lg font-bold">Resumo do pedido</h2>
                <div className="mt-4">
                  <Linha label="Serviço" valor="Certidão de Objeto e Pé" />
                  <Linha label="Processo" valor={data.numeroProcesso} />
                  {data.nomeParte && <Linha label="Parte envolvida" valor={data.nomeParte} />}
                  <Linha label="CPF" valor={data.cpf} />
                  <Linha
                    label="Certidões"
                    valor={`${data.quantidade} ${data.quantidade > 1 ? "certidões" : "certidão"}`}
                  />
                  <Linha label="E-mail" valor={data.email} />
                  <Linha label="WhatsApp" valor={data.whatsapp} />
                  <Linha label="Total" valor={formatarBRL(data.valorCentavos)} />
                </div>
                {data.observacoes && (
                  <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    {data.observacoes}
                  </p>
                )}
              </section>

              {data.status === "pago" ? (
                <section className="card-premium p-6 sm:p-8">
                  <h2 className="text-lg font-bold">Pagamento confirmado</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recebemos {formatarBRL(data.valorCentavos)} referente ao protocolo{" "}
                    {data.protocolo}
                    {data.pagoEm
                      ? ` em ${new Date(data.pagoEm).toLocaleString("pt-BR")}`
                      : ""}
                    . Sua solicitação já foi encaminhada ao tribunal e você será avisado a cada
                    etapa.
                  </p>
                  <div className="mt-6 grid place-items-center rounded-2xl bg-accent/10 p-8 text-accent-foreground">
                    <Check className="h-12 w-12" />
                  </div>
                  <a
                    href={whatsappLink(
                      `Olá! Meu pagamento do protocolo ${data.protocolo} foi confirmado. Gostaria de acompanhar o andamento.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                  >
                    <MessageCircle className="h-4 w-4 text-accent" />
                    Falar com a equipe
                  </a>
                </section>
              ) : (
              <section className="card-premium p-6 sm:p-8">
                <h2 className="text-lg font-bold">
                  Pagamento via Pix — {formatarBRL(data.valorCentavos)}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Escaneie o QR Code no app do seu banco ou use o código copia e cola.
                </p>

                <div className="mt-6 grid place-items-center rounded-2xl bg-card p-4">
                  {qr ? (
                    <img
                      src={qr}
                      width={240}
                      height={240}
                      alt={`QR Code Pix para o protocolo ${data.protocolo}`}
                      className="h-60 w-60"
                    />
                  ) : (
                    <div className="grid h-60 w-60 place-items-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>

                <p className="mt-6 break-all rounded-xl bg-secondary px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {data.pixCopiaECola}
                </p>
                <button
                  onClick={copiar}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {copiado ? (
                    <>
                      <Check className="h-4 w-4" /> Código copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copiar código Pix
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs text-muted-foreground">
                  Recebedor: {PIX.nome} — {PIX.cidade}.{" "}
                  {data.confirmacaoAutomatica
                    ? "A confirmação é automática: assim que o Pix cair, esta página muda para “Pagamento confirmado” em poucos segundos."
                    : "Após pagar, envie o comprovante pelo WhatsApp para que nossa equipe confirme o pedido."}
                </p>

                <a
                  href={whatsappLink(
                    `Olá! Realizei o pagamento do protocolo ${data.protocolo} (Certidão de Objeto e Pé). Segue o comprovante.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Falar pelo WhatsApp
                </a>
              </section>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}