import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function validarPedidoId(input: { pedidoId: string }) {
  const id = String(input?.pedidoId ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Pedido inválido.");
  return { pedidoId: id };
}

type ContextoEquipe = {
  supabase: { from: (t: "user_roles") => never };
  userId: string;
};

async function exigirEquipe(context: ContextoEquipe) {
  const consulta = context.supabase.from("user_roles") as unknown as {
    select: (c: string) => {
      eq: (c: string, v: string) => { limit: (n: number) => Promise<{ data: unknown[] | null }> };
    };
  };
  const { data: staff } = await consulta.select("role").eq("user_id", context.userId).limit(1);
  if (!staff?.length) throw new Error("Acesso restrito à equipe.");
}

/**
 * Dispara (ou repete) a emissão automática da Certidão de Antecedentes
 * Criminais de um pedido já pago. Uso interno do painel.
 */
export const dispararEmissaoAntecedentes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarPedidoId)
  .handler(async ({ data, context }) => {
    await exigirEquipe(context as never);
    const { processarEmissaoAntecedentes } = await import("./antecedentes.server");
    return processarEmissaoAntecedentes(data.pedidoId);
  });

/**
 * Baixa o PDF oficial da certidão emitida e anexa ao pedido como documento
 * do tipo "certidao", para ficar registrado no painel e no link do WhatsApp.
 */
export const anexarPdfAntecedentes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarPedidoId)
  .handler(async ({ data, context }) => {
    await exigirEquipe(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pedido } = await supabaseAdmin
      .from("pedidos")
      .select("id, protocolo")
      .eq("id", data.pedidoId)
      .maybeSingle();
    if (!pedido) throw new Error("Pedido não encontrado.");

    const { data: emissao } = await supabaseAdmin
      .from("emissoes_antecedentes")
      .select("site_receipt, certidao_numero")
      .eq("pedido_id", data.pedidoId)
      .maybeSingle();
    const url = emissao?.site_receipt ?? null;
    if (!url) throw new Error("Esta certidão ainda não tem PDF disponível.");

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Não foi possível baixar o PDF da certidão.");
    const arquivo = new Uint8Array(await resposta.arrayBuffer());

    const nome = `certidao-antecedentes-${emissao?.certidao_numero ?? pedido.protocolo}.pdf`;
    const caminho = `${pedido.protocolo}/${Date.now()}-${nome}`;

    const { error: erroUpload } = await supabaseAdmin.storage
      .from("pedido-anexos")
      .upload(caminho, arquivo, { contentType: "application/pdf", upsert: false });
    if (erroUpload) throw new Error("Não foi possível guardar o PDF no pedido.");

    const { error } = await supabaseAdmin.from("pedido_anexos").insert({
      pedido_id: pedido.id,
      tipo: "certidao",
      nome_arquivo: nome,
      caminho,
      tamanho_bytes: arquivo.byteLength,
      content_type: "application/pdf",
      autor_id: context.userId,
    });
    if (error) throw new Error("Não foi possível registrar o documento no pedido.");

    return { ok: true, nome };
  });

/** Reenvia o e-mail de entrega da certidão ao cliente. */
export const reenviarEmailAntecedentes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validarPedidoId)
  .handler(async ({ data, context }) => {
    await exigirEquipe(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("emissoes_antecedentes")
      .update({ email_enviado_em: null })
      .eq("pedido_id", data.pedidoId);

    const { processarEmissaoAntecedentes } = await import("./antecedentes.server");
    return processarEmissaoAntecedentes(data.pedidoId);
  });
