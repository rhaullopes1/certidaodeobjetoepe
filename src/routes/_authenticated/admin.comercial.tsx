import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Flame, Loader2, MessageCircle } from "lucide-react";
import { AdminHeader, SemPermissao, BotaoDesconto } from "./admin.index";
import { souEquipe, type PedidoAdmin } from "@/lib/admin";
import { formatarBRL } from "@/lib/site";
import { FINALIDADES } from "@/lib/pedidos.schema";
import { normalizarWhatsapp, linkWhatsappRecuperacao } from "@/lib/whatsapp-cliente";
import { painelComercial } from "@/lib/comercial.functions";
import { funilDiario, metricasPorEtapa, ultimosDias, diaSP, etapaDe } from "@/lib/comercial";
import { scoreIntencao, type Faixa } from "@/lib/score-intencao";

export const Route = createFileRoute("/_authenticated/admin/comercial")({
  component: Comercial,
  head: () => ({
    meta: [
      { title: "Centro de Comando Comercial | Certidão Objeto e Pé" },
      { name: "description", content: "Faturamento diário, funil, recuperação e fila priorizada de pedidos não pagos." },
      { property: "og:title", content: "Centro de Comando Comercial | Certidão Objeto e Pé" },
      { property: "og:description", content: "Painel interno comercial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const META_DIA = 100000; // centavos (R$ 1.000)
const COR_FAIXA: Record<Faixa, string> = {
  quente: "bg-destructive text-destructive-foreground",
  morno: "bg-gold text-navy-deep",
  frio: "bg-muted text-muted-foreground",
};

function idade(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} dias`;
}

function Card({ r, v, s, tom }: { r: string; v: string; s?: string; tom?: "ok" | "mal" }) {
  return (
    <div className="card-premium min-w-0 p-3 sm:p-4">
      <p className="truncate text-[11px] font-semibold uppercase text-muted-foreground">{r}</p>
      <p className={`mt-1 truncate text-lg font-bold sm:text-2xl ${tom === "ok" ? "text-live" : tom === "mal" ? "text-destructive" : ""}`}>{v}</p>
      {s && <p className="mt-0.5 truncate text-xs text-muted-foreground">{s}</p>}
    </div>
  );
}

function Comercial() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const carregar = useServerFn(painelComercial);
  const q = useQuery({ queryKey: ["admin-comercial"], queryFn: () => carregar(), enabled: permissao.data === true });
  const [faixa, setFaixa] = useState<"todas" | Faixa>("todas");

  const d = useMemo(() => {
    if (!q.data) return null;
    const { pedidos, recuperacao } = q.data;
    const dias = ultimosDias(7);
    const funil = funilDiario(pedidos, dias);
    const hoje = funil[funil.length - 1];
    const sem = funil.reduce(
      (s, x) => ({ criados: s.criados + x.criados, ini: s.ini + x.pagamentoIniciado, pagos: s.pagos + x.pagos, receita: s.receita + x.receita }),
      { criados: 0, ini: 0, pagos: 0, receita: 0 },
    );
    const rec = metricasPorEtapa(recuperacao);
    const etapaPorPedido = new Map(recuperacao.map((r) => [r.pedido_id, { etapa: etapaDe(r), status: r.status_automacao }]));

    const aguardando = pedidos.filter((p) => !p.pago_em && p.status === "aguardando_pagamento");
    const abandonados = pedidos.filter((p) => !p.pago_em && ["cancelado", "expirado"].includes(p.status) && Date.now() - new Date(p.created_at).getTime() < 15 * 86400000);
    const fila = [...aguardando, ...abandonados]
      .map((p) => ({ p, s: scoreIntencao({ ...p, whatsappValido: normalizarWhatsapp(p.whatsapp) !== null }), auto: etapaPorPedido.get(p.id) }))
      .sort((a, b) => b.s.score - a.s.score || b.p.created_at.localeCompare(a.p.created_at));
    return {
      funil, hoje, sem, rec, fila,
      aguardandoValor: aguardando.reduce((s, p) => s + p.valor_centavos, 0),
      aguardandoQtd: aguardando.length,
      abandonadosQtd: abandonados.length,
      hojeStr: diaSP(new Date().toISOString()),
    };
  }, [q.data]);

  const fila = d ? (faixa === "todas" ? d.fila : d.fila.filter((x) => x.s.faixa === faixa)) : [];

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-3 py-6 sm:px-8 sm:py-8">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Centro de Comando Comercial</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Últimos 7 dias · horário de Brasília · meta {formatarBRL(META_DIA)}/dia</p>
        </div>

        {permissao.data === false && <SemPermissao />}
        {(permissao.isPending || q.isPending) && permissao.data !== false && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</p>
        )}
        {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}

        {d && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              <Card r="Receita hoje" v={formatarBRL(d.hoje.receita)} s={`${d.hoje.pagos} pagos · meta ${formatarBRL(META_DIA)}`} tom={d.hoje.receita >= META_DIA ? "ok" : undefined} />
              <Card r="Receita 7 dias" v={formatarBRL(d.sem.receita)} s={`${d.sem.pagos} pagos · média ${formatarBRL(Math.round(d.sem.receita / 7))}/dia`} />
              <Card r="Aguardando pagamento" v={String(d.aguardandoQtd)} s={formatarBRL(d.aguardandoValor)} tom="mal" />
              <Card r="Abandonados (15 dias)" v={String(d.abandonadosQtd)} s="cancelados/expirados sem pagar" />
              <Card r="Recuperados" v={String(d.rec.recuperados)} s={formatarBRL(d.rec.valorRecuperado)} tom="ok" />
              <Card r="Taxa de recuperação" v={`${d.rec.taxaRecuperacao}%`} s="recuperados ÷ total na régua" />
              <Card r="Em recuperação" v={formatarBRL(d.rec.valorEmRecuperacao)} s={`${d.rec.emAndamento} pedidos na régua`} />
              <Card r="Conversão 7 dias" v={d.sem.criados ? `${((d.sem.pagos / d.sem.criados) * 100).toFixed(1)}%` : "—"} s={`${d.sem.pagos} pagos / ${d.sem.criados} pedidos`} />
            </div>

            <section className="card-premium p-3 sm:p-5">
              <h2 className="font-semibold">Funil diário</h2>
              <p className="text-xs text-muted-foreground">
                Pedido criado → cobrança gerada (Pix/cartão) → pago. Hoje o Pix é gerado automaticamente ao abrir o pedido, então essa coluna quase igual a "Pedidos" é normal. Cópias do Pix e cliques no cartão agora são medidos no Google (add_payment_info). Cliques em anúncios ficam no Google Ads.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="py-2">Dia</th><th>Pedidos</th><th>Pix/cartão gerado</th><th>Pagos</th><th>Receita</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[...d.funil].reverse().map((x) => (
                      <tr key={x.dia}>
                        <td className="py-1.5">{x.dia.slice(8)}/{x.dia.slice(5, 7)}{x.dia === d.hojeStr ? " (hoje)" : ""}</td>
                        <td>{x.criados}</td>
                        <td>{x.pagamentoIniciado}</td>
                        <td>{x.pagos}</td>
                        <td className={x.receita >= META_DIA ? "font-semibold text-live" : ""}>{formatarBRL(x.receita)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card-premium p-3 sm:p-5">
              <h2 className="font-semibold">Recuperação por etapa e resultado</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {d.rec.etapas.map((e) => (
                  <div key={e.etapa} className="rounded-xl bg-secondary/60 p-3 text-xs">
                    <p className="font-semibold">{e.etapa === 0 ? "Antes da etapa 1" : `Até a etapa ${e.etapa}`}</p>
                    <p className="mt-1">Em andamento: <b>{e.emAndamento}</b></p>
                    <p>Recuperados: <b className="text-live">{e.recuperados}</b></p>
                    <p>Encerrados: <b>{e.encerrados}</b></p>
                    <p className="mt-1 text-muted-foreground">Recuperado {formatarBRL(e.valorRecuperado)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-auto flex items-center gap-2 font-semibold"><Flame className="h-4 w-4 text-destructive" /> Fila de recuperação ({fila.length})</h2>
                {(["todas", "quente", "morno", "frio"] as const).map((f) => (
                  <button key={f} onClick={() => setFaixa(f)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${faixa === f ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Ordenada pelo score de intenção (sinais do pedido: idade, Pix gerado, cartão recusado, link reaberto, finalidade, quantidade, oferta ativa).
              </p>
              {fila.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido nesta faixa.</p>}
              {fila.slice(0, 150).map(({ p, s, auto }) => {
                const wa = linkWhatsappRecuperacao({
                  nome_parte: p.nome_parte,
                  protocolo: p.protocolo,
                  valorFormatado: formatarBRL(p.valor_centavos),
                  linkPagamento: `https://certidaodeobjetoepe.org/pedido/${encodeURIComponent(p.protocolo)}`,
                  whatsapp: p.whatsapp,
                });
                return (
                  <div key={p.id} className="card-premium flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:p-4">
                    <div className="flex items-center gap-3 sm:w-24">
                      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${COR_FAIXA[s.faixa]}`}>{s.score}</span>
                      <span className="text-xs font-semibold capitalize sm:hidden">{s.faixa}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.nome_parte || "Sem nome"} · {formatarBRL(p.valor_centavos)}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.protocolo} · há {idade(p.created_at)} · {p.status === "aguardando_pagamento" ? "aguardando" : p.status}
                        {" · "}{auto ? (auto.etapa ? `e-mail etapa ${auto.etapa}` : "régua: aguardando etapa 1") : "fora da régua"}
                        {p.finalidade && p.finalidade in FINALIDADES ? ` · ${FINALIDADES[p.finalidade as keyof typeof FINALIDADES]}` : ""}
                      </p>
                      {s.motivos.length > 0 && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.motivos.join(" · ")}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/admin/$protocolo" params={{ protocolo: p.protocolo }} className="inline-flex min-h-10 items-center rounded-full border border-input bg-card px-4 text-xs font-semibold">
                        Abrir
                      </Link>
                      {wa ? (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-live/15 px-4 text-xs font-semibold text-live">
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem WhatsApp</span>
                      )}
                      <BotaoDesconto pedido={p as unknown as PedidoAdmin} />
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
