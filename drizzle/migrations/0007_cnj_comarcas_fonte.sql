ALTER TABLE public.cnj_comarcas
  ADD COLUMN IF NOT EXISTS fonte_url text,
  ADD COLUMN IF NOT EXISTS fonte_atualizada_em date;
CREATE UNIQUE INDEX IF NOT EXISTS cnj_comarcas_tribunal_origem_uidx ON public.cnj_comarcas (tribunal_id, codigo_origem);