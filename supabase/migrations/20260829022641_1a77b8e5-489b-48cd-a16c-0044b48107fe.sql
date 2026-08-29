ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS checkout_url text;

CREATE INDEX IF NOT EXISTS pedidos_stripe_session_id_idx ON public.pedidos (stripe_session_id);