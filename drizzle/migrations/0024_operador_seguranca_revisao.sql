DROP FUNCTION IF EXISTS public.operador_pedido_detalhe(uuid);
CREATE FUNCTION public.operador_pedido_detalhe(p_atribuicao uuid)
 RETURNS TABLE (atribuicao_id uuid, pedido_id uuid, status_operacao text, atribuido_em timestamptz,
   iniciado_em timestamptz, concluido_em timestamptz, observacao_operador text,
   protocolo text, numero_processo text, nome_parte text, cpf text, quantidade integer, certidoes jsonb,
   observacoes text, finalidade text, tribunal_sigla text, tribunal_nome text, uf_processo text,
   cidade_processo text, comarca_processo text, foro text, vara text, unidade_judiciaria text,
   sistema_processual text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select o.id, p.id, o.status_operacao, o.atribuido_em, o.iniciado_em, o.concluido_em,
    o.observacao_operador, p.protocolo, p.numero_processo, p.nome_parte, p.cpf,
    p.quantidade, p.certidoes, p.observacoes, p.finalidade, p.tribunal_sigla, p.tribunal_nome,
    coalesce(p.uf_processo, p.uf), coalesce(p.cidade_processo, p.cidade), p.comarca_processo, p.foro,
    p.vara, p.unidade_judiciaria, p.sistema_processual
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.id = p_atribuicao and o.operador_id = auth.uid()
    and private.operador_tem_pedido(auth.uid(), o.pedido_id)
$$;
REVOKE ALL ON FUNCTION public.operador_pedido_detalhe(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.operador_pedido_detalhe(uuid) TO authenticated;

-- observacao_operador = orientação da administração ao operador; o operador não a sobrescreve
-- (as notas dele ficam no histórico de andamentos).
CREATE OR REPLACE FUNCTION public.operador_atualizar_etapa(p_atribuicao uuid, p_status text, p_observacao text DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_status NOT IN ('atribuido','em_andamento','aguardando_tribunal','documento_recebido','concluido','devolvido') THEN
    RAISE EXCEPTION 'Etapa inválida';
  END IF;
  SELECT * INTO o FROM public.operador_pedidos WHERE id = p_atribuicao FOR UPDATE;
  IF o.id IS NULL OR o.operador_id <> auth.uid() OR NOT private.operador_tem_pedido(auth.uid(), o.pedido_id) THEN
    RAISE EXCEPTION 'Atribuição não encontrada';
  END IF;
  IF o.status_operacao = 'concluido' THEN
    RAISE EXCEPTION 'Atribuição concluída aguarda validação administrativa';
  END IF;
  UPDATE public.operador_pedidos SET
    status_operacao = p_status,
    iniciado_em = CASE WHEN p_status <> 'atribuido' THEN coalesce(iniciado_em, now()) ELSE iniciado_em END,
    concluido_em = CASE WHEN p_status = 'concluido' THEN now() ELSE concluido_em END,
    devolvido_em = CASE WHEN p_status = 'devolvido' THEN now() ELSE devolvido_em END
  WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_' || p_status, nullif(trim(coalesce(p_observacao, '')), ''), auth.uid());
END $$;

-- Validação administrativa só de atribuição concluída (barreira no banco).
CREATE OR REPLACE FUNCTION public.exigir_conclusao_para_validar()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.validado_em IS NOT NULL AND OLD.validado_em IS NULL AND OLD.status_operacao <> 'concluido' THEN
    RAISE EXCEPTION 'Só é possível validar uma atribuição concluída pelo operador';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER operador_pedidos_exigir_conclusao BEFORE UPDATE ON public.operador_pedidos
  FOR EACH ROW EXECUTE FUNCTION public.exigir_conclusao_para_validar();
REVOKE ALL ON FUNCTION public.exigir_conclusao_para_validar() FROM PUBLIC, anon, authenticated;