# Corrigir disparo da conversão do Google Ads

## Problema
A conversão do Google Ads (`AW-18411209847/ZLw3CNazkOgcEPeIk8tE`) na página `/pedido/$protocolo` só é enviada se a função `gtag` já estiver disponível no momento exato em que o status do pedido fica `pago`. Como o script do Google carrega de forma assíncrona, a conversão pode ser perdida tanto na primeira visita quanto quando o polling atualiza o status de pendente para pago.

## O que será feito
1. Criar um helper robusto para envio da conversão que:
   - Envie imediatamente se `gtag` já estiver carregado.
   - Aguarde o carregamento do script gtag caso ele ainda não esteja disponível, com timeout de segurança.
   - Deduplique por protocolo usando `localStorage`, evitando conversões duplicadas do mesmo pedido em recargas.
2. Substituir o `useEffect` atual de `src/routes/pedido.$protocolo.tsx` por uma chamada ao novo helper sempre que `data.status === "pago"`.
3. Adicionar, opcionalmente, `value` e `currency` (BRL) ao evento de conversão para rastrear o valor da venda no Google Ads.
4. Validar no preview se o evento `conversion` com `send_to` correto é chamado no console quando o pedido está pago.
5. Rodar typecheck e build para garantir que não houve regressões.

## Arquivos afetados
- `src/lib/analytics.ts` (novo helper de conversão)
- `src/routes/pedido.$protocolo.tsx` (uso do helper e remoção da lógica inline)

## Não será alterado
- ID da conta Google Ads (`AW-18411209847`).
- ID do evento de conversão (`AW-18411209847/ZLw3CNazkOgcEPeIk8tE`).
- Tag base global carregada em `src/routes/__root.tsx`.
- Lógica de pagamento, webhooks ou status dos pedidos.
