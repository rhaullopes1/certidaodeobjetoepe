ALTER TABLE public.cpn_certificate_routes
  ADD COLUMN IF NOT EXISTS status_verificacao text NOT NULL DEFAULT 'pendente' CHECK (status_verificacao IN ('pendente','verificada','revisar')),
  ADD COLUMN IF NOT EXISTS observacao_verificacao text,
  ADD COLUMN IF NOT EXISTS responsavel_id uuid;
CREATE INDEX IF NOT EXISTS cpn_queries_filtros_idx ON public.cpn_process_queries(tribunal_sigla, status, demo);