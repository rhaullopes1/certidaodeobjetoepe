import { Copy, ExternalLink, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { ROTULO_ORIGEM, instrucoesEncaminhamento, type Enriquecimento } from "@/lib/cpn-enriquecimento";
import { CATEGORIAS_ROTA, PERFIS_ROTA, TIPOS_ROTA, canaisDaRota, passosDaRota, statusRota, tipoRotaValido, type AvaliacaoRota, type PerfilSolicitante, type RotaCertidao } from "@/lib/cpn";
import { AvisoAssistida } from "./cpn-documento";

const simNao = (b: boolean | null | undefined) => (b === null || b === undefined ? null : b ? "Sim" : "Não");

function Item({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2 py-0.5 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words font-medium">{v ?? <span className="text-muted-foreground">não informado na fonte</span>}</dd>
    </div>
  );
}

function Secao({ n, t, children }: { n: number; t: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-2">
      <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{n}. {t}</h3>
      {children}
    </div>
  );
}

export function SeloStatusRota({ rota }: { rota: RotaCertidao | null }) {
  const st = statusRota(rota);
  const c = CATEGORIAS_ROTA[st.categoria];
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${c.classe}`}>{c.emoji} {c.rotulo}</span>;
}

const link = (url: string, texto?: string) => <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline"><ExternalLink className="h-3 w-3" />{texto ?? url}</a>;

/** Painel da Rota de Solicitação: só dados cadastrados com fonte; ausência = "não informado na fonte". */
const APLIC: Record<string, { t: string; c: string }> = {
  sim: { t: "Aplicável", c: "bg-live/15 text-live" },
  indeterminado: { t: "Indeterminada — falta dado", c: "bg-gold/15 text-foreground" },
  nao: { t: "Não aplicável", c: "bg-destructive/10 text-destructive" },
};

export function PainelRota({ rota, alternativas, tribunal, onEscolher, alertas, avaliacoes = [], perfil = null, onPerfil }: {
  rota: RotaCertidao | null; alternativas: RotaCertidao[]; tribunal: string | null; alertas: string[]; onEscolher: (id: string) => void;
  avaliacoes?: AvaliacaoRota[]; perfil?: PerfilSolicitante | null; onPerfil?: (p: PerfilSolicitante | null) => void;
}) {
  const avDe = (id: string | undefined) => avaliacoes.find((a) => a.rotaId === id);
  const st = statusRota(rota);
  const tipo = TIPOS_ROTA[tipoRotaValido(rota?.tipo_rota)];
  const passos = passosDaRota(rota);
  const canais = canaisDaRota(rota);
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fonte: catálogo CPN de rotas (cada rota com evidência oficial)</p>
      {onPerfil && (
        <label className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold">Perfil do solicitante:</span>
          <select aria-label="Perfil do solicitante" value={perfil ?? ""} onChange={(e) => onPerfil((e.target.value || null) as PerfilSolicitante | null)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
            <option value="">Não informado</option>
            <option value="parte_advogado_habilitado">{PERFIS_ROTA.parte_advogado_habilitado}</option>
            <option value="terceiro_ou_advogado_nao_cadastrado">{PERFIS_ROTA.terceiro_ou_advogado_nao_cadastrado}</option>
          </select>
        </label>
      )}
      {rota && avDe(rota.id) && <Aval a={avDe(rota.id)!} />}
      <Secao n={3} t="Tipo de certidão"><p className="text-sm">Certidão de Objeto e Pé / Narratória</p></Secao>
      <Secao n={4} t="Status da rota">
        <SeloStatusRota rota={rota} />
        {rota ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {tipo.rotulo} — {tipo.natureza}
            {!st.verificada && <> Declarada no catálogo: {CATEGORIAS_ROTA[st.declarada].rotulo}; fica VERIFICAR até um administrador confirmar a evidência.</>}
            {" "}Integração CPN: {rota.automacao_cpn === "homologada" ? "homologada" : "não homologada (a CPN não executa no portal)"}.
          </p>
        ) : <p className="mt-1 text-xs text-muted-foreground">Nenhuma rota cadastrada para {tribunal ?? "este tribunal"} neste contexto. Verificar em fonte oficial antes de orientar.</p>}
      </Secao>
      {rota && (
        <>
          <Secao n={5} t="Onde solicitar">
            <p className="text-sm">{tipo.rotulo}{rota.sistema ? ` · ${rota.sistema}` : ""}{rota.grau ? ` · ${rota.grau}` : ""}</p>
            {rota.url_certidao && <p className="text-xs">{link(rota.url_certidao, "Abrir página oficial da solicitação")}</p>}
          </Secao>
          <Secao n={6} t="Como solicitar — passo a passo">
            {passos.length ? <ol className="list-decimal space-y-0.5 pl-5 text-sm">{passos.map((s) => <li key={s}>{s}</li>)}</ol> : <p className="text-xs text-muted-foreground">Passo a passo não cadastrado.</p>}
          </Secao>
          <Secao n={7} t="Quem pode solicitar">
            <p className="text-sm">{rota.quem_pode ?? <span className="text-muted-foreground">não informado na fonte</span>}</p>
            <p className="text-xs text-muted-foreground">Perfil da rota: {PERFIS_ROTA[rota.perfil ?? "qualquer"] ?? rota.perfil}</p>
          </Secao>
          <Secao n={8} t="Requisitos / documentos">
            <dl>
              <Item k="Requisitos" v={rota.requisitos} />
              <Item k="Login" v={simNao(rota.exige_login)} />
              <Item k="Advogado" v={simNao(rota.exige_advogado)} />
              <Item k="Petição" v={simNao(rota.exige_peticao)} />
              <Item k="Procuração" v={simNao(rota.exige_procuracao)} />
              <Item k="Identificação" v={simNao(rota.exige_identificacao)} />
              <Item k="Finalidade" v={simNao(rota.exige_finalidade)} />
              <Item k="Pagamento" v={simNao(rota.exige_pagamento)} />
            </dl>
          </Secao>
          <Secao n={9} t="Prazo / custo / entrega (somente com fonte oficial)">
            <dl><Item k="Prazo" v={rota.prazo} /><Item k="Custo" v={rota.custo} /><Item k="Entrega" v={rota.forma_entrega} /></dl>
          </Secao>
          <Secao n={10} t="Canais oficiais">
            {canais.length ? (
              <ul className="space-y-0.5 text-sm">{canais.map((c) => (
                <li key={c.rotulo}>{c.rotulo}: {c.valor ? (/^https:\/\//.test(c.valor) ? link(c.valor) : <b>{c.valor}</b>) : <span className="text-muted-foreground">endereço específico não cadastrado — usar só o publicado pela unidade</span>}</li>
              ))}</ul>
            ) : <p className="text-xs text-muted-foreground">Nenhum canal cadastrado.</p>}
          </Secao>
          <Secao n={11} t="Links oficiais">
            <dl>
              <Item k="Solicitação" v={rota.url_certidao ? link(rota.url_certidao) : null} />
              <Item k="Autenticidade" v={rota.autenticidade_url ? link(rota.autenticidade_url) : null} />
            </dl>
          </Secao>
          <Secao n={12} t="Evidência da informação">
            <p className="text-sm">{rota.url_fonte ? link(rota.url_fonte, rota.fonte_evidencia ?? "Fonte oficial") : rota.fonte_evidencia ?? <span className="text-destructive">sem fonte cadastrada</span>}</p>
            {rota.fonte_trecho && <blockquote className="mt-1 border-l-2 border-border pl-2 text-xs italic text-muted-foreground">"{rota.fonte_trecho}"</blockquote>}
            {rota.observacoes && <p className="mt-1 text-xs">Obs.: {rota.observacoes}</p>}
            {rota.excecoes && <p className="text-xs">Exceções: {rota.excecoes}</p>}
          </Secao>
          <Secao n={13} t="Última verificação">
            <p className="text-sm">{rota.ultima_verificacao ?? "—"} · {st.verificada ? "verificada por administrador" : "pendente de verificação"}</p>
          </Secao>
          {tipoRotaValido(rota.tipo_rota).startsWith("ASSISTIDA") && <AvisoAssistida requisitos={rota.requisitos} url={rota.url_certidao} />}
        </>
      )}
      {alertas.length > 0 && <ul className="space-y-1 text-xs">{alertas.map((a) => <li key={a} className="rounded-lg bg-gold/15 px-2 py-1">⚠ {a}</li>)}</ul>}
      {alternativas.length > 0 && (
        <div className="border-t border-border pt-2">
          <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Outras rotas do catálogo para este processo</h3>
          <ul className="space-y-1">{alternativas.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => onEscolher(a.id)} className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-2 py-1 text-left text-xs hover:bg-secondary">
                <span>{TIPOS_ROTA[tipoRotaValido(a.tipo_rota)].rotulo} · {PERFIS_ROTA[a.perfil ?? "qualquer"] ?? a.perfil}{a.sistema ? ` · ${a.sistema}` : ""}{a.grau ? ` · ${a.grau}` : ""}</span>
                <SeloStatusRota rota={a} />
              </button>
              {avDe(a.id) && <Aval a={avDe(a.id)!} />}
            </li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}

/** "Dados enriquecidos da base CPN" + encaminhamento "Solicitar nesta unidade/canal". */
export function DadosEnriquecidos({ en, sigilo }: { en: Enriquecimento | null | undefined; sigilo: boolean }) {
  if (!en) return <p className="text-xs text-muted-foreground">Tribunal não identificado — sem dados da base.</p>;
  const c = en.canal;
  const instr = instrucoesEncaminhamento(en);
  const tel = c.telefone?.split("/")[0].replace(/\D/g, "");
  const copiar = (t: string) => { void navigator.clipboard.writeText(t); toast.success("Copiado"); };
  const b = "inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-secondary";
  return (
    <div className="space-y-3">
      <dl>
        {en.campos.map((f) => (
          <div key={f.rotulo} className="grid grid-cols-[8.5rem_1fr] gap-2 py-0.5 text-sm">
            <dt className="text-muted-foreground">{f.rotulo}</dt>
            <dd className="min-w-0 break-words font-medium">{f.valor} <span className="text-[10px] font-normal text-muted-foreground">({ROTULO_ORIGEM[f.origem]})</span></dd>
          </div>
        ))}
        {!en.unidade && <p className="text-xs text-muted-foreground">Unidade judiciária: não identificada na base (não deduzida do código de origem).</p>}
      </dl>
      {en.fonteUnidade && (
        <p className="text-xs text-muted-foreground">Fonte da unidade: {en.fonteUnidade.url ? link(en.fonteUnidade.url, en.fonteUnidade.tipo ?? "fonte") : en.fonteUnidade.tipo ?? "sem fonte registrada"} · última verificação: {en.fonteUnidade.data ?? "—"}</p>
      )}
      <div className="rounded-xl border border-border p-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Solicitar nesta unidade/canal</h4>
        <p className={`mt-1 text-xs font-semibold ${c.status === "confirmado" ? "text-live" : c.status === "canal_tribunal" ? "text-gold" : "text-destructive"}`}>
          {c.status === "confirmado" ? "Canal específico da unidade (cadastrado com fonte)" : c.status === "canal_tribunal" ? "Canal geral do tribunal — confirmar se atende esta certidão/unidade" : "Não identificado — verificar"}
        </p>
        <ul className="mt-1 space-y-0.5 text-xs">{instr.map((l) => <li key={l}>{l}</li>)}</ul>
        {sigilo && <p className="mt-1 text-xs text-destructive">Processo sigiloso: não incluir dados de mérito no pedido.</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {c.email && <><a href={`mailto:${c.email}`} className={b}><Mail className="h-3 w-3" /> Abrir e-mail</a><button type="button" className={b} onClick={() => copiar(c.email!)}><Copy className="h-3 w-3" /> Copiar e-mail</button></>}
          {tel && tel.length >= 8 && <a href={`tel:${tel}`} className={b}><Phone className="h-3 w-3" /> Ligar</a>}
          {c.balcaoVirtualUrl && <a href={c.balcaoVirtualUrl} target="_blank" rel="noopener noreferrer" className={b}><ExternalLink className="h-3 w-3" /> Balcão Virtual</a>}
          {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className={b}><ExternalLink className="h-3 w-3" /> {c.fallback ? "Canal geral do tribunal" : "Canal da unidade"}</a>}
          {c.status !== "nao_cadastrado" && <button type="button" className={b} onClick={() => copiar(instr.join("\n"))}><Copy className="h-3 w-3" /> Copiar encaminhamento</button>}
        </div>
      </div>
      {en.canaisGerais.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Canais gerais do tribunal (contexto — não são a rota da Objeto e Pé)</h4>
          <ul className="mt-1 space-y-1 text-xs">{en.canaisGerais.map((g) => (
            <li key={g.rotulo}>{link(g.url, g.rotulo)} <span className="text-muted-foreground">· fonte: {g.fonte ?? "não registrada"} · verificado em {g.verificadaEm ?? "—"}</span></li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}

function Aval({ a }: { a: AvaliacaoRota }) {
  const s = APLIC[a.aplicavel];
  return (
    <div className="mt-1 rounded-lg border border-border px-2 py-1 text-[11px]">
      <span className={`rounded-full px-2 py-0.5 font-bold ${s.c}`}>{s.t}</span>
      {a.motivos.length > 0 && <span className="ml-1 text-muted-foreground">{a.motivos.join(" · ")}</span>}
      {a.faltando.length > 0 && <p className="mt-0.5 text-destructive">Falta: {a.faltando.join(" · ")}</p>}
    </div>
  );
}
