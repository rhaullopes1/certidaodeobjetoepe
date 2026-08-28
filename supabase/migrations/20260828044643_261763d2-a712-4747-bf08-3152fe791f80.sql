CREATE TABLE public.cron_tokens (
  nome text PRIMARY KEY,
  token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.cron_tokens TO service_role;
ALTER TABLE public.cron_tokens ENABLE ROW LEVEL SECURITY;

INSERT INTO public.cron_tokens (nome, token)
VALUES ('recuperacao', encode(gen_random_bytes(32), 'hex'));