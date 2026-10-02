import { ExternalLink } from "lucide-react";
import { CATEGORIAS_ROTA, PERFIS_ROTA, TIPOS_ROTA, canaisDaRota, passosDaRota, statusRota, tipoRotaValido, type RotaCertidao } from "@/lib/cpn";
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
export function PainelRota({ rota, alternativas, tribunal, onEscolher, alertas }: {
  rota: RotaCertidao | null; alternativas: RotaCertidao[]; tribunal: string | null; alertas: string[]; onEscolher: (id: string) => void;
}) {
  const st = statusRota(rota);
  const tipo = TIPOS_ROTA[tipoRotaValido(rota?.tipo_rota)];
  const passos = passosDaRota(rota);
  const canais = canaisDaRota(rota);
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fonte: catálogo CPN de rotas (cada rota com evidência oficial)</p>
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
            </li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}
