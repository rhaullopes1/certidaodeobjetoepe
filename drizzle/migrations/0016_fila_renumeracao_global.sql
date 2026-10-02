ALTER TABLE public.pedidos DISABLE TRIGGER trg_atribuir_fila_mensal;
UPDATE public.pedidos SET fila_numero = -fila_numero WHERE fila_numero IS NOT NULL;
WITH base AS (
  SELECT id, row_number() OVER (ORDER BY pago_em, created_at, id) AS n
  FROM public.pedidos WHERE fila_numero IS NOT NULL
)
UPDATE public.pedidos p SET fila_numero = b.n FROM base b WHERE p.id = b.id;
ALTER TABLE public.pedidos ENABLE TRIGGER trg_atribuir_fila_mensal;
UPDATE public.fila_mensal_contador SET ultimo = COALESCE((SELECT max(fila_numero) FROM public.pedidos), 0) WHERE mes = 'global';
CREATE UNIQUE INDEX IF NOT EXISTS pedidos_fila_numero_global_uniq ON public.pedidos (fila_numero) WHERE fila_numero IS NOT NULL;