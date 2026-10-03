import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Paperclip,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  emissaoDoPedido,
  listarPedidosAntecedentes,
  ROTULO_EMISSAO,
  type PedidoAntecedentesAdmin,
} from "@/lib/antecedentes.admin";
import {
  anexarPdfAntecedentes,
  dispararEmissaoAntecedentes,
  reenviarEmailAntecedentes,
} from "@/lib/antecedentes.admin.functions";
import { enviarAnexo, listarAnexos, abrirAnexo, souEquipe } from "@/lib/admin";
import { abrirEmNovaAba } from "@/lib/abrir-em-nova-aba";
import { formatarBRL, statusPedido } from "@/lib/site";
import { BotaoWhatsAppCliente } from "@/components/admin/botao-whatsapp";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/antecedentes")({
  component: AdminAntecedentes,
  head: () => ({
    meta: [
      { title: "Antecedentes criminais | Painel Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Pedidos de Certidão de Antecedentes Criminais Federal e entrega do PDF.",
      },
      { property: "og:title", content: "Antecedentes criminais | Painel" },
      { property: "og:description", content: "Controle das emissões de antecedentes criminais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function dataBR(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function AdminAntecedentes() {
  const permissao = useQuery({ queryKey: ["sou-equipe"], queryFn: souEquipe });
  const [busca, setBusca] = useState("");

  const pedidos = useQuery({
    queryKey: ["admin-antecedentes", busca],
    queryFn: () => listarPedidosAntecedentes(busca),
    enabled: permissao.data === true,
  });

  if (permissao.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (permissao.data !== true) return <SemPermissao />;

  const lista = pedidos.data ?? [];
  const emitidas = lista.filter((p) => emissaoDoPedido(p)?.status === "emitida").length;
  const pendentes = lista.filter(
    (p) => (p.status === "pago" || p.status === "emitido") && emissaoDoPedido(p)?.status !== "emitida",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold">Antecedentes criminais</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pedidos da Certidão de Antecedentes Criminais Federal (Polícia Federal), com o PDF
            emitido e o envio ao cliente.
          </p>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Cartao titulo="Pedidos" valor={String(lista.length)} />
          <Cartao titulo="Certidões emitidas" valor={String(emitidas)} />
          <Cartao titulo="Pagos sem certidão" valor={String(pendentes)} />
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por protocolo, nome, e-mail ou CPF"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {pedidos.isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum pedido de antecedentes criminais encontrado.
          </p>
        ) : (
          <div className="space-y-4">
            {lista.map((p) => (
              <CartaoPedido key={p.id} pedido={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Cartao({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-display text-2xl font-bold">{valor}</p>
    </div>
  );
}

function CartaoPedido({ pedido }: { pedido: PedidoAntecedentesAdmin }) {
  const queryClient = useQueryClient();
  const emissao = emissaoDoPedido(pedido);
  const rotulo = emissao ? ROTULO_EMISSAO[emissao.status] : null;
  const [aviso, setAviso] = useState<string | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const anexos = useQuery({
    queryKey: ["anexos-antecedentes", pedido.id],
    queryFn: () => listarAnexos(pedido.id),
  });
  const certidaoAnexada = (anexos.data ?? []).find((a) => a.tipo === "certidao") ?? null;

  const emitir = useServerFn(dispararEmissaoAntecedentes);
  const anexarPdf = useServerFn(anexarPdfAntecedentes);
  const reenviar = useServerFn(reenviarEmailAntecedentes);

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["admin-antecedentes"] });
    queryClient.invalidateQueries({ queryKey: ["anexos-antecedentes", pedido.id] });
  }

  const mEmitir = useMutation({
    mutationFn: () => emitir({ data: { pedidoId: pedido.id } }),
    onSuccess: (r) => {
      setAviso(
        r.acao === "emitida"
          ? "Certidão emitida e entrega processada."
          : r.acao === "falhou"
            ? `Não foi possível emitir: ${r.erro}`
            : `Nada a fazer agora (${r.motivo}).`,
      );
      recarregar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const mAnexar = useMutation({
    mutationFn: () => anexarPdf({ data: { pedidoId: pedido.id } }),
    onSuccess: () => {
      setAviso("PDF anexado ao pedido.");
      recarregar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const mReenviar = useMutation({
    mutationFn: () => reenviar({ data: { pedidoId: pedido.id } }),
    onSuccess: () => {
      setAviso("E-mail da certidão reenviado ao cliente.");
      recarregar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const mUpload = useMutation({
    mutationFn: (arquivo: File) =>
      enviarAnexo({ pedidoId: pedido.id, protocolo: pedido.protocolo, tipo: "certidao", arquivo }),
    onSuccess: () => {
      setAviso("PDF anexado ao pedido.");
      recarregar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  async function abrirAnexado() {
    if (!certidaoAnexada) return;
    try {
      const caminho = certidaoAnexada.caminho;
      await abrirEmNovaAba(() => abrirAnexo(caminho));
    } catch {
      setAviso("Não foi possível abrir o documento.");
    }
  }

  const ocupado =
    mEmitir.isPending || mAnexar.isPending || mReenviar.isPending || mUpload.isPending;
  const botao =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60";

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-bold">{pedido.nome_parte ?? "Sem nome"}</p>
          <p className="text-xs text-muted-foreground">
            {pedido.protocolo} · CPF {pedido.cpf} · {dataBR(pedido.created_at)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pedido.email} · {pedido.whatsapp}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
            {statusPedido(pedido.status).label}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatarBRL(pedido.valor_centavos)}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-secondary/40 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${rotulo?.cor ?? "bg-secondary text-foreground"}`}
          >
            {rotulo?.texto ?? "Emissão ainda não iniciada"}
          </span>
          {emissao?.negativa ? (
            <span className="inline-flex items-center gap-1 text-xs text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" /> Nada consta
            </span>
          ) : null}
        </div>

        {emissao ? (
          <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
            <div>Número: <strong className="text-foreground">{emissao.certidao_numero ?? "—"}</strong></div>
            <div>Validade: <strong className="text-foreground">{emissao.validade_data ?? "—"}</strong></div>
            <div>Emitida em: <strong className="text-foreground">{emissao.emissao_datahora ?? "—"}</strong></div>
            <div>Tentativas: <strong className="text-foreground">{emissao.tentativas}</strong></div>
            <div>
              E-mail ao cliente:{" "}
              <strong className="text-foreground">
                {emissao.email_enviado_em ? dataBR(emissao.email_enviado_em) : "ainda não enviado"}
              </strong>
            </div>
            <div>
              WhatsApp automático:{" "}
              <strong className="text-foreground">
                {emissao.whatsapp_enviado_em ? dataBR(emissao.whatsapp_enviado_em) : "envio manual"}
              </strong>
            </div>
          </dl>
        ) : null}

        {emissao?.erro ? (
          <p className="mt-3 flex items-start gap-2 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {emissao.erro}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {emissao?.site_receipt ? (
          <a
            href={emissao.site_receipt}
            target="_blank"
            rel="noopener noreferrer"
            className={`${botao} bg-primary text-primary-foreground hover:bg-primary/90`}
          >
            <FileText className="h-4 w-4" /> Abrir PDF emitido
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        ) : null}

        {emissao?.site_receipt && !certidaoAnexada ? (
          <button
            type="button"
            onClick={() => mAnexar.mutate()}
            disabled={ocupado}
            className={`${botao} bg-secondary text-foreground hover:bg-secondary/70`}
          >
            {mAnexar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
            Anexar PDF ao pedido
          </button>
        ) : null}

        {certidaoAnexada ? (
          <button
            type="button"
            onClick={abrirAnexado}
            className={`${botao} bg-secondary text-foreground hover:bg-secondary/70`}
          >
            <Paperclip className="h-4 w-4" /> Documento anexado
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => inputArquivo.current?.click()}
              disabled={ocupado}
              className={`${botao} bg-secondary text-foreground hover:bg-secondary/70`}
            >
              {mUpload.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              Anexar PDF do computador
            </button>
            <input
              ref={inputArquivo}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                e.target.value = "";
                if (arquivo) mUpload.mutate(arquivo);
              }}
            />
          </>
        )}

        <button
          type="button"
          onClick={() => mEmitir.mutate()}
          disabled={ocupado}
          className={`${botao} bg-secondary text-foreground hover:bg-secondary/70`}
        >
          {mEmitir.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {emissao?.status === "emitida" ? "Reprocessar entrega" : "Emitir agora"}
        </button>

        {emissao?.status === "emitida" ? (
          <button
            type="button"
            onClick={() => mReenviar.mutate()}
            disabled={ocupado}
            className={`${botao} bg-secondary text-foreground hover:bg-secondary/70`}
          >
            {mReenviar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Reenviar e-mail
          </button>
        ) : null}

        <BotaoWhatsAppCliente
          pedido={{
            id: pedido.id,
            protocolo: pedido.protocolo,
            nome_parte: pedido.nome_parte,
            whatsapp: pedido.whatsapp,
            status: pedido.status,
          }}
          destaque={emissao?.status === "emitida"}
        />

        <Link
          to="/admin/$protocolo"
          params={{ protocolo: pedido.protocolo }}
          className={`${botao} bg-secondary text-foreground hover:bg-secondary/70`}
        >
          Abrir pedido
        </Link>
      </div>

      {aviso ? <p className="mt-3 text-xs text-muted-foreground">{aviso}</p> : null}
    </article>
  );
}
