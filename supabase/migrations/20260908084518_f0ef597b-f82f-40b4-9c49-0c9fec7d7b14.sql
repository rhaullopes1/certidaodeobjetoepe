ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS acesso_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS pedidos_acesso_token_idx ON public.pedidos (acesso_token);

ALTER TABLE public.webhook_eventos
  ADD COLUMN IF NOT EXISTS evento_id text;

CREATE UNIQUE INDEX IF NOT EXISTS webhook_eventos_provedor_evento_id_key
  ON public.webhook_eventos (provedor, evento_id)
  WHERE evento_id IS NOT NULL;