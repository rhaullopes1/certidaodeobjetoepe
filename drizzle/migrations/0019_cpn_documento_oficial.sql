ALTER TABLE public.cpn_operacoes
  ADD COLUMN IF NOT EXISTS documento_caminho text,
  ADD COLUMN IF NOT EXISTS documento_nome text,
  ADD COLUMN IF NOT EXISTS documento_sha256 text,
  ADD COLUMN IF NOT EXISTS documento_tamanho integer,
  ADD COLUMN IF NOT EXISTS documento_recebido_em timestamptz,
  ADD COLUMN IF NOT EXISTS documento_recebido_por uuid,
  ADD COLUMN IF NOT EXISTS documento_origem text,
  ADD COLUMN IF NOT EXISTS documento_texto_extraido boolean,
  ADD COLUMN IF NOT EXISTS documento_processo_extraido text,
  ADD COLUMN IF NOT EXISTS documento_processo_confere boolean,
  ADD COLUMN IF NOT EXISTS documento_numero_certidao text,
  ADD COLUMN IF NOT EXISTS documento_codigo_seguranca text,
  ADD COLUMN IF NOT EXISTS documento_autenticidade_status text NOT NULL DEFAULT 'nao_conferido',
  ADD COLUMN IF NOT EXISTS documento_autenticidade_conferida_em timestamptz,
  ADD COLUMN IF NOT EXISTS documento_autenticidade_conferida_por uuid;

CREATE POLICY "Equipe le documentos CPN" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cpn-documentos' AND private.is_staff(auth.uid()));
CREATE POLICY "Equipe envia documentos CPN" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cpn-documentos' AND private.is_staff(auth.uid()));