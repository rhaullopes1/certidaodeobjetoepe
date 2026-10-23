# Publicar na Vercel com Supabase próprio

1. Crie um projeto vazio no supabase.com. No SQL Editor, cole e rode `deploy/supabase-setup-completo.sql`.
2. Em Authentication → URL Configuration, coloque o domínio da Vercel como Site URL. Ative Google se for usar.
3. Na Vercel → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Mercado Pago, SMS, WhatsApp e demais chaves usadas hoje (mesmos nomes)
4. Deployments → Redeploy. O `vercel.json` já faz o build no formato da Vercel.
5. Crie seu usuário em /auth e, no SQL Editor, dê o papel admin:
   `insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'SEU@EMAIL';`
6. Atualize a URL do webhook do Mercado Pago para o novo domínio.

Limitações fora do Lovable: e-mails pelo domínio Lovable e recursos de IA do Lovable precisam de `LOVABLE_API_KEY` ou de troca por outro provedor (ex.: Resend). Os dados atuais (pedidos antigos) só podem ser copiados quando o banco Lovable voltar a ficar ativo.
