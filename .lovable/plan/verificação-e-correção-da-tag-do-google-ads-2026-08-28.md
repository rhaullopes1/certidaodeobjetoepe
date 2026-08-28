# Verificação e correção da tag do Google Ads

## Contexto atual
- A tag base do Google (`AW-18411209847`) já está carregada em todas as páginas via `src/routes/__root.tsx`.
- O snippet de evento de conversão (`AW-18411209847/ZLw3CNazkOgcEPeIk8tE`) está em `src/routes/pedido.$protocolo.tsx`.

## Problemas encontrados
- O evento de conversão dispara para qualquer pedido carregado, inclusive pedidos pendentes.
- O evento depende apenas de `data?.protocolo`, então, quando o polling atualiza o status de "pendente" para "pago", o evento não é reenviado.
- Navegações internas (SPA) não enviam `page_view` automaticamente para o gtag.

## O que será feito
1. **Corrigir o gatilho de conversão** em `/pedido/$protocolo` para disparar apenas quando `data.status === "pago"`.
2. **Reagir à mudança de status**: quando o polling/refetch atualizar o pedido para pago, o evento de conversão deve ser enviado.
3. **Adicionar rastreamento de `page_view`** em navegações internas da SPA, enviando o evento para o gtag quando a rota mudar.
4. **Evitar duplicação** de eventos de conversão usando uma flag local ou verificando o status.
5. **Verificar** via console/network que a tag base carrega e que o evento de conversão dispara apenas no pagamento confirmado.
6. **Rodar typecheck e build** para garantir que não há regressões.

## Arquivos afetados
- `src/routes/pedido.$protocolo.tsx`
- `src/routes/__root.tsx`

## Não será alterado
- IDs da conta Google Ads (`AW-18411209847`) e do evento (`AW-18411209847/ZLw3CNazkOgcEPeIk8tE`).
- Lógica de pagamento, checkout ou webhook.
