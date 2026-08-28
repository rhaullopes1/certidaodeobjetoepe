# Trocar e-mail exibido no site para contato@certidaodeobjetoepe.org

Objetivo: garantir que o endereço `contato@certidaodeobjetoepe.org` seja o único e-mail de contato visível no site, nos envios e nos templates, removendo qualquer menção remanescente ao Gmail antigo.

## Estado atual verificado

- `src/lib/site.ts`: `EMAIL_CONTATO` já aponta para `contato@certidaodeobjetoepe.org`.
- `src/components/site/alternativas-contato.tsx` usa `EMAIL_CONTATO` no link `mailto:`.
- `src/lib/pedidos.server.ts` usa `EMAIL_CONTATO` como `replyTo` e destinatário administrativo.
- Não foram encontradas menções a `gmail.com`, `certidaoobjetoepe@gmail.com`, `objetoepe@gmail.com` ou `noreply@certidaodeobjetoepe.org` no código-fonte.

## Ações do plano

1. Revisar todos os templates de e-mail em `src/lib/email-templates/` para confirmar que usam `EMAIL_CONTATO` ou não mencionam o endereço antigo.
2. Verificar footer, páginas de contato/FAQ e termos para garantir que o e-mail vem de `EMAIL_CONTATO`.
3. Rodar typecheck (`tsgo`) e build para garantir que nenhuma alteração quebre a aplicação.
4. Conferir visualmente o rodapé e a página de contato no preview mobile/desktop.

## Resultado esperado

- Site exibe apenas `contato@certidaodeobjetoepe.org` como canal de e-mail.
- E-mails transacionais mantêm `noreply@certidaodeobjetoepe.org` como remetente técnico e `contato@...` como reply-to.
- Nenhuma regressão de build ou typecheck.
