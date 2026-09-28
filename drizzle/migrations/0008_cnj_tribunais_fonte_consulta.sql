ALTER TABLE public.cnj_tribunais ADD COLUMN IF NOT EXISTS consulta_processual_fonte text;
ALTER TABLE public.cnj_tribunais ADD COLUMN IF NOT EXISTS consulta_processual_verificada_em date;