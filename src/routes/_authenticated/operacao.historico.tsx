import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { meuHistoricoOperacao } from "@/lib/operacao.functions";
import { duracao, mediana } from "@/lib/papeis";

export const Route = createFileRoute("/_authenticated/operacao/historico")({
  component: Historico,
});

const data = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
type Periodo = "7" | "30" | "90" | "todos";
type Situacao = "todas" | "validada" | "devolvida";

function Historico() {
  const fn = useServerFn(meuHistoricoOperacao);
  const q = useQuery({ queryKey: ["operacao", "historico"], queryFn: () => fn() });
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [situacao, setSituacao] = useState<Situacao>("todas");

  const lista = useMemo(() => {
    const limite = periodo === "todos" ? 0 : Date.now() - Number(periodo) * 86_400_000;
    return (q.data ?? []).filter((h) => {
      const ref = new Date(h.validado_em ?? h.devolvido_em ?? h.atribuido_em).getTime();
      return ref >= limite && (situacao === "todas" || h.situacao === situacao);
    });
  }, [q.data, periodo, situacao]);

  const validadas = lista.filter((h) => h.situacao === "validada");
  const horas = validadas
    .filter((h) => h.concluido_em)
    .map((h) => (new Date(h.concluido_em!).getTime() - new Date(h.atribuido_em).getTime()) / 3_600_000);
  const med = mediana(horas);
  const tempo = med === null ? "—" : duracao(new Date(0).toISOString(), new Date(med * 3_600_000).toISOString());

  const sel = "rounded-lg border border-input bg-background px-2 py-2 text-sm";
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Histórico das minhas operações</h1>
      <div className="grid grid-cols-3 gap-2">
        {[
          { r: "Validadas", v: validadas.length },
          { r: "Devolvidas", v: lista.length - validadas.length },
          { r: "Tempo mediano", v: tempo },
        ].map((c) => (
          <div key={c.r} className="min-w-0 rounded-xl border border-border bg-background p-2.5">
            <p className="truncate text-[11px] text-muted-foreground">{c.r}</p>
            <p className="truncate text-xl font-bold">{q.isPending ? "…" : c.v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted-foreground">Período
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)} className={`mt-1 w-full ${sel}`}>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="todos">Tudo</option>
          </select>
        </label>
        <label className="text-xs text-muted-foreground">Situação
          <select value={situacao} onChange={(e) => setSituacao(e.target.value as Situacao)} className={`mt-1 w-full ${sel}`}>
            <option value="todas">Todas</option>
            <option value="validada">Validadas</option>
            <option value="devolvida">Devolvidas</option>
          </select>
        </label>
      </div>
      {q.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
      {!q.isPending && lista.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma operação encerrada neste período.
        </p>
      )}
      <ul className="space-y-3">
        {lista.map((h) => (
          <li key={h.atribuicao_id} className="rounded-xl border border-border bg-background p-4 text-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <p className="truncate font-mono font-bold">{h.protocolo}</p>
                <p className="truncate">{h.numero_processo}</p>
                <p className="truncate text-muted-foreground">
                  {[h.tribunal_sigla, h.comarca_processo].filter(Boolean).join(" · ") || "Tribunal não identificado"}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${h.situacao === "validada" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {h.situacao === "validada" ? "Validada" : "Devolvida"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Recebida {data(h.atribuido_em)} · Concluída {data(h.concluido_em)} ·{" "}
              {h.situacao === "validada" ? `Validada ${data(h.validado_em)}` : `Devolvida ${data(h.devolvido_em)}`}
            </p>
            {h.concluido_em && (
              <p className="mt-1 text-xs font-semibold">Tempo de execução: {duracao(h.atribuido_em, h.concluido_em)}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
