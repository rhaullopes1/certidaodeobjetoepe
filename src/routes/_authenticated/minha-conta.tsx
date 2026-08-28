import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Check, Copy, FileText, Loader2, Scale } from "lucide-react";
import { meusPedidos, type PedidoDoCliente } from "@/lib/pedidos.functions";
import { formatarBRL, statusPedido } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  component: MinhaConta,
  head: () => ({
    meta: [
      { title: "Meus pedidos | Certidão de Objeto e Pé" },
      {
        name: "description",
        content:
          "Acompanhe seus pedidos de Certidão de Objeto e Pé, veja o status e pague os pedidos pendentes por Pix.",
      },
      { property: "og:title", content: "Meus pedidos | Certidão de Objeto e Pé" },
      {
        property: "og:description",
        content: "Histórico de pedidos, status e pagamento por Pix na sua conta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function dataBR(valor: string) {
  return new Date(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function BlocoPix({ pedido }: { pedido: PedidoDoCliente }) {
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(pedido.pixCopiaECola, { width: 480, margin: 1 })
      .then((url) => {
        if (ativo) setQr(url);
      })
      .catch(() => setQr(null));
    return () => {
      ativo = false;
    };
  }, [pedido.pixCopiaECola]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pedido.pixCopiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="mt-5 grid gap-5 rounded-2xl bg-secondary p-5 sm:grid-cols-[160px_1fr]">
      <div className="grid place-items-center rounded-xl bg-card p-3">
        {pedido.pixQrCodeUrl ?? qr ? (
          <img
            src={pedido.pixQrCodeUrl ?? qr ?? ""}
            alt={`QR Code Pix do pedido ${pedido.protocolo}`}
            className="h-32 w-32"
          />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Pix copia e cola
        </p>
        <p className="mt-2 break-all rounded-xl bg-card px-3 py-2 font-mono text-[11px] leading-relaxed">
          {pedido.pixCopiaECola}
        </p>
        <button
          type="button"
          onClick={copiar}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
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
        {pedido.pixExpiraEm && (
          <p className="mt-2 text-xs text-muted-foreground">
            Código válido até {dataBR(pedido.pixExpiraEm)}.
          </p>
        )}
      </div>
    </div>
  );
}

function MinhaConta() {
  const buscar = useServerFn(meusPedidos);
  const { data, isPending, isError } = useQuery({
    queryKey: ["meus-pedidos"],
    queryFn: () => buscar({}),
    refetchInterval: 30_000,
  });

  const pedidos = data ?? [];
  const pendentes = pedidos.filter((p) => p.status === "aguardando_pagamento");
  const outros = pedidos.filter((p) => p.status !== "aguardando_pagamento");

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
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Meus pedidos</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Acompanhe o andamento das suas certidões e pague os pedidos pendentes por Pix.
        </p>

        {isPending && (
          <p className="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando seus pedidos...
          </p>
        )}

        {isError && (
          <p className="mt-10 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            Não foi possível carregar seus pedidos agora. Recarregue a página.
          </p>
        )}

        {!isPending && !isError && pedidos.length === 0 && (
          <div className="card-premium mt-10 p-7 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não tem pedidos nesta conta.
            </p>
            <Link
              to="/solicitar"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Solicitar certidão
            </Link>
          </div>
        )}

        {pendentes.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold">Pendentes de pagamento</h2>
            <div className="mt-4 space-y-5">
              {pendentes.map((p) => (
                <article key={p.protocolo} className="card-premium p-6">
                  <CabecalhoPedido pedido={p} />
                  <BlocoPix pedido={p} />
                </article>
              ))}
            </div>
          </section>
        )}

        {outros.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold">Histórico de pedidos</h2>
            <div className="mt-4 space-y-4">
              {outros.map((p) => (
                <article key={p.protocolo} className="card-premium p-6">
                  <CabecalhoPedido pedido={p} />
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function CabecalhoPedido({ pedido }: { pedido: PedidoDoCliente }) {
  const status = statusPedido(pedido.status);
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Protocolo {pedido.protocolo}
        </p>
        <p className="mt-1 font-display text-lg font-bold">
          {pedido.quantidade} {pedido.quantidade === 1 ? "certidão" : "certidões"} ·{" "}
          {formatarBRL(pedido.valorCentavos)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Processo {pedido.numeroProcesso} · pedido em {dataBR(pedido.criadoEm)}
        </p>
      </div>
      <div className="text-right">
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold">
          {status.label}
        </span>
        <Link
          to="/pedido/$protocolo"
          params={{ protocolo: pedido.protocolo }}
          className="mt-3 flex items-center justify-end gap-2 text-xs font-semibold text-primary underline underline-offset-4"
        >
          <FileText className="h-4 w-4" /> Ver pedido e comprovante
        </Link>
      </div>
    </div>
  );
}
