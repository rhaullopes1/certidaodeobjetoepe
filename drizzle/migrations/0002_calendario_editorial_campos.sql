alter table public.content_topics
  add column if not exists campanha text,
  add column if not exists data_publicacao date,
  add column if not exists horario text,
  add column if not exists objetivo text,
  add column if not exists palavras_secundarias text[] default '{}'::text[],
  add column if not exists slug_sugerido text,
  add column if not exists meta_title text,
  add column if not exists meta_description text;

create index if not exists content_topics_campanha_idx on public.content_topics (campanha, data_publicacao, horario);