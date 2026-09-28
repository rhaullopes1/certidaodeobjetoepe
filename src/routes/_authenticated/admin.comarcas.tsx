import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Search, Trash2, Pencil, X } from "lucide-react";
import {
  listarComarcas,
  removerComarca,
  salvarComarca,
  souEquipe,
  CAMPOS_TEXTO_UNIDADE,
  TIPOS_CANAL,
  TIPOS_FONTE,
  validarFonteUnidade,
  type ComarcaContato,
  type ComarcaContatoInput,
} from "@/lib/admin";
import { ESTADOS } from "@/lib/site";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/comarcas")({
  component: AdminComarcas,
  head: () => ({
    meta: [
      { title: "Contatos das comarcas | Painel Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Base interna de telefones e e-mails das comarcas e varas.",
      },
      { property: "og:title", content: "Contatos das comarcas | Painel Certidão Objeto e Pé" },
      { property: "og:description", content: "Cadastro interno de contatos das comarcas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const vazio: ComarcaContatoInput = {
  comarca: "",
  ...Object.fromEntries(CAMPOS_TEXTO_UNIDADE.map((c) => [c, ""])),
};

/** Campos extras do formulário da unidade (além dos básicos). */
const CAMPOS_EXTRAS: { chave: (typeof CAMPOS_TEXTO_UNIDADE)[number]; rotulo: string }[] = [
  { chave: "foro", rotulo: "Foro / fórum" },
  { chave: "codigo_origem_cnj", rotulo: "Código de origem CNJ (OOOO)" },
  { chave: "unidade_judiciaria", rotulo: "Unidade judicial" },
  { chave: "endereco", rotulo: "Endereço" },
  { chave: "cep", rotulo: "CEP" },
  { chave: "responsavel_nome", rotulo: "Responsável (só se publicado oficialmente)" },
  { chave: "responsavel_setor", rotulo: "Setor / cargo" },
  { chave: "canal_solicitacao_url", rotulo: "URL oficial para solicitar a certidão" },
  { chave: "canal_solicitacao_email", rotulo: "E-mail oficial para solicitação" },
  { chave: "canal_solicitacao_telefone", rotulo: "Telefone para solicitação" },
  { chave: "documentos_exigidos", rotulo: "Documentos exigidos" },
  { chave: "taxa_info", rotulo: "Taxa (conforme fonte)" },
  { chave: "prazo_info", rotulo: "Prazo informado pela unidade" },
  { chave: "fonte_url", rotulo: "Link da fonte oficial" },
];

const campo =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-ring";

function AdminComarcas() {
  const queryClient = useQueryClient();
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });

  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<ComarcaContatoInput | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const comarcas = useQuery({
    queryKey: ["admin-comarcas", busca],
    queryFn: () => listarComarcas(busca),
    enabled: permissao.data === true,
  });

  const salvar = useMutation({
    mutationFn: (dados: ComarcaContatoInput) => salvarComarca(dados),
    onSuccess: () => {
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ["admin-comarcas"] });
    },
    onError: (e) => setErro(e instanceof Error ? e.message : "Não foi possível salvar."),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => removerComarca(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comarcas"] }),
    onError: (e) => setErro(e instanceof Error ? e.message : "Não foi possível excluir."),
  });

  function editar(c: ComarcaContato) {
    setErro(null);
    const copia: ComarcaContatoInput = { id: c.id, comarca: c.comarca, ativo: c.ativo };
    for (const k of CAMPOS_TEXTO_UNIDADE) (copia as Record<string, unknown>)[k] = c[k] ?? "";
    setForm(copia);
  }

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Contatos das comarcas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Base interna da equipe. Nunca aparece para o cliente.
            </p>
          </div>
          <button
            onClick={() => {
              setErro(null);
              setForm({ ...vazio });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nova comarca
          </button>
        </div>

        {permissao.data === false && (
          <div className="mt-8">
            <SemPermissao />
          </div>
        )}

        {permissao.data === true && (
          <>
            <div className="mt-6 flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className={campo}
                placeholder="Buscar por tribunal, comarca, foro, código OOOO, vara, telefone ou e-mail"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {erro && <p className="mt-4 text-sm font-medium text-destructive">{erro}</p>}

            {form && (
              <section className="card-premium mt-6 p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">
                    {form.id ? "Editar comarca" : "Cadastrar comarca"}
                  </h2>
                  <button
                    onClick={() => setForm(null)}
                    aria-label="Fechar formulário"
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    className={campo}
                    placeholder="Comarca (obrigatório)"
                    value={form.comarca}
                    onChange={(e) => setForm({ ...form, comarca: e.target.value })}
                  />
                  <select
                    className={campo}
                    value={form.uf ?? ""}
                    onChange={(e) => setForm({ ...form, uf: e.target.value })}
                    aria-label="Estado"
                  >
                    <option value="">Estado (UF)</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  <input
                    className={campo}
                    placeholder="Tribunal (ex.: TJSP)"
                    value={form.tribunal ?? ""}
                    onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
                  />
                  <input
                    className={campo}
                    placeholder="Vara / cartório"
                    value={form.vara_cartorio ?? ""}
                    onChange={(e) => setForm({ ...form, vara_cartorio: e.target.value })}
                  />
                  <input
                    className={campo}
                    placeholder="Telefone"
                    value={form.telefone ?? ""}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  />
                  <input
                    className={campo}
                    placeholder="WhatsApp"
                    value={form.whatsapp ?? ""}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                  <input
                    className={campo}
                    placeholder="E-mail do cartório"
                    value={form.email ?? ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <input
                    className={campo}
                    placeholder="Link do balcão virtual"
                    value={form.balcao_virtual_url ?? ""}
                    onChange={(e) => setForm({ ...form, balcao_virtual_url: e.target.value })}
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {CAMPOS_EXTRAS.map((c) => (
                    <input
                      key={c.chave}
                      className={campo}
                      placeholder={c.rotulo}
                      aria-label={c.rotulo}
                      value={(form[c.chave] as string | null | undefined) ?? ""}
                      onChange={(e) => setForm({ ...form, [c.chave]: e.target.value })}
                    />
                  ))}
                  <select
                    className={campo}
                    aria-label="Tipo de canal de solicitação"
                    value={form.canal_solicitacao_tipo ?? ""}
                    onChange={(e) => setForm({ ...form, canal_solicitacao_tipo: e.target.value })}
                  >
                    <option value="">Tipo de canal de solicitação</option>
                    {TIPOS_CANAL.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                  <select
                    className={campo}
                    aria-label="Tipo da fonte"
                    value={form.fonte_tipo ?? ""}
                    onChange={(e) => setForm({ ...form, fonte_tipo: e.target.value })}
                  >
                    <option value="">Tipo da fonte (obrigatório p/ contatos)</option>
                    {TIPOS_FONTE.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <label className="text-xs text-muted-foreground">
                    Data de atualização da fonte
                    <input
                      type="date"
                      className={`${campo} mt-1`}
                      value={form.fonte_atualizada_em ?? ""}
                      onChange={(e) => setForm({ ...form, fonte_atualizada_em: e.target.value })}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.ativo ?? true}
                      onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                    />
                    Cadastro ativo
                  </label>
                </div>
                <textarea
                  className={`${campo} mt-3 min-h-20`}
                  placeholder="Instruções operacionais para solicitar a certidão"
                  value={form.instrucoes_solicitacao ?? ""}
                  onChange={(e) => setForm({ ...form, instrucoes_solicitacao: e.target.value })}
                />
                <textarea
                  className={`${campo} mt-3 min-h-24`}
                  placeholder="Observações internas (horários, ramais, particularidades)"
                  value={form.observacoes ?? ""}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />

                <button
                  onClick={() => {
                    setErro(null);
                    if (!form.comarca.trim()) {
                      setErro("Informe o nome da comarca.");
                      return;
                    }
                    const erroFonte = validarFonteUnidade(form as unknown as Record<string, string>);
                    if (erroFonte) {
                      setErro(erroFonte);
                      return;
                    }
                    salvar.mutate(form);
                  }}
                  disabled={salvar.isPending}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar contato
                </button>
              </section>
            )}

            {comarcas.isPending && (
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando comarcas...
              </p>
            )}

            {comarcas.data && comarcas.data.length === 0 && (
              <p className="mt-8 text-sm text-muted-foreground">
                Nenhuma comarca cadastrada ainda. Cada contato salvo aqui fica disponível para
                todos os próximos pedidos.
              </p>
            )}

            {comarcas.data && comarcas.data.length > 0 && (
              <ul className="mt-6 space-y-3">
                {comarcas.data.map((c) => (
                  <li key={c.id} className="card-premium p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold break-words">
                          {c.comarca}
                          {c.uf ? ` — ${c.uf}` : ""}
                          {c.tribunal ? ` · ${c.tribunal}` : ""}
                          {c.codigo_origem_cnj ? ` · origem ${c.codigo_origem_cnj}` : ""}
                          {c.ativo === false ? " · inativo" : ""}
                        </p>
                        {(c.foro || c.unidade_judiciaria) && (
                          <p className="text-sm text-muted-foreground break-words">
                            {[c.foro, c.unidade_judiciaria].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {c.vara_cartorio && (
                          <p className="text-sm text-muted-foreground break-words">
                            {c.vara_cartorio}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editar(c)}
                          aria-label={`Editar ${c.comarca}`}
                          className="rounded-full bg-secondary p-2 text-muted-foreground transition-colors hover:bg-secondary/70"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => excluir.mutate(c.id)}
                          aria-label={`Excluir ${c.comarca}`}
                          className="rounded-full bg-secondary p-2 text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                      {c.telefone && <span>Telefone: {c.telefone}</span>}
                      {c.whatsapp && <span>WhatsApp: {c.whatsapp}</span>}
                      {c.email && <span className="break-words">E-mail: {c.email}</span>}
                      {c.balcao_virtual_url && (
                        <a
                          href={c.balcao_virtual_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words text-accent underline"
                        >
                          Balcão virtual
                        </a>
                      )}
                      {c.canal_solicitacao_url && (
                        <span className="break-words">Canal: {c.canal_solicitacao_url}</span>
                      )}
                      {c.fonte_tipo && (
                        <span>
                          Fonte: {c.fonte_tipo}
                          {c.fonte_atualizada_em ? ` · ${c.fonte_atualizada_em.split("-").reverse().join("/")}` : ""}
                        </span>
                      )}
                      {c.observacoes && (
                        <span className="break-words">Obs.: {c.observacoes}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
