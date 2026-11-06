CREATE OR REPLACE FUNCTION public.avisar_fila_operacao(p_operador uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_operador IS NULL THEN
    RETURN;
  END IF;
  PERFORM realtime.send(
    jsonb_build_object('motivo', 'fila', 'em', extract(epoch FROM now())::bigint),
    'fila',
    'operacao-' || p_operador::text,
    true
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.avisar_fila_operacao_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.avisar_fila_operacao(OLD.operador_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.operador_id IS DISTINCT FROM NEW.operador_id THEN
    PERFORM public.avisar_fila_operacao(OLD.operador_id);
    PERFORM public.avisar_fila_operacao(NEW.operador_id);
  ELSE
    PERFORM public.avisar_fila_operacao(NEW.operador_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS operacao_fila_aviso ON public.operador_pedidos;
CREATE TRIGGER operacao_fila_aviso
AFTER INSERT OR UPDATE OR DELETE ON public.operador_pedidos
FOR EACH ROW EXECUTE FUNCTION public.avisar_fila_operacao_trigger();

DROP POLICY IF EXISTS "operador_le_proprio_aviso" ON realtime.messages;
CREATE POLICY "operador_le_proprio_aviso" ON realtime.messages
FOR SELECT TO authenticated
USING (realtime.topic() = 'operacao-' || auth.uid()::text);