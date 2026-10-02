import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { ESTADOS_ROTA, MODALIDADES, ROTULO_STATUS_CONSULTA, STATUS_VERIFICACAO, filtrarCobertura, type AcaoRota, type Modalidade, type StatusVerificacao } from "@/lib/cpn";
import { coberturaCpn, filaVerificacaoCpn, historicoConsultasCpn, marcarRota, type FiltrosHistorico } from "@/lib/cpn.functions";

export function BadgeModalidade({ m }: { m: Modalidade }) {
  const c = MODALIDADES[m] ?? MODALIDADES.VERIFICAR;
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${c.classe}`}>{c.emoji} {c.rotulo}</span>;
}


const input = "h-10 rounded-xl border border-input bg-background px-3 text-sm";
const SEGMENTOS: Record<number, string> = { 1: "STF", 2: "CNJ", 3: "STJ", 4: "Federal", 5: "Trabalho", 6: "Eleitoral", 7: "Militar União", 8: "Estadual", 9: "Militar Estadual" };

/** Cobertura nacional: cadastro real de tribunais; sem rota = VERIFICAR. */
export function CoberturaRotas() {
  const fn = useServerFn(coberturaCpn);
  const q = useQuery({ queryKey: ["cpn-cobertura"], queryFn: () => fn() });
  const [termo, setTermo] = useState("");
  const [soSemRota, setSoSemRota] = useState(false);
  if (q.isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (!q.data) return <p className="text-sm text-destructive">Não foi possível carregar a cobertura.</p>;
  const r = q.data.resumo;
  const linhas = filtrarCobertura(q.data.linhas, termo).filter((l) => !soSemRota || !l.temRota);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[["Tribunais cadastrados", r.total], ["Com rota cadastrada", r.comRota], ["Rota homologada", r.homologadas], ["Rota identificada", r.identificadas], ["Manual (verificada)", r.manuaisValidadas], ["VERIFICAR", r.semRotaValidada]].map(([k, v]) => (
          <div key={k as string} className="rounded-xl border border-border px-3 py-2"><p className="text-[11px] text-muted-foreground">{k}</p><p className="font-display text-xl font-bold">{v}</p></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Buscar por sigla, nome ou UF" aria-label="Buscar tribunal" className={`${input} min-w-64 flex-1`} />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={soSemRota} onChange={(e) => setSoSemRota(e.target.checked)} /> Só sem rota</label>
      </div>
      <ul className="max-h-[32rem] divide-y divide-border overflow-auto text-sm">
        {linhas.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span><span className="font-semibold">{l.sigla}</span> <span className="text-muted-foreground">— {l.nome}{l.uf ? ` · ${l.uf}` : ""} · {SEGMENTOS[l.segmento] ?? l.segmento}</span></span>
            {l.temRota ? (
              <span className="flex items-center gap-2"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${ESTADOS_ROTA[l.estado].classe}`}>{ESTADOS_ROTA[l.estado].emoji} {ESTADOS_ROTA[l.estado].rotulo}</span><span className="text-xs text-muted-foreground">{l.totalRotas} rota(s){l.verificada ? " · verificada" : " · pendente de verificação"}</span></span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">⚪ VERIFICAR — rota ainda não homologada/cadastrada</span>
            )}
          </li>
        ))}
        {linhas.length === 0 && <li className="py-2 text-muted-foreground">Nenhum tribunal encontrado.</li>}
      </ul>
    </div>
  );
}

/** Fila de rotas a verificar com confirmação explícita e auditoria. */
export function FilaVerificacao() {
  const qc = useQueryClient();
  const fn = useServerFn(filaVerificacaoCpn);
  const marcarFn = useServerFn(marcarRota);
  const q = useQuery({ queryKey: ["cpn-fila"], queryFn: () => fn() });
  const [obs, setObs] = useState<Record<string, string>>({});
  const mut = useMutation({
    mutationFn: (v: { routeId: string; acao: AcaoRota }) => marcarFn({ data: { ...v, confirmado: true, observacao: obs[v.routeId] ?? null } }),
    onSuccess: (r) => {
      toast.success(r.somenteAuditoria ? "Pedido de revisão registrado na auditoria" : "Rota atualizada e registrada na auditoria");
      for (const k of ["cpn-fila", "cpn-cobertura", "cpn-painel"]) qc.invalidateQueries({ queryKey: [k] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });
  const confirmar = (routeId: string, tribunal: string, acao: AcaoRota) => {
    const texto = acao === "verificada"
      ? `Confirmo que conferi a fonte oficial da rota ${tribunal} hoje e que a evidência cadastrada continua válida.`
      : `Marcar a rota ${tribunal} para revisão?`;
    if (window.confirm(texto)) mut.mutate({ routeId, acao });
  };
  if (q.isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  const itens = q.data?.itens ?? [];
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>;
  return (
    <ul className="space-y-3">
      {itens.map((r) => (
        <li key={r.id} className="rounded-xl border border-border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">{r.tribunal} <span className="font-normal text-muted-foreground">{r.sistema ?? "sistema não especificado"}{r.grau ? ` · ${r.grau}` : ""} · {r.metodo}</span></span>
            <span className="flex items-center gap-2">
              <BadgeModalidade m={r.modalidade as Modalidade} />
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.status_verificacao === "verificada" ? "bg-live/15 text-live" : r.status_verificacao === "revisar" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>{STATUS_VERIFICACAO[r.status_verificacao as StatusVerificacao] ?? r.status_verificacao}</span>
            </span>
          </div>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            <div><dt className="inline text-muted-foreground">Evidência: </dt><dd className="inline">{r.fonte_evidencia ?? "—"}</dd></div>
            <div><dt className="inline text-muted-foreground">Última verificação: </dt><dd className="inline">{r.ultima_verificacao ?? "—"}</dd></div>
            <div><dt className="inline text-muted-foreground">Responsável: </dt><dd className="inline">{r.responsavel ?? "—"}</dd></div>
            <div><dt className="inline text-muted-foreground">Automação CPN: </dt><dd className="inline">{r.automacao_cpn === "homologada" ? "Homologada" : "Execução não integrada"}</dd></div>
            {r.observacao_verificacao && <div className="sm:col-span-2"><dt className="inline text-muted-foreground">Observação: </dt><dd className="inline">{r.observacao_verificacao}</dd></div>}
          </dl>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input value={obs[r.id] ?? ""} onChange={(e) => setObs((o) => ({ ...o, [r.id]: e.target.value }))} placeholder="Observação da verificação" aria-label={`Observação ${r.tribunal}`} className={`${input} h-9 min-w-56 flex-1`} />
            {r.url_fonte ? <a href={r.url_fonte} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:bg-secondary"><ExternalLink className="h-3.5 w-3.5" /> Abrir fonte oficial</a> : <span className="text-xs text-destructive">Sem URL oficial</span>}
            {q.data?.admin && <button type="button" disabled={mut.isPending} onClick={() => confirmar(r.id, r.tribunal, "verificada")} className="rounded-lg bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">Marcar como verificada</button>}
            <button type="button" disabled={mut.isPending} onClick={() => confirmar(r.id, r.tribunal, "revisar")} className="rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50">Marcar como revisar</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const STATUS_CONSULTA = ROTULO_STATUS_CONSULTA;

/** Histórico operacional filtrável. */
export function HistoricoConsultas({ abrir }: { abrir: (numero: string) => void }) {
  const fn = useServerFn(historicoConsultasCpn);
  const [f, setF] = useState<FiltrosHistorico>({ tipo: "real" });
  const [aplicado, setAplicado] = useState<FiltrosHistorico>({ tipo: "real" });
  const q = useQuery({ queryKey: ["cpn-historico", aplicado], queryFn: () => fn({ data: aplicado }) });
  const set = (k: keyof FiltrosHistorico) => (e: { target: { value: string } }) => setF((o) => ({ ...o, [k]: e.target.value }));
  return (
    <div className="space-y-3">
      <form className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7" onSubmit={(e) => { e.preventDefault(); setAplicado(f); }}>
        <input className={input} placeholder="Nº do processo" aria-label="Filtrar por número" value={f.numero ?? ""} onChange={set("numero")} />
        <input className={input} placeholder="Tribunal (ex.: TJSP)" aria-label="Filtrar por tribunal" value={f.tribunal ?? ""} onChange={set("tribunal")} />
        <select className={input} aria-label="Modalidade" value={f.modalidade ?? ""} onChange={set("modalidade")}>
          <option value="">Modalidade</option>
          {Object.entries(MODALIDADES).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
        </select>
        <select className={input} aria-label="Status" value={f.status ?? ""} onChange={set("status")}>
          <option value="">Status</option>
          {Object.entries(STATUS_CONSULTA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" className={input} aria-label="De" value={f.de ?? ""} onChange={set("de")} />
        <input type="date" className={input} aria-label="Até" value={f.ate ?? ""} onChange={set("ate")} />
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground">Filtrar</button>
        </div>
      </form>
      {q.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <ul className="divide-y divide-border text-sm">
          {(q.data ?? []).map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <button type="button" className="font-mono hover:underline" onClick={() => abrir(u.numero_normalizado ?? u.numero_raw)}>{u.numero_normalizado ?? u.numero_raw}</button>
              <span className="flex flex-wrap items-center gap-2">
                <span>{u.tribunal_sigla ?? "—"}</span>
                <span className="text-muted-foreground">{STATUS_CONSULTA[u.status] ?? u.status}</span>
                {u.modalidade && <BadgeModalidade m={u.modalidade as Modalidade} />}
                <span className="text-xs text-muted-foreground">{new Date(u.consultado_em).toLocaleString("pt-BR")}</span>
              </span>
            </li>
          ))}
          {q.data?.length === 0 && <li className="py-2 text-muted-foreground">Nenhuma consulta com esses filtros.</li>}
        </ul>
      )}
    </div>
  );
}
