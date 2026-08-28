# Automação de recuperação de pedidos pendentes

Sequência automática de 3 e-mails para pedidos com pagamento pendente, com painel de controle e editor de textos.

## 1. Banco de dados

Nova tabela `abandoned_orders`, uma linha por pedido pendente:

- `pedido_id` (referência ao pedido), `cliente_nome`, `cliente_email`, `valor_total_centavos`, `link_pagamento`, `codigo_pix`, `data_criacao`
- `status_automacao`: `pendente`, `etapa_1_enviada`, `etapa_2_enviada`, `etapa_3_enviada`, `recuperado`, `cancelado`
- carimbos de envio por etapa (`etapa_1_em`, `etapa_2_em`, `etapa_3_em`), `recuperado_em`, `valor_recuperado_centavos`
- trava de execução (lease) para impedir duas rodadas simultâneas do robô

Regras de acesso: só a equipe/admin enxerga e edita; o cliente nunca acessa esta tabela.

Segunda tabela `email_sequencia_config`: guarda assunto e corpo editáveis das 3 etapas, com valores padrão iniciais.

O pedido continua sendo a fonte oficial de status; a nova tabela apenas espelha os dados necessários para a régua de recuperação. Quando o pagamento é confirmado (webhook ou marcação manual), a linha vira `recuperado` automaticamente.

## 2. Rotina automática

Rota pública de cron (`/api/public/cron/recuperacao`) protegida por credencial, agendada para rodar a cada 10 minutos:

- insere na fila os pedidos pendentes criados desde a última rodada
- envia a etapa devida conforme o tempo desde a criação do pedido: etapa 1 aos 30 min, etapa 2 às 12 h, etapa 3 às 48 h
- processa no máximo um lote por rodada, marca cada envio no banco (nunca reenvia a mesma etapa) e para a régua assim que o pedido é pago, expirado ou cancelado
- pausa a automação e avisa no painel em caso de bloqueio do serviço de e-mail

O lembrete único de 24 h existente é substituído por esta régua, para o cliente não receber e-mails duplicados.

## 3. Painel `/admin/recuperacao`

Tema escuro, responsivo, com:

- cartões de métricas: total de pedidos pendentes, taxa de recuperação (%), valor total recuperado em R$
- tabela dos pedidos em recuperação: cliente, e-mail, valor, etapa atual, data de criação, último envio
- ações por linha: reenviar e-mail da etapa atual, marcar como pago (recuperado), cancelar a régua
- filtros por status e busca por protocolo/e-mail

## 4. Editor / preview dos e-mails

Aba de configurações dentro da mesma página:

- edição de assunto e corpo das 3 etapas
- variáveis dinâmicas suportadas: `{{nome_cliente}}`, `{{numero_pedido}}`, `{{link_pagamento}}`, `{{codigo_pix}}`
- botão de pré-visualização com dados de exemplo e envio de e-mail de teste para o próprio admin

## Detalhes técnicos

- Migração cria as duas tabelas com GRANTs e RLS (leitura/escrita apenas para staff via `private.is_staff`).
- Envio pelo helper existente `sendTemplateEmail`, com um novo template React Email que renderiza o corpo configurável das etapas; `idempotencyKey` por pedido + etapa.
- Cron agendado por `pg_cron` chamando a rota pública com autenticação; lote limitado, lease de execução e marcação idempotente conforme as regras de jobs em background.
- Ações do painel via `createServerFn` protegidas, com verificação de papel de equipe.
- Sem alterações no fluxo público de solicitação, preços ou checkout.
