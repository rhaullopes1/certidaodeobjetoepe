CREATE OR REPLACE FUNCTION public.operador_tempos_entrega()
 RETURNS TABLE(atribuicao_id uuid, finalidade text, status_operacao text, atribuido_em timestamptz, concluido_em timestamptz)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select o.id, p.finalidade, o.status_operacao, o.atribuido_em, o.concluido_em
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.operador_id = auth.uid()
    and private.has_role(auth.uid(), 'operador_certidao'::public.app_role)
    and o.status_operacao <> 'devolvido'
  order by o.atribuido_em desc
$$;
REVOKE ALL ON FUNCTION public.operador_tempos_entrega() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.operador_tempos_entrega() TO authenticated;