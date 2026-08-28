# Conta do cliente e área "Meus pedidos"

Hoje o pedido é feito sem cadastro e o back office é exclusivo da equipe. A ideia é que todo cliente crie uma conta (nome, e-mail e senha) ao solicitar a certidão e passe a ter uma área própria com histórico, pedidos pendentes, QR Code e código Pix copia-e-cola.

## Como vai funcionar

1. Em `/solicitar`, depois de informar os dados das certidões e escolher a quantidade, o cliente cria a conta na etapa de contato: nome completo, e-mail, senha (mín. 8 caracteres) e confirmação de senha. O acesso é imediato — sem precisar confirmar e-mail.
2. Se o e-mail já tiver conta, o formulário mostra o campo de senha para entrar em vez de cadastrar (e link "esqueci minha senha").
3. Quem já estiver logado pula essa etapa: nome e e-mail vêm do perfil.
4. O pedido é gravado vinculado à conta. Ao criar a conta, todos os pedidos antigos feitos com aquele mesmo e-mail são vinculados automaticamente ao novo usuário.
5. Nova área do cliente em `/minha-conta`:
   - lista de pedidos (protocolo, data, quantidade, valor, status);
   - destaque dos pedidos pendentes de pagamento, com QR Code e código Pix copia-e-cola direto na tela, botão de copiar e aviso de expiração;
   - link para a página do pedido e download do comprovante em PDF.
6. O menu do topo passa a mostrar "Meus pedidos" para clientes e "Back office" apenas para quem é da equipe. O `/admin` continua restrito à equipe.

## Detalhes técnicos

Banco (migração):
- `pedidos.user_id uuid` referenciando o usuário, com índice.
- Políticas RLS adicionais em `pedidos`: cliente lê apenas linhas onde `user_id = auth.uid()` (equipe mantém acesso atual); nenhuma política de escrita para cliente — a criação continua server-side.
- Função/trigger `security definer` que, ao criar usuário, faz `update public.pedidos set user_id = new.id where user_id is null and lower(email) = lower(new.email)`.
- Grants: `GRANT SELECT ON public.pedidos TO authenticated` (já necessário para o cliente ler o próprio pedido).
- Auth: habilitar confirmação automática de e-mail (`auto_confirm_email`).

Código:
- `src/lib/pedidos.schema.ts` / `pedidos.server.ts`: aceitar e persistir `user_id` do usuário autenticado ao criar o pedido.
- `src/lib/pedidos.functions.ts`: nova função protegida `meusPedidos` com `requireSupabaseAuth`, devolvendo protocolo, status, valor, quantidade, datas, `pix_codigo` e `pix_qrcode_url`.
- `src/routes/solicitar.tsx`: etapa de cadastro/login (signUp/signInWithPassword do cliente do navegador) antes de enviar o pedido; validação de senha e e-mail já existente.
- Nova rota `src/routes/_authenticated/minha-conta.tsx` (usa o gate existente) com a lista e o bloco de pagamento Pix; reaproveita o componente de QR/copia-e-cola de `pedido.$protocolo`.
- `src/components/user-menu.tsx`: mostrar "Meus pedidos" sempre e "Back office"/"Documentos" apenas quando o usuário tiver papel de equipe (consulta a `user_roles`).
- `/acompanhar` continua funcionando por protocolo, para quem não quiser entrar.
