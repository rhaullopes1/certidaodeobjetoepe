ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS pedidos_user_id_idx ON public.pedidos(user_id);

GRANT SELECT ON public.pedidos TO authenticated;

CREATE POLICY "Cliente ve os proprios pedidos"
ON public.pedidos
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.vincular_pedidos_ao_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.pedidos
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(email) = lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_vincular_pedidos ON auth.users;
CREATE TRIGGER on_auth_user_created_vincular_pedidos
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.vincular_pedidos_ao_usuario();