-- Observação interna do andamento (nunca exposta ao cliente)
ALTER TABLE public.pedido_andamentos
  ADD COLUMN IF NOT EXISTS observacao_interna text,
  ADD COLUMN IF NOT EXISTS comarca_contato_id uuid;

-- Base cumulativa de contatos das comarcas
CREATE TABLE IF NOT EXISTS public.comarcas_contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uf text,
  tribunal text,
  comarca text NOT NULL,
  vara_cartorio text,
  telefone text,
  whatsapp text,
  email text,
  balcao_virtual_url text,
  observacoes text,
  autor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comarcas_contatos_busca_idx
  ON public.comarcas_contatos (uf, comarca);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comarcas_contatos TO authenticated;
GRANT ALL ON public.comarcas_contatos TO service_role;

ALTER TABLE public.comarcas_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le contatos de comarcas"
  ON public.comarcas_contatos FOR SELECT
  TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE POLICY "Equipe cadastra contatos de comarcas"
  ON public.comarcas_contatos FOR INSERT
  TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));

CREATE POLICY "Equipe atualiza contatos de comarcas"
  ON public.comarcas_contatos FOR UPDATE
  TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

CREATE POLICY "Admin remove contatos de comarcas"
  ON public.comarcas_contatos FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER comarcas_contatos_set_updated_at
  BEFORE UPDATE ON public.comarcas_contatos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.comarcas_contatos
  ADD CONSTRAINT comarcas_contatos_pedido_fk
  FOREIGN KEY (id) REFERENCES public.comarcas_contatos(id) ON DELETE CASCADE;
