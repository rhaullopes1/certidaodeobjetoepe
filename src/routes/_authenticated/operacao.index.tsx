import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin } from "lucide-react";
import { minhaFilaOperacao } from "@/lib/operacao.functions";
import { rotuloEtapa } from "@/lib/papeis";

export const Route = createFileRoute("/_authenticated/operacao/")({
  component: Fila,
});

function Fila() {
  const fn = useServerFn(minhaFilaOperacao);
  const q = useQuery({ queryKey: ["operacao", "fila"], queryFn: () => fn() });
  const lista = q.data ?? [];
  const abertas = lista.filter((t) => t.status_operacao !== "concluido").length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-sm text-muted-foreground">Tarefas em aberto</p>
        <p className="text-3xl font-bold">{q.isPending ? "…" : abertas}</p>
        {lista.length > abertas && (
          <p className="text-xs text-muted-foreground">{lista.length - abertas} concluída(s) aguardando validação</p>
        )}
      </div>
      <h1 className="text-lg font-bold">Minhas operações</h1>
      {q.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
      {!q.isPending && lista.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma certidão atribuída a você no momento.
        </p>
      )}
      <ul className="space-y-3">
        {lista.map((t) => (
          <li key={t.atribuicao_id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold">{t.protocolo}</p>
                <p className="truncate text-sm">{t.numero_processo}</p>
                <p className="truncate text-sm text-muted-foreground">{t.nome_parte ?? "Parte não informada"}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {rotuloEtapa(t.status_operacao)}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {[t.tribunal_sigla, t.comarca_processo ?? t.cidade_processo, t.uf_processo].filter(Boolean).join(" · ") || "Local não identificado"}
            </p>
            <Link
              to="/operacao/$id"
              params={{ id: t.atribuicao_id }}
              className="mt-3 block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Abrir operação
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
