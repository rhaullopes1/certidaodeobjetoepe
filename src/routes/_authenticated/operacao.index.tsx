import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AlertTriangle, Clock, FileText, Loader2, MapPin, Search } from "lucide-react";
import { minhaFilaOperacao } from "@/lib/operacao.functions";
import {
  MAX_PDFS_OPERADOR, diasDesde, duracao, mediana, nivelIdade, ordenarFilaOperador, precisaAtencao,
  proximaAcaoOperador, rotuloEtapa, rotuloPendencia, type NivelIdade,
} from "@/lib/papeis";
import { LuzesUrgencia } from "@/components/admin/luzes-urgencia";
import { FINALIDADES } from "@/lib/pedidos.schema";

export const Route = createFileRoute("/_authenticated/operacao/")({
  component: Fila,
});

type Filtro = "todas" | "prioridade" | "em_andamento" | "aguardando_tribunal" | "pendencias" | "concluidas";
const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "prioridade", rotulo: "Prioridade" },
  { valor: "em_andamento", rotulo: "Em andamento" },
  { valor: "aguardando_tribunal", rotulo: "Aguardando tribunal" },
  { valor: "pendencias", rotulo: "Pendências" },
  { valor: "concluidas", rotulo: "Concluídas" },
];

const IDADE: Record<NivelIdade, { classe: string; rotulo: string }> = {
  normal: { classe: "border-border bg-secondary text-foreground", rotulo: "No prazo" },
  atencao: { classe: "border-gold bg-gold/20 text-foreground", rotulo: "Atenção" },
  critica: { classe: "border-destructive bg-destructive text-destructive-foreground", rotulo: "Crítica" },
};

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Fila() {
  const fn = useServerFn(minhaFilaOperacao);
  const q = useQuery({ queryKey: ["operacao", "fila"], queryFn: () => fn() });
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const lista = q.data ?? [];

  const ind = useMemo(() => {
    const abertas = lista.filter((t) => t.status_operacao !== "concluido");
    const tempos = lista
      .filter((t) => t.concluido_em)
      .map((t) => (new Date(t.concluido_em!).getTime() - new Date(t.atribuido_em).getTime()) / 3_600_000);
    const med = mediana(tempos);
    return {
      abertas: abertas.length,
      andamento: lista.filter((t) => t.status_operacao === "em_andamento").length,
      tribunal: lista.filter((t) => t.status_operacao === "aguardando_tribunal").length,
      pendencias: lista.filter((t) => t.pendencia_motivo && t.status_operacao !== "concluido").length,
      concluidas: lista.filter((t) => t.status_operacao === "concluido").length,
      tempo: med === null ? null : duracao(new Date(0).toISOString(), new Date(med * 3_600_000).toISOString()),
    };
  }, [lista]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrada = lista.filter((t) => {
      if (termo && ![t.protocolo, t.numero_processo, t.nome_parte].some((v) => v?.toLowerCase().includes(termo))) return false;
      switch (filtro) {
        case "prioridade": return precisaAtencao(t);
        case "em_andamento": return t.status_operacao === "em_andamento";
        case "aguardando_tribunal": return t.status_operacao === "aguardando_tribunal";
        case "pendencias": return Boolean(t.pendencia_motivo) && t.status_operacao !== "concluido";
        case "concluidas": return t.status_operacao === "concluido";
        default: return true;
      }
    });
    return ordenarFilaOperador(filtrada);
  }, [lista, busca, filtro]);

  const cards: { rotulo: string; valor: string | number }[] = [
    { rotulo: "Em aberto", valor: ind.abertas },
    { rotulo: "Em andamento", valor: ind.andamento },
    { rotulo: "Aguard. tribunal", valor: ind.tribunal },
    { rotulo: "Pendências", valor: ind.pendencias },
    { rotulo: "Concluídas", valor: ind.concluidas },
    { rotulo: "Tempo mediano", valor: ind.tempo ?? "—" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-gold">Cockpit jurídico</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{saudacao()}, equipe Efficiency.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe prioridades, pendências e documentos da sua operação.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.rotulo} className="min-w-0 rounded-lg border border-border bg-card p-3">
            <p className="truncate text-[10px] font-semibold uppercase text-muted-foreground">{c.rotulo}</p>
            <p className="mt-1 truncate text-2xl font-bold text-foreground">{q.isPending ? "…" : c.valor}</p>
          </div>
        ))}
      </div>

      <label className="relative block">
        <span className="sr-only">Buscar operação</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar protocolo, processo ou parte"
        className="w-full rounded-lg border border-input bg-card py-3 pl-9 pr-3 text-sm"
        />
      </label>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filtros">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            role="tab"
            aria-selected={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filtro === f.valor ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {q.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
      {!q.isPending && visiveis.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {lista.length === 0 ? "Nenhuma certidão atribuída a você no momento." : "Nenhuma operação neste filtro."}
        </p>
      )}

      <ul className="space-y-3">
        {visiveis.map((t) => {
          const dias = diasDesde(t.atribuido_em);
          const idade = IDADE[nivelIdade(dias)];
          const concluida = t.status_operacao === "concluido";
          const acao = proximaAcaoOperador(t);
          return (
            <li key={t.atribuicao_id} className={`rounded-lg border bg-card p-4 sm:p-5 ${t.pendencia_motivo && !concluida ? "border-destructive border-2" : "border-border"}`}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/15 px-2 text-xs font-bold text-primary"
                  title={t.fila_numero != null ? `Nº ${t.fila_numero} da fila` : "Sem número de fila"}
                >
                  {t.fila_numero != null ? `#${t.fila_numero}` : "—"}
                </span>
                <LuzesUrgencia pagoEm={t.pago_em} className="rounded-full bg-background/85 px-2 py-1 ring-1 ring-border" />
                {t.finalidade && t.finalidade in FINALIDADES && (
                  <span className="inline-flex rounded-full border border-primary/40 px-2 py-0.5 text-xs font-semibold text-primary">
                    {FINALIDADES[t.finalidade as keyof typeof FINALIDADES]}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-bold">{t.protocolo}</p>
                  <p className="truncate text-sm">{t.numero_processo}</p>
                  <p className="truncate text-sm text-muted-foreground">{t.nome_parte ?? "Parte não informada"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {rotuloEtapa(t.status_operacao)}
                </span>
              </div>

              <p className="mt-2 flex min-w-0 items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 break-words">
                  {[t.tribunal_sigla, t.comarca_processo ?? t.cidade_processo, t.vara, t.uf_processo].filter(Boolean).join(" · ") || "Local não identificado"}
                </span>
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {!concluida && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${idade.classe}`}>
                    <Clock className="h-3.5 w-3.5" /> {dias === 0 ? "Hoje" : `${dias} dia(s)`} · {idade.rotulo}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                  <FileText className="h-3.5 w-3.5" /> {t.pdfs ?? 0}/{MAX_PDFS_OPERADOR} PDFs
                </span>
                {t.pendencia_motivo && !concluida && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 font-semibold text-destructive-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" /> Pendência: {rotuloPendencia(t.pendencia_motivo)}
                  </span>
                )}
              </div>

              <Link
                to="/operacao/$id"
                params={{ id: t.atribuicao_id }}
                className={`mt-3 block rounded-lg px-3 py-2.5 text-center text-sm font-semibold ${
                  concluida ? "border border-border bg-secondary text-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {concluida ? "Ver operação · Aguardando validação" : `Próxima ação: ${acao}`}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
