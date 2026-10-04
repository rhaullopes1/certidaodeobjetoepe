DROP FUNCTION IF EXISTS public.operador_minha_fila();
CREATE FUNCTION public.operador_minha_fila()
 RETURNS TABLE(atribuicao_id uuid, pedido_id uuid, status_operacao text, atribuido_em timestamp with time zone, iniciado_em timestamp with time zone, concluido_em timestamp with time zone, protocolo text, numero_processo text, nome_parte text, quantidade integer, tribunal_sigla text, uf_processo text, cidade_processo text, comarca_processo text, foro text, vara text, finalidade text, pendencia_motivo text, pendencia_em timestamp with time zone, pdfs integer, fila_numero integer, pago_em timestamp with time zone)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select o.id, p.id, o.status_operacao, o.atribuido_em, o.iniciado_em, o.concluido_em, p.protocolo,
    p.numero_processo, p.nome_parte, p.quantidade, p.tribunal_sigla, coalesce(p.uf_processo, p.uf),
    coalesce(p.cidade_processo, p.cidade), p.comarca_processo, p.foro, p.vara, p.finalidade,
    o.pendencia_motivo, o.pendencia_em, private.operador_pdfs_count(auth.uid(), p.id, o.atribuido_em),
    p.fila_numero, p.pago_em
  from public.operador_pedidos o join public.pedidos p on p.id = o.pedido_id
  where o.operador_id = auth.uid()
    and private.has_role(auth.uid(), 'operador_certidao'::public.app_role)
    and o.status_operacao <> 'devolvido' and o.validado_em is null
  order by p.fila_numero desc nulls last, o.atribuido_em desc
$function$;
REVOKE ALL ON FUNCTION public.operador_minha_fila() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.operador_minha_fila() TO authenticated;