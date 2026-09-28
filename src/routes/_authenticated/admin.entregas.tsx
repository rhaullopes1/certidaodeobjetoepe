import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, MessageCircle, PackageCheck } from "lucide-react";
import { badgeConfianca, resumoLocalizacao } from "@/lib/localizacao";
import { useServerFn } from "@tanstack/react-start";
import { reidentificarLote } from "@/lib/localizacao.functions";

const SELO = {
  confirmado: { t: "Localização confirmada", c: "bg-accent/15 text-accent" },
  parcial: { t: "Localização parcial", c: "bg-secondary text-foreground" },
  nao_identificado: { t: "Localização não identificada", c: "bg-destructive/10 text-destructive" },
} as const;
import {
  concluirEntrega,
  dadosCanaisFila,
  definirEtapaEntrega,
  etapaAtualEntrega,
  ETAPAS_ENTREGA,
  listarEntregasPendentes,
  souEquipe,
  type ComarcaContato,
  type EtapaEntrega,
  type PedidoAdmin,
} from "@/lib/admin";

import { escolherUnidade } from "@/lib/localizacao";
import { resolverCanalSolicitacao } from "@/lib/canal-solicitacao";
import { OndeSolicitarResumo } from "@/components/admin/onde-solicitar";
import { formatarBRL, statusPedido } from "@/lib/site";
import { linkWhatsappCliente, normalizarWhatsapp } from "@/lib/whatsapp-cliente";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/entregas")({
  component: AdminEntregas,
  head: () => ({
    meta: [
      { title: "Entregas pendentes | Painel Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Fila de pedidos pagos aguardando a entrega da certidão.",
      },
      { property: "og:title", content: "Entregas pendentes | Painel Certidão Objeto e Pé" },
      { property: "og:description", content: "Controle das entregas de certidões vendidas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/** Texto amigável do tempo decorrido desde o pagamento. */
function tempoDesde(iso: string | null): string {
  if (!iso) return "sem data de pagamento";
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} dia${dias > 1 ? "s" : ""}`;
}

function BotaoWhatsApp({ pedido }: { pedido: PedidoAdmin }) {
  const link = linkWhatsappCliente({
    protocolo: pedido.protocolo,
    nome_parte: pedido.nome_parte,
    whatsapp: pedido.whatsapp,
    status: pedido.status,
  });
  const numeroOk = normalizarWhatsapp(pedido.whatsapp) !== null;
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors";

  if (!numeroOk || !link) {
    return (
      <span
        className={`${base} bg-secondary/60 text-muted-foreground/50`}
        title="Número de WhatsApp não disponível para este pedido"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp indisponível
      </span>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-secondary text-foreground hover:bg-secondary/70`}
    >
      <MessageCircle className="h-4 w-4" /> WhatsApp
    </a>
  );
}

function AdminEntregas() {
  const queryClient = useQueryClient();
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const [erro, setErro] = useState<string | null>(null);

  const entregas = useQuery({
    queryKey: ["admin-entregas"],
    queryFn: listarEntregasPendentes,
    enabled: permissao.data === true,
  });

  const concluir = useMutation({
    mutationFn: (pedidoId: string) => concluirEntrega(pedidoId),
    onSuccess: () => {
      setErro(null);
      queryClient.invalidateQueries({ queryKey: ["admin-entregas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-entregas-total"] });
    },
    onError: (e) =>
      setErro(e instanceof Error ? e.message : "Não foi possível concluir a entrega."),
  });

  const mudarEtapa = useMutation({
    mutationFn: (v: { pedidoId: string; etapa: EtapaEntrega }) =>
      definirEtapaEntrega(v.pedidoId, v.etapa),
    onSuccess: () => {
      setErro(null);
      queryClient.invalidateQueries({ queryKey: ["admin-entregas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-entregas-total"] });
    },
    onError: (e) =>
      setErro(e instanceof Error ? e.message : "Não foi possível atualizar a situação do pedido."),
  });



  const lote = useServerFn(reidentificarLote);
  const [msgLote, setMsgLote] = useState<string | null>(null);
  const reidentificar = useMutation({
    mutationFn: (modo: "sem_localizacao" | "pendentes" | "todos") => lote({ data: { modo } }),
    onSuccess: (r) => {
      setMsgLote(
        `${r.processados} processados · ${r.atualizados} atualizados · ganharam tribunal ${r.ganharamTribunal}, comarca ${r.ganharamComarca}, foro ${r.ganharamForo}, sistema ${r.ganharamSistema} · ${r.confirmados} confirmados, ${r.parciais} parciais, ${r.naoIdentificados} não identificados · ${r.invalidos} sem número CNJ válido.${r.listaParciais.length ? ` Continuam parciais: ${r.listaParciais.join(", ")}.` : ""}`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-entregas"] });
    },
    onError: (e) => setMsgLote(e instanceof Error ? e.message : "Falha na reidentificação."),
  });

  const lista = entregas.data ?? [];
  const total = lista.length;
  const siglas = [...new Set(lista.map((p) => p.tribunal_sigla ?? "").filter(Boolean))].sort();
  const canaisFila = useQuery({
    queryKey: ["admin-canais-fila", siglas.join(",")],
    queryFn: () => dadosCanaisFila(siglas),
    enabled: permissao.data === true && entregas.isSuccess,
  });
  const canalDe = (p: PedidoAdmin) => {
    const d = canaisFila.data!;
    const escolha = escolherUnidade<ComarcaContato>(d.unidades, {
      tribunal: p.tribunal_sigla ?? null,
      codigoOrigem: p.codigo_origem_cnj ?? null,
      comarca: p.comarca_processo ?? null,
      foro: p.foro ?? null,
      vara: p.vara ?? null,
    });
    const trib = d.tribunais.find((t) => t.sigla === p.tribunal_sigla) ?? null;
    return resolverCanalSolicitacao(escolha, trib);
  };
  const faturamento = lista.reduce((soma, p) => soma + (p.valor_centavos ?? 0), 0);

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
          <PackageCheck className="h-6 w-6 text-accent" /> Entregas pendentes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos já pagos aguardando a entrega da certidão, em ordem fixa de chegada,
          do mais recente para o mais antigo. A posição não muda quando você altera a
          situação. Ao entregar, clique em
          “Concluir entrega” para encerrar o pedido.
        </p>

        {permissao.isPending && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando acesso...
          </p>
        )}

        {permissao.data === false && (
          <div className="mt-8">
            <SemPermissao />
          </div>
        )}

        {permissao.data === true && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Aguardando entrega
                </p>
                <p className="mt-1 font-display text-3xl font-bold">{total}</p>
              </div>
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Valor já recebido nesta fila
                </p>
                <p className="mt-1 font-display text-3xl font-bold">{formatarBRL(faturamento)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Reidentificar pela tabela CNJ os pedidos ainda não confirmados? Não há consultas externas e dados confirmados são preservados.")) reidentificar.mutate("pendentes");
                }}
                disabled={reidentificar.isPending}
                className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {reidentificar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Reidentificar pedidos pendentes
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Recalcular a localização de todos os pedidos pela tabela CNJ? Dados confirmados (vara/DataJud) são preservados.")) reidentificar.mutate("todos");
                }}
                disabled={reidentificar.isPending}
                className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-60"
              >
                Recalcular todos os pedidos
              </button>
              <span className="text-xs text-muted-foreground">
                Usa só a tabela interna; não consulta serviços externos nem apaga vara já confirmada.
              </span>
            </div>
            {msgLote && <p className="mt-2 text-sm text-muted-foreground">{msgLote}</p>}

            {erro && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            )}

            {entregas.isPending && (
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando entregas...
              </p>
            )}

            {entregas.data && total === 0 && (
              <div className="card-premium mt-8 p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-accent" />
                <p className="mt-3 text-sm font-semibold">Nenhuma entrega pendente.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Todas as certidões pagas já foram entregues aos clientes.
                </p>
              </div>
            )}

            {total > 0 && (
              <ul className="mt-8 grid gap-4">
                {lista.map((p, i) => (
                  <li key={p.id} className="card-premium p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent/15 px-2 text-xs font-bold text-accent">
                            {i + 1}
                          </span>
                          <Link
                            to="/admin/$protocolo"
                            params={{ protocolo: p.protocolo }}
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            {p.protocolo}
                          </Link>
                          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {statusPedido(p.status).label}
                          </span>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${SELO[badgeConfianca(p)].c}`}>
                            {SELO[badgeConfianca(p)].t}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold">{p.nome_parte ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          Processo {p.numero_processo}
                          {p.uf ? ` · ${p.cidade ? `${p.cidade}/` : ""}${p.uf}` : ""}
                        </p>
                        {resumoLocalizacao(p) && (
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-accent" />
                            {resumoLocalizacao(p)}
                          </p>
                        )}
                        <Link
                          to="/admin/$protocolo"
                          params={{ protocolo: p.protocolo }}
                          hash="localizacao"
                          className="mt-1 inline-block text-xs font-semibold text-accent underline-offset-4 hover:underline"
                        >
                          Localização e canal de solicitação →
                        </Link>
                        {canaisFila.data && <OndeSolicitarResumo c={canalDe(p)} />}
                        <p className="mt-1 text-sm text-muted-foreground">
                          {p.quantidade} certidão(ões) · {formatarBRL(p.valor_centavos)} · Pago{" "}
                          {p.pago_em
                            ? `em ${new Date(p.pago_em).toLocaleString("pt-BR")} (${tempoDesde(p.pago_em)})`
                            : "— sem data registrada"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Posição {i + 1} na fila · chegada em{" "}
                          {new Date(p.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <BotaoWhatsApp pedido={p} />
                        <button
                          type="button"
                          onClick={() => concluir.mutate(p.id)}
                          disabled={concluir.isPending && concluir.variables === p.id}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                          {concluir.isPending && concluir.variables === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Concluir entrega
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Situação da certidão
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ETAPAS_ENTREGA.map((etapa) => {
                          const ativa = etapaAtualEntrega(p.status) === etapa.valor;
                          const carregando =
                            mudarEtapa.isPending &&
                            mudarEtapa.variables?.pedidoId === p.id &&
                            mudarEtapa.variables?.etapa === etapa.valor;
                          return (
                            <button
                              key={etapa.valor}
                              type="button"
                              aria-pressed={ativa}
                              disabled={ativa || mudarEtapa.isPending}
                              onClick={() =>
                                mudarEtapa.mutate({ pedidoId: p.id, etapa: etapa.valor })
                              }
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-80 ${
                                ativa
                                  ? "bg-accent text-accent-foreground ring-2 ring-accent/40"
                                  : "border border-input bg-background hover:bg-secondary"
                              }`}
                            >
                              {carregando ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : ativa ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : null}
                              {etapa.rotulo}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
