-- Central de Conteúdo COP (não altera nada de pedidos/pagamentos)

create or replace function private.is_equipe(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;
revoke all on function private.is_equipe(uuid) from public, anon;
grant execute on function private.is_equipe(uuid) to authenticated, service_role;

create table public.content_topics (
  id uuid primary key default gen_random_uuid(),
  nicho text not null check (nicho in ('caminhoneiros','motoristas_app')),
  titulo text not null,
  angulo text not null default '',
  palavra_chave text not null default '',
  prioridade int not null default 100,
  ativo boolean not null default true,
  ultimo_uso_em timestamptz,
  created_at timestamptz not null default now()
);
create unique index content_topics_titulo_uidx on public.content_topics (lower(titulo));

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.content_topics(id) on delete set null,
  nicho text not null,
  status text not null default 'draft' check (status in ('draft','approved','scheduled','publishing','published','failed')),
  slug text not null unique,
  titulo text not null,
  meta_description text not null default '',
  resumo text not null default '',
  blocos jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  canais jsonb not null default '{}'::jsonb,
  modelo text,
  agendado_para timestamptz,
  publicado_em timestamptz,
  criado_por uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_items_status_idx on public.content_items (status, agendado_para);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  canal text not null unique,
  nome text not null default '',
  conectado boolean not null default false,
  secret_esperado text not null default '',
  config jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

create table public.publication_jobs (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  canal text not null,
  status text not null default 'scheduled' check (status in ('scheduled','publishing','published','failed','skipped')),
  agendado_para timestamptz not null default now(),
  tentativas int not null default 0,
  ultimo_erro text,
  url_publicada text,
  idempotency_key text not null unique,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index publication_jobs_fila_idx on public.publication_jobs (status, agendado_para);

create table public.publication_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.publication_jobs(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete cascade,
  canal text,
  nivel text not null default 'info',
  mensagem text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index publication_logs_created_idx on public.publication_logs (created_at desc);

create table public.content_metrics (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  canal text not null,
  impressoes int not null default 0,
  cliques int not null default 0,
  coletado_em timestamptz not null default now()
);

create table public.content_config (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

grant select, insert, update, delete on public.content_topics to authenticated;
grant select, insert, update, delete on public.content_items to authenticated;
grant select, insert, update, delete on public.publication_jobs to authenticated;
grant select, insert, update, delete on public.social_accounts to authenticated;
grant select, insert, update, delete on public.publication_logs to authenticated;
grant select, insert, update, delete on public.content_metrics to authenticated;
grant select, insert, update, delete on public.content_config to authenticated;
grant select on public.content_items to anon;
grant all on public.content_topics, public.content_items, public.publication_jobs,
  public.social_accounts, public.publication_logs, public.content_metrics, public.content_config
  to service_role;

alter table public.content_topics enable row level security;
alter table public.content_items enable row level security;
alter table public.publication_jobs enable row level security;
alter table public.social_accounts enable row level security;
alter table public.publication_logs enable row level security;
alter table public.content_metrics enable row level security;
alter table public.content_config enable row level security;

create policy "equipe gerencia temas" on public.content_topics for all to authenticated
  using (private.is_equipe(auth.uid())) with check (private.is_equipe(auth.uid()));
create policy "equipe gerencia conteudos" on public.content_items for all to authenticated
  using (private.is_equipe(auth.uid())) with check (private.is_equipe(auth.uid()));
create policy "publico le publicados" on public.content_items for select to anon
  using (status = 'published');
create policy "equipe gerencia fila" on public.publication_jobs for all to authenticated
  using (private.is_equipe(auth.uid())) with check (private.is_equipe(auth.uid()));
create policy "equipe gerencia contas" on public.social_accounts for all to authenticated
  using (private.is_equipe(auth.uid())) with check (private.is_equipe(auth.uid()));
create policy "equipe le logs" on public.publication_logs for select to authenticated
  using (private.is_equipe(auth.uid()));
create policy "equipe le metricas" on public.content_metrics for select to authenticated
  using (private.is_equipe(auth.uid()));
create policy "equipe gerencia config" on public.content_config for all to authenticated
  using (private.is_equipe(auth.uid())) with check (private.is_equipe(auth.uid()));

insert into public.content_config (chave, valor) values
  ('agenda', '{"horarioCaminhoneiros":"08:00","horarioMotoristas":"18:00","timezone":"America/Sao_Paulo","ativo":true,"modoTeste":true}'::jsonb);

insert into public.social_accounts (canal, nome, secret_esperado) values
  ('blog','Blog do site (certidaodeobjetoepe.org)', ''),
  ('google_business','Google Business Profile','GOOGLE_BUSINESS_ACCESS_TOKEN'),
  ('youtube','YouTube Shorts','YOUTUBE_ACCESS_TOKEN'),
  ('tiktok','TikTok','TIKTOK_ACCESS_TOKEN'),
  ('instagram','Instagram / Reels','INSTAGRAM_ACCESS_TOKEN'),
  ('facebook','Facebook','FACEBOOK_ACCESS_TOKEN');
update public.social_accounts set conectado = true where canal = 'blog';

insert into public.content_topics (nicho, titulo, angulo, palavra_chave, prioridade)
select 'caminhoneiros', t.titulo, t.angulo, t.kw, t.ord
from (values
 ('Certidão de Objeto e Pé para caminhoneiro: o que é e quando pode ser pedida','Explicar o documento em linguagem simples para motorista profissional','certidão de objeto e pé caminhoneiro',1),
 ('Apareceu um processo no meu nome: o que o caminhoneiro deve fazer primeiro','Passo a passo de diagnóstico do apontamento','processo no nome caminhoneiro',2),
 ('Como descobrir o número do processo pelo CPF','Caminhos oficiais de consulta','consulta processo por cpf',3),
 ('Diferença entre nada consta, antecedentes criminais e objeto e pé','Comparativo prático','diferença certidões judiciais',4),
 ('Processo arquivado ainda aparece em consulta? Como comprovar a situação atual','Uso da certidão para comprovar arquivamento','processo arquivado certidão',5),
 ('Análise de perfil em transporte de carga: quais documentos costumam ser pedidos','Panorama geral sem afirmar exigência de empresa específica','documentos análise cadastral transporte',6),
 ('Prazo de validade das certidões judiciais na prática','Validade e reemissão','validade certidão judicial',7),
 ('Certidão de Objeto e Pé em processo criminal: o que consta no documento','Conteúdo típico da certidão criminal','certidão objeto e pé criminal',8),
 ('Certidão de Objeto e Pé em processo trabalhista do motorista','Justiça do Trabalho','certidão objeto e pé trabalhista',9),
 ('Processo em outro estado: como pedir a certidão sem viajar','Pedido remoto','certidão processo outro estado',10),
 ('Homônimo: quando o processo não é seu','Como comprovar que não é a mesma pessoa','homônimo processo judicial',11),
 ('Certidão positiva não é condenação: como explicar isso a um analista','Interpretação correta do documento','certidão positiva significado',12),
 ('Multa, execução fiscal e CNH: entendendo os tipos de processo','Tipos de processo comuns','execução fiscal motorista',13),
 ('Como organizar uma pasta de documentos do motorista profissional','Checklist','documentos motorista profissional',14),
 ('Quanto tempo leva para sair a Certidão de Objeto e Pé','Prazos por tribunal','prazo certidão objeto e pé',15),
 ('O que fazer quando o tribunal é físico e o processo é antigo','Processos em papel','processo antigo em papel certidão',16),
 ('Certidão de Objeto e Pé no TJSP para motoristas','Tribunal de maior volume','certidão objeto e pé tjsp',17),
 ('Certidão de Objeto e Pé na Justiça Federal','TRFs','certidão objeto e pé justiça federal',18),
 ('Cadastro reprovado por apontamento judicial: como reunir a documentação','Roteiro de regularização','apontamento judicial cadastro',19),
 ('Autônomo x agregado x frotista: diferenças na hora de comprovar situação judicial','Perfis de contratação','caminhoneiro agregado documentos',20),
 ('Como validar a autenticidade de uma certidão judicial','Selo e código de validação','validar certidão judicial',21),
 ('Certidão em nome de terceiro: é possível pedir?','Regras de acesso','certidão em nome de terceiro',22),
 ('Processo sigiloso: o que a certidão mostra','Segredo de justiça','processo sigiloso certidão',23),
 ('Quantas certidões pedir quando há mais de um processo','Organização do pedido','várias certidões processos',24),
 ('Erros comuns ao pedir certidão e como evitar retrabalho','Checklist de dados','erros pedido certidão',25),
 ('Como acompanhar o andamento do seu pedido de certidão','Transparência do serviço','acompanhar pedido certidão',26),
 ('Documento digital tem o mesmo valor do impresso?','Assinatura eletrônica','certidão digital validade',27),
 ('Renovação de cadastro: quando vale reemitir as certidões','Rotina periódica','renovar certidão cadastro',28),
 ('Seguro de carga e comprovação documental: entendendo o processo de análise','Visão geral cuidadosa','seguro de carga documentos',29),
 ('Perguntas frequentes de caminhoneiros sobre certidões judiciais','FAQ consolidado','dúvidas certidão caminhoneiro',30)
) as t(titulo, angulo, kw, ord);

insert into public.content_topics (nicho, titulo, angulo, palavra_chave, prioridade)
select 'motoristas_app', t.titulo, t.angulo, t.kw, t.ord
from (values
 ('Certidão de Objeto e Pé para motorista de aplicativo: guia rápido','Introdução ao documento','certidão objeto e pé motorista de aplicativo',1),
 ('Conta bloqueada por questão judicial: primeiros passos','Diagnóstico e documentação','conta bloqueada processo judicial',2),
 ('Como saber se existe processo no seu nome','Consulta por tribunal','saber se tenho processo',3),
 ('Antecedentes criminais x objeto e pé: qual documento apresentar','Comparativo','antecedentes ou objeto e pé',4),
 ('Processo antigo e encerrado: como comprovar que está resolvido','Prova documental','processo encerrado comprovar',5),
 ('Cadastro em plataforma de transporte: documentos geralmente solicitados','Sem afirmar exigência específica','documentos cadastro motorista app',6),
 ('O que significa cada informação da Certidão de Objeto e Pé','Leitura do documento','como ler certidão objeto e pé',7),
 ('Certidão de Objeto e Pé em juizado especial','Juizados','certidão juizado especial',8),
 ('Processo cível não é crime: entenda a diferença','Educação jurídica','processo cível x criminal',9),
 ('Motorista de app com processo em outro estado','Pedido remoto','processo outro estado motorista app',10),
 ('Homônimo em cadastro de motorista: como resolver','Identificação correta','homônimo cadastro motorista',11),
 ('Prazo médio de emissão por tribunal','Expectativa realista','prazo emissão certidão tribunal',12),
 ('Certidão vencida: quando é preciso reemitir','Validade','certidão vencida reemitir',13),
 ('Como reunir documentos para uma nova análise de cadastro','Checklist','documentos nova análise cadastro',14),
 ('Entrega por delivery e análise de perfil: o que costuma ser avaliado','Panorama cuidadoso','análise de perfil entregador',15),
 ('Certidão de Objeto e Pé no TJRJ para motoristas','Tribunal regional','certidão objeto e pé tjrj',16),
 ('Certidão de Objeto e Pé no TJMG para motoristas','Tribunal regional','certidão objeto e pé tjmg',17),
 ('Como pedir certidão de mais de um processo ao mesmo tempo','Pedido múltiplo','pedido várias certidões',18),
 ('Número CNJ: o que cada bloco do número significa','Educacional','número cnj significado',19),
 ('Consulta pública x certidão oficial: por que a impressão de tela não basta','Valor probatório','print de consulta não vale',20),
 ('O que fazer se o tribunal recusar o pedido de certidão','Alternativas','tribunal recusou certidão',21),
 ('Processo trabalhista do motorista: impacto documental','Justiça do Trabalho','processo trabalhista motorista app',22),
 ('Segurança de dados ao enviar CPF e documentos','Privacidade','segurança dados cpf documentos',23),
 ('Custo de uma certidão judicial: o que compõe o valor','Transparência','custo certidão judicial',24),
 ('Como acompanhar o pedido e receber o PDF','Experiência do cliente','acompanhar pedido pdf certidão',25),
 ('Certidão para financiamento de veículo usado no trabalho com app','Uso financeiro','certidão financiamento veículo',26),
 ('Dúvidas sobre segredo de justiça em processos de motorista','Sigilo','segredo de justiça certidão',27),
 ('Regularização documental: um plano de 7 dias','Plano prático','plano regularizar documentos',28),
 ('Quando procurar um advogado além da certidão','Limites do serviço','quando procurar advogado processo',29),
 ('Perguntas frequentes de motoristas de aplicativo sobre certidões','FAQ consolidado','dúvidas certidão motorista app',30)
) as t(titulo, angulo, kw, ord);