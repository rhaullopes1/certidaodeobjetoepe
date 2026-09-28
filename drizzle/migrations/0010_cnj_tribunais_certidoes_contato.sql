ALTER TABLE public.cnj_tribunais
  ADD COLUMN IF NOT EXISTS certidoes_email text,
  ADD COLUMN IF NOT EXISTS certidoes_telefone text,
  ADD COLUMN IF NOT EXISTS certidoes_instrucoes text,
  ADD COLUMN IF NOT EXISTS certidoes_fonte_normativa_url text;
ALTER TABLE public.cnj_tribunais DROP CONSTRAINT IF EXISTS cnj_tribunais_certidoes_tipo_chk;
ALTER TABLE public.cnj_tribunais ADD CONSTRAINT cnj_tribunais_certidoes_tipo_chk
  CHECK (certidoes_tipo IS NULL OR certidoes_tipo IN ('geral','especifica_objeto_pe','objeto_pe_via_unidade'));