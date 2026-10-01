/**
 * Integração com a API da Infosimples para emitir a Certidão de Antecedentes
 * Criminais da Polícia Federal (SINIC).
 *
 * Documentação oficial da consulta:
 * https://api.infosimples.com/consultas/docs/pt-BR/antecedentes-criminais/pf/emit
 *
 * Nada aqui é inferido ou gerado: o conteúdo da certidão vem exclusivamente da
 * resposta da API, que por sua vez reproduz o retorno da Polícia Federal.
 */

const ENDPOINT =
  "https://api.infosimples.com/api/v2/consultas/antecedentes-criminais/pf/emit";

export type AntecedentesEntrada = {
  nome: string;
  /** Data de nascimento em ISO 8601 (AAAA-MM-DD). */
  birthdate: string;
  cpf?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  ufNascimento?: string | null;
};

export type AntecedentesCertidao = {
  certidaoCodigo: string | null;
  numero: string | null;
  emissaoDatahora: string | null;
  validadeData: string | null;
  mensagem: string | null;
  /** True quando a PF conseguiu emitir a certidão negativa. */
  negativa: boolean | null;
  /** PDF/HTML da certidão disponibilizado pela Infosimples. */
  siteReceipt: string | null;
};

export type AntecedentesResultado =
  | { ok: true; certidao: AntecedentesCertidao; bruto: unknown }
  | { ok: false; code: number; erro: string; permanente: boolean; bruto: unknown };

export function temInfosimples() {
  return Boolean(process.env["INFOSIMPLES_TOKEN"]);
}

/**
 * Códigos de retorno da Infosimples na faixa 600-799 significam "consulta sem
 * sucesso". Alguns são definitivos (dados do cliente incorretos) e outros são
 * temporários (site da PF fora do ar), o que decide se vale repetir a tentativa.
 */
function erroPermanente(code: number) {
  // 612: parâmetros inválidos · 613: dados não encontrados na fonte
  // 618: consulta sem resultados · 619: dados divergentes
  return [612, 613, 614, 618, 619, 620].includes(code);
}

export async function emitirAntecedentesPF(
  entrada: AntecedentesEntrada,
): Promise<AntecedentesResultado> {
  const token = process.env["INFOSIMPLES_TOKEN"];
  if (!token) {
    return {
      ok: false,
      code: 0,
      erro: "Infosimples não configurado (INFOSIMPLES_TOKEN ausente).",
      permanente: false,
      bruto: null,
    };
  }

  const corpo = new URLSearchParams();
  corpo.set("token", token);
  corpo.set("nome", entrada.nome);
  corpo.set("birthdate", entrada.birthdate);
  if (entrada.cpf) corpo.set("cpf", entrada.cpf);
  if (entrada.nomeMae) corpo.set("nome_mae", entrada.nomeMae);
  if (entrada.nomePai) corpo.set("nome_pai", entrada.nomePai);
  if (entrada.ufNascimento) corpo.set("uf_nascimento", entrada.ufNascimento);
  corpo.set("timeout", "300");

  let resposta: Response;
  try {
    resposta = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo.toString(),
    });
  } catch (e) {
    return {
      ok: false,
      code: 0,
      erro: `Falha de rede ao chamar a Infosimples: ${String(e)}`,
      permanente: false,
      bruto: null,
    };
  }

  const texto = await resposta.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(texto) as Record<string, unknown>;
  } catch {
    return {
      ok: false,
      code: resposta.status,
      erro: `Resposta inesperada da Infosimples (HTTP ${resposta.status}).`,
      permanente: false,
      bruto: texto.slice(0, 2000),
    };
  }

  // O token nunca é devolvido pela API, mas o cabeçalho ecoa os parâmetros
  // enviados — removido antes de qualquer gravação em banco.
  const bruto = sanitizar(json);
  const code = Number(json["code"] ?? 0);

  if (code !== 200) {
    const erros = Array.isArray(json["errors"]) ? (json["errors"] as string[]).join("; ") : "";
    return {
      ok: false,
      code,
      erro: erros || String(json["code_message"] ?? `Código ${code}`),
      permanente: erroPermanente(code),
      bruto,
    };
  }

  const registro = Array.isArray(json["data"]) ? (json["data"][0] as Record<string, unknown>) : null;
  if (!registro) {
    return {
      ok: false,
      code,
      erro: "A Infosimples respondeu sem dados da certidão.",
      permanente: false,
      bruto,
    };
  }

  const recibos = Array.isArray(json["site_receipts"]) ? (json["site_receipts"] as string[]) : [];

  return {
    ok: true,
    bruto,
    certidao: {
      certidaoCodigo: texto_ou_nulo(registro["certidao_codigo"]),
      numero: texto_ou_nulo(registro["numero"]),
      emissaoDatahora:
        texto_ou_nulo(registro["normalizado_emissao_datahora"]) ??
        texto_ou_nulo(registro["emissao_datahora"]),
      validadeData: texto_ou_nulo(registro["validade_data"]),
      mensagem: texto_ou_nulo(registro["mensagem"]),
      negativa:
        typeof registro["conseguiu_emitir_certidao_negativa"] === "boolean"
          ? (registro["conseguiu_emitir_certidao_negativa"] as boolean)
          : null,
      siteReceipt: texto_ou_nulo(registro["site_receipt"]) ?? recibos[0] ?? null,
    },
  };
}

function texto_ou_nulo(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Remove o eco dos parâmetros enviados (contém CPF e token) antes de gravar. */
function sanitizar(json: Record<string, unknown>) {
  const copia: Record<string, unknown> = { ...json };
  const header = copia["header"];
  if (header && typeof header === "object") {
    const h = { ...(header as Record<string, unknown>) };
    delete h["parameters"];
    delete h["signature"];
    copia["header"] = h;
  }
  return copia;
}
