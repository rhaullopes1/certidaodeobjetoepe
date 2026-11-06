REVOKE ALL ON public.keepalive_heartbeat FROM anon, authenticated;

COMMENT ON TABLE public.keepalive_heartbeat IS 'Registro interno da ultima atividade do banco. Tabela somente interna: sem acesso anon/authenticated e sem politicas RLS. Nao contem dados de clientes.';