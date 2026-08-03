CREATE TYPE public.app_role AS ENUM ('admin', 'equipe');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'equipe')
  )
$$;

CREATE POLICY "Usuario ve os proprios papeis"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia papeis"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pedido_andamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  status text NOT NULL,
  observacao text,
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pedido_andamentos_pedido_id_idx ON public.pedido_andamentos (pedido_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_andamentos TO authenticated;
GRANT ALL ON public.pedido_andamentos TO service_role;
ALTER TABLE public.pedido_andamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le andamentos"
  ON public.pedido_andamentos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe registra andamentos"
  ON public.pedido_andamentos FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admin remove andamentos"
  ON public.pedido_andamentos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pedido_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'comprovante',
  nome_arquivo text NOT NULL,
  caminho text NOT NULL,
  tamanho_bytes integer,
  content_type text,
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pedido_anexos_pedido_id_idx ON public.pedido_anexos (pedido_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_anexos TO authenticated;
GRANT ALL ON public.pedido_anexos TO service_role;
ALTER TABLE public.pedido_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le anexos"
  ON public.pedido_anexos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe anexa arquivos"
  ON public.pedido_anexos FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Equipe remove anexos"
  ON public.pedido_anexos FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe consulta pedidos"
  ON public.pedidos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe atualiza pedidos"
  ON public.pedidos FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

GRANT SELECT, UPDATE ON public.pedidos TO authenticated;