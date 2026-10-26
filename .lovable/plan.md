# Auditoria OAuth/MCP — Certidão de Objeto e Pé

## Diagnóstico (somente leitura)
- **Servidor OAuth:** ativo, consentimento em `/.lovable/oauth/consent`, registro automático de clientes ligado, Site URL = certidaodeobjetoepe.lovable.app. Verificação automática: nenhum problema encontrado.
- **Endereços permitidos:** inclui o domínio publicado, .org, www, operacao.flydox.net e previews.
- **Issuer:** `https://<ref>.supabase.co/auth/v1` direto (correto, não o proxy), público "authenticated", exige `client_id` do OAuth (rejeita token de sessão copiado).
- **Login com retorno:** `/auth` valida `next` (`oauthReturnPath`) e preserva nos três caminhos — senha, cadastro (`emailRedirectTo`) e Google (`redirect_uri`).
- **Ferramenta `listar_pedidos`:** só leitura; identidade vem do token, nunca do pedido do agente; cliente usa RLS com o token do usuário e filtro extra por `user_id`; operador recusado; admin/equipe seguem RLS. Retorna apenas protocolo, status, data, UF e quantidade — sem nome, CPF, telefone, e-mail ou valores. Sem chave privilegiada.
- **Rotas geradas:** `src/routes/mcp.ts` e `src/routes/[.well-known]/` pelo plugin em `vite.config.ts`.

## Riscos para estabilidade
1. **Banco pausado por créditos** é o maior risco: com o Cloud parado, login, consentimento e consulta falham. Não é bug de código.
2. **Domínio canônico:** o Site URL é o .lovable.app; conectar pelo .org funciona (está na lista), mas use sempre um único endereço no agente para evitar novo consentimento.
3. Não há teste automatizado da ferramenta em si (só `access.test.ts` e `oauth-return-path.test.ts`).

## Alterações mínimas recomendadas (não aplicadas)
- Nenhuma alteração obrigatória — a configuração atual está correta e segura.
- Opcional: adicionar teste de `list-orders.ts` confirmando (a) cliente sempre filtrado por `user_id`, (b) operador recusado, (c) campos retornados sem dados pessoais.
- Opcional: manter saldo/recarga automática do Cloud para não pausar.

## Arquivos relevantes
`src/lib/mcp/index.ts`, `src/lib/mcp/supabase.ts`, `src/lib/mcp/access.ts`, `src/lib/mcp/tools/list-orders.ts`, `src/routes/[.]lovable.oauth.consent.tsx`, `src/routes/auth.tsx`, `src/lib/oauth-return-path.ts`, `vite.config.ts`.
