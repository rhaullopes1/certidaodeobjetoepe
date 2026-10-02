import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { ESTADOS_ROTA, MODALIDADES, ROTULO_STATUS_CONSULTA, STATUS_VERIFICACAO, TRECHO_MINIMO, filtrarCobertura, requisitosHomologacao, type EvidenciaInformada, type Modalidade, type RotaHomologavel, type StatusVerificacao } from "@/lib/cpn";
import { coberturaCpn, filaVerificacaoCpn, historicoConsultasCpn, historicoRotaCpn, homologarRota, manterVerificarRota, type FiltrosHistorico } from "@/lib/cpn.functions";

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

type ItemFila = Awaited<ReturnType<typeof filaVerificacaoCpn>>["itens"][number];
const PERFIL_ROT: Record<string, string> = { qualquer: "Qualquer interessado", parte_advogado_habilitado: "Parte / advogado do processo", terceiro_ou_advogado_nao_cadastrado: "Terceiro / advogado não cadastrado", sigiloso: "Processo sigiloso" };
const ACAO_ROT: Record<string, string> = { homologar_rota: "Homologada", manter_verificar_rota: "Mantida em VERIFICAR", solicitar_revisao_rota: "Revisão solicitada (operador)", verificar_rota: "Verificada (fluxo antigo)", revisar_rota: "Marcada para revisão (fluxo antigo)" };

/** Fila de homologação controlada: evidência registrada pelo administrador, auditoria e histórico. */
export function FilaVerificacao() {
  const fn = useServerFn(filaVerificacaoCpn);
  const q = useQuery({ queryKey: ["cpn-fila"], queryFn: () => fn() });
  const [aberta, setAberta] = useState<string | null>(null);
  if (q.isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  const itens = q.data?.itens ?? [];
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>;
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Homologar exige cadastro completo e evidência registrada por você: URL oficial consultada, trecho copiado da fonte e data. Nada é preenchido automaticamente. Homologar não altera a automação da CPN.</p>
      <ul className="space-y-3">
        {itens.map((r) => <ItemRota key={r.id} r={r} admin={q.data?.admin ?? false} aberta={aberta === r.id} alternar={() => setAberta((a) => (a === r.id ? null : r.id))} />)}
      </ul>
    </div>
  );
}

function Campo({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><dt className="inline text-muted-foreground">{k}: </dt><dd className="inline break-words">{v ?? <span className="text-destructive">não cadastrado</span>}</dd></div>;
}
const link = (u: string | null) => (u ? <a href={u} target="_blank" rel="noopener noreferrer" className="text-primary underline">{u}</a> : null);

function ItemRota({ r, admin, aberta, alternar }: { r: ItemFila; admin: boolean; aberta: boolean; alternar: () => void }) {
  const qc = useQueryClient();
  const homFn = useServerFn(homologarRota);
  const manterFn = useServerFn(manterVerificarRota);
  const histFn = useServerFn(historicoRotaCpn);
  const hoje = new Date().toISOString().slice(0, 10);
  const [ev, setEv] = useState<EvidenciaInformada>({ urlFonte: "", trecho: "", dataVerificacao: hoje, observacao: "" });
  const hist = useQuery({ queryKey: ["cpn-hist-rota", r.id], queryFn: () => histFn({ data: { routeId: r.id } }), enabled: aberta });
  const faltando = requisitosHomologacao(r as unknown as RotaHomologavel, ev, hoje);
  const ok = () => { for (const k of ["cpn-fila", "cpn-cobertura", "cpn-painel", "cpn-hist-rota"]) qc.invalidateQueries({ queryKey: [k] }); };
  const hom = useMutation({ mutationFn: () => homFn({ data: { routeId: r.id, confirmado: true, ...ev } }), onSuccess: () => { toast.success("Rota homologada e registrada na auditoria"); ok(); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Falha") });
  const manter = useMutation({ mutationFn: () => manterFn({ data: { routeId: r.id, confirmado: true, ...ev } }), onSuccess: (x) => { toast.success(x.somenteAuditoria ? "Pedido de revisão registrado na auditoria" : "Rota mantida em VERIFICAR; registro na auditoria"); ok(); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Falha") });
  const set = (k: keyof EvidenciaInformada) => (e: { target: { value: string } }) => setEv((o) => ({ ...o, [k]: e.target.value }));
  const status = r.status_verificacao as StatusVerificacao;
  return (
    <li className="rounded-xl border border-border p-3 text-sm" data-testid="rota-fila">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{r.tribunal} <span className="font-normal text-muted-foreground">{r.sistema ?? "qualquer sistema"} · {r.grau ?? "grau não especificado"} · {PERFIL_ROT[r.perfil] ?? r.perfil} · {r.tipo_rota}</span></span>
        <span className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status === "verificada" ? "bg-live/15 text-live" : status === "revisar" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>{status === "verificada" ? "Homologada" : `⚪ VERIFICAR · ${STATUS_VERIFICACAO[status] ?? status}`}</span>
          <button type="button" onClick={alternar} className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-secondary">{aberta ? "Fechar" : "Abrir verificação"}</button>
        </span>
      </div>
      {r.lacunas.length > 0 && <p className="mt-1 text-xs text-destructive">Falta no cadastro: {r.lacunas.join(" · ")}</p>}
      {aberta && (
        <div className="mt-3 space-y-3">
          <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            <Campo k="Tribunal" v={(r.cnj_tribunais as { nome?: string } | null)?.nome ?? r.tribunal} />
            <Campo k="Sistema" v={r.sistema ?? "qualquer (não especificado)"} />
            <Campo k="Grau" v={r.grau} />
            <Campo k="Perfil" v={PERFIL_ROT[r.perfil] ?? r.perfil} />
            <Campo k="Tipo de rota" v={r.tipo_rota} />
            <Campo k="Método" v={r.metodo} />
            <Campo k="URL oficial de solicitação" v={link(r.url_certidao)} />
            <Campo k="Autenticidade" v={link(r.autenticidade_url)} />
            <Campo k="URL da fonte cadastrada" v={link(r.url_fonte)} />
            <Campo k="Evidência (descrição)" v={r.fonte_evidencia} />
            <div className="sm:col-span-2"><Campo k="Trecho da fonte cadastrado" v={r.fonte_trecho} /></div>
            <div className="sm:col-span-2"><Campo k="Requisitos" v={r.requisitos} /></div>
            <Campo k="Quem pode pedir" v={r.quem_pode} />
            <Campo k="Passos" v={Array.isArray(r.passos) && r.passos.length ? `${r.passos.length} passo(s)` : null} />
            <Campo k="Última verificação" v={r.ultima_verificacao ? `${r.ultima_verificacao}${r.verificador ? ` · ${r.verificador}` : ""}` : "nunca"} />
            <Campo k="Automação CPN" v={r.automacao_cpn === "homologada" ? "Homologada (etapa técnica)" : "Não integrada — homologação técnica é etapa separada"} />
          </dl>
          {r.url_fonte && <a href={r.url_fonte} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:bg-secondary"><ExternalLink className="h-3.5 w-3.5" /> Abrir fonte oficial</a>}
          <fieldset className="grid gap-2 rounded-xl border border-border p-3">
            <legend className="px-1 text-xs font-semibold">Registrar verificação (você consulta e copia da fonte oficial)</legend>
            <input className={input} aria-label="URL oficial consultada" placeholder="URL oficial consultada (https://...)" value={ev.urlFonte ?? ""} onChange={set("urlFonte")} />
            <textarea className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm" aria-label="Trecho da fonte oficial" placeholder={`Trecho copiado literalmente da fonte (mín. ${TRECHO_MINIMO} caracteres)`} value={ev.trecho ?? ""} onChange={set("trecho")} />
            <div className="flex flex-wrap gap-2">
              <input type="date" max={hoje} className={input} aria-label="Data da verificação" value={ev.dataVerificacao ?? ""} onChange={set("dataVerificacao")} />
              <input className={`${input} flex-1`} aria-label="Observação" placeholder="Observação (opcional)" value={ev.observacao ?? ""} onChange={set("observacao")} />
            </div>
            <p className="text-xs text-muted-foreground">Responsável: você (registrado automaticamente pela sua conta).</p>
            {faltando.length > 0
              ? <p className="text-xs text-destructive" data-testid="faltando">Homologação bloqueada. Falta: {faltando.join(" · ")}</p>
              : <p className="text-xs text-live">Requisitos mínimos completos.</p>}
            <div className="flex flex-wrap gap-2">
              {admin && <button type="button" disabled={faltando.length > 0 || hom.isPending} onClick={() => { if (window.confirm(`Confirmo que consultei a fonte oficial em ${ev.dataVerificacao} e que o trecho foi copiado dela. Homologar a rota ${r.tribunal}?`)) hom.mutate(); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">Homologar rota</button>}
              <button type="button" disabled={manter.isPending} onClick={() => { if (window.confirm(admin ? "Manter esta rota em VERIFICAR e registrar na auditoria?" : "Registrar pedido de revisão na auditoria?")) manter.mutate(); }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50">{admin ? "Manter VERIFICAR" : "Solicitar revisão"}</button>
            </div>
          </fieldset>
          <div>
            <p className="text-xs font-semibold">Histórico de verificação</p>
            {hist.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (hist.data ?? []).length === 0 ? <p className="text-xs text-muted-foreground">Nenhum registro ainda.</p> : (
              <ul className="mt-1 space-y-1 text-xs">
                {hist.data!.map((h) => {
                  const d = (h.detalhes ?? {}) as { url_fonte_consultada?: string; data_verificacao?: string; faltando?: string[]; observacao?: string };
                  return <li key={h.id} className="rounded-lg bg-secondary/50 px-2 py-1"><span className="font-semibold">{ACAO_ROT[h.acao] ?? h.acao}</span> · {new Date(h.created_at).toLocaleString("pt-BR")} · {h.operador}{d.data_verificacao ? ` · consulta em ${d.data_verificacao}` : ""}{d.url_fonte_consultada ? ` · ${d.url_fonte_consultada}` : ""}{d.faltando?.length ? ` · faltava: ${d.faltando.join("; ")}` : ""}{d.observacao ? ` · ${d.observacao}` : ""}</li>;
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
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
