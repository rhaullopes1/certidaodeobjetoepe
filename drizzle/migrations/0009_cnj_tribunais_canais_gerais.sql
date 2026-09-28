ALTER TABLE public.cnj_tribunais
  ADD COLUMN IF NOT EXISTS balcao_virtual_url text,
  ADD COLUMN IF NOT EXISTS balcao_virtual_fonte text,
  ADD COLUMN IF NOT EXISTS balcao_virtual_verificada_em date,
  ADD COLUMN IF NOT EXISTS certidoes_url text,
  ADD COLUMN IF NOT EXISTS certidoes_tipo text,
  ADD COLUMN IF NOT EXISTS certidoes_fonte text,
  ADD COLUMN IF NOT EXISTS certidoes_verificada_em date;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cnj_tribunais_certidoes_tipo_chk') THEN
    ALTER TABLE public.cnj_tribunais ADD CONSTRAINT cnj_tribunais_certidoes_tipo_chk
      CHECK (certidoes_tipo IS NULL OR certidoes_tipo IN ('geral','especifica_objeto_pe'));
  END IF;
END $$;