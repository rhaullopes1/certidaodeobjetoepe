import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  devolverOperacaoAdmin,
  listarOperadores,
  painelOperacaoAdmin,
  reatribuirOperacao,
  validarOperacaoAdmin,
} from "@/lib/operacao.functions";
import { atribuicaoAtiva, rotuloEtapa } from "@/lib/papeis";

export const Route = createFileRoute("/_authenticated/admin/operacao")({
  head: () => ({
    meta: [
      { title: "Operação | Back office" },
      { name: "description", content: "Acompanhamento dos pedidos enviados ao operador." },
      { property: "og:title", content: "Operação | Back office" },
      { property: "og:description", content: "Acompanhamento dos pedidos enviados ao operador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function tempoDesde(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d ${h % 24}h`;
}

function Pagina() {
  const qc = useQueryClient();
  const painel = useServerFn(painelOperacaoAdmin);
  const opsFn = useServerFn(listarOperadores);
  const reatribuir = useServerFn(reatribuirOperacao);
  const devolver = useServerFn(devolverOperacaoAdmin);
  const validar = useServerFn(validarOperacaoAdmin);
  const q = useQuery({ queryKey: ["admin-operacao"], queryFn: () => painel() });
  const ops = useQuery({ queryKey: ["operadores"], queryFn: () => opsFn() });
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [destino, setDestino] = useState<Record<string, string>>({});

  const acao = useMutation({
    mutationFn: async (a: { tipo: "reatribuir" | "devolver" | "validar"; id: string }) => {
      if (a.tipo === "reatribuir") return reatribuir({ data: { id: a.id, operadorId: destino[a.id] } });
      if (a.tipo === "devolver") return devolver({ data: { id: a.id, observacao: window.prompt("Motivo da devolução (opcional)") ?? undefined } });
      return validar({ data: { id: a.id } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-operacao"] });
      qc.invalidateQueries({ queryKey: ["operacao-ativas"] });
    },
  });

  const lista = (q.data ?? []).filter((a) => mostrarTodas || atribuicaoAtiva(a));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back office</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Operação</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mostrarTodas} onChange={(e) => setMostrarTodas(e.target.checked)} /> Mostrar devolvidas e validadas
        </label>
      </div>
      {q.isPending && <Loader2 className="mt-4 h-5 w-5 animate-spin" />}
      {q.error && <p className="mt-4 text-sm text-destructive">{(q.error as Error).message}</p>}
      {acao.error && <p className="mt-4 text-sm text-destructive">{(acao.error as Error).message}</p>}
      {!q.isPending && lista.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Nenhum pedido em operação.</p>}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Pedido</th><th className="p-3">Operador</th><th className="p-3">Etapa</th><th className="p-3">Desde atribuição</th><th className="p-3">Último andamento</th><th className="p-3">Ações</th></tr>
          </thead>
          <tbody>
            {lista.map((a) => {
              const ativa = atribuicaoAtiva(a);
              return (
                <tr key={a.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <Link to="/admin/$protocolo" params={{ protocolo: a.pedidos?.protocolo ?? "" }} className="font-semibold text-primary">{a.pedidos?.protocolo}</Link>
                    <p className="text-xs text-muted-foreground">{a.pedidos?.numero_processo}</p>
                  </td>
                  <td className="p-3">{a.operador_nome}</td>
                  <td className="p-3">{a.validado_em ? "Validado" : rotuloEtapa(a.status_operacao)}{a.status_operacao === "concluido" && !a.validado_em && <p className="text-xs font-semibold text-accent">Aguardando validação</p>}</td>
                  <td className="p-3">{tempoDesde(a.atribuido_em)}</td>
                  <td className="p-3 text-xs">{a.ultimo_andamento ? `${rotuloEtapa(a.ultimo_andamento.status.replace(/^operacao_/, ""))} — ${new Date(a.ultimo_andamento.created_at).toLocaleString("pt-BR")}` : "—"}</td>
                  <td className="p-3">
                    {ativa && (
                      <div className="flex flex-col gap-1.5">
                        {a.status_operacao === "concluido" && (
                          <button onClick={() => acao.mutate({ tipo: "validar", id: a.id })} className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">Validar conclusão</button>
                        )}
                        <div className="flex gap-1">
                          <select value={destino[a.id] ?? ""} onChange={(e) => setDestino({ ...destino, [a.id]: e.target.value })} className="rounded-md border border-input bg-background px-1 py-1 text-xs">
                            <option value="">Reatribuir…</option>
                            {(ops.data ?? []).filter((o) => o.id !== a.operador_id).map((o) => <option key={o.id} value={o.id}>{o.nome || o.email}</option>)}
                          </select>
                          <button disabled={!destino[a.id]} onClick={() => acao.mutate({ tipo: "reatribuir", id: a.id })} className="rounded-md border border-input px-2 text-xs disabled:opacity-40">OK</button>
                        </div>
                        <button onClick={() => acao.mutate({ tipo: "devolver", id: a.id })} className="rounded-md border border-input px-2 py-1 text-xs">Recolher (devolver)</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
