import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  MessageCircle,
  Scale,
  FileText,
  Download,
} from "lucide-react";
import { consultarPedido, regerarCobranca } from "@/lib/pedidos.functions";
import { whatsappLink, PIX, statusPedido, formatarBRL, EMAIL_CONTATO } from "@/lib/site";
import { PrazoEmissao } from "@/components/site/prazo-emissao";
import { sendGoogleAdsConversion, trackGenerateLead } from "@/lib/analytics";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { PassosPix, SelosPagamento } from "@/components/site/reforco-pagamento";


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
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["pedido", protocolo],
    queryFn: () => buscar({ data: { protocolo } }),
    refetchInterval: (query) =>
      query.state.data?.status === "aguardando_pagamento" &&
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
        ? 15_000
        : false,
    staleTime: 8_000,
  });

  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const novoLink = useServerFn(regerarCobranca);
  const [gerando, setGerando] = useState(false);
  const [falhouLink, setFalhouLink] = useState(false);

  async function tentarNovamente() {
    setGerando(true);
    setFalhouLink(false);
    try {
      const atualizado = await novoLink({ data: { protocolo } });
      if (atualizado?.checkoutUrl) {
        await refetch();
        window.open(atualizado.checkoutUrl, "_blank", "noopener,noreferrer");
      } else {
        setFalhouLink(true);
      }
    } catch {
      setFalhouLink(true);
    } finally {
      setGerando(false);
    }
  }

  useEffect(() => {
    if (!data?.protocolo) return;
    trackGenerateLead(data.protocolo, data.valorCentavos);
    if (data.status === "pago") {
      sendGoogleAdsConversion(data.protocolo, data.valorCentavos);
    }
  }, [data?.status, data?.protocolo, data?.valorCentavos]);



  useEffect(() => {
    if (!data?.pixCopiaECola) return;
    let ativo = true;
    void import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(data.pixCopiaECola, { width: 480, margin: 1 }))
      .then((url) => {
        if (ativo) setQr(url);
      })
      .catch(() => {
        if (ativo) setQr(null);
      });
    return () => {
      ativo = false;
    };
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
    <div className="min-h-dvh bg-secondary/40">
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
            <button
              type="button"
              onClick={async () => {
                const { baixarComprovantePedido } = await import("@/lib/comprovante-pdf");
                baixarComprovantePedido({
                  protocolo: data.protocolo,
                  numeroProcesso: data.numeroProcesso,
                  nomeParte: data.nomeParte,
                  cpf: data.cpf,
                  quantidade: data.quantidade,
                  email: data.email,
                  whatsapp: data.whatsapp,
                  valorCentavos: data.valorCentavos,
                  status: data.status,
                  criadoEm: data.criadoEm,
                  pagoEm: data.pagoEm,
                  observacoes: data.observacoes,
                  certidoes: data.certidoes,
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-input bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              <Download className="h-4 w-4 text-accent" />
              Baixar comprovante em PDF
            </button>

            <PrazoEmissao className="mt-6" />

            {(data.status === "expirado" || data.status === "cancelado") && (
              <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/5 px-5 py-4">
                <p className="text-sm font-bold">Precisa retomar este pedido?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Uma pessoa da nossa equipe resolve com você em poucos minutos — inclusive quando o
                  processo corre em segredo de justiça.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(
                      `Olá! Preciso de ajuda com o pedido ${data.protocolo}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
                  >
                    Falar no WhatsApp
                  </a>
                  <a
                    href={`mailto:${EMAIL_CONTATO}`}
                    className="inline-flex items-center justify-center rounded-full border border-input bg-card px-5 py-2.5 text-xs font-bold"
                  >
                    Enviar e-mail
                  </a>
                </div>
              </div>
            )}

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
                {data.certidoes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold">Processos deste pedido</p>
                    {data.certidoes.map((c, i) => (
                      <div key={i} className="rounded-xl bg-secondary px-4 py-3 text-sm">
                        <p className="font-semibold break-words">
                          {i + 1}. {c.numeroProcesso}
                        </p>
                        <p className="text-muted-foreground break-words">
                          {c.nomeParte} — CPF {c.cpf}
                        </p>
                        {c.observacoes && (
                          <p className="mt-1 text-xs text-muted-foreground break-words">
                            Observação: {c.observacoes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

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
                  <AlternativasContato className="mt-3" />
                </section>
              ) : (
              <section className="card-premium p-6 sm:p-8">
                <h2 className="text-lg font-bold">
                  Pagamento — {formatarBRL(data.valorCentavos)}
                </h2>

                {data.checkoutUrl ? (
                  <>
                    {data.pixCopiaECola ? (
                      <div className="mt-4 rounded-2xl border-2 border-accent/60 bg-accent/5 p-5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                            Recomendado
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Opção 1
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold">
                          Pague por Pix — {formatarBRL(data.valorCentavos)}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Escaneie o QR Code no app do seu banco ou use o código copia e cola.
                        </p>
                        <div className="mt-4 grid place-items-center rounded-2xl bg-card p-4">
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
                        <p className="mt-4 break-all rounded-xl bg-secondary px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
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
                        <p className="mt-3 text-xs text-muted-foreground">
                          Recebedor: {PIX.nome} — {PIX.cidade}.{" "}
                          {data.confirmacaoAutomatica
                            ? "A confirmação é automática: assim que o Pix cair, esta página muda para “Pagamento confirmado” em poucos segundos."
                            : "Após pagar, envie o comprovante pelo WhatsApp para que nossa equipe confirme o pedido."}
                        </p>
                        {!data.confirmacaoAutomatica && (
                          <a
                            href={whatsappLink(
                              `Olá! Realizei o pagamento por Pix do protocolo ${data.protocolo} (Certidão de Objeto e Pé). Segue o comprovante.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                          >
                            <MessageCircle className="h-4 w-4 text-accent" />
                            Enviar comprovante pelo WhatsApp
                          </a>
                        )}
                      </div>
                    ) : null}

                    <div className="mt-6 rounded-2xl border border-input p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Opção 2
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold">
                        Sem saldo no Pix agora? Pague com cartão
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cartão de crédito, Apple Pay ou Google Pay em ambiente seguro. A confirmação
                        é automática: assim que o pagamento for aprovado, esta página muda para
                        “Pagamento confirmado”.
                      </p>
                      <a
                        href={data.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Pagar com cartão com segurança
                      </a>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Você será levado ao ambiente de pagamento seguro. Em caso de dúvida, fale
                        com nossa equipe pelo WhatsApp.
                      </p>
                    </div>

                    <SelosPagamento className="mt-6" />


                    <a
                      href={whatsappLink(
                        `Olá! Preciso de ajuda com o pagamento do protocolo ${data.protocolo}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                    >
                      <MessageCircle className="h-4 w-4 text-accent" />
                      Falar pelo WhatsApp
                    </a>
                    <AlternativasContato className="mt-3" />
                  </>
                ) : (
                <>
                <div className="mt-4 rounded-2xl border-2 border-accent/60 bg-accent/5 p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                      Recomendado
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Opção 1
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold">
                    Pague por Pix — {formatarBRL(data.valorCentavos)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Escaneie o QR Code no app do seu banco ou use o código copia e cola.
                  </p>
                  <PassosPix
                    className="mt-4"
                    confirmacaoAutomatica={data.confirmacaoAutomatica}
                  />
                  <div className="mt-4 grid place-items-center rounded-2xl bg-card p-4">
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
                  <p className="mt-4 break-all rounded-xl bg-secondary px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    Recebedor: {PIX.nome} — {PIX.cidade}.{" "}
                    {data.confirmacaoAutomatica
                      ? "A confirmação é automática: assim que o Pix cair, esta página muda para “Pagamento confirmado” em poucos segundos."
                      : "Após pagar, envie o comprovante pelo WhatsApp para que nossa equipe confirme o pedido."}
                  </p>
                  {!data.confirmacaoAutomatica && (
                    <a
                      href={whatsappLink(
                        `Olá! Realizei o pagamento do protocolo ${data.protocolo} (Certidão de Objeto e Pé). Segue o comprovante.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                    >
                      <MessageCircle className="h-4 w-4 text-accent" />
                      Enviar comprovante pelo WhatsApp
                    </a>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-input p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Opção 2
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold">Prefere pagar com cartão?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pagamento com cartão indisponível no momento. Você pode tentar de novo ou
                    falar com a nossa equipe — resolvemos em minutos.
                  </p>
                  <button
                    type="button"
                    onClick={tentarNovamente}
                    disabled={gerando}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {gerando ? "Gerando link..." : "Tentar novamente"}
                  </button>
                  {falhouLink && (
                    <p className="mt-2 text-xs text-destructive">
                      Ainda não foi possível gerar o link. Use o Pix acima ou fale com a equipe.
                    </p>
                  )}
                </div>

                <SelosPagamento className="mt-6" />


                <a
                  href={whatsappLink(
                    `Olá! Preciso de ajuda com o pagamento do protocolo ${data.protocolo}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Falar pelo WhatsApp
                </a>
                <AlternativasContato className="mt-3" />
                </>
                )}
              </section>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}