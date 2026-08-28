# Central de automação de e-mails

Amplia a automação atual (que já cobre a régua de recuperação de pedidos pendentes) com e-mail de boas-vindas, campanhas semanais agendadas e um painel único com métricas.

## 1. Base de clientes

A base de clientes já existe (perfis criados no cadastro). Serão acrescentados:

- `status_conta` (`ativa` / `descadastrado`) e `ultimo_email_enviado` no perfil do cliente.
- Nova visão consolidada de contatos: contas cadastradas **+** e-mails que já fizeram pedido sem conta, sem duplicar endereços.
- Descadastro automático quando o contato clica em "cancelar inscrição" ou o e-mail retorna como inválido/reclamação (recebido pelo canal de eventos de e-mail).

## 2. E-mail de boas-vindas

- Disparo imediato ao criar uma conta nova, uma única vez por cliente.
- Conteúdo (assunto e corpo) editável no painel, com variáveis `{{nome_cliente}}` e `{{email_cliente}}`.
- Inclui apresentação da marca e link para "Minha conta".

## 3. Campanhas semanais

Nova tabela de campanhas com título, assunto, conteúdo, data de agendamento e status (`rascunho`, `agendado`, `enviando`, `enviado`).

- Rotina automática toda **terça-feira às 09:00 (horário de Brasília)** que pega a campanha agendada para aquele período e envia para todos os contatos ativos.
- Envio em lotes com registro por destinatário, sem reenviar para quem já recebeu a mesma campanha.
- Botão "Enviar agora para todos" no painel.
- Histórico de disparos com total de envios, entregas, rejeições, descadastros e taxa de abertura.

## 4. Rastreio de abertura e cliques

- Cada e-mail de campanha recebe um pixel de rastreio e links redirecionados por uma rota pública do site.
- Registro de aberturas e cliques por destinatário, alimentando as métricas de engajamento.
- Link de cancelamento de inscrição em todo e-mail de campanha.

## 5. Painel `/admin/emails` (tema escuro)

Uma página com abas:

- **Métricas**: total de clientes cadastrados, contatos ativos, taxa de abertura e de cliques das campanhas, pedidos recuperados e valor total recuperado em R$.
- **Boas-vindas**: edição de assunto e corpo com pré-visualização em tempo real e envio de teste.
- **Campanhas semanais**: editor de conteúdo com preview, agendamento de data/hora, envio imediato e histórico de disparos com contagens.
- **Recuperação de pedidos**: a tela atual de recuperação passa a viver aqui como aba (a rota `/admin/recuperacao` continua funcionando).

Layout responsivo, seguindo o tema escuro já usado na tela de recuperação.

## Detalhes técnicos

- Migração: colunas `status_conta` / `ultimo_email_enviado` em `profiles`; tabelas `weekly_campaigns`, `campaign_recipients` (status por destinatário, aberto_em, clicado_em) e `email_contacts_optout`, todas com GRANTs e RLS restrita a staff via `private.is_staff`; a rotina usa service role.
- Boas-vindas: enviado por server function chamada no primeiro login/criação de perfil, idempotente por `user_id`.
- Semanal: rota `/api/public/cron/semanal` protegida por token (mesmo padrão de `/api/public/cron/recuperacao`), agendada por `pg_cron` às 12:00 UTC de terça; lock de execução e lote limitado por rodada.
- Rastreio: rotas públicas `/api/public/e/open/$id.gif` e `/api/public/e/click/$id`, sem dados pessoais na URL (apenas o id do destinatário da campanha).
- Eventos de e-mail (rejeição, reclamação, descadastro) recebidos em `src/routes/lovable/email/events.ts` marcam o contato como `descadastrado`.
- Novos templates React Email registrados no registry: `boas-vindas` e `campanha-semanal`, ambos renderizando conteúdo configurável.
- Server functions protegidas por verificação de papel de equipe, no mesmo padrão de `recuperacao.functions.ts`.
- Sem alterações no fluxo público de solicitação, preços ou checkout.
