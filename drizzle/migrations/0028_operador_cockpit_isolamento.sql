-- 1) Novos campos operacionais (sem dado financeiro)
ALTER TABLE public.operador_pedidos
  ADD COLUMN IF NOT EXISTS pendencia_motivo text,
  ADD COLUMN IF NOT EXISTS pendencia_observacao text,
  ADD COLUMN IF NOT EXISTS pendencia_em timestamptz,
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS nota_operador text;

-- 2) Operador não lê mais a tabela diretamente (evita observacao_admin, atribuido_por etc.)
DROP POLICY IF EXISTS "Operador le as proprias atribuicoes" ON public.operador_pedidos;

-- 3) Helpers SECURITY DEFINER
CREATE OR REPLACE FUNCTION private.operador_pode_remover_anexo(_uid uuid, _pedido uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select private.operador_tem_pedido(_uid, _pedido) and exists (
    select 1 from public.operador_pedidos o
    where o.pedido_id = _pedido and o.operador_id = _uid and o.validado_em is null
      and o.status_operacao in ('atribuido','em_andamento','aguardando_tribunal','documento_recebido'))
$$;
CREATE OR REPLACE FUNCTION private.operador_pode_ler_arquivo(_uid uuid, _caminho text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select exists (select 1 from public.pedido_anexos a
    where a.caminho = _caminho and a.tipo = 'certidao' and private.operador_tem_pedido(_uid, a.pedido_id))
$$;
REVOKE ALL ON FUNCTION private.operador_pode_remover_anexo(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION private.operador_pode_ler_arquivo(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.operador_pode_remover_anexo(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.operador_pode_ler_arquivo(uuid, text) TO authenticated, service_role;

-- 4) Anexos: operador só enxerga certidões (nunca comprovantes/administrativos)
DROP POLICY IF EXISTS "Operador le anexos atribuidos" ON public.pedido_anexos;
CREATE POLICY "Operador le anexos atribuidos" ON public.pedido_anexos
  FOR SELECT TO authenticated
  USING (tipo = 'certidao' AND private.operador_tem_pedido(auth.uid(), pedido_id));
DROP POLICY IF EXISTS "Operador remove proprios anexos antes de concluir" ON public.pedido_anexos;
CREATE POLICY "Operador remove proprios anexos antes de concluir" ON public.pedido_anexos
  FOR DELETE TO authenticated
  USING (autor_id = auth.uid() AND tipo = 'certidao' AND private.operador_pode_remover_anexo(auth.uid(), pedido_id));

DROP POLICY IF EXISTS "Operador le arquivos atribuidos" ON storage.objects;
CREATE POLICY "Operador le arquivos atribuidos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pedido-anexos' AND private.operador_pode_ler_arquivo(auth.uid(), name));

-- 5) Etapas: fluxo ampliado, sequencial e com pendência bloqueando conclusão
CREATE OR REPLACE FUNCTION public.operador_atualizar_etapa(p_atribuicao uuid, p_status text, p_observacao text DEFAULT NULL::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_status NOT IN ('em_andamento','aguardando_tribunal','documento_recebido','concluido') THEN RAISE EXCEPTION 'Etapa inválida'; END IF;
  SELECT * INTO o FROM public.operador_pedidos WHERE id = p_atribuicao FOR UPDATE;
  IF o.id IS NULL OR o.operador_id <> auth.uid() OR NOT private.operador_tem_pedido(auth.uid(), o.pedido_id) THEN
    RAISE EXCEPTION 'Atribuição não encontrada';
  END IF;
  IF o.status_operacao = 'concluido' THEN RAISE EXCEPTION 'Atribuição concluída aguarda validação administrativa'; END IF;
  IF NOT (
       (o.status_operacao = 'atribuido' AND p_status = 'em_andamento')
    OR (o.status_operacao = 'em_andamento' AND p_status IN ('aguardando_tribunal','documento_recebido','concluido'))
    OR (o.status_operacao = 'aguardando_tribunal' AND p_status IN ('em_andamento','documento_recebido'))
    OR (o.status_operacao = 'documento_recebido' AND p_status = 'concluido')
  ) THEN
    IF p_status = 'concluido' THEN RAISE EXCEPTION 'Só é possível concluir uma operação em andamento';
    ELSE RAISE EXCEPTION 'Transição de etapa não permitida'; END IF;
  END IF;
  IF p_status = 'concluido' AND o.pendencia_motivo IS NOT NULL THEN
    RAISE EXCEPTION 'Resolva a pendência antes de concluir.';
  END IF;
  IF p_status = 'concluido' AND private.operador_pdfs_count(auth.uid(), o.pedido_id, o.atribuido_em) < 1 THEN
    RAISE EXCEPTION 'Anexe pelo menos 1 PDF da certidão para concluir.';
  END IF;
  UPDATE public.operador_pedidos SET
    status_operacao = p_status,
    iniciado_em = coalesce(iniciado_em, now()),
    concluido_em = CASE WHEN p_status = 'concluido' THEN now() ELSE concluido_em END
  WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_' || p_status, nullif(trim(coalesce(p_observacao, '')), ''), auth.uid());
END $function$;

-- Helper interno: atribuição ativa do próprio operador, editável
CREATE OR REPLACE FUNCTION private.operador_atribuicao_editavel(_atrib uuid)
RETURNS public.operador_pedidos LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE o public.operador_pedidos;
BEGIN
  SELECT * INTO o FROM public.operador_pedidos WHERE id = _atrib FOR UPDATE;
  IF o.id IS NULL OR o.operador_id <> auth.uid() OR NOT private.operador_tem_pedido(auth.uid(), o.pedido_id) THEN
    RAISE EXCEPTION 'Atribuição não encontrada';
  END IF;
  IF o.status_operacao IN ('concluido','devolvido') THEN RAISE EXCEPTION 'Operação não está ativa'; END IF;
  RETURN o;
END $$;
REVOKE ALL ON FUNCTION private.operador_atribuicao_editavel(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.operador_atribuicao_editavel(uuid) TO authenticated, service_role;

-- 6) Pendências
CREATE OR REPLACE FUNCTION public.operador_registrar_pendencia(p_atribuicao uuid, p_motivo text, p_observacao text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_motivo NOT IN ('documento_faltante','processo_indisponivel','segredo_justica','tribunal_indisponivel','dados_inconsistentes','aguardando_resposta_tribunal','outro') THEN
    RAISE EXCEPTION 'Motivo de pendência inválido';
  END IF;
  IF p_motivo = 'outro' AND nullif(trim(coalesce(p_observacao,'')),'') IS NULL THEN
    RAISE EXCEPTION 'Descreva a pendência.';
  END IF;
  o := private.operador_atribuicao_editavel(p_atribuicao);
  UPDATE public.operador_pedidos SET pendencia_motivo = p_motivo,
    pendencia_observacao = left(nullif(trim(coalesce(p_observacao,'')),''), 2000), pendencia_em = now()
  WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_pendencia', left(nullif(trim(coalesce(p_observacao,'')),''), 2000), auth.uid());
END $$;

CREATE OR REPLACE FUNCTION public.operador_resolver_pendencia(p_atribuicao uuid, p_observacao text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE o public.operador_pedidos;
BEGIN
  o := private.operador_atribuicao_editavel(p_atribuicao);
  IF o.pendencia_motivo IS NULL THEN RAISE EXCEPTION 'Não há pendência aberta'; END IF;
  UPDATE public.operador_pedidos SET pendencia_motivo = NULL, pendencia_observacao = NULL, pendencia_em = NULL WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_pendencia_resolvida', left(nullif(trim(coalesce(p_observacao,'')),''), 2000), auth.uid());
END $$;

-- 7) Checklist manual (itens derivados como "PDF anexado" não são aceitos aqui)
CREATE OR REPLACE FUNCTION public.operador_salvar_checklist(p_atribuicao uuid, p_item text, p_marcado boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_item NOT IN ('processo_identificado','tribunal_identificado','acesso_realizado','informacoes_conferidas','certidao_solicitada','certidao_recebida','pdf_conferido') THEN
    RAISE EXCEPTION 'Item de checklist inválido';
  END IF;
  o := private.operador_atribuicao_editavel(p_atribuicao);
  UPDATE public.operador_pedidos SET checklist = coalesce(checklist,'{}'::jsonb) || jsonb_build_object(p_item, p_marcado) WHERE id = o.id;
END $$;

-- 8) Nota operacional do operador
CREATE OR REPLACE FUNCTION public.operador_salvar_nota(p_atribuicao uuid, p_nota text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE o public.operador_pedidos;
BEGIN
  o := private.operador_atribuicao_editavel(p_atribuicao);
  UPDATE public.operador_pedidos SET nota_operador = left(nullif(trim(coalesce(p_nota,'')),''), 4000) WHERE id = o.id;
END $$;

-- 9) Anexos operacionais com projeção explícita
CREATE OR REPLACE FUNCTION public.operador_anexos(p_atribuicao uuid)
RETURNS TABLE(id uuid, nome_arquivo text, caminho text, tamanho_bytes integer, created_at timestamptz, meu boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select a.id, a.nome_arquivo, a.caminho, a.tamanho_bytes, a.created_at,
    (a.autor_id = auth.uid() and a.created_at >= o.atribuido_em)
  from public.operador_pedidos o join public.pedido_anexos a on a.pedido_id = o.pedido_id
  where o.id = p_atribuicao and o.operador_id = auth.uid()
    and private.operador_tem_pedido(auth.uid(), o.pedido_id)
    and a.tipo = 'certidao'
  order by a.created_at desc
$$;

-- 10) Fila com dados de cockpit (sem valores)
DROP FUNCTION IF EXISTS public.operador_minha_fila();
CREATE FUNCTION public.operador_minha_fila()
RETURNS TABLE(atribuicao_id uuid, pedido_id uuid, status_operacao text, atribuido_em timestamptz, iniciado_em timestamptz, concluido_em timestamptz, protocolo text, numero_processo text, nome_parte text, quantidade integer, tribunal_sigla text, uf_processo text, cidade_processo text, comarca_processo text, foro text, vara text, finalidade text, pendencia_motivo text, pendencia_em timestamptz, pdfs integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select o.id, p.id, o.status_operacao, o.atribuido_em, o.iniciado_em, o.concluido_em, p.protocolo,
    p.numero_processo, p.nome_parte, p.quantidade, p.tribunal_sigla, coalesce(p.uf_processo, p.uf),
    coalesce(p.cidade_processo, p.cidade), p.comarca_processo, p.foro, p.vara, p.finalidade,
    o.pendencia_motivo, o.pendencia_em, private.operador_pdfs_count(auth.uid(), p.id, o.atribuido_em)
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.operador_id = auth.uid()
    and private.has_role(auth.uid(), 'operador_certidao'::public.app_role)
    and o.status_operacao <> 'devolvido' and o.validado_em is null
  order by o.atribuido_em asc
$$;

-- 11) Detalhe com pendência/checklist/nota (sem observacao_admin, sem valores)
DROP FUNCTION IF EXISTS public.operador_pedido_detalhe(uuid);
CREATE FUNCTION public.operador_pedido_detalhe(p_atribuicao uuid)
RETURNS TABLE(atribuicao_id uuid, pedido_id uuid, status_operacao text, atribuido_em timestamptz, iniciado_em timestamptz, concluido_em timestamptz, observacao_operador text, protocolo text, numero_processo text, nome_parte text, cpf text, quantidade integer, certidoes jsonb, observacoes text, finalidade text, tribunal_sigla text, tribunal_nome text, uf_processo text, cidade_processo text, comarca_processo text, foro text, vara text, unidade_judiciaria text, sistema_processual text, pendencia_motivo text, pendencia_observacao text, pendencia_em timestamptz, checklist jsonb, nota_operador text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select o.id, p.id, o.status_operacao, o.atribuido_em, o.iniciado_em, o.concluido_em,
    o.observacao_operador, p.protocolo, p.numero_processo, p.nome_parte, p.cpf,
    p.quantidade, p.certidoes, p.observacoes, p.finalidade, p.tribunal_sigla, p.tribunal_nome,
    coalesce(p.uf_processo, p.uf), coalesce(p.cidade_processo, p.cidade), p.comarca_processo, p.foro,
    p.vara, p.unidade_judiciaria, p.sistema_processual,
    o.pendencia_motivo, o.pendencia_observacao, o.pendencia_em, o.checklist, o.nota_operador
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.id = p_atribuicao and o.operador_id = auth.uid()
    and private.operador_tem_pedido(auth.uid(), o.pedido_id)
$$;

-- 12) Histórico operacional: só andamentos desta atribuição
CREATE OR REPLACE FUNCTION public.operador_historico(p_atribuicao uuid)
RETURNS TABLE(id uuid, status text, observacao text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select a.id, a.status, a.observacao, a.created_at
  from public.pedido_andamentos a join public.operador_pedidos o on o.pedido_id = a.pedido_id
  where o.id = p_atribuicao and o.operador_id = auth.uid()
    and private.operador_tem_pedido(auth.uid(), o.pedido_id)
    and a.status like 'operacao_%' and a.created_at >= o.atribuido_em
  order by a.created_at desc
$$;

-- 13) Meu histórico: validadas e devolvidas, sem valores
DROP FUNCTION IF EXISTS public.operador_meu_historico();
CREATE FUNCTION public.operador_meu_historico()
RETURNS TABLE(atribuicao_id uuid, protocolo text, numero_processo text, nome_parte text, tribunal_sigla text, comarca_processo text, situacao text, atribuido_em timestamptz, iniciado_em timestamptz, concluido_em timestamptz, validado_em timestamptz, devolvido_em timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select o.id, p.protocolo, p.numero_processo, p.nome_parte, p.tribunal_sigla, p.comarca_processo,
    case when o.validado_em is not null then 'validada' else 'devolvida' end,
    o.atribuido_em, o.iniciado_em, o.concluido_em, o.validado_em, o.devolvido_em
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.operador_id = auth.uid()
    and private.has_role(auth.uid(), 'operador_certidao'::public.app_role)
    and (o.validado_em is not null or o.status_operacao = 'devolvido')
  order by coalesce(o.validado_em, o.devolvido_em) desc
$$;

REVOKE ALL ON FUNCTION public.operador_registrar_pendencia(uuid, text, text) FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_resolver_pendencia(uuid, text) FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_salvar_checklist(uuid, text, boolean) FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_salvar_nota(uuid, text) FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_anexos(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_minha_fila() FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_pedido_detalhe(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.operador_meu_historico() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.operador_registrar_pendencia(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_resolver_pendencia(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_salvar_checklist(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_salvar_nota(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_anexos(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_minha_fila() TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_pedido_detalhe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.operador_meu_historico() TO authenticated;