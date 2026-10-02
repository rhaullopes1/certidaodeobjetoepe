import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { analisarNup } from "./cnj";
import { decodificarPartes } from "./cnj.functions";
import { CASOS_DEMO, escolherRota, type Modalidade, type RotaCertidao, type StatusOperacao, STATUS_OPERACAO } from "./cpn";

type Sb = SupabaseClient<Database>;

async function exigirEquipe(supabase: Sb, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!data || data.length === 0) throw new Error("Acesso restrito à equipe.");
  return data.some((p) => p.role === "admin");
}

async function auditar(supabase: Sb, userId: string, acao: string, extra: { numero?: string | null; route_id?: string | null; operacao_id?: string | null; resultado?: string | null; detalhes?: Json } = {}) {
  await supabase.from("cpn_audit_logs").insert({
    operador_id: userId,
    acao,
    numero_processo: extra.numero ?? null,
    route_id: extra.route_id ?? null,
    operacao_id: extra.operacao_id ?? null,
    resultado: extra.resultado ?? null,
    detalhes: extra.detalhes ?? {},
  });
}

export interface ProcessoCpn {
  numeroFormatado: string;
  digitoValido: boolean;
  segmento: string | null;
  tribunalSigla: string | null;
  tribunalNome: string | null;
  uf: string | null;
  codigoOrigem: string | null;
  grau: string | null;
  orgaoJulgador: string | null;
  sistema: string | null;
  classe: string | null;
  assuntos: string[];
  movimentos: { nome: string; dataHora: string | null }[];
  nivelSigilo: number | null;
  dataAjuizamento: string | null;
}

export interface ResultadoCpn {
  queryId: string | null;
  demo: boolean;
  erro: string | null;
  datajud: { status: string; fonte: string; erro?: string } | null;
  processo: ProcessoCpn | null;
  modalidade: Modalidade;
  rota: RotaCertidao | null;
  alertas: string[];
}

/** Localiza o processo: CNJ → tabela de tribunais → DataJud (server-side) → motor de rotas. */
export const localizarProcesso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { numero: string; demo?: boolean }) => ({ numero: String(i?.numero ?? "").slice(0, 60), demo: Boolean(i?.demo) }))
  .handler(async ({ data, context }): Promise<ResultadoCpn> => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const partes = analisarNup(data.numero);

    const registrar = async (r: Omit<ResultadoCpn, "queryId">, status: string) => {
      const { data: q } = await supabase
        .from("cpn_process_queries")
        .insert({
          numero_raw: data.numero,
          numero_normalizado: partes ? partes.formatado : null,
          cnj_valido: Boolean(partes?.digitoValido),
          tribunal_sigla: r.processo?.tribunalSigla ?? null,
          status,
          modalidade: r.processo ? r.modalidade : null,
          route_id: r.rota?.id ?? null,
          demo: r.demo,
          fonte: r.demo ? "DEMO (dados locais fictícios)" : r.datajud?.status === "ok" ? r.datajud.fonte : "Tabela CNJ",
          dados_json: JSON.parse(JSON.stringify({ processo: r.processo, datajud: r.datajud, alertas: r.alertas })) as Json,
          operador_id: userId,
        })
        .select("id")
        .single();
      await auditar(supabase, userId, "consulta", { numero: partes?.formatado ?? data.numero, route_id: r.rota?.id, resultado: status, detalhes: { demo: r.demo } });
      return { ...r, queryId: q?.id ?? null };
    };

    const vazio = { demo: data.demo, datajud: null, processo: null, modalidade: "VERIFICAR" as Modalidade, rota: null, alertas: [] };
    if (!partes) return registrar({ ...vazio, erro: "Número inválido: informe os 20 dígitos do número único (CNJ)." }, "invalido");
    if (!partes.digitoValido) return registrar({ ...vazio, erro: "Dígito verificador inválido (Módulo 97). Confira o número digitado." }, "invalido");

    const dec = await decodificarPartes(partes);
    const { data: trib } = await supabase
      .from("cnj_tribunais")
      .select("id, sigla, nome, uf")
      .eq("segmento", partes.segmento)
      .eq("codigo_tr", partes.codigoTribunal)
      .maybeSingle();

    const demoCaso = data.demo ? CASOS_DEMO.find((c) => c.numero === partes.formatado) : undefined;
    let datajud: ResultadoCpn["datajud"] = null;
    let fonteDados: Partial<ProcessoCpn> = {};
    if (data.demo) {
      if (!demoCaso) return registrar({ ...vazio, erro: "Este número não é um caso DEMO. Desative o modo DEMO para consulta real." }, "erro");
      const d = demoCaso.dados;
      fonteDados = { sistema: d.sistema, grau: d.grau, orgaoJulgador: d.orgaoJulgador, classe: d.classe, assuntos: [...d.assuntos], nivelSigilo: d.nivelSigilo, movimentos: [{ nome: "DEMO — Conclusos para despacho", dataHora: null }] };
    } else if (trib) {
      const { consultarDatajud } = await import("./datajud.server");
      const r = await consultarDatajud(partes.formatado, trib.sigla, { timeoutMs: 20000 });
      datajud = { status: r.status, fonte: r.fonte, ...(r.erro ? { erro: r.erro.slice(0, 200) } : {}) };
      if (r.status === "ok") {
        fonteDados = { sistema: r.sistema, grau: r.grau, orgaoJulgador: r.orgaoJulgador, classe: r.classe, assuntos: r.assuntos, movimentos: r.ultimosMovimentos, nivelSigilo: r.nivelSigilo, dataAjuizamento: r.dataAjuizamento };
      }
    }

    const sigilo = fonteDados.nivelSigilo ?? null;
    const processo: ProcessoCpn = {
      numeroFormatado: partes.formatado,
      digitoValido: true,
      segmento: dec.segmentoNome,
      tribunalSigla: trib?.sigla ?? dec.tribunalSigla,
      tribunalNome: trib?.nome ?? dec.tribunalNome,
      uf: trib?.uf ?? dec.uf,
      codigoOrigem: partes.codigoOrigem,
      grau: fonteDados.grau ?? null,
      // Segredo de justiça: não exibir detalhes de mérito.
      orgaoJulgador: fonteDados.orgaoJulgador ?? null,
      sistema: fonteDados.sistema ?? null,
      classe: sigilo && sigilo > 0 ? null : fonteDados.classe ?? null,
      assuntos: sigilo && sigilo > 0 ? [] : fonteDados.assuntos ?? [],
      movimentos: sigilo && sigilo > 0 ? [] : fonteDados.movimentos ?? [],
      nivelSigilo: sigilo,
      dataAjuizamento: fonteDados.dataAjuizamento ?? null,
    };

    let rotas: RotaCertidao[] = [];
    if (trib) {
      const { data: rs } = await supabase.from("cpn_certificate_routes").select("*").eq("tribunal_id", trib.id).eq("ativo", true);
      rotas = (rs ?? []) as unknown as RotaCertidao[];
    }
    const escolha = escolherRota(rotas, { sistema: processo.sistema, grau: processo.grau, nivelSigilo: sigilo });
    const localizado = data.demo || datajud?.status === "ok";
    const status = !trib ? "tribunal_nao_identificado" : localizado ? "localizado" : datajud?.status === "indisponivel" || datajud?.status === "limite_requisicoes" ? "erro" : "nao_localizado";
    return registrar({ demo: data.demo, erro: null, datajud, processo, modalidade: escolha.modalidade, rota: escolha.rota, alertas: escolha.alertas }, status);
  });

/** Dashboard, últimas consultas, pendências manuais e catálogo de rotas. */
export const painelCpn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const admin = await exigirEquipe(supabase, userId);
    const inicio = new Date();
    inicio.setUTCHours(3, 0, 0, 0); // meia-noite em Brasília
    if (inicio.getTime() > Date.now()) inicio.setUTCDate(inicio.getUTCDate() - 1);

    const [{ data: hoje }, { data: ultimas }, { data: pendencias }, { data: rotas }] = await Promise.all([
      supabase.from("cpn_process_queries").select("status, modalidade").gte("consultado_em", inicio.toISOString()).limit(2000),
      supabase.from("cpn_process_queries").select("id, numero_normalizado, numero_raw, tribunal_sigla, status, modalidade, demo, consultado_em").order("consultado_em", { ascending: false }).limit(15),
      supabase.from("cpn_operacoes").select("*").not("status", "in", "(entregue)").order("created_at", { ascending: false }).limit(50),
      supabase.from("cpn_certificate_routes").select("id, sistema, modalidade, metodo, url_fonte, ultima_verificacao, automacao_cpn, cnj_tribunais(sigla)").eq("ativo", true).order("prioridade"),
    ]);
    const h = hoje ?? [];
    const conta = (f: (x: (typeof h)[number]) => boolean) => h.filter(f).length;
    return {
      admin,
      stats: {
        consultas: h.length,
        localizados: conta((x) => x.status === "localizado"),
        automaticas: conta((x) => x.modalidade === "AUTOMATICA"),
        semiautomaticas: conta((x) => x.modalidade === "SEMIAUTOMATICA"),
        manuais: conta((x) => x.modalidade === "MANUAL"),
        naoLocalizados: conta((x) => x.status === "nao_localizado" || x.status === "tribunal_nao_identificado"),
        erros: conta((x) => x.status === "erro" || x.status === "invalido"),
      },
      ultimas: ultimas ?? [],
      pendencias: pendencias ?? [],
      rotas: (rotas ?? []).map((r) => ({ ...r, tribunal: (r.cnj_tribunais as { sigla: string } | null)?.sigla ?? "?" })),
    };
  });

/** Cria ficha operacional (fluxo manual / registro de resultado). Não envia nada externamente. */
export const criarOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { queryId: string | null; routeId: string | null; numero: string; tribunal: string | null; unidade: string | null; metodo: string | null; url: string | null; requisitos: string | null; texto: string | null; observacao: string | null; status: StatusOperacao; demo: boolean }) => ({
    ...i,
    status: (i.status in STATUS_OPERACAO ? i.status : "aguardando") as StatusOperacao,
    numero: String(i.numero).slice(0, 40),
    texto: i.texto ? String(i.texto).slice(0, 5000) : null,
    observacao: i.observacao ? String(i.observacao).slice(0, 2000) : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const { data: op, error } = await supabase
      .from("cpn_operacoes")
      .insert({ query_id: data.queryId, route_id: data.routeId, numero_processo: data.numero, tribunal_sigla: data.tribunal, unidade: data.unidade, metodo: data.metodo, url_oficial: data.url, requisitos: data.requisitos, texto_solicitacao: data.texto, observacao: data.observacao, status: data.status, demo: data.demo, operador_id: userId })
      .select("id")
      .single();
    if (error || !op) throw new Error("Não foi possível registrar a operação.");
    await auditar(supabase, userId, "criar_operacao", { numero: data.numero, route_id: data.routeId, operacao_id: op.id, resultado: data.status });
    return { id: op.id };
  });

export const atualizarOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; status: StatusOperacao; observacao?: string | null; documentoUrl?: string | null }) => ({
    id: String(i.id),
    status: (i.status in STATUS_OPERACAO ? i.status : "aguardando") as StatusOperacao,
    observacao: i.observacao ? String(i.observacao).slice(0, 2000) : null,
    documentoUrl: i.documentoUrl && /^https?:\/\//.test(i.documentoUrl) ? String(i.documentoUrl).slice(0, 500) : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const patch: Database["public"]["Tables"]["cpn_operacoes"]["Update"] = { status: data.status };
    if (data.observacao) patch.observacao = data.observacao;
    if (data.documentoUrl) patch.documento_url = data.documentoUrl;
    const { data: op, error } = await supabase.from("cpn_operacoes").update(patch).eq("id", data.id).select("numero_processo, route_id").single();
    if (error || !op) throw new Error("Não foi possível atualizar a operação.");
    await auditar(supabase, userId, "atualizar_operacao", { numero: op.numero_processo, route_id: op.route_id, operacao_id: data.id, resultado: data.status });
    return { ok: true };
  });

/** Marca rota como verificada hoje (somente admin — RLS também exige). */
export const marcarRotaVerificada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { routeId: string }) => ({ routeId: String(i.routeId) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await exigirEquipe(supabase, userId);
    if (!admin) throw new Error("Somente administradores podem verificar rotas.");
    const hoje = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("cpn_certificate_routes").update({ ultima_verificacao: hoje, verificado_por: userId }).eq("id", data.routeId);
    if (error) throw new Error("Não foi possível marcar a rota.");
    await auditar(supabase, userId, "verificar_rota", { route_id: data.routeId, resultado: hoje });
    return { ok: true, data: hoje };
  });

/** Registra ações simples do operador (abrir fonte, copiar rota). */
export const registrarAcaoCpn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { acao: "abrir_fonte" | "abrir_certidao" | "copiar_rota" | "copiar_solicitacao"; numero: string | null; routeId: string | null }) => ({
    acao: (["abrir_fonte", "abrir_certidao", "copiar_rota", "copiar_solicitacao"].includes(i.acao) ? i.acao : "abrir_fonte") as string,
    numero: i.numero ? String(i.numero).slice(0, 40) : null,
    routeId: i.routeId ? String(i.routeId) : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    await auditar(supabase, userId, data.acao, { numero: data.numero, route_id: data.routeId });
    return { ok: true };
  });

/** Histórico de auditoria e operações de um processo. */
export const historicoProcessoCpn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { numero: string }) => ({ numero: String(i.numero).slice(0, 40) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const [{ data: logs }, { data: ops }] = await Promise.all([
      supabase.from("cpn_audit_logs").select("id, acao, resultado, created_at").eq("numero_processo", data.numero).order("created_at", { ascending: false }).limit(50),
      supabase.from("cpn_operacoes").select("id, status, observacao, created_at, updated_at, demo").eq("numero_processo", data.numero).order("created_at", { ascending: false }),
    ]);
    return { logs: logs ?? [], operacoes: ops ?? [] };
  });
