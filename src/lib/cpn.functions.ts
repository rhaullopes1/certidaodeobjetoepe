import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { analisarNup } from "./cnj";
import { decodificarPartes } from "./cnj.functions";
import { montarEnriquecimento, type Enriquecimento, type TribunalEnriq, type UnidadeEnriq } from "./cpn-enriquecimento";
import { calcularCobertura, dadosConfirmados, escolherRota, prepararMarcacaoRota, statusConsulta, type AcaoRota, type Modalidade, type RotaCertidao, type StatusOperacao, STATUS_OPERACAO } from "./cpn";

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
  alternativas?: RotaCertidao[];
  enriquecimento?: Enriquecimento | null;
}

/** Localiza o processo: CNJ → tabela de tribunais → DataJud (server-side) → motor de rotas. */
export const localizarProcesso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { numero: string }) => ({ numero: String(i?.numero ?? "").slice(0, 60), demo: false as const }))
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
          fonte: r.datajud?.status === "ok" ? r.datajud.fonte : "Cadastro CNJ (não confirmado pela fonte)",
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
      .select("id, sigla, nome, uf, consulta_processual_url, consulta_processual_fonte, consulta_processual_verificada_em, balcao_virtual_url, balcao_virtual_fonte, balcao_virtual_verificada_em, certidoes_url, certidoes_tipo, certidoes_email, certidoes_telefone, certidoes_instrucoes, certidoes_fonte, certidoes_verificada_em")
      .eq("segmento", partes.segmento)
      .eq("codigo_tr", partes.codigoTribunal)
      .maybeSingle();

    let datajud: ResultadoCpn["datajud"] = null;
    let fonteDados: Partial<ProcessoCpn> = {};
    if (trib) {
      const { consultarDatajud } = await import("./datajud.server");
      const r = await consultarDatajud(partes.formatado, trib.sigla, { timeoutMs: 20000 });
      datajud = { status: r.status, fonte: r.fonte, ...(r.erro ? { erro: r.erro.slice(0, 200) } : {}) };
      fonteDados = dadosConfirmados(r);
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
    let enriquecimento: Enriquecimento | null = null;
    if (trib) {
      const [{ data: com }, { data: unids }] = await Promise.all([
        supabase.from("cnj_comarcas").select("nome, cidade, uf, foro, fonte_url, fonte_atualizada_em").eq("tribunal_id", trib.id).eq("codigo_origem", partes.codigoOrigem).maybeSingle(),
        supabase.from("comarcas_contatos").select("*").eq("tribunal", trib.sigla).eq("ativo", true).limit(2000),
      ]);
      enriquecimento = montarEnriquecimento({
        tribunal: trib as unknown as TribunalEnriq,
        segmento: dec.segmentoNome,
        codigoOrigem: partes.codigoOrigem,
        comarcaCnj: com ?? null,
        unidades: (unids ?? []) as unknown as UnidadeEnriq[],
        vara: processo.orgaoJulgador,
      });
    }
    const escolha = escolherRota(rotas, { sistema: processo.sistema, grau: processo.grau, nivelSigilo: sigilo });
    const status = statusConsulta({ tribunalIdentificado: Boolean(trib), datajudStatus: datajud?.status ?? null });
    return registrar({ demo: data.demo, erro: null, datajud, processo, modalidade: escolha.modalidade, rota: escolha.rota, alertas: escolha.alertas, alternativas: escolha.alternativas ?? [], enriquecimento }, status);
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
      supabase.from("cpn_process_queries").select("status, modalidade, demo").gte("consultado_em", inicio.toISOString()).limit(2000),
      supabase.from("cpn_process_queries").select("id, numero_normalizado, numero_raw, tribunal_sigla, status, modalidade, demo, consultado_em").eq("demo", false).order("consultado_em", { ascending: false }).limit(15),
      supabase.from("cpn_operacoes").select("*").eq("demo", false).not("status", "in", "(entregue)").order("created_at", { ascending: false }).limit(50),
      supabase.from("cpn_certificate_routes").select("id, sistema, modalidade, metodo, url_fonte, ultima_verificacao, automacao_cpn, status_verificacao, cnj_tribunais(sigla)").eq("ativo", true).order("prioridade"),
    ]);
    const todos = hoje ?? [];
    const h = todos.filter((x) => !x.demo);
    const conta = (f: (x: (typeof h)[number]) => boolean) => h.filter(f).length;
    return {
      admin,
      stats: {
        consultas: h.length,
        localizados: conta((x) => x.status === "confirmado" || x.status === "localizado"),
        automaticas: conta((x) => x.modalidade === "AUTOMATICA"),
        semiautomaticas: conta((x) => x.modalidade === "SEMIAUTOMATICA"),
        manuais: conta((x) => x.modalidade === "MANUAL"),
        naoLocalizados: conta((x) => ["nao_encontrado", "nao_localizado", "tribunal_nao_identificado"].includes(x.status)),
        erros: conta((x) => ["fonte_indisponivel", "erro", "invalido"].includes(x.status)),
        demo: todos.length - h.length,
      },
      ultimas: ultimas ?? [],
      pendencias: pendencias ?? [],
      rotas: (rotas ?? []).map((r) => ({ ...r, tribunal: (r.cnj_tribunais as { sigla: string } | null)?.sigla ?? "?" })),
    };
  });

/** Cria ficha operacional (fluxo manual / registro de resultado). Não envia nada externamente. */
export const criarOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { queryId: string | null; routeId: string | null; numero: string; tribunal: string | null; unidade: string | null; metodo: string | null; url: string | null; requisitos: string | null; texto: string | null; observacao: string | null; status: StatusOperacao; canal?: string | null; destinatario?: string | null; demo: boolean }) => ({
    canal: i.canal ? String(i.canal).slice(0, 200) : null,
    destinatario: i.destinatario ? String(i.destinatario).slice(0, 300) : null,
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
      .insert({ query_id: data.queryId, route_id: data.routeId, numero_processo: data.numero, tribunal_sigla: data.tribunal, unidade: data.unidade, metodo: data.metodo, url_oficial: data.url, requisitos: data.requisitos, texto_solicitacao: data.texto, observacao: data.observacao, status: data.status, canal: data.canal, destinatario: data.destinatario, demo: false, operador_id: userId })
      .select("id")
      .single();
    if (error || !op) throw new Error("Não foi possível registrar a operação.");
    await auditar(supabase, userId, "criar_operacao", { numero: data.numero, route_id: data.routeId, operacao_id: op.id, resultado: data.status, detalhes: { canal: data.canal, destinatario: data.destinatario, metodo: data.metodo, tribunal: data.tribunal } });
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

/** Marca rota como verificada/revisar — exige confirmação explícita; somente admin altera a rota. */
export const marcarRota = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { routeId: string; acao: AcaoRota; confirmado: boolean; observacao?: string | null }) => ({
    routeId: String(i.routeId),
    acao: (i.acao === "revisar" ? "revisar" : "verificada") as AcaoRota,
    confirmado: i.confirmado === true,
    observacao: i.observacao ? String(i.observacao).trim().slice(0, 1000) || null : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await exigirEquipe(supabase, userId);
    const { data: rota } = await supabase.from("cpn_certificate_routes").select("id, fonte_evidencia, url_fonte").eq("id", data.routeId).maybeSingle();
    if (!rota) throw new Error("Rota não encontrada.");
    if (!admin && data.acao === "revisar") {
      // Operador sem permissão de edição: registra pedido de revisão só na auditoria.
      await auditar(supabase, userId, "solicitar_revisao_rota", { route_id: data.routeId, resultado: "revisar", detalhes: { observacao: data.observacao } });
      return { ok: true, somenteAuditoria: true };
    }
    const { patch, auditoria } = prepararMarcacaoRota({ ...data, admin, userId, evidenciaAtual: rota.fonte_evidencia, urlFonte: rota.url_fonte, hoje: new Date().toISOString().slice(0, 10) });
    const { error } = await supabase.from("cpn_certificate_routes").update(patch).eq("id", data.routeId);
    if (error) throw new Error("Não foi possível atualizar a rota.");
    await supabase.from("cpn_audit_logs").insert(auditoria as never);
    return { ok: true, somenteAuditoria: false };
  });

/** Cobertura nacional a partir de cnj_tribunais + rotas reais (sem registros fictícios). */
export const coberturaCpn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const [{ data: tribs }, { data: rotas }] = await Promise.all([
      supabase.from("cnj_tribunais").select("id, sigla, nome, uf, segmento").order("segmento").order("sigla"),
      supabase.from("cpn_certificate_routes").select("id, tribunal_id, modalidade, status_verificacao, automacao_cpn").eq("ativo", true),
    ]);
    return calcularCobertura(tribs ?? [], rotas ?? []);
  });

/** Fila de rotas a verificar (todas as rotas ativas, pendentes/revisar primeiro). */
export const filaVerificacaoCpn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const admin = await exigirEquipe(supabase, userId);
    const { data } = await supabase
      .from("cpn_certificate_routes")
      .select("id, sistema, grau, modalidade, metodo, url_fonte, fonte_evidencia, ultima_verificacao, status_verificacao, observacao_verificacao, responsavel_id, automacao_cpn, cnj_tribunais(sigla, nome)")
      .eq("ativo", true);
    const ids = [...new Set((data ?? []).map((r) => r.responsavel_id).filter((x): x is string => Boolean(x)))];
    const { data: perfis } = ids.length ? await supabase.from("profiles").select("id, nome").in("id", ids) : { data: [] };
    const nome = new Map((perfis ?? []).map((p) => [p.id, p.nome]));
    const ordem = { revisar: 0, pendente: 1, verificada: 2 } as Record<string, number>;
    const itens = (data ?? [])
      .map((r) => ({ ...r, tribunal: (r.cnj_tribunais as { sigla: string } | null)?.sigla ?? "?", responsavel: r.responsavel_id ? nome.get(r.responsavel_id) ?? "Equipe" : null }))
      .sort((a, b) => (ordem[a.status_verificacao] ?? 9) - (ordem[b.status_verificacao] ?? 9) || a.tribunal.localeCompare(b.tribunal));
    return { admin, itens };
  });

export interface FiltrosHistorico { numero?: string; tribunal?: string; modalidade?: string; status?: string; de?: string; ate?: string; tipo?: "todos" | "real" | "demo" }

/** Histórico de consultas com filtros (somente campos operacionais, sem dados pessoais). */
export const historicoConsultasCpn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: FiltrosHistorico) => ({
    numero: (i?.numero ?? "").replace(/[^\d.-]/g, "").slice(0, 30),
    tribunal: (i?.tribunal ?? "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 10).toUpperCase(),
    modalidade: (i?.modalidade ?? "").replace(/[^A-Z]/g, "").slice(0, 20),
    status: (i?.status ?? "").replace(/[^a-z_]/g, "").slice(0, 30),
    de: /^\d{4}-\d{2}-\d{2}$/.test(i?.de ?? "") ? i.de! : "",
    ate: /^\d{4}-\d{2}-\d{2}$/.test(i?.ate ?? "") ? i.ate! : "",
    tipo: (i?.tipo === "demo" || i?.tipo === "todos" ? i.tipo : "real") as "todos" | "real" | "demo",
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    let q = supabase.from("cpn_process_queries").select("id, numero_normalizado, numero_raw, tribunal_sigla, status, modalidade, demo, fonte, consultado_em").order("consultado_em", { ascending: false }).limit(200);
    const digitos = data.numero.replace(/\D/g, "");
    if (digitos) q = q.ilike("numero_normalizado", `%${data.numero}%`);
    if (data.tribunal) q = q.eq("tribunal_sigla", data.tribunal);
    if (data.modalidade) q = q.eq("modalidade", data.modalidade);
    if (data.status) q = q.eq("status", data.status);
    if (data.de) q = q.gte("consultado_em", `${data.de}T03:00:00Z`);
    if (data.ate) { const f = new Date(`${data.ate}T03:00:00Z`); f.setUTCDate(f.getUTCDate() + 1); q = q.lt("consultado_em", f.toISOString()); }
    q = q.eq("demo", false);
    const { data: linhas, error } = await q;
    if (error) throw new Error("Não foi possível carregar o histórico.");
    return linhas ?? [];
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
      supabase.from("cpn_operacoes").select("id, status, observacao, created_at, updated_at, demo").eq("numero_processo", data.numero).eq("demo", false).order("created_at", { ascending: false }),
    ]);
    return { logs: logs ?? [], operacoes: ops ?? [] };
  });

/** Recebe o PDF oficial real (enviado pelo operador), valida, armazena sem alterar e registra auditoria. */
export const receberDocumentoOficial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { operacaoId: string; nome: string; base64: string; origem: string }) => ({
    operacaoId: String(i.operacaoId),
    nome: String(i.nome ?? "certidao.pdf").replace(/[^\w.\- ]/g, "_").slice(0, 120),
    base64: String(i.base64 ?? ""),
    origem: String(i.origem ?? "").trim().slice(0, 300),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const { ehPdf, extrairDadosNarratoria, sha256Hex } = await import("./cpn-documento");
    if (!data.origem) throw new Error("Informe a origem do documento (ex.: eproc TJSP — botão Certidão Narratória).");
    const bytes = Uint8Array.from(Buffer.from(data.base64, "base64"));
    if (bytes.length === 0 || bytes.length > 15 * 1024 * 1024) throw new Error("Arquivo vazio ou maior que 15 MB.");
    if (!ehPdf(bytes)) throw new Error("O arquivo não é um PDF válido.");
    const { data: op } = await supabase.from("cpn_operacoes").select("id, numero_processo, route_id, tribunal_sigla, metodo, documento_caminho").eq("id", data.operacaoId).maybeSingle();
    if (!op) throw new Error("Ficha não encontrada.");
    if (op.documento_caminho) throw new Error("Esta ficha já tem documento oficial registrado.");
    let texto = "";
    try {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(bytes.slice());
      texto = (await extractText(pdf, { mergePages: true })).text;
    } catch { texto = ""; }
    const dados = extrairDadosNarratoria(texto, op.numero_processo);
    const hash = await sha256Hex(bytes);
    const caminho = `${op.id}/${hash}.pdf`;
    const { error: upErr } = await supabase.storage.from("cpn-documentos").upload(caminho, bytes, { contentType: "application/pdf", upsert: false });
    if (upErr) throw new Error("Não foi possível armazenar o PDF.");
    const agora = new Date().toISOString();
    await supabase.from("cpn_operacoes").update({
      documento_caminho: caminho, documento_nome: data.nome, documento_sha256: hash, documento_tamanho: bytes.length,
      documento_recebido_em: agora, documento_recebido_por: userId, documento_origem: data.origem,
      documento_texto_extraido: dados.textoExtraido, documento_processo_extraido: dados.processos[0] ?? null,
      documento_processo_confere: dados.processoConfere, documento_numero_certidao: dados.numeroCertidao,
      documento_codigo_seguranca: dados.codigoSeguranca, status: "recebido",
    }).eq("id", op.id);
    await auditar(supabase, userId, "receber_documento_oficial", { numero: op.numero_processo, route_id: op.route_id, operacao_id: op.id, resultado: "recebido",
      detalhes: { tribunal: op.tribunal_sigla, metodo: op.metodo, origem: data.origem, sha256: hash, tamanho: bytes.length, recebido_em: agora, extracao: { ...dados } } as unknown as Json });
    return { sha256: hash, ...dados };
  });

/** Registra a conferência de autenticidade feita pelo operador na consulta pública oficial. */
export const conferirAutenticidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { operacaoId: string; resultado: "conferido_valido" | "conferido_invalido"; numeroCertidao: string; codigoSeguranca: string; observacao?: string | null; confirmado: boolean }) => ({
    operacaoId: String(i.operacaoId),
    resultado: (i.resultado === "conferido_invalido" ? "conferido_invalido" : "conferido_valido") as "conferido_valido" | "conferido_invalido",
    numeroCertidao: String(i.numeroCertidao ?? "").trim().slice(0, 60),
    codigoSeguranca: String(i.codigoSeguranca ?? "").trim().slice(0, 80),
    observacao: i.observacao ? String(i.observacao).slice(0, 1000) : null,
    confirmado: i.confirmado === true,
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    if (!data.confirmado) throw new Error("Confirmação explícita obrigatória.");
    if (!data.numeroCertidao || !data.codigoSeguranca) throw new Error("Informe o número da certidão e o código de segurança que constam no PDF.");
    const { data: op } = await supabase.from("cpn_operacoes").select("id, numero_processo, route_id, documento_caminho").eq("id", data.operacaoId).maybeSingle();
    if (!op?.documento_caminho) throw new Error("Anexe o PDF oficial antes de conferir a autenticidade.");
    const agora = new Date().toISOString();
    await supabase.from("cpn_operacoes").update({
      documento_numero_certidao: data.numeroCertidao, documento_codigo_seguranca: data.codigoSeguranca,
      documento_autenticidade_status: data.resultado, documento_autenticidade_conferida_em: agora, documento_autenticidade_conferida_por: userId,
    }).eq("id", op.id);
    await auditar(supabase, userId, "conferir_autenticidade", { numero: op.numero_processo, route_id: op.route_id, operacao_id: op.id, resultado: data.resultado,
      detalhes: { numero_certidao: data.numeroCertidao, codigo_seguranca: data.codigoSeguranca, observacao: data.observacao, conferido_em: agora, meio: "consulta pública oficial (operador)" } });
    return { ok: true };
  });

/** Link temporário para abrir o PDF oficial armazenado. */
export const linkDocumentoOficial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { operacaoId: string }) => ({ operacaoId: String(i.operacaoId) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const { data: op } = await supabase.from("cpn_operacoes").select("documento_caminho").eq("id", data.operacaoId).maybeSingle();
    if (!op?.documento_caminho) throw new Error("Sem documento.");
    const { data: s } = await supabase.storage.from("cpn-documentos").createSignedUrl(op.documento_caminho, 300);
    if (!s?.signedUrl) throw new Error("Não foi possível abrir o documento.");
    return { url: s.signedUrl };
  });
