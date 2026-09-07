CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  numero_processo TEXT,
  uf TEXT,
  observacoes TEXT,
  origem TEXT NOT NULL DEFAULT 'home',
  atendido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer visitante pode registrar um contato" ON public.leads;
CREATE POLICY "Qualquer visitante pode registrar um contato"
  ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Equipe pode ver os contatos" ON public.leads;
CREATE POLICY "Equipe pode ver os contatos"
  ON public.leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

DROP POLICY IF EXISTS "Equipe pode atualizar os contatos" ON public.leads;
CREATE POLICY "Equipe pode atualizar os contatos"
  ON public.leads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

DROP TRIGGER IF EXISTS leads_set_updated_at ON public.leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();