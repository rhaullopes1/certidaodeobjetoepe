CREATE OR REPLACE FUNCTION public.operador_atualizar_etapa(p_atribuicao uuid, p_status text, p_observacao text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_status NOT IN ('em_andamento','concluido') THEN
    RAISE EXCEPTION 'Etapa inválida';
  END IF;
  SELECT * INTO o FROM public.operador_pedidos WHERE id = p_atribuicao FOR UPDATE;
  IF o.id IS NULL OR o.operador_id <> auth.uid() OR NOT private.operador_tem_pedido(auth.uid(), o.pedido_id) THEN
    RAISE EXCEPTION 'Atribuição não encontrada';
  END IF;
  IF o.status_operacao = 'concluido' THEN
    RAISE EXCEPTION 'Atribuição concluída aguarda validação administrativa';
  END IF;
  IF p_status = 'em_andamento' AND o.status_operacao <> 'atribuido' THEN
    RAISE EXCEPTION 'A operação já está em andamento';
  END IF;
  IF p_status = 'concluido' AND o.status_operacao <> 'em_andamento' THEN
    RAISE EXCEPTION 'Só é possível concluir uma operação em andamento';
  END IF;
  UPDATE public.operador_pedidos SET
    status_operacao = p_status,
    iniciado_em = coalesce(iniciado_em, now()),
    concluido_em = CASE WHEN p_status = 'concluido' THEN now() ELSE concluido_em END
  WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_' || p_status, nullif(trim(coalesce(p_observacao, '')), ''), auth.uid());
END $function$;