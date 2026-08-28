CREATE TABLE public.abandoned_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL UNIQUE REFERENCES public.pedidos(id) ON DELETE CASCADE,
  protocolo text NOT NULL,
  cliente_nome text,
  cliente_email text NOT NULL,
  valor_total_centavos integer NOT NULL DEFAULT 0,
  link_pagamento text,
  codigo_pix text,
  data_criacao timestamptz NOT NULL DEFAULT now(),
  status_automacao text NOT NULL DEFAULT 'pendente',
  etapa_1_em timestamptz,
  etapa_2_em timestamptz,
  etapa_3_em timestamptz,
  recuperado_em timestamptz,
  valor_recuperado_centavos integer NOT NULL DEFAULT 0,
  ultimo_erro text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX abandoned_orders_status_idx ON public.abandoned_orders (status_automacao, data_criacao);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.abandoned_orders TO authenticated;
GRANT ALL ON public.abandoned_orders TO service_role;
ALTER TABLE public.abandoned_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le recuperacao" ON public.abandoned_orders
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe atualiza recuperacao" ON public.abandoned_orders
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

CREATE TRIGGER abandoned_orders_set_updated_at
  BEFORE UPDATE ON public.abandoned_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.email_sequencia_config (
  etapa smallint PRIMARY KEY,
  assunto text NOT NULL,
  corpo text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.email_sequencia_config TO authenticated;
GRANT ALL ON public.email_sequencia_config TO service_role;
ALTER TABLE public.email_sequencia_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le config emails" ON public.email_sequencia_config
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Equipe edita config emails" ON public.email_sequencia_config
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

CREATE TRIGGER email_sequencia_config_set_updated_at
  BEFORE UPDATE ON public.email_sequencia_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.email_sequencia_config (etapa, assunto, corpo) VALUES
(1, 'Seu pedido {{numero_pedido}} está quase pronto', 'Olá {{nome_cliente}},

Recebemos sua solicitação de Certidão de Objeto e Pé (pedido {{numero_pedido}}), mas o pagamento ainda não foi identificado.

Conclua o pagamento pelo link: {{link_pagamento}}

Pix copia e cola:
{{codigo_pix}}

Assim que o pagamento for confirmado, iniciamos a solicitação junto ao tribunal.'),
(2, 'Ainda dá tempo de concluir o pedido {{numero_pedido}}', 'Olá {{nome_cliente}},

Seu pedido {{numero_pedido}} continua aguardando pagamento. Guardamos todos os dados que você preencheu, então basta finalizar para começarmos.

Link de pagamento: {{link_pagamento}}

Pix copia e cola:
{{codigo_pix}}

Qualquer dúvida, é só responder este e-mail.'),
(3, 'Último aviso: pedido {{numero_pedido}} expira em breve', 'Olá {{nome_cliente}},

Este é o último lembrete sobre o pedido {{numero_pedido}}. Pedidos sem pagamento são cancelados automaticamente após 7 dias.

Finalize agora: {{link_pagamento}}

Pix copia e cola:
{{codigo_pix}}

Se preferir outra forma de pagamento ou precisar de ajuda, responda este e-mail.');

CREATE TABLE public.job_locks (
  nome text PRIMARY KEY,
  expira_em timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.job_locks TO service_role;
ALTER TABLE public.job_locks ENABLE ROW LEVEL SECURITY;