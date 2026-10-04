import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { meusTemposEntrega } from "@/lib/operacao.functions";
import { FINALIDADES, type Finalidade } from "@/lib/pedidos.schema";
import { mediana } from "@/lib/papeis";

export const Route = createFileRoute("/_authenticated/operacao/metas")({
  component: Metas,
});

/** Metas internas (em horas), contadas do envio ao operador até a conclusão. */
const METAS_HORAS: Record<Finalidade, number> = {
  caminhoneiro_motorista: 48,
  motorista_app: 72,
  transacao_imobiliaria: 120,
  outro: 120,
};

const fmt = (h: number | null) => {
  if (h === null) return "—";
  if (h < 24) return `${Math.round(h)}h`;
  const d = Math.floor(h / 24);
  const r = Math.round(h % 24);
  return r ? `${d}d ${r}h` : `${d}d`;
};

function Metas() {
  const fn = useServerFn(meusTemposEntrega);
  const q = useQuery({ queryKey: ["operacao", "tempos-entrega"], queryFn: () => fn() });
  const agora = Date.now();

  const linhas = (Object.keys(FINALIDADES) as Finalidade[]).map((f) => {
    const itens = (q.data ?? []).filter((i) => (i.finalidade ?? "outro") === f);
    const meta = METAS_HORAS[f];
    const concl = itens.filter((i) => i.concluido_em);
    const horas = concl.map((i) => (new Date(i.concluido_em!).getTime() - new Date(i.atribuido_em).getTime()) / 3_600_000);
    const noPrazo = horas.filter((h) => h <= meta).length;
    const abertos = itens.filter((i) => !i.concluido_em);
    const atrasados = abertos.filter((i) => (agora - new Date(i.atribuido_em).getTime()) / 3_600_000 > meta).length;
    return { f, meta, med: mediana(horas), total: concl.length, noPrazo, abertos: abertos.length, atrasados };
  });

  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase text-gold">Desempenho</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Metas de tempo de entrega</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tempo contado do envio do pedido até a sua conclusão, comparado com a meta interna de cada tipo.
        </p>
      </div>
      {q.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {linhas.map((l) => {
          const pct = l.total ? Math.round((l.noPrazo / l.total) * 100) : null;
          const dentro = l.med !== null && l.med <= l.meta;
          return (
            <div key={l.f} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{FINALIDADES[l.f]}</p>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Meta {fmt(l.meta)}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Tempo real</p>
                  <p className={`mt-1 text-lg font-bold ${l.med === null ? "" : dentro ? "text-live" : "text-destructive"}`}>{fmt(l.med)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">No prazo</p>
                  <p className="mt-1 text-lg font-bold">{pct === null ? "—" : `${pct}%`}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Abertos</p>
                  <p className="mt-1 text-lg font-bold">
                    {l.abertos}
                    {l.atrasados > 0 && <span className="ml-1 text-xs text-destructive">({l.atrasados} acima)</span>}
                  </p>
                </div>
              </div>
              {l.med !== null && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${dentro ? "bg-live" : "bg-destructive"}`}
                    style={{ width: `${Math.min(100, (l.med / l.meta) * 100)}%` }}
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{l.total} concluído(s) · tempo real = mediana</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
