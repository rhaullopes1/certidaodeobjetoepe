CREATE OR REPLACE FUNCTION public.atribuir_fila_mensal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_mes text; v_num integer;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.fila_numero IS NOT NULL THEN
    NEW.fila_mes := OLD.fila_mes; NEW.fila_numero := OLD.fila_numero; RETURN NEW;
  END IF;
  IF NEW.pago_em IS NULL OR NEW.status NOT IN ('pago','em_analise','protocolado','emitida','emitido') THEN
    NEW.fila_mes := NULL; NEW.fila_numero := NULL; RETURN NEW;
  END IF;
  v_mes := to_char(NEW.pago_em AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM');
  INSERT INTO public.fila_mensal_contador (mes, ultimo) VALUES (v_mes, 1)
  ON CONFLICT (mes) DO UPDATE SET ultimo = public.fila_mensal_contador.ultimo + 1
  RETURNING ultimo INTO v_num;
  NEW.fila_mes := v_mes; NEW.fila_numero := v_num;
  RETURN NEW;
END $$;

ALTER TABLE public.pedidos DISABLE TRIGGER trg_atribuir_fila_mensal;
UPDATE public.pedidos SET fila_mes = NULL, fila_numero = NULL WHERE fila_numero IS NOT NULL;
WITH base AS (
  SELECT id, to_char(pago_em AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') AS mes,
         row_number() OVER (PARTITION BY to_char(pago_em AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') ORDER BY pago_em, created_at, id) AS n
  FROM public.pedidos WHERE pago_em IS NOT NULL AND status IN ('pago','em_analise','protocolado','emitida','emitido')
)
UPDATE public.pedidos p SET fila_mes = b.mes, fila_numero = b.n FROM base b WHERE p.id = b.id;
ALTER TABLE public.pedidos ENABLE TRIGGER trg_atribuir_fila_mensal;
UPDATE public.fila_mensal_contador c SET ultimo = COALESCE((SELECT max(fila_numero) FROM public.pedidos WHERE fila_mes = c.mes), 0) WHERE c.mes IS NOT NULL;