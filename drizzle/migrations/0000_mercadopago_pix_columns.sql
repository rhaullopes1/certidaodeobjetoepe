ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_status TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_external_reference TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_pix_expira_em TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS pedidos_mercadopago_payment_id_key
  ON public.pedidos (mercadopago_payment_id)
  WHERE mercadopago_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS pedidos_mercadopago_external_reference_idx
  ON public.pedidos (mercadopago_external_reference)
  WHERE mercadopago_external_reference IS NOT NULL;