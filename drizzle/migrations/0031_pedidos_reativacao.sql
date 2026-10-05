ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS reativado_em timestamptz;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS reativacao_contato_em timestamptz;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS reativacao_email_em timestamptz;
COMMENT ON COLUMN public.pedidos.reativado_em IS 'Quando o cliente reabriu um pedido cancelado/expirado pelo link; o prazo de expiração conta a partir daqui.';
COMMENT ON COLUMN public.pedidos.reativacao_contato_em IS 'Último contato manual (WhatsApp) da campanha de reativação.';
COMMENT ON COLUMN public.pedidos.reativacao_email_em IS 'Último e-mail automático da campanha de reativação (dias 5 e 10).';