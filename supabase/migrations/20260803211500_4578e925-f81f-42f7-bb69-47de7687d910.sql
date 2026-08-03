CREATE POLICY "Equipe le anexos storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pedido-anexos' AND public.is_staff(auth.uid()));

CREATE POLICY "Equipe envia anexos storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pedido-anexos' AND public.is_staff(auth.uid()));

CREATE POLICY "Equipe remove anexos storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pedido-anexos' AND public.is_staff(auth.uid()));