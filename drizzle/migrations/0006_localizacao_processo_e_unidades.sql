ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS tribunal_sigla text,
  ADD COLUMN IF NOT EXISTS tribunal_nome text,
  ADD COLUMN IF NOT EXISTS segmento_judiciario text,
  ADD COLUMN IF NOT EXISTS uf_processo text,
  ADD COLUMN IF NOT EXISTS cidade_processo text,
  ADD COLUMN IF NOT EXISTS comarca_processo text,
  ADD COLUMN IF NOT EXISTS foro text,
  ADD COLUMN IF NOT EXISTS codigo_origem_cnj text,
  ADD COLUMN IF NOT EXISTS vara text,
  ADD COLUMN IF NOT EXISTS unidade_judiciaria text,
  ADD COLUMN IF NOT EXISTS sistema_processual text,
  ADD COLUMN IF NOT EXISTS processo_enriquecido boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS processo_enriquecido_em timestamptz,
  ADD COLUMN IF NOT EXISTS processo_fonte text,
  ADD COLUMN IF NOT EXISTS processo_confianca text,
  ADD COLUMN IF NOT EXISTS processo_dados jsonb;

CREATE INDEX IF NOT EXISTS pedidos_tribunal_origem_idx ON public.pedidos (tribunal_sigla, codigo_origem_cnj);

ALTER TABLE public.cnj_comarcas ADD COLUMN IF NOT EXISTS foro text;
ALTER TABLE public.cnj_tribunais ADD COLUMN IF NOT EXISTS consulta_processual_url text;
COMMENT ON COLUMN public.cnj_tribunais.consulta_processual_url IS 'URL oficial de consulta processual, cadastrada manualmente. Pode conter {numero} e {digitos}.';

ALTER TABLE public.comarcas_contatos
  ADD COLUMN IF NOT EXISTS foro text,
  ADD COLUMN IF NOT EXISTS codigo_origem_cnj text,
  ADD COLUMN IF NOT EXISTS unidade_judiciaria text,
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS responsavel_nome text,
  ADD COLUMN IF NOT EXISTS responsavel_setor text,
  ADD COLUMN IF NOT EXISTS canal_solicitacao_tipo text,
  ADD COLUMN IF NOT EXISTS canal_solicitacao_url text,
  ADD COLUMN IF NOT EXISTS canal_solicitacao_email text,
  ADD COLUMN IF NOT EXISTS canal_solicitacao_telefone text,
  ADD COLUMN IF NOT EXISTS instrucoes_solicitacao text,
  ADD COLUMN IF NOT EXISTS documentos_exigidos text,
  ADD COLUMN IF NOT EXISTS taxa_info text,
  ADD COLUMN IF NOT EXISTS prazo_info text,
  ADD COLUMN IF NOT EXISTS fonte_url text,
  ADD COLUMN IF NOT EXISTS fonte_tipo text,
  ADD COLUMN IF NOT EXISTS fonte_atualizada_em date,
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS comarcas_contatos_tribunal_origem_idx ON public.comarcas_contatos (tribunal, codigo_origem_cnj);
CREATE INDEX IF NOT EXISTS comarcas_contatos_comarca_idx ON public.comarcas_contatos (lower(comarca));
CREATE INDEX IF NOT EXISTS comarcas_contatos_unidade_idx ON public.comarcas_contatos (lower(unidade_judiciaria));