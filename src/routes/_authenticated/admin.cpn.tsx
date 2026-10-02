import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCopy, ExternalLink, FileText, History, Loader2, Search, ShieldAlert } from "lucide-react";
import { souEquipe } from "@/lib/admin";
import { analisarNup, formatarNup } from "@/lib/cnj";
import { CoberturaRotas, FilaVerificacao, HistoricoConsultas } from "@/components/admin/cpn-paineis";
import { ESTADOS_DADO, MODALIDADES, estadoDado, STATUS_OPERACAO, canaisDaRota, passosDaRota, textoInstrucoes, textoSolicitacao, type RotaCertidao, type Modalidade, type StatusOperacao, escolherRota, type PerfilSolicitante } from "@/lib/cpn";
import {
  atualizarOperacao,
  criarOperacao,
  historicoProcessoCpn,
  localizarProcesso,
  painelCpn,
  registrarAcaoCpn,
  type ResultadoCpn,
} from "@/lib/cpn.functions";
import { AdminHeader, SemPermissao } from "./admin.index";
import { DocumentoOficial, type OpDoc } from "@/components/admin/cpn-documento";
import { DadosEnriquecidos, PainelRota } from "@/components/admin/cpn-rota";

export const Route = createFileRoute("/_authenticated/admin/cpn")({
  component: PaginaCpn,
  head: () => ({
    meta: [
      { title: "CPN — Central do Operador | Painel interno" },
      { name: "description", content: "Ferramenta interna de localização de processos e rotas de Certidão de Objeto e Pé." },
      { property: "og:title", content: "CPN — Central do Operador" },
      { property: "og:description", content: "Ferramenta interna do operador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const DATAJUD_MSG: Record<string, string> = {
  nao_configurado: "DataJud não configurado",
  tribunal_nao_suportado: "Tribunal sem índice DataJud",
  nao_encontrado: "Processo não encontrado no DataJud",
  indisponivel: "DataJud indisponível",
  limite_requisicoes: "Limite de requisições do DataJud",
  ok: "DADO CONFIRMADO pelo DataJud",
};

function Badge({ m }: { m: Modalidade }) {
  const c = MODALIDADES[m];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${c.classe}`}>{c.emoji} {c.rotulo}</span>;
}

function Campo({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-1 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words font-medium">{v ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

const simNao = (b: boolean | null) => (b === null ? null : b ? "Sim" : "Não");
const card = "rounded-2xl border border-border bg-card p-5 shadow-sm";
const btn = "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50";

function PaginaCpn() {
  const equipe = useQuery({ queryKey: ["souEquipe"], queryFn: souEquipe });
  if (equipe.isLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!equipe.data) return <SemPermissao />;
  return <Cpn />;
}

function Cpn() {
  const qc = useQueryClient();
  const painelFn = useServerFn(painelCpn);
  const localizarFn = useServerFn(localizarProcesso);
  const acaoFn = useServerFn(registrarAcaoCpn);
  const painel = useQuery({ queryKey: ["cpn-painel"], queryFn: () => painelFn() });
  const [numero, setNumero] = useState("");
  const [aba, setAba] = useState<"ultimas" | "cobertura" | "fila" | "historico" | "pendencias">("ultimas");
  const [enviado, setEnviado] = useState<string | null>(null);

  const consulta = useMutation({
    mutationFn: (v: { numero: string }) => localizarFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cpn-painel"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha na consulta"),
  });

  const buscar = (n = numero) => {
    if (!n.trim()) return;
    setNumero(formatarNup(n));
    setEnviado(n);
    consulta.mutate({ numero: n });
  };

  const s = painel.data?.stats;
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8">
        <div>
          <h1 className="font-display text-2xl font-bold">CPN — Central do Operador</h1>
          <p className="text-sm text-muted-foreground">Certidão de Objeto e Pé · ferramenta interna (não emite documento oficial)</p>
        </div>

        <p className="text-xs text-muted-foreground">Indicadores de hoje — consultas reais</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            ["Consultas hoje", s?.consultas], ["Dados confirmados", s?.localizados], ["Automáticas", s?.automaticas],
            ["Semiautomáticas", s?.semiautomaticas], ["Manuais", s?.manuais], ["Não encontrados", s?.naoLocalizados], ["Fonte indisponível", s?.erros],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-xl border border-border bg-card px-3 py-2">
              <p className="text-[11px] text-muted-foreground">{k}</p>
              <p className="font-display text-xl font-bold">{v ?? "—"}</p>
            </div>
          ))}
        </div>

        <form className={card} onSubmit={(e) => { e.preventDefault(); buscar(); }}>
          <label htmlFor="cpn-numero" className="text-sm font-semibold">Número do processo</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input id="cpn-numero" value={numero} onChange={(e) => setNumero(formatarNup(e.target.value))} placeholder="0000000-00.0000.0.00.0000" inputMode="numeric"
              className="h-14 flex-1 rounded-xl border border-input bg-background px-4 font-mono text-lg tracking-wide outline-none focus:ring-2 focus:ring-ring" />
            <button type="submit" disabled={consulta.isPending} className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-60">
              {consulta.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />} Localizar processo
            </button>
          </div>
        </form>

        {consulta.isPending && enviado && <IdentificacaoImediata numero={enviado} />}
        {!consulta.isPending && consulta.data && <Resultado r={consulta.data} admin={Boolean(painel.data?.admin)} registrar={(acao, routeId) => acaoFn({ data: { acao, numero: consulta.data?.processo?.numeroFormatado ?? null, routeId } })} />}

        <section className={card}>
          <div className="mb-4 flex flex-wrap gap-2">
            {([["ultimas", "Últimos processos"], ["cobertura", "Cobertura de rotas"], ["fila", "Rotas a verificar"], ["historico", "Histórico"], ["pendencias", "Pendências manuais"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setAba(k)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${aba === k ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{l}</button>
            ))}
          </div>
          {painel.isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {aba === "ultimas" && (
            <ul className="divide-y divide-border text-sm">
              {painel.data?.ultimas.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <button type="button" className="font-mono hover:underline" onClick={() => buscar(u.numero_normalizado ?? u.numero_raw)}>{u.numero_normalizado ?? u.numero_raw}</button>
                  <span className="flex items-center gap-2">
                    <span>{u.tribunal_sigla ?? "—"}</span><span className="text-muted-foreground">{u.status}</span>
                    {u.modalidade && <Badge m={u.modalidade as Modalidade} />}
                    <span className="text-xs text-muted-foreground">{new Date(u.consultado_em).toLocaleString("pt-BR")}</span>
                  </span>
                </li>
              ))}
              {painel.data?.ultimas.length === 0 && <li className="py-2 text-muted-foreground">Nenhuma consulta ainda.</li>}
            </ul>
          )}
          {aba === "cobertura" && <CoberturaRotas />}
          {aba === "fila" && <FilaVerificacao />}
          {aba === "historico" && <HistoricoConsultas abrir={(n) => buscar(n)} />}
          {aba === "pendencias" && (
            <Pendencias itens={painel.data?.pendencias ?? []} />
          )}
        </section>
      </main>
    </div>
  );
}

function Resultado({ r, admin, registrar }: { r: ResultadoCpn; admin: boolean; registrar: (a: "abrir_fonte" | "abrir_certidao" | "copiar_rota" | "copiar_solicitacao", routeId: string | null) => void }) {
  const historicoFn = useServerFn(historicoProcessoCpn);
  const [ficha, setFicha] = useState(false);
  const [hist, setHist] = useState(false);
  const p = r.processo;
  const todas = [...(r.rota ? [r.rota] : []), ...(r.alternativas ?? [])];
  const [perfil, setPerfil] = useState<PerfilSolicitante | null>(null);
  const motor = escolherRota(todas, { sistema: r.processo?.sistema ?? null, grau: r.processo?.grau ?? null, nivelSigilo: r.processo?.nivelSigilo ?? null, perfil });
  const [selId, setSelId] = useState<string | null>(null);
  const rota = todas.find((x) => x.id === selId) ?? motor.rota;
  const alternativas = todas.filter((x) => x.id !== rota?.id);
  const [modoFicha, setModoFicha] = useState<"assistida" | "resultado">("assistida");
  const historico = useQuery({ queryKey: ["cpn-hist", p?.numeroFormatado], queryFn: () => historicoFn({ data: { numero: p!.numeroFormatado } }), enabled: hist && Boolean(p) });

  if (r.erro) return <div className={`${card} border-destructive/40 text-destructive`}><ShieldAlert className="mr-2 inline h-5 w-5" />{r.erro}</div>;
  if (!p) return null;
  const sigilo = p.nivelSigilo !== null && p.nivelSigilo > 0;
  const confirmado = r.datajud?.status === "ok";
  const eDado = estadoDado(r.datajud?.status ?? null);
  const copiar = async (texto: string, acao: "copiar_rota" | "copiar_solicitacao") => {
    await navigator.clipboard.writeText(texto);
    toast.success("Copiado");
    registrar(acao, rota?.id ?? null);
  };
  const ctx = { numero: p.numeroFormatado, tribunal: p.tribunalSigla, unidade: p.orgaoJulgador };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={card}>
        <h2 className="mb-2 flex items-center justify-between font-display font-bold">Processo</h2>
        <p className={`rounded-lg px-3 py-2 text-xs font-bold ${confirmado ? "bg-live/15 text-live" : "bg-destructive/10 text-destructive"}`}>{ESTADOS_DADO[eDado]}</p>
        <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Identificação pelo número (CNJ + cadastro de tribunais)</h3>
        <dl>
          <Campo k="Número CNJ" v={<span className="font-mono">{p.numeroFormatado}</span>} />
          <Campo k="Validade" v={<span className="text-live">Dígito verificador válido</span>} />
          <Campo k="Segmento" v={p.segmento} />
          <Campo k="Tribunal" v={p.tribunalSigla ? `${p.tribunalSigla} — ${p.tribunalNome ?? ""}` : null} />
          <Campo k="UF" v={p.uf} />
          <Campo k="Código origem" v={p.codigoOrigem ? `${p.codigoOrigem} (não define vara/comarca)` : null} />
        </dl>
        <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Dados confirmados pelo DataJud (origem: {r.datajud?.fonte ?? "—"})</h3>
        {confirmado ? (
          <dl>
            <Campo k="Grau" v={p.grau} />
            <Campo k="Órgão julgador" v={p.orgaoJulgador} />
            <Campo k="Sistema" v={p.sistema} />
            <Campo k="Classe" v={p.classe} />
            <Campo k="Assuntos" v={p.assuntos.length ? p.assuntos.join(", ") : null} />
            <Campo k="Situação" v={p.movimentos[0] ? `${p.movimentos[0].nome}${p.movimentos[0].dataHora ? ` (${new Date(p.movimentos[0].dataHora).toLocaleDateString("pt-BR")})` : ""}` : null} />
            {p.nivelSigilo !== null && <Campo k="Segredo de justiça" v={sigilo ? <span className="font-bold text-destructive">Sim (informado pela fonte)</span> : "Não informado como sigiloso"} />}
          </dl>
        ) : (
          <p className="mt-1 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {r.datajud ? DATAJUD_MSG[r.datajud.status] ?? r.datajud.status : "Tribunal não identificado no cadastro"}. Não foi possível confirmar: nenhum dado de vara, comarca, órgão julgador, classe, assunto, situação ou sistema é exibido. A rota ao lado vem só do cadastro CPN.
          </p>
        )}
        <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Dados enriquecidos da base CPN</h3>
        <DadosEnriquecidos en={r.enriquecimento} sigilo={Boolean(sigilo)} />
      </section>

      <section className={card}>
        <h2 className="mb-2 font-display font-bold">Painel da rota de solicitação</h2>
        <PainelRota rota={rota} alternativas={alternativas} tribunal={p.tribunalSigla} alertas={rota?.id === motor.rota?.id ? motor.alertas : []} onEscolher={setSelId} avaliacoes={motor.avaliacoes ?? []} perfil={perfil} onPerfil={(v) => { setPerfil(v); setSelId(null); }} />
      </section>

      <section className={card}>
        <h2 className="mb-3 font-display font-bold">Ações do operador</h2>
        <p className="mb-2 text-xs text-muted-foreground">A CPN não envia nada nem acessa portais: o operador executa pelo canal oficial.</p>
        <div className="flex flex-col gap-2">
          <a aria-disabled={!rota?.url_fonte} href={rota?.url_fonte ?? undefined} target="_blank" rel="noopener noreferrer" onClick={() => registrar("abrir_fonte", rota?.id ?? null)} className={`${btn} ${rota?.url_fonte ? "" : "pointer-events-none opacity-50"}`}><ExternalLink className="h-4 w-4" /> Abrir evidência oficial</a>
          <a aria-disabled={!rota?.url_certidao} href={rota?.url_certidao ?? undefined} target="_blank" rel="noopener noreferrer" onClick={() => registrar("abrir_certidao", rota?.id ?? null)} className={`${btn} ${rota?.url_certidao ? "" : "pointer-events-none opacity-50"}`}><ExternalLink className="h-4 w-4" /> Abrir rota oficial</a>
          <button type="button" className={btn} onClick={() => copiar(textoInstrucoes(ctx, rota), "copiar_rota")}><ClipboardCopy className="h-4 w-4" /> Copiar instruções</button>
          <button type="button" className={btn} onClick={() => { setModoFicha("assistida"); setFicha(true); }}><FileText className="h-4 w-4" /> Iniciar solicitação assistida</button>
          <button type="button" className={btn} onClick={() => { setModoFicha("resultado"); setFicha(true); }}><CheckCircle2 className="h-4 w-4" /> Registrar resultado</button>
          {admin && rota && <span className="self-center text-xs text-muted-foreground">Homologação: aba “Rotas a verificar” (exige evidência registrada).</span>}
          <button type="button" className={btn} onClick={() => setHist((v) => !v)}><History className="h-4 w-4" /> Histórico</button>
        </div>
        {hist && (
          <ul className="mt-3 max-h-56 space-y-1 overflow-auto text-xs">
            {historico.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {historico.data?.operacoes.map((o) => <li key={o.id} className="rounded bg-primary/5 px-2 py-1">Ficha: {STATUS_OPERACAO[o.status as StatusOperacao] ?? o.status} · {new Date(o.updated_at).toLocaleString("pt-BR")}</li>)}
            {historico.data?.logs.map((l) => <li key={l.id} className="px-2">{new Date(l.created_at).toLocaleString("pt-BR")} — {l.acao}{l.resultado ? ` (${l.resultado})` : ""}</li>)}
          </ul>
        )}
      </section>

      {ficha && <Ficha key={`${rota?.id}-${modoFicha}`} r={r} rota={rota} modo={modoFicha} copiar={(t) => copiar(t, "copiar_solicitacao")} padrao={textoSolicitacao(ctx, rota)} fechar={() => setFicha(false)} />}
    </div>
  );
}

function Ficha({ r, rota, modo, padrao, copiar, fechar }: { r: ResultadoCpn; rota: RotaCertidao | null; modo: "assistida" | "resultado"; padrao: string; copiar: (t: string) => void; fechar: () => void }) {
  const canais = canaisDaRota(rota);
  const passos = passosDaRota(rota);
  const [canal, setCanal] = useState(canais[0]?.rotulo ?? "");
  const [destinatario, setDestinatario] = useState(canais[0]?.valor ?? "");
  const qc = useQueryClient();
  const criarFn = useServerFn(criarOperacao);
  const p = r.processo!;
  const [texto, setTexto] = useState(padrao);
  const [obs, setObs] = useState("");
  const [status, setStatus] = useState<StatusOperacao>(modo === "assistida" ? "preparado" : "solicitado");
  const salvar = useMutation({
    mutationFn: () => criarFn({ data: { queryId: r.queryId, routeId: rota?.id ?? null, numero: p.numeroFormatado, tribunal: p.tribunalSigla, unidade: p.orgaoJulgador, metodo: rota?.tipo_rota ?? rota?.metodo ?? null, url: rota?.url_certidao ?? rota?.url_fonte ?? null, requisitos: rota?.requisitos ?? null, texto, observacao: obs || null, status, canal: canal || null, destinatario: destinatario || null, demo: false } }),
    onSuccess: () => { toast.success("Ficha registrada"); qc.invalidateQueries({ queryKey: ["cpn-painel"] }); qc.invalidateQueries({ queryKey: ["cpn-hist"] }); fechar(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });
  return (
    <section className={`${card} lg:col-span-3`}>
      <h2 className="mb-3 font-display font-bold">{modo === "assistida" ? "Solicitação assistida" : "Registrar resultado"}</h2>
      {modo === "assistida" && (
        <div className="mb-3 rounded-xl bg-secondary/60 p-3 text-sm">
          <p className="font-semibold">Checklist</p>
          <ul className="mt-1 space-y-0.5">
            {["Conferir que o perfil do solicitante corresponde à rota", ...passos, "Registrar data, canal e status nesta ficha", "Ao receber o PDF, anexá-lo em Pendências para validar"].map((x) => <li key={x}>☐ {x}</li>)}
          </ul>
        </div>
      )}
      <dl className="grid gap-x-6 sm:grid-cols-2">
        <Campo k="Tribunal" v={p.tribunalSigla} />
        <Campo k="Unidade" v={p.orgaoJulgador ?? "não confirmada pela fonte"} />
        <Campo k="Processo" v={p.numeroFormatado} />
        <Campo k="Tipo" v="Certidão de Objeto e Pé / Narratória" />
        <Campo k="Rota" v={rota?.tipo_rota ?? rota?.metodo} />
        <Campo k="URL oficial" v={rota?.url_certidao ?? rota?.url_fonte} />
        <Campo k="Requisitos" v={rota?.requisitos} />
      </dl>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-semibold">Canal oficial
          <select value={canal} onChange={(e) => { setCanal(e.target.value); setDestinatario(canais.find((c) => c.rotulo === e.target.value)?.valor ?? ""); }} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal">
            <option value="">— não informado —</option>
            {canais.map((c) => <option key={c.rotulo} value={c.rotulo}>{c.rotulo}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">Destinatário (endereço oficial publicado)
          <input value={destinatario} onChange={(e) => setDestinatario(e.target.value)} placeholder="ex.: e-mail oficial da unidade" className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal" />
        </label>
      </div>
      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario) && <a className={`${btn} mt-2`} href={`mailto:${destinatario}?subject=${encodeURIComponent(`Certidão de Objeto e Pé — ${p.numeroFormatado}`)}&body=${encodeURIComponent(texto)}`}>Abrir e-mail oficial</a>}
      {/^https:\/\//.test(destinatario) && <a className={`${btn} mt-2`} href={destinatario} target="_blank" rel="noopener noreferrer">Abrir canal oficial</a>}
      <label className="mt-3 block text-sm font-semibold">Texto-base de solicitação (revise antes de enviar — a CPN não envia nada)</label>
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={7} className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-sm" />
      <label className="mt-3 block text-sm font-semibold">Observações</label>
      <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-sm" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusOperacao)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
          {Object.entries(STATUS_OPERACAO).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button type="button" className={btn} onClick={() => copiar(texto)}><ClipboardCopy className="h-4 w-4" /> Copiar texto</button>
        <button type="button" disabled={salvar.isPending} onClick={() => salvar.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {modo === "assistida" ? "Registrar solicitação" : "Registrar resultado"}
        </button>
      </div>
    </section>
  );
}

type Pend = OpDoc & { id: string; numero_processo: string; tribunal_sigla: string | null; status: string; observacao: string | null; demo: boolean; created_at: string; updated_at: string };

function Pendencias({ itens }: { itens: Pend[] }) {
  const qc = useQueryClient();
  const atualizarFn = useServerFn(atualizarOperacao);
  const mut = useMutation({
    mutationFn: (v: { id: string; status: StatusOperacao }) => atualizarFn({ data: v }),
    onSuccess: () => { toast.success("Status atualizado"); qc.invalidateQueries({ queryKey: ["cpn-painel"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma pendência manual.</p>;
  return (
    <ul className="divide-y divide-border text-sm">
      {itens.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
          <span><span className="font-mono">{o.numero_processo}</span> · {o.tribunal_sigla ?? "—"}
            {o.observacao && <span className="block text-xs text-muted-foreground">{o.observacao}</span>}
            <DocumentoOficial op={o} /></span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{new Date(o.updated_at).toLocaleString("pt-BR")}</span>
            <select value={o.status} onChange={(e) => mut.mutate({ id: o.id, status: e.target.value as StatusOperacao })} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
              {Object.entries(STATUS_OPERACAO).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Mostrado enquanto o servidor consulta o DataJud: só a estrutura do número, nada inferido. */
function IdentificacaoImediata({ numero }: { numero: string }) {
  const pts = analisarNup(numero);
  return (
    <section className={card}>
      <h2 className="mb-2 font-display font-bold">Identificação pelo número</h2>
      {pts ? (
        <dl>
          <Campo k="Número CNJ" v={<span className="font-mono">{pts.formatado}</span>} />
          <Campo k="Dígito verificador" v={pts.digitoValido ? <span className="text-live">Válido</span> : <span className="text-destructive">Inválido</span>} />
          <Campo k="Segmento (J)" v={pts.segmento} />
          <Campo k="Tribunal (TR)" v={pts.codigoTribunal} />
          <Campo k="Origem (OOOO)" v={`${pts.codigoOrigem} (não define vara/comarca)`} />
        </dl>
      ) : <p className="text-sm text-destructive">Número incompleto: são necessários 20 dígitos.</p>}
      <p className="mt-3 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Consultando o DataJud… a resposta pode levar até 20 segundos.
      </p>
    </section>
  );
}
