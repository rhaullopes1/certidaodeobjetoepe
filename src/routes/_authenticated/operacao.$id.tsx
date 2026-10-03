import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { atualizarEtapaOperacao, detalheOperacao } from "@/lib/operacao.functions";
import { ETAPAS_OPERACAO, rotuloEtapa } from "@/lib/papeis";
import { abrirAnexo, enviarAnexo } from "@/lib/admin";

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
  const [etapa, setEtapa] = useState("");
  const [obs, setObs] = useState("");
  const [tipo, setTipo] = useState("certidao");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const recarregar = () => {
    qc.invalidateQueries({ queryKey: ["operacao"] });
  };
  const mudar = useMutation({
    mutationFn: () => etapaFn({ data: { id, status: etapa, observacao: obs || undefined } }),
    onSuccess: () => { setObs(""); setEtapa(""); recarregar(); },
  });
  const enviar = useMutation({
    mutationFn: async () => {
      if (!arquivo || !q.data) throw new Error("Escolha um arquivo.");
      await enviarAnexo({ pedidoId: q.data.pedido.pedido_id, protocolo: q.data.pedido.protocolo, tipo, arquivo });
    },
    onSuccess: () => { setArquivo(null); recarregar(); },
  });

  if (q.isPending) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (q.error) return <p className="text-sm text-destructive">{(q.error as Error).message}</p>;
  const { pedido: p, historico, anexos } = q.data;
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
          <Campo rotulo="Orientação da administração" valor={p.observacao_admin} />
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
          <p className="mt-2 text-sm text-muted-foreground">Concluída — aguardando validação da administração.</p>
        ) : (
          <div className="mt-2 space-y-2">
            <select value={etapa} onChange={(e) => setEtapa(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="">Escolha a nova etapa…</option>
              {ETAPAS_OPERACAO.filter((e) => e.valor !== p.status_operacao).map((e) => (
                <option key={e.valor} value={e.valor}>{e.rotulo}</option>
              ))}
            </select>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação (opcional)" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <button disabled={!etapa || mudar.isPending} onClick={() => mudar.mutate()} className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {mudar.isPending ? "Salvando…" : "Atualizar etapa"}
            </button>
            {mudar.error && <p className="text-sm text-destructive">{(mudar.error as Error).message}</p>}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h2 className="font-bold">Documentos</h2>
        <ul className="mt-2 space-y-1">
          {anexos.length === 0 && <li className="text-sm text-muted-foreground">Nenhum documento.</li>}
          {anexos.map((a) => (
            <li key={a.id}>
              <button onClick={async () => window.open(await abrirAnexo(a.caminho), "_blank", "noopener")} className="flex items-center gap-1 text-left text-sm text-primary underline">
                <FileText className="h-4 w-4 shrink-0" /> {a.nome_arquivo} <span className="text-muted-foreground">({a.tipo})</span>
              </button>
            </li>
          ))}
        </ul>
        {!travado && (
          <div className="mt-3 space-y-2">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="certidao">Certidão</option>
              <option value="documento">Documento</option>
            </select>
            <input type="file" accept="application/pdf,image/*" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} className="w-full text-sm" />
            <button disabled={!arquivo || enviar.isPending} onClick={() => enviar.mutate()} className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-input px-3 py-2.5 text-sm font-semibold disabled:opacity-50">
              <Upload className="h-4 w-4" /> {enviar.isPending ? "Enviando…" : "Enviar arquivo"}
            </button>
            {enviar.error && <p className="text-sm text-destructive">{(enviar.error as Error).message}</p>}
          </div>
        )}
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
