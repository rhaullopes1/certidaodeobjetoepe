# Duplicidade de pedidos + etiqueta "Novo"

## O que foi verificado

Consulta na base atual: existem 2 casos de duplicidade (mesmo número de processo + CPF + e-mail), ambos criados com poucos minutos de diferença — sinal clássico de reenvio do formulário pelo cliente:

- processo 0040503-60.2020.8.19.0001 — 27/08 13:39 e 13:53
- processo 0018455-35.2006.8.08.0024 — 27/08 21:11 e 21:27

Nenhuma trava impede hoje a criação de um segundo pedido idêntico.

## O que será feito

### 1. Evitar duplicidade na criação
No servidor, antes de gravar o pedido: se já existir um pedido com o mesmo número de processo + CPF + e-mail, ainda aguardando pagamento e criado nos últimos 30 minutos, o sistema reaproveita esse pedido (retorna o mesmo protocolo e o mesmo Pix) em vez de criar outro. Pedidos legítimos repetidos (dias depois, ou já pagos) continuam sendo criados normalmente.

### 2. Sinalizar duplicidade no painel
Na lista de pedidos do admin, pedidos que compartilham processo + CPF ganham uma etiqueta "Possível duplicidade", para a equipe conferir antes de emitir duas certidões iguais. Na tela de detalhe do pedido, um aviso mostra os protocolos relacionados com link.

### 3. Etiqueta de pedido novo
Etiqueta "Novo" nos pedidos criados nas últimas 24 horas, na lista do admin, junto do protocolo. Filtro rápido "Somente novos" no formulário de busca.

## Detalhes técnicos

- `src/lib/pedidos.server.ts` (`criarPedidoNoBanco`): consulta de reaproveitamento via `supabaseAdmin` por `numero_processo`+`cpf`+`email`, `status = 'aguardando_pagamento'`, `created_at > now() - 30 min`; se achar, retorna o resumo existente sem novo e-mail de confirmação.
- `src/lib/admin.ts`: em `listarPedidos`, marcar `duplicado: boolean` agrupando por `numero_processo`+`cpf` no conjunto retornado; adicionar helper `ehNovo(created_at)` (< 24h).
- `src/routes/_authenticated/admin.index.tsx`: etiquetas "Novo" e "Possível duplicidade" na coluna de protocolo, usando os tokens de cor existentes (`accent`, `destructive`), e checkbox de filtro "Somente novos" (filtro no cliente).
- `src/routes/_authenticated/admin.$protocolo.tsx`: bloco de aviso listando protocolos com mesmo processo+CPF.
- Sem mudança de banco de dados.
