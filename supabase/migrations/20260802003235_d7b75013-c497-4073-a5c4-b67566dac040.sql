ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS pagbank_order_id text,
  ADD COLUMN IF NOT EXISTS pix_codigo text,
  ADD COLUMN IF NOT EXISTS pix_qrcode_url text,
  ADD COLUMN IF NOT EXISTS pix_expira_em timestamp with time zone,
  ADD COLUMN IF NOT EXISTS pago_em timestamp with time zone;

CREATE INDEX IF NOT EXISTS pedidos_pagbank_order_id_idx ON public.pedidos (pagbank_order_id);