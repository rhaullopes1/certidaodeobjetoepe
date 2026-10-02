ALTER TABLE public.cpn_certificate_routes
  ADD COLUMN IF NOT EXISTS tipo_rota text NOT NULL DEFAULT 'VERIFICAR',
  ADD COLUMN IF NOT EXISTS perfil text NOT NULL DEFAULT 'qualquer',
  ADD COLUMN IF NOT EXISTS quem_pode text,
  ADD COLUMN IF NOT EXISTS passos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canais jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exige_procuracao boolean,
  ADD COLUMN IF NOT EXISTS exige_identificacao boolean,
  ADD COLUMN IF NOT EXISTS exige_finalidade boolean,
  ADD COLUMN IF NOT EXISTS forma_entrega text,
  ADD COLUMN IF NOT EXISTS fonte_trecho text;

ALTER TABLE public.cpn_certificate_routes ADD CONSTRAINT cpn_routes_tipo_rota_check CHECK (tipo_rota IN ('AUTO_API','AUTO_PORTAL','AUTO_EPROC','AUTO_PJE','ASSISTIDA_EPROC','ASSISTIDA_PJE','MANUAL_BALCAO_VIRTUAL','MANUAL_EMAIL','MANUAL_FORMULARIO','MANUAL_PRESENCIAL','VERIFICAR','INDISPONIVEL'));
ALTER TABLE public.cpn_certificate_routes ADD CONSTRAINT cpn_routes_perfil_check CHECK (perfil IN ('qualquer','parte_advogado_habilitado','terceiro_ou_advogado_nao_cadastrado','sigiloso'));

ALTER TABLE public.cpn_operacoes
  ADD COLUMN IF NOT EXISTS canal text,
  ADD COLUMN IF NOT EXISTS destinatario text;

ALTER TABLE public.cpn_operacoes DROP CONSTRAINT IF EXISTS cpn_operacoes_status_check;
ALTER TABLE public.cpn_operacoes ADD CONSTRAINT cpn_operacoes_status_check CHECK (status IN ('preparado','aguardando','solicitado','em_analise','recebido','entregue','sem_resposta','encerrado'));