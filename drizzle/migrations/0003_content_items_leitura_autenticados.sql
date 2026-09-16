CREATE POLICY "autenticados leem publicados" ON public.content_items
FOR SELECT TO authenticated
USING (status = 'published');