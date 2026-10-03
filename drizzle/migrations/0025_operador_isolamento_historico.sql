-- Leads: só admin/equipe (antes qualquer papel, inclusive operador, lia/alterava).
DROP POLICY IF EXISTS "Equipe pode ver os contatos" ON public.leads;
DROP POLICY IF EXISTS "Equipe pode atualizar os contatos" ON public.leads;
CREATE POLICY "Equipe pode ver os contatos" ON public.leads FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe pode atualizar os contatos" ON public.leads FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

-- Operador: fluxo Recebido -> Em andamento -> Concluído (aguardando validação). Só avança.
CREATE OR REPLACE FUNCTION public.operador_atualizar_etapa(p_atribuicao uuid, p_status text, p_observacao text DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
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
  UPDATE public.operador_pedidos SET
    status_operacao = p_status,
    iniciado_em = coalesce(iniciado_em, now()),
    concluido_em = CASE WHEN p_status = 'concluido' THEN now() ELSE concluido_em END
  WHERE id = o.id;
  INSERT INTO public.pedido_andamentos (pedido_id, status, observacao, autor_id)
  VALUES (o.pedido_id, 'operacao_' || p_status, nullif(trim(coalesce(p_observacao, '')), ''), auth.uid());
END $$;

-- Histórico exclusivo do operador: só as atribuições DELE validadas pela administração.
CREATE OR REPLACE FUNCTION public.operador_meu_historico()
 RETURNS TABLE(atribuicao_id uuid, protocolo text, numero_processo text, nome_parte text, tribunal_sigla text,
   atribuido_em timestamptz, concluido_em timestamptz, validado_em timestamptz)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select o.id, p.protocolo, p.numero_processo, p.nome_parte, p.tribunal_sigla,
    o.atribuido_em, o.concluido_em, o.validado_em
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.operador_id = auth.uid()
    and private.has_role(auth.uid(), 'operador_certidao'::public.app_role)
    and o.validado_em is not null
  order by o.validado_em desc
$$;
REVOKE ALL ON FUNCTION public.operador_meu_historico() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.operador_meu_historico() TO authenticated;