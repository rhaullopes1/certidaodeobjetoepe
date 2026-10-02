INSERT INTO public.fila_mensal_contador (mes, ultimo)
SELECT 'global', COALESCE(max(fila_numero), 0) FROM public.pedidos
ON CONFLICT (mes) DO UPDATE SET ultimo = GREATEST(public.fila_mensal_contador.ultimo, EXCLUDED.ultimo);

COMMENT ON COLUMN public.pedidos.fila_mes IS 'Histórico: mês da numeração antiga (YYYY-MM). Novos números usam a chave global.';
COMMENT ON TABLE public.fila_mensal_contador IS 'Contador da fila. Somente a linha mes=global é usada para novas atribuições; linhas YYYY-MM são históricas.';

CREATE OR REPLACE FUNCTION public.atribuir_fila_mensal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_num integer;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.fila_numero IS NOT NULL THEN
    NEW.fila_mes := OLD.fila_mes; NEW.fila_numero := OLD.fila_numero; RETURN NEW;
  END IF;
  IF NEW.pago_em IS NULL OR NEW.status NOT IN ('pago','em_analise','protocolado','emitida','emitido') THEN
    NEW.fila_mes := NULL; NEW.fila_numero := NULL; RETURN NEW;
  END IF;
  INSERT INTO public.fila_mensal_contador (mes, ultimo) VALUES ('global', 1)
  ON CONFLICT (mes) DO UPDATE SET ultimo = public.fila_mensal_contador.ultimo + 1
  RETURNING ultimo INTO v_num;
  NEW.fila_mes := 'global'; NEW.fila_numero := v_num;
  RETURN NEW;
END $$;