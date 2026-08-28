ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status_conta text NOT NULL DEFAULT 'ativa',
  ADD COLUMN IF NOT EXISTS ultimo_email_enviado timestamptz,
  ADD COLUMN IF NOT EXISTS boas_vindas_em timestamptz;

CREATE TABLE public.email_config (
  chave text PRIMARY KEY,
  assunto text NOT NULL,
  corpo text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.email_config TO authenticated;
GRANT ALL ON public.email_config TO service_role;
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le config email" ON public.email_config FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe edita config email" ON public.email_config FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER email_config_set_updated_at BEFORE UPDATE ON public.email_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.email_config (chave, assunto, corpo) VALUES (
  'boas-vindas',
  'Bem-vindo(a) à Certidão de Objeto e Pé, {{nome_cliente}}',
  'Olá {{nome_cliente}},

Sua conta foi criada com sucesso na Certidão de Objeto e Pé.

Somos especializados na solicitação de Certidão de Objeto e Pé em todos os tribunais do Brasil, com acompanhamento do pedido do início à entrega.

Acesse sua conta para solicitar certidões e acompanhar seus pedidos:
https://certidaodeobjetoepe.org/minha-conta

Seu e-mail de acesso: {{email_cliente}}

Qualquer dúvida, é só responder este e-mail ou ligar para 0800 000 4604.

Equipe Certidão de Objeto e Pé'
);

CREATE TABLE public.weekly_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  assunto text NOT NULL,
  conteudo_html text NOT NULL,
  agendamento_data timestamptz,
  status text NOT NULL DEFAULT 'rascunho',
  total_destinatarios integer NOT NULL DEFAULT 0,
  total_enviados integer NOT NULL DEFAULT 0,
  total_falhas integer NOT NULL DEFAULT 0,
  enviado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_campaigns TO authenticated;
GRANT ALL ON public.weekly_campaigns TO service_role;
ALTER TABLE public.weekly_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe gerencia campanhas" ON public.weekly_campaigns FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER weekly_campaigns_set_updated_at BEFORE UPDATE ON public.weekly_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX weekly_campaigns_status_idx ON public.weekly_campaigns (status, agendamento_data);

CREATE TABLE public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.weekly_campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  status text NOT NULL DEFAULT 'pendente',
  erro text,
  enviado_em timestamptz,
  aberto_em timestamptz,
  clicado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);
GRANT SELECT ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le destinatarios" ON public.campaign_recipients FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE INDEX campaign_recipients_campanha_idx ON public.campaign_recipients (campaign_id, status);

CREATE TABLE public.email_optouts (
  email text PRIMARY KEY,
  motivo text NOT NULL DEFAULT 'unsubscribe',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_optouts TO authenticated;
GRANT ALL ON public.email_optouts TO service_role;
ALTER TABLE public.email_optouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le descadastros" ON public.email_optouts FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

INSERT INTO public.cron_tokens (nome, token)
VALUES ('semanal', encode(gen_random_bytes(24), 'hex'))
ON CONFLICT (nome) DO NOTHING;

SELECT cron.schedule(
  'campanha-semanal',
  '0 12 * * 2',
  $$
  SELECT net.http_post(
    url := 'https://certidaodeobjetoepe.org/api/public/cron/semanal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT token FROM public.cron_tokens WHERE nome = 'semanal')
    ),
    body := '{}'::jsonb
  );
  $$
);