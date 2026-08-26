ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS lembrete_enviado_em timestamptz;

CREATE TABLE IF NOT EXISTS public.webhook_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provedor text NOT NULL,
  tipo text,
  payment_id text,
  resultado text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.webhook_eventos TO service_role;
ALTER TABLE public.webhook_eventos ENABLE ROW LEVEL SECURITY;