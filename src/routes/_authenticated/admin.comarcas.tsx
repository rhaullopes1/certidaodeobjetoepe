import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Search, Trash2, Pencil, X } from "lucide-react";
import {
  listarComarcas,
  removerComarca,
  salvarComarca,
  souEquipe,
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
  uf: "",
  tribunal: "",
  comarca: "",
  vara_cartorio: "",
  telefone: "",
  whatsapp: "",
  email: "",
  balcao_virtual_url: "",
  observacoes: "",
};

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
    setForm({
      id: c.id,
      uf: c.uf ?? "",
      tribunal: c.tribunal ?? "",
      comarca: c.comarca,
      vara_cartorio: c.vara_cartorio ?? "",
      telefone: c.telefone ?? "",
      whatsapp: c.whatsapp ?? "",
      email: c.email ?? "",
      balcao_virtual_url: c.balcao_virtual_url ?? "",
      observacoes: c.observacoes ?? "",
    });
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
                placeholder="Buscar por comarca, tribunal, telefone ou e-mail"
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
                    {ESTADOS.map((e) => (
                      <option key={e.uf} value={e.uf}>
                        {e.uf} — {e.nome}
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
                        </p>
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
