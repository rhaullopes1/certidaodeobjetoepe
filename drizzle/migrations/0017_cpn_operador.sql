-- CPN: catálogo de rotas de certidão, consultas, operações manuais e auditoria. Reutiliza cnj_tribunais.
CREATE TABLE public.cpn_certificate_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribunal_id uuid NOT NULL REFERENCES public.cnj_tribunais(id) ON DELETE CASCADE,
  sistema text,
  grau text,
  tipo_certidao text NOT NULL DEFAULT 'objeto_e_pe',
  modalidade text NOT NULL DEFAULT 'VERIFICAR' CHECK (modalidade IN ('AUTOMATICA','SEMIAUTOMATICA','MANUAL','INDISPONIVEL','VERIFICAR')),
  metodo text NOT NULL DEFAULT 'VERIFICAR',
  url_fonte text,
  url_certidao text,
  exige_login boolean,
  exige_advogado boolean,
  exige_peticao boolean,
  exige_pagamento boolean,
  custo text,
  prazo text,
  autenticidade_url text,
  requisitos text,
  observacoes text,
  excecoes text,
  texto_base_solicitacao text,
  fonte_evidencia text,
  automacao_cpn text NOT NULL DEFAULT 'nao_homologada' CHECK (automacao_cpn IN ('nao_homologada','homologada')),
  prioridade integer NOT NULL DEFAULT 100,
  ultima_verificacao date,
  verificado_por uuid,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cpn_routes_tribunal_idx ON public.cpn_certificate_routes(tribunal_id) WHERE ativo;
GRANT SELECT, INSERT, UPDATE ON public.cpn_certificate_routes TO authenticated;
GRANT ALL ON public.cpn_certificate_routes TO service_role;
ALTER TABLE public.cpn_certificate_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le rotas CPN" ON public.cpn_certificate_routes FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admin cadastra rotas CPN" ON public.cpn_certificate_routes FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin atualiza rotas CPN" ON public.cpn_certificate_routes FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER cpn_routes_set_updated_at BEFORE UPDATE ON public.cpn_certificate_routes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cpn_process_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_raw text NOT NULL,
  numero_normalizado text,
  cnj_valido boolean NOT NULL DEFAULT false,
  tribunal_sigla text,
  status text NOT NULL,
  modalidade text,
  route_id uuid REFERENCES public.cpn_certificate_routes(id) ON DELETE SET NULL,
  demo boolean NOT NULL DEFAULT false,
  fonte text,
  dados_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  operador_id uuid NOT NULL DEFAULT auth.uid(),
  consultado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cpn_queries_data_idx ON public.cpn_process_queries(consultado_em DESC);
GRANT SELECT, INSERT ON public.cpn_process_queries TO authenticated;
GRANT ALL ON public.cpn_process_queries TO service_role;
ALTER TABLE public.cpn_process_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le consultas CPN" ON public.cpn_process_queries FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe registra consultas CPN" ON public.cpn_process_queries FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()) AND operador_id = auth.uid());

CREATE TABLE public.cpn_operacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES public.cpn_process_queries(id) ON DELETE SET NULL,
  route_id uuid REFERENCES public.cpn_certificate_routes(id) ON DELETE SET NULL,
  numero_processo text NOT NULL,
  tribunal_sigla text,
  unidade text,
  tipo_certidao text NOT NULL DEFAULT 'objeto_e_pe',
  metodo text,
  url_oficial text,
  requisitos text,
  texto_solicitacao text,
  status text NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando','solicitado','em_analise','recebido','entregue','sem_resposta')),
  observacao text,
  documento_url text,
  demo boolean NOT NULL DEFAULT false,
  operador_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cpn_operacoes_status_idx ON public.cpn_operacoes(status, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.cpn_operacoes TO authenticated;
GRANT ALL ON public.cpn_operacoes TO service_role;
ALTER TABLE public.cpn_operacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le operacoes CPN" ON public.cpn_operacoes FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe cria operacoes CPN" ON public.cpn_operacoes FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()) AND operador_id = auth.uid());
CREATE POLICY "Equipe atualiza operacoes CPN" ON public.cpn_operacoes FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER cpn_operacoes_set_updated_at BEFORE UPDATE ON public.cpn_operacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cpn_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operador_id uuid NOT NULL DEFAULT auth.uid(),
  acao text NOT NULL,
  numero_processo text,
  route_id uuid,
  operacao_id uuid,
  resultado text,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cpn_audit_data_idx ON public.cpn_audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.cpn_audit_logs TO authenticated;
GRANT ALL ON public.cpn_audit_logs TO service_role;
ALTER TABLE public.cpn_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le auditoria CPN" ON public.cpn_audit_logs FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe registra auditoria CPN" ON public.cpn_audit_logs FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()) AND operador_id = auth.uid());