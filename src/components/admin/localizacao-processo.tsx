import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ExternalLink,
  FileSearch,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  unidadesParaPedido,
  urlConsultaTribunal,
  type ComarcaContato,
  type PedidoAdmin,
} from "@/lib/admin";
import {
  badgeConfianca,
  camposLocalizacao,
  escolherUnidade,
  urlConsultaProcesso,
  urlHttpsSegura,
  type Confianca,
  type NivelUnidade,
} from "@/lib/localizacao";
import { atualizarLocalizacao } from "@/lib/localizacao.functions";

const BADGE: Record<Confianca, { texto: string; classe: string }> = {
  confirmado: { texto: "Confirmado", classe: "bg-accent/15 text-accent" },
  parcial: { texto: "Parcial", classe: "bg-secondary text-foreground" },
  nao_identificado: { texto: "Não identificado", classe: "bg-destructive/10 text-destructive" },
};

const NIVEL: Record<NivelUnidade, string> = {
  vara: "contato específico da vara",
  codigo_origem: "contato pelo código de origem",
  foro: "contato do foro",
  comarca: "contato geral da comarca",
};

const botao =
  "inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary";

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="break-words text-sm font-medium sm:text-right">{valor}</span>
    </div>
  );
}

function fmtData(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
}

function soDig(v: string) {
  return v.replace(/\D/g, "");
}

export function LocalizacaoProcesso({ pedido }: { pedido: PedidoAdmin }) {
  const queryClient = useQueryClient();
  const atualizar = useServerFn(atualizarLocalizacao);
  const [aviso, setAviso] = useState<string | null>(null);

  const unidades = useQuery({
    queryKey: ["admin-unidades-pedido", pedido.id, pedido.comarca_processo, pedido.codigo_origem_cnj],
    queryFn: () => unidadesParaPedido(pedido),
  });
  const consultaUrl = useQuery({
    queryKey: ["admin-tribunal-url", pedido.tribunal_sigla],
    queryFn: () => urlConsultaTribunal(pedido.tribunal_sigla),
    enabled: !!pedido.tribunal_sigla,
  });

  const recalcular = useMutation({
    mutationFn: (consultarDatajud: boolean) =>
      atualizar({ data: { pedidoId: pedido.id, consultarDatajud } }),
    onSuccess: (r, consultou) => {
      const msgs: Record<string, string> = {
        nao_configurado: "DataJud não configurado — identificação feita apenas pela tabela CNJ.",
        tribunal_nao_suportado: "Tribunal sem índice DataJud conhecido.",
        nao_encontrado: "DataJud não retornou este processo.",
        indisponivel: "DataJud indisponível no momento. Dados CNJ mantidos.",
        ok: "Dados confirmados pelo DataJud.",
      };
      setAviso(consultou && r.datajudStatus ? msgs[r.datajudStatus] ?? null : "Identificação atualizada.");
      queryClient.invalidateQueries({ queryKey: ["admin-pedido"] });
    },
    onError: (e) => setAviso(e instanceof Error ? e.message : "Falha ao atualizar."),
  });

  const campos = camposLocalizacao(pedido);
  const badge = BADGE[badgeConfianca(pedido)];
  const linkProcesso = urlConsultaProcesso(consultaUrl.data, pedido.numero_processo);
  const escolha = escolherUnidade<ComarcaContato>(unidades.data ?? [], {
    tribunal: pedido.tribunal_sigla ?? null,
    codigoOrigem: pedido.codigo_origem_cnj ?? null,
    comarca: pedido.comarca_processo ?? null,
    foro: pedido.foro ?? null,
    vara: pedido.vara ?? null,
  });
  const u = escolha?.unidade ?? null;
  const datajud = (pedido.processo_dados as { datajud?: { status?: string } } | null)?.datajud;

  return (
    <div className="mt-8 grid gap-6">
      {/* LOCALIZAÇÃO DO PROCESSO */}
      <section className="card-premium border-l-4 border-l-accent p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
            <MapPin className="h-5 w-5 text-accent" /> Localização do processo
          </h2>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${badge.classe}`}>
            {badge.texto}
          </span>
        </div>
        <div className="mt-4">
          {campos.map((c) => (
            <Linha key={c.label} label={c.label} valor={c.valor} />
          ))}
          <Linha label="Fonte" valor={pedido.processo_fonte ?? "Sem fonte registrada"} />
          {fmtData(pedido.processo_enriquecido_em) && (
            <Linha label="Última atualização" valor={fmtData(pedido.processo_enriquecido_em)!} />
          )}
          {datajud?.status && datajud.status !== "ok" && (
            <Linha label="DataJud" valor={datajud.status.replace(/_/g, " ")} />
          )}
        </div>
        {!pedido.vara && (
          <p className="mt-3 text-xs text-muted-foreground">
            Vara não confirmada. O código de origem indica a unidade de origem/foro, não a vara.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {linkProcesso && (
            <a href={linkProcesso} target="_blank" rel="noopener noreferrer" className={botao}>
              <ExternalLink className="h-4 w-4" /> Abrir processo no tribunal
            </a>
          )}
          <button
            type="button"
            className={botao}
            disabled={recalcular.isPending}
            onClick={() => recalcular.mutate(false)}
          >
            <RefreshCw className="h-4 w-4" /> Reidentificar pela tabela CNJ
          </button>
          <button
            type="button"
            className={botao}
            disabled={recalcular.isPending}
            onClick={() => recalcular.mutate(true)}
          >
            {recalcular.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSearch className="h-4 w-4" />
            )}
            Consultar DataJud
          </button>
        </div>
        {aviso && <p className="mt-3 text-sm text-muted-foreground">{aviso}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CONTATO DA UNIDADE */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-bold">Contato da unidade / fórum</h2>
          {unidades.isPending && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando na base interna...
            </p>
          )}
          {!unidades.isPending && !u && (
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum contato cadastrado para esta unidade/comarca. Cadastre em “Comarcas” com a
              fonte oficial.
            </p>
          )}
          {u && (
            <>
              <p className="mt-1 text-xs text-muted-foreground">{NIVEL[escolha!.nivel]}</p>
              <div className="mt-3">
                <Linha
                  label="Unidade"
                  valor={u.unidade_judiciaria || u.vara_cartorio || u.foro || u.comarca}
                />
                {u.endereco && <Linha label="Endereço" valor={u.endereco} />}
                {u.cep && <Linha label="CEP" valor={u.cep} />}
                {u.telefone && <Linha label="Telefone" valor={u.telefone} />}
                {u.whatsapp && <Linha label="WhatsApp" valor={u.whatsapp} />}
                {u.email && <Linha label="E-mail" valor={u.email} />}
                {(u.responsavel_nome || u.responsavel_setor) && u.fonte_tipo && (
                  <Linha
                    label="Responsável/setor"
                    valor={[u.responsavel_nome, u.responsavel_setor].filter(Boolean).join(" — ")}
                  />
                )}
                {u.observacoes && <Linha label="Observações" valor={u.observacoes} />}
                <Linha
                  label="Fonte"
                  valor={
                    [u.fonte_tipo, fmtData(u.fonte_atualizada_em)].filter(Boolean).join(" · ") ||
                    "Sem fonte registrada"
                  }
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {u.telefone && (
                  <a href={`tel:${soDig(u.telefone)}`} className={botao}>
                    <Phone className="h-4 w-4" /> Ligar
                  </a>
                )}
                {u.whatsapp && soDig(u.whatsapp).length >= 10 && (
                  <a
                    href={`https://wa.me/${soDig(u.whatsapp).length <= 11 ? "55" : ""}${soDig(u.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={botao}
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {u.email && (
                  <a href={`mailto:${u.email}`} className={botao}>
                    <Mail className="h-4 w-4" /> E-mail
                  </a>
                )}
                {urlHttpsSegura(u.balcao_virtual_url) && (
                  <a href={urlHttpsSegura(u.balcao_virtual_url)!} target="_blank" rel="noopener noreferrer" className={botao}>
                    <ExternalLink className="h-4 w-4" /> Balcão Virtual
                  </a>
                )}
                {u.endereco && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [u.endereco, u.cep].filter(Boolean).join(" "),
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={botao}
                  >
                    <MapPin className="h-4 w-4" /> Mapa
                  </a>
                )}
                {u.fonte_url && urlHttpsSegura(u.fonte_url) && (
                  <a href={urlHttpsSegura(u.fonte_url)!} target="_blank" rel="noopener noreferrer" className={botao}>
                    <ExternalLink className="h-4 w-4" /> Ver fonte
                  </a>
                )}
              </div>
            </>
          )}
        </section>

        {/* SOLICITAÇÃO DA CERTIDÃO */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-bold">Solicitação da certidão</h2>
          <div className="mt-3">
            <Linha label="Tipo" valor="Certidão de Objeto e Pé" />
            {u && (
              <Linha
                label="Unidade responsável"
                valor={u.unidade_judiciaria || u.vara_cartorio || u.foro || u.comarca}
              />
            )}
            {u?.canal_solicitacao_tipo && (
              <Linha label="Tipo de canal" valor={u.canal_solicitacao_tipo.replace(/_/g, " ")} />
            )}
            {u?.canal_solicitacao_url && <Linha label="URL oficial" valor={u.canal_solicitacao_url} />}
            {u?.canal_solicitacao_email && <Linha label="E-mail oficial" valor={u.canal_solicitacao_email} />}
            {u?.canal_solicitacao_telefone && <Linha label="Telefone" valor={u.canal_solicitacao_telefone} />}
            {u?.documentos_exigidos && <Linha label="Documentos exigidos" valor={u.documentos_exigidos} />}
            {u?.taxa_info && <Linha label="Taxa" valor={u.taxa_info} />}
            {u?.prazo_info && <Linha label="Prazo informado" valor={u.prazo_info} />}
            {u?.instrucoes_solicitacao && <Linha label="Instruções" valor={u.instrucoes_solicitacao} />}
            {u && (u.canal_solicitacao_url || u.canal_solicitacao_email || u.canal_solicitacao_telefone) && (
              <Linha
                label="Fonte"
                valor={[u.fonte_tipo, fmtData(u.fonte_atualizada_em)].filter(Boolean).join(" · ") || "—"}
              />
            )}
          </div>
          {u && urlHttpsSegura(u.canal_solicitacao_url) ? (
            <a
              href={urlHttpsSegura(u.canal_solicitacao_url)!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" /> Abrir canal de solicitação
            </a>
          ) : (
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Canal específico não cadastrado.
              {u && (u.email || u.telefone || u.balcao_virtual_url)
                ? " Use os contatos oficiais da unidade ao lado."
                : " Cadastre o canal oficial em “Comarcas”."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
