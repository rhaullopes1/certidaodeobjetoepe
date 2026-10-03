-- Contagem de PDFs da certidão enviados pelo operador na atribuição atual
CREATE OR REPLACE FUNCTION private.operador_pdfs_count(p_operador uuid, p_pedido uuid, p_desde timestamptz)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select count(*)::int from public.pedido_anexos
  where pedido_id = p_pedido and autor_id = p_operador and tipo = 'certidao'
    and created_at >= p_desde
$$;

-- Validação server-side de anexos enviados por operador (não-equipe)
CREATE OR REPLACE FUNCTION public.validar_anexo_operador()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.operador_pedidos;
BEGIN
  IF private.is_staff(auth.uid()) OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO o FROM public.operador_pedidos
   WHERE pedido_id = NEW.pedido_id AND operador_id = auth.uid()
     AND validado_em IS NULL AND status_operacao <> 'devolvido'
   ORDER BY atribuido_em DESC LIMIT 1 FOR UPDATE;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Atribuição não encontrada'; END IF;
  IF o.status_operacao = 'concluido' THEN RAISE EXCEPTION 'Operação concluída: anexos bloqueados'; END IF;
  IF NEW.tipo <> 'certidao' OR coalesce(NEW.content_type,'') <> 'application/pdf'
     OR lower(NEW.nome_arquivo) NOT LIKE '%.pdf' OR lower(NEW.caminho) NOT LIKE '%.pdf' THEN
    RAISE EXCEPTION 'Apenas arquivos PDF da certidão são aceitos';
  END IF;
  IF private.operador_pdfs_count(auth.uid(), NEW.pedido_id, o.atribuido_em) >= 3 THEN
    RAISE EXCEPTION 'Limite de 3 PDFs por operação atingido';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS pedido_anexos_validar_operador ON public.pedido_anexos;
CREATE TRIGGER pedido_anexos_validar_operador BEFORE INSERT ON public.pedido_anexos
FOR EACH ROW EXECUTE FUNCTION public.validar_anexo_operador();

-- Operador remove apenas seus próprios PDFs, antes da conclusão
CREATE POLICY "Operador remove proprios anexos antes de concluir" ON public.pedido_anexos
FOR DELETE TO authenticated USING (
  autor_id = auth.uid() AND private.operador_tem_pedido(auth.uid(), pedido_id)
  AND EXISTS (SELECT 1 FROM public.operador_pedidos o WHERE o.pedido_id = pedido_anexos.pedido_id
    AND o.operador_id = auth.uid() AND o.status_operacao IN ('atribuido','em_andamento','aguardando_tribunal','documento_recebido')
    AND o.validado_em IS NULL)
);

-- Storage: operador só envia PDF; remove apenas objetos próprios
DROP POLICY IF EXISTS "Operador envia arquivos atribuidos" ON storage.objects;
CREATE POLICY "Operador envia arquivos atribuidos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pedido-anexos' AND lower(name) LIKE '%.pdf'
  AND private.operador_tem_protocolo(auth.uid(), (storage.foldername(name))[1]));
CREATE POLICY "Operador remove proprios arquivos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pedido-anexos' AND owner_id = auth.uid()::text
  AND private.operador_tem_protocolo(auth.uid(), (storage.foldername(name))[1]));

-- Conclusão exige ao menos 1 PDF
CREATE OR REPLACE FUNCTION public.operador_atualizar_etapa(p_atribuicao uuid, p_status text, p_observacao text DEFAULT NULL::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE o public.operador_pedidos;
BEGIN
  IF p_status NOT IN ('em_andamento','concluido') THEN RAISE EXCEPTION 'Etapa inválida'; END IF;
  SELECT * INTO o FROM public.operador_pedidos WHERE id = p_atribuicao FOR UPDATE;
  IF o.id IS NULL OR o.operador_id <> auth.uid() OR NOT private.operador_tem_pedido(auth.uid(), o.pedido_id) THEN
    RAISE EXCEPTION 'Atribuição não encontrada';
  END IF;
  IF o.status_operacao = 'concluido' THEN RAISE EXCEPTION 'Atribuição concluída aguarda validação administrativa'; END IF;
  IF p_status = 'em_andamento' AND o.status_operacao <> 'atribuido' THEN RAISE EXCEPTION 'A operação já está em andamento'; END IF;
  IF p_status = 'concluido' AND o.status_operacao <> 'em_andamento' THEN RAISE EXCEPTION 'Só é possível concluir uma operação em andamento'; END IF;
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