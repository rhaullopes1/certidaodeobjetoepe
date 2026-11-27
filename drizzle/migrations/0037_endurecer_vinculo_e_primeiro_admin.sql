CREATE OR REPLACE FUNCTION public.grant_first_admin()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  -- DEPRECATED: papel de administrador nunca é concedido automaticamente no cadastro.
  RETURN NEW;
END;
$function$;
COMMENT ON FUNCTION public.grant_first_admin() IS 'DEPRECATED: no-op; admins são concedidos manualmente';

CREATE OR REPLACE FUNCTION public.vincular_pedidos_ao_usuario()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NOT NULL AND coalesce(NEW.raw_app_meta_data->>'provider','email') <> 'email' THEN
    UPDATE public.pedidos SET user_id = NEW.id
     WHERE user_id IS NULL AND lower(email) = lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$function$;