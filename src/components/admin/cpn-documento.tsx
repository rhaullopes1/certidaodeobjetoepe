import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, FileUp, Loader2, ShieldAlert } from "lucide-react";
import { STATUS_AUTENTICIDADE, type StatusAutenticidade } from "@/lib/cpn-documento";
import { conferirAutenticidade, linkDocumentoOficial, receberDocumentoOficial } from "@/lib/cpn.functions";

export const AUTENTICIDADE_TJSP = "https://eproc1g-consulta.tjsp.jus.br/eproc/externo_controlador.php?acao=consulta_autenticidade_certidao_narratoria";

/** Aviso + checklist da operação assistida (sem integração servidor-side com o portal). */
export function AvisoAssistida({ requisitos, url }: { requisitos: string | null; url: string | null }) {
  return (
    <div className="mt-3 rounded-xl border border-gold/60 bg-gold/10 p-3 text-xs">
      <p className="flex items-center gap-1.5 font-bold"><ShieldAlert className="h-4 w-4" /> Não é emissão automática. Esta etapa requer acesso autorizado ao eproc.</p>
      <ol className="mt-2 list-decimal space-y-1 pl-4">
        <li>Confirmar que o processo tramita no eproc (não e-SAJ).</li>
        <li>Entrar no eproc com perfil de advogado ou parte Jus Postulandi que conste no cadastro do processo.</li>
        <li>Na capa do processo, menu Ações → botão "Certidão Narratória".</li>
        <li>Baixar o PDF emitido, sem alterar, e anexá-lo na ficha (Pendências manuais).</li>
        <li>Conferir a autenticidade na consulta pública oficial (processo + nº da certidão + código de segurança).</li>
      </ol>
      {requisitos && <p className="mt-2 text-muted-foreground">Requisitos: {requisitos}</p>}
      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-semibold text-primary underline"><ExternalLink className="h-3.5 w-3.5" /> Abrir orientação oficial</a>}
    </div>
  );
}

export type OpDoc = {
  id: string; numero_processo: string; documento_caminho?: string | null; documento_nome?: string | null; documento_sha256?: string | null;
  documento_recebido_em?: string | null; documento_origem?: string | null; documento_texto_extraido?: boolean | null;
  documento_processo_extraido?: string | null; documento_processo_confere?: boolean | null; documento_numero_certidao?: string | null;
  documento_codigo_seguranca?: string | null; documento_autenticidade_status?: string | null; documento_autenticidade_conferida_em?: string | null;
};

async function paraBase64(f: File) {
  const buf = new Uint8Array(await f.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Recebimento e validação do PDF oficial real de uma ficha. */
export function DocumentoOficial({ op }: { op: OpDoc }) {
  const qc = useQueryClient();
  const receberFn = useServerFn(receberDocumentoOficial);
  const conferirFn = useServerFn(conferirAutenticidade);
  const linkFn = useServerFn(linkDocumentoOficial);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [origem, setOrigem] = useState("eproc TJSP — botão Certidão Narratória");
  const [num, setNum] = useState(op.documento_numero_certidao ?? "");
  const [cod, setCod] = useState(op.documento_codigo_seguranca ?? "");
  const atualizar = () => qc.invalidateQueries({ queryKey: ["cpn-painel"] });
  const receber = useMutation({
    mutationFn: async () => receberFn({ data: { operacaoId: op.id, nome: arquivo!.name, base64: await paraBase64(arquivo!), origem } }),
    onSuccess: () => { toast.success("PDF oficial registrado"); atualizar(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });
  const conferir = useMutation({
    mutationFn: (resultado: "conferido_valido" | "conferido_invalido") => conferirFn({ data: { operacaoId: op.id, resultado, numeroCertidao: num, codigoSeguranca: cod, confirmado: true } }),
    onSuccess: () => { toast.success("Conferência registrada"); atualizar(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });
  const abrir = async () => { try { window.open((await linkFn({ data: { operacaoId: op.id } })).url, "_blank", "noopener"); } catch (e) { toast.error(e instanceof Error ? e.message : "Falha"); } };
  const input = "h-9 rounded-lg border border-input bg-background px-2 text-sm";

  if (!op.documento_caminho) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-secondary/60 p-2 text-xs">
        <span className="font-semibold">Documento oficial (PDF real emitido pelo tribunal):</span>
        <input type="file" accept="application/pdf" aria-label="PDF oficial" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} className="text-xs" />
        <input value={origem} onChange={(e) => setOrigem(e.target.value)} aria-label="Origem do documento" className={`${input} min-w-60 flex-1`} />
        <button type="button" disabled={!arquivo || receber.isPending} onClick={() => receber.mutate()} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1.5 font-semibold text-primary-foreground disabled:opacity-50">
          {receber.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} Anexar PDF oficial
        </button>
      </div>
    );
  }
  const st = (op.documento_autenticidade_status ?? "nao_conferido") as StatusAutenticidade;
  return (
    <div className="mt-2 space-y-1 rounded-lg bg-secondary/60 p-2 text-xs">
      <p><button type="button" onClick={abrir} className="font-semibold text-primary underline">{op.documento_nome ?? "PDF"}</button> · recebido {op.documento_recebido_em ? new Date(op.documento_recebido_em).toLocaleString("pt-BR") : "—"} · origem: {op.documento_origem ?? "—"}</p>
      <p className="font-mono text-[10px] text-muted-foreground">SHA-256 {op.documento_sha256}</p>
      <p>Extraído do PDF: {op.documento_texto_extraido ? <>processo {op.documento_processo_extraido ?? "não encontrado no texto"}{op.documento_processo_confere === false && <b className="text-destructive"> — NÃO confere com a ficha</b>}{op.documento_processo_confere && " (confere)"}</> : "texto não extraível (PDF sem camada de texto)"}</p>
      <p className={st === "conferido_valido" ? "font-bold text-live" : st === "conferido_invalido" ? "font-bold text-destructive" : "font-bold"}>{STATUS_AUTENTICIDADE[st] ?? st}{op.documento_autenticidade_conferida_em ? ` · ${new Date(op.documento_autenticidade_conferida_em).toLocaleString("pt-BR")}` : ""}</p>
      {st === "nao_conferido" && (
        <div className="flex flex-wrap items-center gap-2">
          <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="Nº da certidão (do PDF)" aria-label="Número da certidão" className={input} />
          <input value={cod} onChange={(e) => setCod(e.target.value)} placeholder="Código de segurança (do PDF)" aria-label="Código de segurança" className={input} />
          <a href={AUTENTICIDADE_TJSP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 font-semibold"><ExternalLink className="h-3.5 w-3.5" /> Consulta pública oficial</a>
          <button type="button" disabled={conferir.isPending} onClick={() => window.confirm("Confirmo que consultei a página oficial de autenticidade e ela CONFIRMOU esta certidão.") && conferir.mutate("conferido_valido")} className="rounded-lg bg-primary px-2 py-1.5 font-semibold text-primary-foreground disabled:opacity-50">Autenticidade confirmada</button>
          <button type="button" disabled={conferir.isPending} onClick={() => window.confirm("Confirmo que a consulta oficial NÃO confirmou esta certidão.") && conferir.mutate("conferido_invalido")} className="rounded-lg border border-destructive px-2 py-1.5 font-semibold text-destructive disabled:opacity-50">Não confirmada</button>
        </div>
      )}
    </div>
  );
}
