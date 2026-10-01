-- Tipo de certidão do pedido: objeto e pé (padrão) ou antecedentes criminais PF.
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'objeto_pe';
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS ant_nome_mae text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS ant_nome_pai text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS ant_uf_nascimento text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS ant_nascimento date;

CREATE INDEX IF NOT EXISTS pedidos_tipo_idx ON public.pedidos (tipo);

-- Uma linha por pedido de antecedentes: controla idempotência da emissão e dos envios.
CREATE TABLE IF NOT EXISTS public.emissoes_antecedentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL UNIQUE REFERENCES public.pedidos(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pendente',
  tentativas integer NOT NULL DEFAULT 0,
  certidao_codigo text,
  certidao_numero text,
  emissao_datahora text,
  validade_data text,
  mensagem text,
  site_receipt text,
  negativa boolean,
  erro text,
  payload jsonb,
  emitida_em timestamp with time zone,
  email_enviado_em timestamp with time zone,
  whatsapp_enviado_em timestamp with time zone,
  proxima_tentativa_em timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.emissoes_antecedentes TO authenticated;
GRANT ALL ON public.emissoes_antecedentes TO service_role;

ALTER TABLE public.emissoes_antecedentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le emissoes de antecedentes"
  ON public.emissoes_antecedentes
  FOR SELECT
  TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE TRIGGER emissoes_antecedentes_set_updated_at
  BEFORE UPDATE ON public.emissoes_antecedentes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS emissoes_antecedentes_status_idx
  ON public.emissoes_antecedentes (status, proxima_tentativa_em);