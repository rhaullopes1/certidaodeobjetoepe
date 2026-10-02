ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS fila_mes text, ADD COLUMN IF NOT EXISTS fila_numero integer;

CREATE TABLE IF NOT EXISTS public.fila_mensal_contador (
  mes text PRIMARY KEY,
  ultimo integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.fila_mensal_contador TO service_role;
ALTER TABLE public.fila_mensal_contador ENABLE ROW LEVEL SECURITY;

-- Backfill: mês de referência = mês do pagamento (horário de Brasília), ordem pago_em, created_at, id
WITH base AS (
  SELECT id, to_char(pago_em AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') AS mes,
         row_number() OVER (PARTITION BY to_char(pago_em AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') ORDER BY pago_em, created_at, id) AS n
  FROM public.pedidos WHERE pago_em IS NOT NULL AND fila_numero IS NULL
)
UPDATE public.pedidos p SET fila_mes = b.mes, fila_numero = b.n FROM base b WHERE p.id = b.id;

INSERT INTO public.fila_mensal_contador (mes, ultimo)
SELECT fila_mes, max(fila_numero) FROM public.pedidos WHERE fila_mes IS NOT NULL GROUP BY fila_mes
ON CONFLICT (mes) DO UPDATE SET ultimo = GREATEST(public.fila_mensal_contador.ultimo, EXCLUDED.ultimo);

CREATE UNIQUE INDEX IF NOT EXISTS pedidos_fila_mes_numero_uniq ON public.pedidos (fila_mes, fila_numero) WHERE fila_numero IS NOT NULL;

CREATE OR REPLACE FUNCTION public.atribuir_fila_mensal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_mes text; v_num integer;
BEGIN
  IF NEW.pago_em IS NULL OR NEW.fila_numero IS NOT NULL THEN
    IF TG_OP = 'UPDATE' THEN NEW.fila_mes := OLD.fila_mes; NEW.fila_numero := COALESCE(OLD.fila_numero, NEW.fila_numero); END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.fila_numero IS NOT NULL THEN
    NEW.fila_mes := OLD.fila_mes; NEW.fila_numero := OLD.fila_numero; RETURN NEW;
  END IF;
  v_mes := to_char(NEW.pago_em AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM');
  INSERT INTO public.fila_mensal_contador (mes, ultimo) VALUES (v_mes, 1)
  ON CONFLICT (mes) DO UPDATE SET ultimo = public.fila_mensal_contador.ultimo + 1
  RETURNING ultimo INTO v_num;
  NEW.fila_mes := v_mes; NEW.fila_numero := v_num;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.atribuir_fila_mensal() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_atribuir_fila_mensal ON public.pedidos;
CREATE TRIGGER trg_atribuir_fila_mensal BEFORE INSERT OR UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.atribuir_fila_mensal();