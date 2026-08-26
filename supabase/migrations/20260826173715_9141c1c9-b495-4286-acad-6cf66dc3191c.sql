GRANT SELECT ON public.webhook_eventos TO authenticated;
DROP POLICY IF EXISTS "Equipe pode ver eventos de webhook" ON public.webhook_eventos;
CREATE POLICY "Equipe pode ver eventos de webhook" ON public.webhook_eventos FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));