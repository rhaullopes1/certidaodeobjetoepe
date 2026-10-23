-- Script unico: rode no SQL Editor do seu Supabase novo (projeto vazio).

-- ===== supabase/migrations/20260731050204_f0ed4fb8-d01b-4ffb-a715-20676087b1b2.sql =====
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL UNIQUE,
  numero_processo TEXT NOT NULL,
  uf TEXT NOT NULL,
  cidade TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  observacoes TEXT,
  valor_centavos INTEGER NOT NULL DEFAULT 28800,
  status TEXT NOT NULL DEFAULT 'aguardando_pagamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER pedidos_set_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX pedidos_created_at_idx ON public.pedidos (created_at DESC);
-- ===== supabase/migrations/20260802003235_d7b75013-c497-4073-a5c4-b67566dac040.sql =====
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS pagbank_order_id text,
  ADD COLUMN IF NOT EXISTS pix_codigo text,
  ADD COLUMN IF NOT EXISTS pix_qrcode_url text,
  ADD COLUMN IF NOT EXISTS pix_expira_em timestamp with time zone,
  ADD COLUMN IF NOT EXISTS pago_em timestamp with time zone;

CREATE INDEX IF NOT EXISTS pedidos_pagbank_order_id_idx ON public.pedidos (pagbank_order_id);
-- ===== supabase/migrations/20260803211349_f1004d3f-ae03-4233-96f4-37c72b80c58d.sql =====
CREATE TYPE public.app_role AS ENUM ('admin', 'equipe');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'equipe')
  )
$$;

CREATE POLICY "Usuario ve os proprios papeis"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia papeis"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pedido_andamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  status text NOT NULL,
  observacao text,
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pedido_andamentos_pedido_id_idx ON public.pedido_andamentos (pedido_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_andamentos TO authenticated;
GRANT ALL ON public.pedido_andamentos TO service_role;
ALTER TABLE public.pedido_andamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le andamentos"
  ON public.pedido_andamentos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe registra andamentos"
  ON public.pedido_andamentos FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admin remove andamentos"
  ON public.pedido_andamentos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pedido_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'comprovante',
  nome_arquivo text NOT NULL,
  caminho text NOT NULL,
  tamanho_bytes integer,
  content_type text,
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pedido_anexos_pedido_id_idx ON public.pedido_anexos (pedido_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_anexos TO authenticated;
GRANT ALL ON public.pedido_anexos TO service_role;
ALTER TABLE public.pedido_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe le anexos"
  ON public.pedido_anexos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe anexa arquivos"
  ON public.pedido_anexos FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Equipe remove anexos"
  ON public.pedido_anexos FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe consulta pedidos"
  ON public.pedidos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Equipe atualiza pedidos"
  ON public.pedidos FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

GRANT SELECT, UPDATE ON public.pedidos TO authenticated;
-- ===== supabase/migrations/20260803211439_9bd63fa3-e374-40a0-ae5f-bdbd022ed541.sql =====
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
-- ===== supabase/migrations/20260803211500_4578e925-f81f-42f7-bb69-47de7687d910.sql =====
CREATE POLICY "Equipe le anexos storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pedido-anexos' AND public.is_staff(auth.uid()));

CREATE POLICY "Equipe envia anexos storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pedido-anexos' AND public.is_staff(auth.uid()));

CREATE POLICY "Equipe remove anexos storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pedido-anexos' AND public.is_staff(auth.uid()));
-- ===== supabase/migrations/20260804004957_da3e4d31-47aa-4ed5-b036-9411a3ab3f56.sql =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  email text,
  avatar_url text,
  provider text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve o proprio perfil" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuario atualiza o proprio perfil" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Usuario cria o proprio perfil" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = COALESCE(EXCLUDED.nome, public.profiles.nome),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    provider = COALESCE(EXCLUDED.provider, public.profiles.provider),
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, nome, email, avatar_url, provider)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  COALESCE(u.raw_app_meta_data->>'provider', 'email')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
-- ===== supabase/migrations/20260804005016_019f1c14-77a4-47b8-9a06-82cf78828669.sql =====
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- ===== supabase/migrations/20260815042739_3079deb9-150b-428f-9515-5a4fa9567655.sql =====
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS nome_parte text,
  ADD COLUMN IF NOT EXISTS quantidade integer NOT NULL DEFAULT 1;

ALTER TABLE public.pedidos ALTER COLUMN uf DROP NOT NULL;
ALTER TABLE public.pedidos ALTER COLUMN cidade DROP NOT NULL;
-- ===== supabase/migrations/20260825220643_9d7b1c91-52fc-489b-8bdf-83c94872800d.sql =====
create or replace function public.grant_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_first_admin on auth.users;
create trigger on_auth_user_created_grant_first_admin
after insert on auth.users
for each row execute function public.grant_first_admin();
-- ===== supabase/migrations/20260825220653_8b8bf12c-ab78-4cf1-87d0-1491d453fe21.sql =====
revoke all on function public.grant_first_admin() from public, anon, authenticated;
-- ===== supabase/migrations/20260826002749_9a1b4dff-8208-4fef-96c9-2fb478128468.sql =====
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function private.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin'::public.app_role,'equipe'::public.app_role))
$$;

revoke all on function private.has_role(uuid, public.app_role) from public, anon;
revoke all on function private.is_staff(uuid) from public, anon;
grant execute on function private.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function private.is_staff(uuid) to authenticated, service_role;

drop policy "Usuario ve os proprios papeis" on public.user_roles;
create policy "Usuario ve os proprios papeis" on public.user_roles for select to authenticated
  using ((user_id = auth.uid()) or private.has_role(auth.uid(), 'admin'));

drop policy "Admin gerencia papeis" on public.user_roles;
create policy "Admin gerencia papeis" on public.user_roles for all to authenticated
  using (private.has_role(auth.uid(), 'admin')) with check (private.has_role(auth.uid(), 'admin'));

drop policy "Equipe le andamentos" on public.pedido_andamentos;
create policy "Equipe le andamentos" on public.pedido_andamentos for select to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe registra andamentos" on public.pedido_andamentos;
create policy "Equipe registra andamentos" on public.pedido_andamentos for insert to authenticated
  with check (private.is_staff(auth.uid()));

drop policy "Admin remove andamentos" on public.pedido_andamentos;
create policy "Admin remove andamentos" on public.pedido_andamentos for delete to authenticated
  using (private.has_role(auth.uid(), 'admin'));

drop policy "Equipe le anexos" on public.pedido_anexos;
create policy "Equipe le anexos" on public.pedido_anexos for select to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe anexa arquivos" on public.pedido_anexos;
create policy "Equipe anexa arquivos" on public.pedido_anexos for insert to authenticated
  with check (private.is_staff(auth.uid()));

drop policy "Equipe remove anexos" on public.pedido_anexos;
create policy "Equipe remove anexos" on public.pedido_anexos for delete to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe consulta pedidos" on public.pedidos;
create policy "Equipe consulta pedidos" on public.pedidos for select to authenticated
  using (private.is_staff(auth.uid()));

drop policy "Equipe atualiza pedidos" on public.pedidos;
create policy "Equipe atualiza pedidos" on public.pedidos for update to authenticated
  using (private.is_staff(auth.uid())) with check (private.is_staff(auth.uid()));

drop policy "Usuario ve o proprio perfil" on public.profiles;
create policy "Usuario ve o proprio perfil" on public.profiles for select to authenticated
  using ((id = auth.uid()) or private.has_role(auth.uid(), 'admin'));

drop policy "Equipe le anexos storage" on storage.objects;
create policy "Equipe le anexos storage" on storage.objects for select to authenticated
  using (bucket_id = 'pedido-anexos' and private.is_staff(auth.uid()));

drop policy "Equipe envia anexos storage" on storage.objects;
create policy "Equipe envia anexos storage" on storage.objects for insert to authenticated
  with check (bucket_id = 'pedido-anexos' and private.is_staff(auth.uid()));

drop policy "Equipe remove anexos storage" on storage.objects;
create policy "Equipe remove anexos storage" on storage.objects for delete to authenticated
  using (bucket_id = 'pedido-anexos' and private.is_staff(auth.uid()));

drop function if exists public.has_role(uuid, public.app_role);
drop function if exists public.is_staff(uuid);
-- ===== supabase/migrations/20260826120312_5b414124-ea97-43af-88a7-8d171f9fa063.sql =====
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS certidoes jsonb NOT NULL DEFAULT '[]'::jsonb;
-- ===== supabase/migrations/20260826173647_ace66eb7-faf9-4e4b-9bf6-207950a4b88e.sql =====
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS lembrete_enviado_em timestamptz;

CREATE TABLE IF NOT EXISTS public.webhook_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provedor text NOT NULL,
  tipo text,
  payment_id text,
  resultado text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.webhook_eventos TO service_role;
ALTER TABLE public.webhook_eventos ENABLE ROW LEVEL SECURITY;
-- ===== supabase/migrations/20260826173715_9141c1c9-b495-4286-acad-6cf66dc3191c.sql =====
GRANT SELECT ON public.webhook_eventos TO authenticated;
DROP POLICY IF EXISTS "Equipe pode ver eventos de webhook" ON public.webhook_eventos;
CREATE POLICY "Equipe pode ver eventos de webhook" ON public.webhook_eventos FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
-- ===== supabase/migrations/20260826174049_22005aab-1651-4a31-978b-06d91b0d9d34.sql =====
DROP POLICY IF EXISTS "Equipe atualiza anexos" ON storage.objects;
CREATE POLICY "Equipe atualiza anexos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pedido-anexos' AND private.is_staff(auth.uid()));
-- ===== supabase/migrations/20260828003743_dfd279ae-1b8f-48b3-87e8-95e8f9212973.sql =====
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS pedidos_user_id_idx ON public.pedidos(user_id);

GRANT SELECT ON public.pedidos TO authenticated;

CREATE POLICY "Cliente ve os proprios pedidos"
ON public.pedidos
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.vincular_pedidos_ao_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.pedidos
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND lower(email) = lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_vincular_pedidos ON auth.users;
CREATE TRIGGER on_auth_user_created_vincular_pedidos
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.vincular_pedidos_ao_usuario();
-- ===== supabase/migrations/20260828003754_3e170fa6-8448-4a88-8a11-933d57bd4026.sql =====
REVOKE EXECUTE ON FUNCTION public.vincular_pedidos_ao_usuario() FROM PUBLIC, anon, authenticated;
-- ===== supabase/migrations/20260828044225_497fe957-5a6f-42b8-83cd-a57c2370223a.sql =====
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
-- ===== supabase/migrations/20260828044643_261763d2-a712-4747-bf08-3152fe791f80.sql =====
CREATE TABLE public.cron_tokens (
  nome text PRIMARY KEY,
  token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.cron_tokens TO service_role;
ALTER TABLE public.cron_tokens ENABLE ROW LEVEL SECURITY;

INSERT INTO public.cron_tokens (nome, token)
VALUES ('recuperacao', encode(gen_random_bytes(32), 'hex'));
-- ===== supabase/migrations/20260828044719_014c6462-9fe5-4239-a867-3188fc373b85.sql =====
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'recuperacao-pedidos',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://certidaodeobjetoepe.org/api/public/cron/recuperacao',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT token FROM public.cron_tokens WHERE nome = 'recuperacao')
    ),
    body := '{}'::jsonb
  );
  $$
);
-- ===== supabase/migrations/20260828051414_35d11971-3f9d-44cb-9746-0a0cbfe07cd2.sql =====
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
-- ===== supabase/migrations/20260829022641_1a77b8e5-489b-48cd-a16c-0044b48107fe.sql =====
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS checkout_url text;

CREATE INDEX IF NOT EXISTS pedidos_stripe_session_id_idx ON public.pedidos (stripe_session_id);
-- ===== supabase/migrations/20260901173027_cdeb9c4b-ea5c-447b-8573-4cbd4cafce99.sql =====
CREATE TABLE public.cnj_segmentos (
  codigo smallint PRIMARY KEY,
  nome text NOT NULL,
  descricao text
);
GRANT SELECT ON public.cnj_segmentos TO anon, authenticated;
GRANT ALL ON public.cnj_segmentos TO service_role;
ALTER TABLE public.cnj_segmentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Segmentos CNJ sao publicos" ON public.cnj_segmentos FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.cnj_segmentos (codigo, nome, descricao) VALUES
  (1,'Supremo Tribunal Federal','Processos originários e recursais do STF'),
  (2,'Conselho Nacional de Justiça','Procedimentos administrativos do CNJ'),
  (3,'Superior Tribunal de Justiça','Processos do STJ'),
  (4,'Justiça Federal','Tribunais Regionais Federais e seções judiciárias'),
  (5,'Justiça do Trabalho','TST e Tribunais Regionais do Trabalho'),
  (6,'Justiça Eleitoral','TSE e Tribunais Regionais Eleitorais'),
  (7,'Justiça Militar da União','Superior Tribunal Militar e auditorias militares'),
  (8,'Justiça Estadual','Tribunais de Justiça dos estados e do Distrito Federal'),
  (9,'Justiça Militar Estadual','Tribunais de Justiça Militar estaduais');

CREATE TABLE public.cnj_tribunais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segmento smallint NOT NULL REFERENCES public.cnj_segmentos(codigo),
  codigo_tr text NOT NULL,
  sigla text NOT NULL,
  nome text NOT NULL,
  uf text,
  sede text,
  sistema text,
  tipo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (segmento, codigo_tr)
);
GRANT SELECT ON public.cnj_tribunais TO anon, authenticated;
GRANT ALL ON public.cnj_tribunais TO service_role;
ALTER TABLE public.cnj_tribunais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tribunais CNJ sao publicos" ON public.cnj_tribunais FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER cnj_tribunais_set_updated_at BEFORE UPDATE ON public.cnj_tribunais FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cnj_tribunais (segmento, codigo_tr, sigla, nome, uf, sede, sistema, tipo) VALUES
(1,'00','STF','Supremo Tribunal Federal',NULL,'Brasília','STF Digital','superior'),
  (2,'00','CNJ','Conselho Nacional de Justiça',NULL,'Brasília','PJe','superior'),
  (3,'00','STJ','Superior Tribunal de Justiça',NULL,'Brasília','e-STJ','superior'),
  (4,'01','TRF1','Tribunal Regional Federal da 1ª Região',NULL,'Brasília','PJe','federal'),
  (4,'02','TRF2','Tribunal Regional Federal da 2ª Região',NULL,'Rio de Janeiro','PJe','federal'),
  (4,'03','TRF3','Tribunal Regional Federal da 3ª Região',NULL,'São Paulo','PJe','federal'),
  (4,'04','TRF4','Tribunal Regional Federal da 4ª Região',NULL,'Porto Alegre','PJe','federal'),
  (4,'05','TRF5','Tribunal Regional Federal da 5ª Região',NULL,'Recife','PJe','federal'),
  (4,'06','TRF6','Tribunal Regional Federal da 6ª Região',NULL,'Belo Horizonte','PJe','federal'),
  (5,'00','TST','Tribunal Superior do Trabalho',NULL,'Brasília','PJe','superior'),
  (5,'01','TRT1','Tribunal Regional do Trabalho da 1ª Região','RJ','Rio de Janeiro','PJe','trabalhista'),
  (5,'02','TRT2','Tribunal Regional do Trabalho da 2ª Região','SP','São Paulo','PJe','trabalhista'),
  (5,'03','TRT3','Tribunal Regional do Trabalho da 3ª Região','MG','Belo Horizonte','PJe','trabalhista'),
  (5,'04','TRT4','Tribunal Regional do Trabalho da 4ª Região','RS','Porto Alegre','PJe','trabalhista'),
  (5,'05','TRT5','Tribunal Regional do Trabalho da 5ª Região','BA','Salvador','PJe','trabalhista'),
  (5,'06','TRT6','Tribunal Regional do Trabalho da 6ª Região','PE','Recife','PJe','trabalhista'),
  (5,'07','TRT7','Tribunal Regional do Trabalho da 7ª Região','CE','Fortaleza','PJe','trabalhista'),
  (5,'08','TRT8','Tribunal Regional do Trabalho da 8ª Região','PA','Belém','PJe','trabalhista'),
  (5,'09','TRT9','Tribunal Regional do Trabalho da 9ª Região','PR','Curitiba','PJe','trabalhista'),
  (5,'10','TRT10','Tribunal Regional do Trabalho da 10ª Região','DF','Brasília','PJe','trabalhista'),
  (5,'11','TRT11','Tribunal Regional do Trabalho da 11ª Região','AM','Manaus','PJe','trabalhista'),
  (5,'12','TRT12','Tribunal Regional do Trabalho da 12ª Região','SC','Florianópolis','PJe','trabalhista'),
  (5,'13','TRT13','Tribunal Regional do Trabalho da 13ª Região','PB','João Pessoa','PJe','trabalhista'),
  (5,'14','TRT14','Tribunal Regional do Trabalho da 14ª Região','RO','Porto Velho','PJe','trabalhista'),
  (5,'15','TRT15','Tribunal Regional do Trabalho da 15ª Região','SP','Campinas','PJe','trabalhista'),
  (5,'16','TRT16','Tribunal Regional do Trabalho da 16ª Região','MA','São Luís','PJe','trabalhista'),
  (5,'17','TRT17','Tribunal Regional do Trabalho da 17ª Região','ES','Vitória','PJe','trabalhista'),
  (5,'18','TRT18','Tribunal Regional do Trabalho da 18ª Região','GO','Goiânia','PJe','trabalhista'),
  (5,'19','TRT19','Tribunal Regional do Trabalho da 19ª Região','AL','Maceió','PJe','trabalhista'),
  (5,'20','TRT20','Tribunal Regional do Trabalho da 20ª Região','SE','Aracaju','PJe','trabalhista'),
  (5,'21','TRT21','Tribunal Regional do Trabalho da 21ª Região','RN','Natal','PJe','trabalhista'),
  (5,'22','TRT22','Tribunal Regional do Trabalho da 22ª Região','PI','Teresina','PJe','trabalhista'),
  (5,'23','TRT23','Tribunal Regional do Trabalho da 23ª Região','MT','Cuiabá','PJe','trabalhista'),
  (5,'24','TRT24','Tribunal Regional do Trabalho da 24ª Região','MS','Campo Grande','PJe','trabalhista'),
  (6,'00','TSE','Tribunal Superior Eleitoral',NULL,'Brasília','PJe','superior'),
  (6,'01','TRE-AC','Tribunal Regional Eleitoral do Acre','AC','Rio Branco','PJe','eleitoral'),
  (6,'02','TRE-AL','Tribunal Regional Eleitoral de Alagoas','AL','Maceió','PJe','eleitoral'),
  (6,'03','TRE-AP','Tribunal Regional Eleitoral do Amapá','AP','Macapá','PJe','eleitoral'),
  (6,'04','TRE-AM','Tribunal Regional Eleitoral do Amazonas','AM','Manaus','PJe','eleitoral'),
  (6,'05','TRE-BA','Tribunal Regional Eleitoral da Bahia','BA','Salvador','PJe','eleitoral'),
  (6,'06','TRE-CE','Tribunal Regional Eleitoral do Ceará','CE','Fortaleza','PJe','eleitoral'),
  (6,'07','TRE-DF','Tribunal Regional Eleitoral do Distrito Federal e dos Territórios','DF','Brasília','PJe','eleitoral'),
  (6,'08','TRE-ES','Tribunal Regional Eleitoral do Espírito Santo','ES','Vitória','PJe','eleitoral'),
  (6,'09','TRE-GO','Tribunal Regional Eleitoral de Goiás','GO','Goiânia','PJe','eleitoral'),
  (6,'10','TRE-MA','Tribunal Regional Eleitoral do Maranhão','MA','São Luís','PJe','eleitoral'),
  (6,'11','TRE-MT','Tribunal Regional Eleitoral de Mato Grosso','MT','Cuiabá','PJe','eleitoral'),
  (6,'12','TRE-MS','Tribunal Regional Eleitoral de Mato Grosso do Sul','MS','Campo Grande','PJe','eleitoral'),
  (6,'13','TRE-MG','Tribunal Regional Eleitoral de Minas Gerais','MG','Belo Horizonte','PJe','eleitoral'),
  (6,'14','TRE-PA','Tribunal Regional Eleitoral do Pará','PA','Belém','PJe','eleitoral'),
  (6,'15','TRE-PB','Tribunal Regional Eleitoral da Paraíba','PB','João Pessoa','PJe','eleitoral'),
  (6,'16','TRE-PR','Tribunal Regional Eleitoral do Paraná','PR','Curitiba','PJe','eleitoral'),
  (6,'17','TRE-PE','Tribunal Regional Eleitoral de Pernambuco','PE','Recife','PJe','eleitoral'),
  (6,'18','TRE-PI','Tribunal Regional Eleitoral do Piauí','PI','Teresina','PJe','eleitoral'),
  (6,'19','TRE-RJ','Tribunal Regional Eleitoral do Rio de Janeiro','RJ','Rio de Janeiro','PJe','eleitoral'),
  (6,'20','TRE-RN','Tribunal Regional Eleitoral do Rio Grande do Norte','RN','Natal','PJe','eleitoral'),
  (6,'21','TRE-RS','Tribunal Regional Eleitoral do Rio Grande do Sul','RS','Porto Alegre','PJe','eleitoral'),
  (6,'22','TRE-RO','Tribunal Regional Eleitoral de Rondônia','RO','Porto Velho','PJe','eleitoral'),
  (6,'23','TRE-RR','Tribunal Regional Eleitoral de Roraima','RR','Boa Vista','PJe','eleitoral'),
  (6,'24','TRE-SC','Tribunal Regional Eleitoral de Santa Catarina','SC','Florianópolis','PJe','eleitoral'),
  (6,'25','TRE-SE','Tribunal Regional Eleitoral de Sergipe','SE','Aracaju','PJe','eleitoral'),
  (6,'26','TRE-SP','Tribunal Regional Eleitoral de São Paulo','SP','São Paulo','PJe','eleitoral'),
  (6,'27','TRE-TO','Tribunal Regional Eleitoral do Tocantins','TO','Palmas','PJe','eleitoral'),
  (7,'00','STM','Superior Tribunal Militar',NULL,'Brasília','e-Proc/STM','superior'),
  (8,'01','TJAC','Tribunal de Justiça do Acre','AC','Rio Branco','e-SAJ','estadual'),
  (8,'02','TJAL','Tribunal de Justiça de Alagoas','AL','Maceió','PJe','estadual'),
  (8,'03','TJAP','Tribunal de Justiça do Amapá','AP','Macapá','PJe','estadual'),
  (8,'04','TJAM','Tribunal de Justiça do Amazonas','AM','Manaus','PJe','estadual'),
  (8,'05','TJBA','Tribunal de Justiça da Bahia','BA','Salvador','PJe','estadual'),
  (8,'06','TJCE','Tribunal de Justiça do Ceará','CE','Fortaleza','PJe','estadual'),
  (8,'07','TJDF','Tribunal de Justiça do Distrito Federal e dos Territórios','DF','Brasília','PJe','estadual'),
  (8,'08','TJES','Tribunal de Justiça do Espírito Santo','ES','Vitória','PJe','estadual'),
  (8,'09','TJGO','Tribunal de Justiça de Goiás','GO','Goiânia','PROJUDI','estadual'),
  (8,'10','TJMA','Tribunal de Justiça do Maranhão','MA','São Luís','PJe','estadual'),
  (8,'11','TJMT','Tribunal de Justiça de Mato Grosso','MT','Cuiabá','PJe','estadual'),
  (8,'12','TJMS','Tribunal de Justiça de Mato Grosso do Sul','MS','Campo Grande','PJe','estadual'),
  (8,'13','TJMG','Tribunal de Justiça de Minas Gerais','MG','Belo Horizonte','PJe','estadual'),
  (8,'14','TJPA','Tribunal de Justiça do Pará','PA','Belém','PJe','estadual'),
  (8,'15','TJPB','Tribunal de Justiça da Paraíba','PB','João Pessoa','PJe','estadual'),
  (8,'16','TJPR','Tribunal de Justiça do Paraná','PR','Curitiba','PROJUDI e PJe','estadual'),
  (8,'17','TJPE','Tribunal de Justiça de Pernambuco','PE','Recife','PJe','estadual'),
  (8,'18','TJPI','Tribunal de Justiça do Piauí','PI','Teresina','PJe','estadual'),
  (8,'19','TJRJ','Tribunal de Justiça do Rio de Janeiro','RJ','Rio de Janeiro','PJe e Portal de Serviços','estadual'),
  (8,'20','TJRN','Tribunal de Justiça do Rio Grande do Norte','RN','Natal','PJe','estadual'),
  (8,'21','TJRS','Tribunal de Justiça do Rio Grande do Sul','RS','Porto Alegre','eproc','estadual'),
  (8,'22','TJRO','Tribunal de Justiça de Rondônia','RO','Porto Velho','PJe','estadual'),
  (8,'23','TJRR','Tribunal de Justiça de Roraima','RR','Boa Vista','PROJUDI','estadual'),
  (8,'24','TJSC','Tribunal de Justiça de Santa Catarina','SC','Florianópolis','eproc','estadual'),
  (8,'25','TJSE','Tribunal de Justiça de Sergipe','SE','Aracaju','PJe','estadual'),
  (8,'26','TJSP','Tribunal de Justiça de São Paulo','SP','São Paulo','e-SAJ','estadual'),
  (8,'27','TJTO','Tribunal de Justiça do Tocantins','TO','Palmas','e-Proc','estadual'),
  (9,'13','TJMMG','Tribunal de Justiça Militar de Minas Gerais','MG','Belo Horizonte','e-Proc','militar_estadual'),
  (9,'21','TJMRS','Tribunal de Justiça Militar do Rio Grande do Sul','RS','Porto Alegre','e-Proc','militar_estadual'),
  (9,'26','TJMSP','Tribunal de Justiça Militar de São Paulo','SP','São Paulo','e-Proc','militar_estadual')
;

CREATE TABLE public.cnj_comarcas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribunal_id uuid NOT NULL REFERENCES public.cnj_tribunais(id) ON DELETE CASCADE,
  codigo_origem text NOT NULL,
  nome text NOT NULL,
  cidade text,
  uf text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tribunal_id, codigo_origem)
);
CREATE INDEX cnj_comarcas_codigo_idx ON public.cnj_comarcas (codigo_origem);
GRANT SELECT ON public.cnj_comarcas TO anon, authenticated;
GRANT ALL ON public.cnj_comarcas TO service_role;
ALTER TABLE public.cnj_comarcas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comarcas CNJ sao publicas" ON public.cnj_comarcas FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER cnj_comarcas_set_updated_at BEFORE UPDATE ON public.cnj_comarcas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cnj_comarcas (tribunal_id, codigo_origem, nome, cidade, uf)
SELECT t.id, '0100', 'Foro Central Cível da Comarca de São Paulo', 'São Paulo', 'SP'
FROM public.cnj_tribunais t WHERE t.segmento = 8 AND t.codigo_tr = '26';
-- ===== supabase/migrations/20260907150452_81b2309c-a851-42f4-a35c-dc7c585faaf6.sql =====
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  numero_processo TEXT,
  uf TEXT,
  observacoes TEXT,
  origem TEXT NOT NULL DEFAULT 'home',
  atendido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer visitante pode registrar um contato" ON public.leads;
CREATE POLICY "Qualquer visitante pode registrar um contato"
  ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Equipe pode ver os contatos" ON public.leads;
CREATE POLICY "Equipe pode ver os contatos"
  ON public.leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

DROP POLICY IF EXISTS "Equipe pode atualizar os contatos" ON public.leads;
CREATE POLICY "Equipe pode atualizar os contatos"
  ON public.leads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

DROP TRIGGER IF EXISTS leads_set_updated_at ON public.leads;
CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- ===== supabase/migrations/20260908084518_f0ef597b-f82f-40b4-9c49-0c9fec7d7b14.sql =====
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS acesso_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS pedidos_acesso_token_idx ON public.pedidos (acesso_token);

ALTER TABLE public.webhook_eventos
  ADD COLUMN IF NOT EXISTS evento_id text;

CREATE UNIQUE INDEX IF NOT EXISTS webhook_eventos_provedor_evento_id_key
  ON public.webhook_eventos (provedor, evento_id)
  WHERE evento_id IS NOT NULL;