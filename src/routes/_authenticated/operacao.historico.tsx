import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { meuHistoricoOperacao } from "@/lib/operacao.functions";
import { REMUNERACAO_OPERADOR_CENTAVOS } from "@/lib/papeis";

export const Route = createFileRoute("/_authenticated/operacao/historico")({
  component: Historico,
});

const reais = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const data = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

function Historico() {
  const fn = useServerFn(meuHistoricoOperacao);
  const q = useQuery({ queryKey: ["operacao", "historico"], queryFn: () => fn() });
  const lista = q.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-sm text-muted-foreground">Operações validadas</p>
        <p className="text-3xl font-bold">{q.isPending ? "…" : lista.length}</p>
        {lista.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Remuneração acumulada: {reais(lista.length * REMUNERACAO_OPERADOR_CENTAVOS)}
          </p>
        )}
      </div>
      <h1 className="text-lg font-bold">Histórico das minhas operações</h1>
      {q.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
      {!q.isPending && lista.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma operação validada ainda.
        </p>
      )}
      <ul className="space-y-3">
        {lista.map((h) => (
          <li key={h.atribuicao_id} className="rounded-xl border border-border bg-background p-4 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono font-bold">{h.protocolo}</p>
                <p className="truncate">{h.numero_processo}</p>
                <p className="truncate text-muted-foreground">{h.nome_parte ?? "Parte não informada"}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Validada</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Recebida {data(h.atribuido_em)} · Concluída {data(h.concluido_em)} · Validada {data(h.validado_em)}
            </p>
            <p className="mt-1 text-xs font-semibold">Remuneração: {reais(REMUNERACAO_OPERADOR_CENTAVOS)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
