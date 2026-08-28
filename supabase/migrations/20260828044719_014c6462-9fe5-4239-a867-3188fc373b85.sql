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