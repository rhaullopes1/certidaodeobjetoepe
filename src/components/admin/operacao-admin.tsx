import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { atribuicoesDoPedido, atribuirOperacao, listarOperadores } from "@/lib/operacao.functions";
import { atribuicaoAtiva, podeEnviarParaOperacao, rotuloEtapa } from "@/lib/papeis";

/** Atribuições ativas (pedido_id → etapa), lidas com RLS de equipe. */
export function useAtribuicoesAtivas() {
  return useQuery({
    queryKey: ["operacao-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operador_pedidos")
        .select("pedido_id, status_operacao, validado_em")
        .neq("status_operacao", "devolvido")
        .is("validado_em", null);
      if (error) throw error;
      return new Map((data ?? []).map((a) => [a.pedido_id, a.status_operacao]));
    },
  });
}

/** Mapa pedido_id → atribuição ainda não validada (inclui devolvidas), para o visual das listas. */
export function useAtribuicoesOperacao() {
  return useQuery({
    queryKey: ["operacao-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operador_pedidos")
        .select("pedido_id, status_operacao, validado_em, operador_id, atribuido_em")
        .is("validado_em", null);
      if (error) throw error;
      return new Map((data ?? []).map((a) => [a.pedido_id, a]));
    },
  });
}

/** Mapa operador_id → nome exibível, reaproveitando a mesma lista de operadores. */
export function useOperadoresMap() {
  const opsFn = useServerFn(listarOperadores);
  return useQuery({
    queryKey: ["operadores"],
    queryFn: async () => {
      const ops = await opsFn();
      return new Map(ops.map((o) => [o.id, o.nome || o.email]));
    },
  });
}

export function SeloOperacao({ etapa }: { etapa?: string }) {
  if (!etapa) return null;
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary" title="Pedido enviado para operação">
      Operação: {rotuloEtapa(etapa)}
    </span>
  );
}

/** Versão compacta para listas (ex.: Entregas): botão que abre a escolha do operador em linha. */
export function BotaoEnviarOperacao({ pedidoId }: { pedidoId: string }) {
  const qc = useQueryClient();
  const opsFn = useServerFn(listarOperadores);
  const atribuirFn = useServerFn(atribuirOperacao);
  const ops = useQuery({ queryKey: ["operadores"], queryFn: () => opsFn() });
  const [aberto, setAberto] = useState(false);
  const [operador, setOperador] = useState("");
  const enviar = useMutation({
    mutationFn: () => atribuirFn({ data: { pedidoId, operadorId: operador } }),
    onSuccess: () => {
      setAberto(false);
      setOperador("");
      qc.invalidateQueries({ queryKey: ["operacao-ativas"] });
    },
  });

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary/10 px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15"
      >
        <Send className="h-4 w-4" /> Enviar para operação
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <select
        value={operador}
        onChange={(e) => setOperador(e.target.value)}
        className="rounded-full border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Operador…</option>
        {(ops.data ?? []).map((o) => (
          <option key={o.id} value={o.id}>{o.nome || o.email}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!operador || enviar.isPending}
        onClick={() => enviar.mutate()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
      >
        {enviar.isPending ? "Enviando…" : "Confirmar envio"}
      </button>
      <button type="button" onClick={() => setAberto(false)} className="text-xs font-semibold text-muted-foreground hover:underline">
        Cancelar
      </button>
      {enviar.error && <span className="text-xs text-destructive">{(enviar.error as Error).message}</span>}
    </span>
  );
}

export function EnviarParaOperacao({ pedidoId, status }: { pedidoId: string; status: string }) {
  const qc = useQueryClient();
  const listarFn = useServerFn(atribuicoesDoPedido);
  const opsFn = useServerFn(listarOperadores);
  const atribuirFn = useServerFn(atribuirOperacao);
  const atribs = useQuery({ queryKey: ["operacao-pedido", pedidoId], queryFn: () => listarFn({ data: { pedidoId } }) });
  const ops = useQuery({ queryKey: ["operadores"], queryFn: () => opsFn() });
  const [operador, setOperador] = useState("");
  const [obs, setObs] = useState("");
  const enviar = useMutation({
    mutationFn: () => atribuirFn({ data: { pedidoId, operadorId: operador, observacao: obs || undefined } }),
    onSuccess: () => {
      setObs("");
      qc.invalidateQueries({ queryKey: ["operacao-pedido", pedidoId] });
      qc.invalidateQueries({ queryKey: ["operacao-ativas"] });
      qc.invalidateQueries({ queryKey: ["admin-andamentos"] });
    },
  });

  const lista = atribs.data ?? [];
  const ativa = lista.find(atribuicaoAtiva);
  const nome = (id: string) => ops.data?.find((o) => o.id === id)?.nome || ops.data?.find((o) => o.id === id)?.email || "Operador";
  const pode = podeEnviarParaOperacao(status, lista);

  if (!ativa && !pode && lista.length === 0) return null;

  return (
    <section className="card-premium mt-6 border-2 border-primary/30 p-6">
      <h2 className="text-lg font-bold">Operação</h2>
      {ativa ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <SeloOperacao etapa={ativa.status_operacao} />
          <span>{nome(ativa.operador_id)}</span>
          <span className="text-muted-foreground">desde {new Date(ativa.atribuido_em).toLocaleString("pt-BR")}</span>
          {ativa.status_operacao === "concluido" && <span className="font-semibold text-accent">Aguardando validação em Operação</span>}
        </div>
      ) : pode ? (
        <div className="mt-3 space-y-2">
          {ops.data && ops.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum usuário com o papel de operador cadastrado ainda.</p>
          ) : (
            <>
              <select value={operador} onChange={(e) => setOperador(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione o operador…</option>
                {(ops.data ?? []).map((o) => (
                  <option key={o.id} value={o.id}>{o.nome || o.email}</option>
                ))}
              </select>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Orientação para o operador (opcional)" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <button disabled={!operador || enviar.isPending} onClick={() => enviar.mutate()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
                <Send className="h-4 w-4" /> {enviar.isPending ? "Enviando…" : "Enviar para operação"}
              </button>
            </>
          )}
          {enviar.error && <p className="text-sm text-destructive">{(enviar.error as Error).message}</p>}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Sem atribuição ativa.</p>
      )}
      {lista.filter((a) => a !== ativa).length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {lista.filter((a) => a !== ativa).map((a) => (
            <li key={a.id}>
              {nome(a.operador_id)} — {a.validado_em ? "Validado" : rotuloEtapa(a.status_operacao)} ({new Date(a.atribuido_em).toLocaleDateString("pt-BR")})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
