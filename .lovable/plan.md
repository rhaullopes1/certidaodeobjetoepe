# Testar o site e destravar o que falta

## O que testei agora
- Todas as páginas respondem sem erro: início, /solicitar, /auth, /admin, termos e privacidade.
- Banco: 6 pedidos gravados, nenhum pago, bucket de anexos criado.
- Nenhum usuário cadastrado e nenhum papel de equipe/admin atribuído.
- Nenhuma credencial de pagamento configurada no ambiente.

## Problemas que impedem o site de funcionar de verdade

1. **Pagamento Pix não confirma sozinho**
   Falta a credencial do PagBank. Sem ela o site cai no Pix estático (chave manual), sem QR dinâmico e sem baixa automática — por isso nenhum pedido consta como pago.

2. **Ninguém consegue entrar no back office**
   Não existe usuário nem papel de equipe/admin. Mesmo entrando com Google, as regras de acesso bloqueiam a leitura dos pedidos.

3. **WhatsApp aponta para um 0800**
   O link wa.me usa 558000004604; números 0800 não existem no WhatsApp, então todos os botões abrem uma conversa inválida.

4. **Notificações prometidas não existem**
   Não há envio de e-mail nem de WhatsApp (Twilio) na confirmação de pagamento.

## O que farei

### Etapa 1 — pagamento funcionando
- Pedir e cadastrar o token do PagBank como segredo.
- Testar a criação de cobrança Pix real e a consulta de status.
- Informar a URL do webhook para cadastrar no painel do PagBank e validar o recebimento.

### Etapa 2 — acesso ao back office
- Entrar com Google uma vez para criar o usuário.
- Conceder o papel de admin a esse usuário e confirmar que /admin lista pedidos, anexa documentos e registra andamentos.

### Etapa 3 — contato correto
- Trocar o número do WhatsApp por um celular real com WhatsApp ativo (mantendo o 0800 apenas como telefone de ligação).

### Etapa 4 — notificações (opcional, após 1–3)
- E-mail automático de confirmação de pagamento.
- WhatsApp automático via Twilio, se você quiser seguir com esse provedor.

### Etapa 5 — teste ponta a ponta
- Fluxo completo: pedido, Pix, confirmação, aparecimento no back office e emissão.

## Detalhes técnicos
- Segredo `PAGBANK_TOKEN` lido em `src/lib/pagbank.server.ts`; webhook já existe em `/api/public/webhooks/pagbank` e revalida o status na API antes de gravar.
- Papel gravado em `public.user_roles` (`admin`), usado por `is_staff`/`has_role` nas policies de `pedidos`, `pedido_andamentos` e `pedido_anexos`.
- Número do WhatsApp em `WHATSAPP_NUMBER` (`src/lib/site.ts`); `PHONE_DISPLAY` continua sendo o 0800.
