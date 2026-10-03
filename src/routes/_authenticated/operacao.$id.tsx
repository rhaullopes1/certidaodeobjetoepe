import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { atualizarEtapaOperacao, detalheOperacao } from "@/lib/operacao.functions";
import { MAX_PDFS_OPERADOR, podeConcluirComPdfs, rotuloEtapa, validarPdfOperador } from "@/lib/papeis";
import { abrirAnexo, enviarAnexo, removerAnexo } from "@/lib/admin";
import { abrirEmNovaAba as abrirAba } from "@/lib/abrir-em-nova-aba";

export const Route = createFileRoute("/_authenticated/operacao/$id")({
  component: Detalhe,
});

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | number | null }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="break-words text-sm">{valor}</dd>
    </div>
  );
}

function Detalhe() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fn = useServerFn(detalheOperacao);
  const etapaFn = useServerFn(atualizarEtapaOperacao);
  const q = useQuery({ queryKey: ["operacao", "detalhe", id], queryFn: () => fn({ data: { id } }) });
  const [obs, setObs] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const recarregar = () => qc.invalidateQueries({ queryKey: ["operacao"] });
  const mudar = useMutation({
    mutationFn: (status: "em_andamento" | "concluido") =>
      etapaFn({ data: { id, status, observacao: obs || undefined } }),
    onSuccess: (_r, status) => {
      setObs("");
      toast.success(status === "concluido" ? "Pedido concluído. Aguardando validação da administração." : "Operação iniciada.");
      recarregar();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const enviar = useMutation({
    mutationFn: async (arquivos: File[]) => {
      if (!q.data) return;
      let qtd = q.data.meusPdfs.length;
      for (const arquivo of arquivos) {
        const erro = validarPdfOperador(arquivo, qtd);
        if (erro) throw new Error(`${arquivo.name}: ${erro}`);
        await enviarAnexo({ pedidoId: q.data.pedido.pedido_id, protocolo: q.data.pedido.protocolo, tipo: "certidao", arquivo });
        qtd++;
      }
    },
    onSuccess: () => toast.success("PDF anexado."),
    onError: (e) => toast.error((e as Error).message),
    onSettled: () => { setInputKey((k) => k + 1); recarregar(); },
  });
  const remover = useMutation({
    mutationFn: (a: { id: string; caminho: string }) => removerAnexo(a),
    onSuccess: () => toast.success("PDF removido."),
    onError: (e) => toast.error((e as Error).message),
    onSettled: recarregar,
  });

  if (q.isPending) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (q.error) return <p className="text-sm text-destructive">{(q.error as Error).message}</p>;
  const { pedido: p, historico, anexos, meusPdfs } = q.data;
  const ocupado = mudar.isPending || enviar.isPending || remover.isPending;
  const podeConcluir = podeConcluirComPdfs(meusPdfs.length);
  const vagas = MAX_PDFS_OPERADOR - meusPdfs.length;
  const travado = p.status_operacao === "concluido";
  const certidoes = Array.isArray(p.certidoes) ? (p.certidoes as { numeroProcesso?: string; nomeParte?: string }[]) : [];

  return (
    <div className="space-y-4">
      <Link to="/operacao" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Minhas certidões
      </Link>
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-lg font-bold">{p.protocolo}</p>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{rotuloEtapa(p.status_operacao)}</span>
        </div>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Processo" valor={p.numero_processo} />
          <Campo rotulo="Parte" valor={p.nome_parte} />
          <Campo rotulo="CPF" valor={p.cpf} />
          <Campo rotulo="Quantidade" valor={p.quantidade} />
          <Campo rotulo="Finalidade" valor={p.finalidade} />
          <Campo rotulo="Tribunal" valor={[p.tribunal_sigla, p.tribunal_nome].filter(Boolean).join(" — ")} />
          <Campo rotulo="UF / Cidade" valor={[p.uf_processo, p.cidade_processo].filter(Boolean).join(" / ")} />
          <Campo rotulo="Comarca" valor={p.comarca_processo} />
          <Campo rotulo="Foro" valor={p.foro !== p.comarca_processo ? p.foro : null} />
          <Campo rotulo="Vara" valor={p.vara} />
          <Campo rotulo="Unidade" valor={p.unidade_judiciaria} />
          <Campo rotulo="Sistema" valor={p.sistema_processual} />
          <Campo rotulo="Observações do cliente" valor={p.observacoes} />
          <Campo rotulo="Orientação para você" valor={p.observacao_operador} />
          <Campo rotulo="Atribuído em" valor={new Date(p.atribuido_em).toLocaleString("pt-BR")} />
        </dl>
        {certidoes.length > 1 && (
          <ul className="mt-3 space-y-1 text-sm">
            {certidoes.map((c, i) => (
              <li key={i}>{i + 1}. {c.numeroProcesso} — {c.nomeParte}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h2 className="font-bold">Etapa da operação</h2>
        {travado ? (
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" /> Concluída — aguardando validação da administração.</p>
        ) : p.status_operacao === "atribuido" ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">Inicie a operação para poder anexar a certidão e concluir o pedido.</p>
            <button disabled={ocupado} onClick={() => mudar.mutate("em_andamento")} className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {mudar.isPending ? "Salvando…" : "Iniciar operação (Em andamento)"}
            </button>
          </div>
        ) : p.status_operacao === "devolvido" ? (
          <p className="mt-2 text-sm text-muted-foreground">Operação recolhida pela administração.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <section className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <h3 className="font-semibold">Anexar certidão</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Anexe o PDF da certidão emitida antes de concluir. Mínimo 1 e máximo {MAX_PDFS_OPERADOR} PDFs (quando a certidão tiver mais de uma parte).
              </p>
              <ul className="mt-2 space-y-1.5">
                {meusPdfs.length === 0 && <li className="text-sm text-muted-foreground">Nenhum PDF anexado ainda.</li>}
                {meusPdfs.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2 py-1.5">
                    <button onClick={() => abrirEmNovaAba(a.caminho)} className="flex min-w-0 items-center gap-1 text-left text-sm text-primary underline">
                      <FileText className="h-4 w-4 shrink-0" /> <span className="truncate">{a.nome_arquivo}</span>
                    </button>
                    <button disabled={ocupado} onClick={() => remover.mutate({ id: a.id, caminho: a.caminho })} aria-label={`Remover ${a.nome_arquivo}`} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-medium">{meusPdfs.length} de {MAX_PDFS_OPERADOR} PDFs anexados</p>
              {vagas > 0 && (
                <label className={`mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-semibold ${ocupado ? "pointer-events-none opacity-50" : ""}`}>
                  {enviar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {enviar.isPending ? "Enviando PDF…" : "Escolher PDF"}
                  <input key={inputKey} type="file" accept="application/pdf,.pdf" multiple className="sr-only" disabled={ocupado}
                    onChange={(e) => {
                      const arquivos = Array.from(e.target.files ?? []);
                      if (arquivos.length > vagas) { toast.error(`Você pode anexar no máximo mais ${vagas} PDF(s).`); setInputKey((k) => k + 1); return; }
                      if (arquivos.length) enviar.mutate(arquivos);
                    }} />
                </label>
              )}
            </section>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação (opcional)" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            {!podeConcluir && <p className="text-sm font-medium text-destructive">Anexe pelo menos 1 PDF da certidão para concluir.</p>}
            <button disabled={!podeConcluir || ocupado} onClick={() => mudar.mutate("concluido")} className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {mudar.isPending ? "Concluindo…" : "Concluir pedido"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h2 className="font-bold">Documentos do pedido</h2>
        <ul className="mt-2 space-y-1">
          {anexos.length === 0 && <li className="text-sm text-muted-foreground">Nenhum documento.</li>}
          {anexos.map((a) => (
            <li key={a.id}>
              <button onClick={() => abrirEmNovaAba(a.caminho)} className="flex items-center gap-1 text-left text-sm text-primary underline">
                <FileText className="h-4 w-4 shrink-0" /> {a.nome_arquivo} <span className="text-muted-foreground">({a.tipo})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h2 className="font-bold">Histórico</h2>
        <ul className="mt-2 space-y-2">
          {historico.length === 0 && <li className="text-sm text-muted-foreground">Sem registros.</li>}
          {historico.map((h) => (
            <li key={h.id} className="text-sm">
              <span className="font-semibold">{rotuloEtapa(h.status.replace(/^operacao_/, ""))}</span>{" "}
              <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("pt-BR")}</span>
              {h.observacao && <p className="text-muted-foreground">{h.observacao}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

async function abrirEmNovaAba(caminho: string) {
  try {
    await abrirAba(() => abrirAnexo(caminho));
  } catch (e) {
    toast.error((e as Error).message || "Não foi possível abrir o arquivo.");
  }
}
