CREATE TABLE public.keepalive_heartbeat (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  batido_em timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.keepalive_heartbeat TO service_role;

ALTER TABLE public.keepalive_heartbeat ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.keepalive_heartbeat IS 'Registro interno da ultima atividade do banco. Usado apenas para confirmar que a rotina de manutencao 24h esta rodando. Nao contem dados de clientes.';