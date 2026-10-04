import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, CheckSquare, FileText, Loader2, Square, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  atualizarEtapaOperacao, detalheOperacao, marcarChecklistOperacao, registrarPendenciaOperacao,
  resolverPendenciaOperacao, salvarNotaOperacao,
} from "@/lib/operacao.functions";
import {
  CHECKLIST_MANUAL, MAX_PDFS_OPERADOR, MOTIVOS_PENDENCIA, diasDesde, podeConcluirComPdfs, proximaAcaoOperador,
  proximasEtapasOperador, rotuloEtapa, rotuloPendencia, validarPdfOperador, type EtapaOperadorAcao, type MotivoPendencia,
} from "@/lib/papeis";
import { abrirAnexo, enviarAnexo, removerAnexo } from "@/lib/admin";
import { abrirEmNovaAba as abrirAba } from "@/lib/abrir-em-nova-aba";

export const Route = createFileRoute("/_authenticated/operacao/$id")({
  component: Detalhe,
});

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | number | null }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="break-words text-sm">{valor}</dd>
    </div>
  );
}

function Bloco({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-border bg-card p-4 sm:p-5 ${className}`}>
      <h2 className="font-bold text-foreground">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

const MSG_ETAPA: Record<EtapaOperadorAcao, string> = {
  em_andamento: "Operação em andamento.",
  aguardando_tribunal: "Registrado: aguardando tribunal.",
  documento_recebido: "Registrado: documento recebido.",
  concluido: "Operação concluída. Aguardando validação da administração.",
};

function Detalhe() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fn = useServerFn(detalheOperacao);
  const etapaFn = useServerFn(atualizarEtapaOperacao);
  const pendFn = useServerFn(registrarPendenciaOperacao);
  const resolverFn = useServerFn(resolverPendenciaOperacao);
  const checkFn = useServerFn(marcarChecklistOperacao);
  const notaFn = useServerFn(salvarNotaOperacao);
  const q = useQuery({ queryKey: ["operacao", "detalhe", id], queryFn: () => fn({ data: { id } }) });
  const [obs, setObs] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [motivo, setMotivo] = useState<MotivoPendencia>("documento_faltante");
  const [obsPend, setObsPend] = useState("");
  const [nota, setNota] = useState("");
  const notaServidor = q.data?.pedido.nota_operador ?? "";
  useEffect(() => setNota(notaServidor), [notaServidor]);

  const recarregar = () => qc.invalidateQueries({ queryKey: ["operacao"] });
  const erro = (e: unknown) => toast.error((e as Error).message);

  const mudar = useMutation({
    mutationFn: (status: EtapaOperadorAcao) => etapaFn({ data: { id, status, observacao: obs || undefined } }),
    onSuccess: (_r, status) => { setObs(""); toast.success(MSG_ETAPA[status]); recarregar(); },
    onError: erro,
  });
  const pendencia = useMutation({
    mutationFn: () => pendFn({ data: { id, motivo, observacao: obsPend || undefined } }),
    onSuccess: () => { setObsPend(""); toast.success("Pendência registrada."); recarregar(); },
    onError: erro,
  });
  const resolver = useMutation({
    mutationFn: () => resolverFn({ data: { id, observacao: obsPend || undefined } }),
    onSuccess: () => { setObsPend(""); toast.success("Pendência resolvida. Operação retomada."); recarregar(); },
    onError: erro,
  });
  const marcar = useMutation({
    mutationFn: (v: { item: string; marcado: boolean }) => checkFn({ data: { id, ...v } }),
    onError: erro,
    onSettled: recarregar,
  });
  const salvarNota = useMutation({
    mutationFn: () => notaFn({ data: { id, nota } }),
    onSuccess: () => { toast.success("Nota salva."); recarregar(); },
    onError: erro,
  });
  const enviar = useMutation({
    mutationFn: async (arquivos: File[]) => {
      if (!q.data) return;
      let qtd = q.data.meusPdfs.length;
      for (const arquivo of arquivos) {
        const e = validarPdfOperador(arquivo, qtd);
        if (e) throw new Error(`${arquivo.name}: ${e}`);
        await enviarAnexo({ pedidoId: q.data.pedido.pedido_id, protocolo: q.data.pedido.protocolo, tipo: "certidao", arquivo });
        qtd++;
      }
    },
    onSuccess: () => toast.success("PDF anexado."),
    onError: erro,
    onSettled: () => { setInputKey((k) => k + 1); recarregar(); },
  });
  const remover = useMutation({
    mutationFn: (a: { id: string; caminho: string }) => removerAnexo(a),
    onSuccess: () => toast.success("PDF removido."),
    onError: erro,
    onSettled: recarregar,
  });

  if (q.isPending) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (q.error) return <p className="text-sm text-destructive">{(q.error as Error).message}</p>;
  const { pedido: p, historico, anexos, meusPdfs } = q.data;
  const ocupado = mudar.isPending || enviar.isPending || remover.isPending || pendencia.isPending || resolver.isPending;
  const ativa = p.status_operacao !== "concluido" && p.status_operacao !== "devolvido";
  const iniciada = ativa && p.status_operacao !== "atribuido";
  const temPendencia = Boolean(p.pendencia_motivo);
  const pdfsOk = podeConcluirComPdfs(meusPdfs.length);
  const vagas = MAX_PDFS_OPERADOR - meusPdfs.length;
  const etapas = temPendencia ? [] : proximasEtapasOperador(p.status_operacao);
  const principal = etapas[0];
  const secundarias = etapas.slice(1);
  const bloqueadoConclusao = (v: EtapaOperadorAcao) => v === "concluido" && !pdfsOk;
  const checklist = (p.checklist && typeof p.checklist === "object" ? p.checklist : {}) as Record<string, boolean>;
  const certidoes = Array.isArray(p.certidoes) ? (p.certidoes as { numeroProcesso?: string; nomeParte?: string }[]) : [];
  const acao = proximaAcaoOperador({ ...p, pdfs: meusPdfs.length });
  const dias = diasDesde(p.atribuido_em);

  return (
    <div className="space-y-4">
      <Link to="/operacao" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Minhas operações
      </Link>

      {/* 1. Status + próxima ação */}
      <section className="rounded-lg border border-primary bg-card p-4 sm:p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <p className="truncate font-mono text-lg font-bold">{p.protocolo}</p>
          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{rotuloEtapa(p.status_operacao)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Recebida há {dias === 0 ? "menos de 1 dia" : `${dias} dia(s)`} · {new Date(p.atribuido_em).toLocaleString("pt-BR")}
        </p>
        <p className="mt-3 text-sm"><span className="text-muted-foreground">Próxima ação:</span> <strong>{acao}</strong></p>

        {p.status_operacao === "concluido" && (
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" /> Concluída — aguardando validação da administração.</p>
        )}
        {p.status_operacao === "devolvido" && <p className="mt-2 text-sm text-muted-foreground">Operação recolhida pela administração.</p>}
        {temPendencia && ativa && (
          <p className="mt-2 text-sm font-medium text-destructive">Resolva a pendência abaixo para continuar a operação.</p>
        )}

        {principal && (
          <div className="mt-3 space-y-2">
            {iniciada && (
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação da etapa (opcional)" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            )}
            {bloqueadoConclusao(principal.valor) && (
              <p className="text-sm font-medium text-destructive">Anexe pelo menos 1 PDF da certidão para concluir.</p>
            )}
            <button
              disabled={ocupado || bloqueadoConclusao(principal.valor)}
              onClick={() => mudar.mutate(principal.valor)}
              className="w-full rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {mudar.isPending ? "Salvando…" : principal.rotulo}
            </button>
            {secundarias.map((e) => (
              <button
                key={e.valor}
                disabled={ocupado || bloqueadoConclusao(e.valor)}
                onClick={() => mudar.mutate(e.valor)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {e.rotulo}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 2. Dados essenciais */}
      <Bloco titulo="Dados do processo">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Processo" valor={p.numero_processo} />
          <Campo rotulo="Parte" valor={p.nome_parte} />
          <Campo rotulo="CPF" valor={p.cpf} />
          <Campo rotulo="Quantidade de certidões" valor={p.quantidade} />
          <Campo rotulo="Finalidade" valor={p.finalidade} />
          <Campo rotulo="Tribunal" valor={[p.tribunal_sigla, p.tribunal_nome].filter(Boolean).join(" — ")} />
          <Campo rotulo="UF / Cidade" valor={[p.uf_processo, p.cidade_processo].filter(Boolean).join(" / ")} />
          <Campo rotulo="Comarca" valor={p.comarca_processo} />
          <Campo rotulo="Foro" valor={p.foro !== p.comarca_processo ? p.foro : null} />
          <Campo rotulo="Vara" valor={p.vara} />
          <Campo rotulo="Unidade" valor={p.unidade_judiciaria} />
          <Campo rotulo="Sistema" valor={p.sistema_processual} />
          <Campo rotulo="Observações do pedido" valor={p.observacoes} />
          <Campo rotulo="Orientação operacional" valor={p.observacao_operador} />
        </dl>
        {certidoes.length > 1 && (
          <ul className="mt-3 space-y-1 text-sm">
            {certidoes.map((c, i) => <li key={i} className="break-words">{i + 1}. {c.numeroProcesso} — {c.nomeParte}</li>)}
          </ul>
        )}
      </Bloco>

      {/* 3. Pendências */}
      {(ativa || temPendencia) && (
        <Bloco titulo="Pendências" className={temPendencia ? "border-2 border-destructive" : ""}>
          {temPendencia ? (
            <div className="space-y-2">
              <p className="flex items-start gap-1 text-sm font-semibold text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {rotuloPendencia(p.pendencia_motivo)}
              </p>
              {p.pendencia_observacao && <p className="break-words text-sm">{p.pendencia_observacao}</p>}
              {p.pendencia_em && <p className="text-xs text-muted-foreground">Registrada em {new Date(p.pendencia_em).toLocaleString("pt-BR")}</p>}
              {ativa && (
                <>
                  <textarea value={obsPend} onChange={(e) => setObsPend(e.target.value)} placeholder="Como foi resolvida (opcional)" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <button disabled={ocupado} onClick={() => resolver.mutate()} className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                    {resolver.isPending ? "Salvando…" : "Resolver pendência e retomar"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Algo impede a emissão? Registre o motivo para acompanhar.</p>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoPendencia)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" aria-label="Motivo da pendência">
                {MOTIVOS_PENDENCIA.map((m) => <option key={m.valor} value={m.valor}>{m.rotulo}</option>)}
              </select>
              <textarea value={obsPend} onChange={(e) => setObsPend(e.target.value)} placeholder={motivo === "outro" ? "Descreva a pendência (obrigatório)" : "Detalhes (opcional)"} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <button
                disabled={ocupado || (motivo === "outro" && !obsPend.trim())}
                onClick={() => pendencia.mutate()}
                className="w-full rounded-lg border border-destructive bg-background px-3 py-2.5 text-sm font-semibold text-destructive disabled:opacity-50"
              >
                {pendencia.isPending ? "Salvando…" : "Registrar pendência"}
              </button>
            </div>
          )}
        </Bloco>
      )}

      {/* 4. Checklist */}
      <Bloco titulo="Checklist operacional">
        <p className="mb-2 text-xs text-muted-foreground">Marque manualmente o que você já fez. "PDF anexado" é conferido pelo sistema.</p>
        <ul className="space-y-1">
          {CHECKLIST_MANUAL.map((c) => {
            const marcado = Boolean(checklist[c.chave]);
            return (
              <li key={c.chave}>
                <button
                  disabled={!iniciada || marcar.isPending}
                  onClick={() => marcar.mutate({ item: c.chave, marcado: !marcado })}
                  aria-pressed={marcado}
                  className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm disabled:opacity-60"
                >
                  {marcado ? <CheckSquare className="h-5 w-5 shrink-0 text-primary" /> : <Square className="h-5 w-5 shrink-0 text-muted-foreground" />}
                  {c.rotulo}
                </button>
              </li>
            );
          })}
          <li className="flex items-center gap-2 px-1 py-1.5 text-sm">
            {pdfsOk ? <CheckSquare className="h-5 w-5 shrink-0 text-primary" /> : <Square className="h-5 w-5 shrink-0 text-muted-foreground" />}
            PDF anexado <span className="text-xs text-muted-foreground">(automático)</span>
          </li>
          <li className="flex items-center gap-2 px-1 py-1.5 text-sm">
            {pdfsOk && !temPendencia && ativa ? <CheckSquare className="h-5 w-5 shrink-0 text-primary" /> : <Square className="h-5 w-5 shrink-0 text-muted-foreground" />}
            Operação pronta para conclusão <span className="text-xs text-muted-foreground">(automático)</span>
          </li>
        </ul>
        {!iniciada && ativa && <p className="mt-2 text-xs text-muted-foreground">Inicie a operação para marcar o checklist.</p>}
      </Bloco>

      {/* 5. Documentos / PDFs */}
      <Bloco titulo="Anexar certidão" className="border-primary/40">
        <p className="text-sm text-muted-foreground">
          Anexe o PDF da certidão emitida antes de concluir. Mínimo 1 e máximo {MAX_PDFS_OPERADOR} PDFs (quando a certidão tiver mais de uma parte).
        </p>
        <ul className="mt-2 space-y-1.5">
          {anexos.length === 0 && <li className="text-sm text-muted-foreground">Nenhum PDF anexado ainda.</li>}
          {anexos.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2 py-1.5">
              <button onClick={() => abrirEmNovaAba(a.caminho)} className="flex min-w-0 items-center gap-1 text-left text-sm text-primary underline">
                <FileText className="h-4 w-4 shrink-0" /> <span className="truncate">{a.nome_arquivo}</span>
              </button>
              {a.meu && iniciada && (
                <button disabled={ocupado} onClick={() => remover.mutate({ id: a.id, caminho: a.caminho })} aria-label={`Remover ${a.nome_arquivo}`} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Remover
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs font-medium">{meusPdfs.length} de {MAX_PDFS_OPERADOR} PDFs anexados</p>
        {iniciada && vagas > 0 && (
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
        {p.status_operacao === "atribuido" && <p className="mt-2 text-xs text-muted-foreground">Inicie a operação para anexar a certidão.</p>}
      </Bloco>

      {/* 6. Observação operacional */}
      <Bloco titulo="Nota operacional">
        <p className="mb-2 text-xs text-muted-foreground">Anotações da sua equipe sobre esta operação.</p>
        <textarea value={nota} onChange={(e) => setNota(e.target.value)} disabled={!ativa} rows={3} maxLength={4000} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-60" />
        {ativa && (
          <button disabled={salvarNota.isPending || nota === notaServidor} onClick={() => salvarNota.mutate()} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-semibold disabled:opacity-50">
            {salvarNota.isPending ? "Salvando…" : "Salvar nota"}
          </button>
        )}
      </Bloco>

      {/* 7. Histórico */}
      <Bloco titulo="Histórico operacional">
        <ul className="space-y-2">
          {historico.length === 0 && <li className="text-sm text-muted-foreground">Sem registros.</li>}
          {historico.map((h) => (
            <li key={h.id} className="text-sm">
              <span className="font-semibold">{rotuloEtapa(h.status.replace(/^operacao_/, ""))}</span>{" "}
              <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("pt-BR")}</span>
              {h.observacao && <p className="break-words text-muted-foreground">{h.observacao}</p>}
            </li>
          ))}
        </ul>
      </Bloco>
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
