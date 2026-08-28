# Fazer o Google Ads registrar conversões

## Por que o Google diz "nenhuma conversão registrada"

A tag base (`AW-18411209847`) está em todas as páginas e o snippet de conversão existe, mas hoje ele só dispara em `/pedido/{protocolo}` quando o pedido está **pago**. Como ainda não houve pedidos pagos desde a correção — e a correção pode não estar na versão publicada — o Google não recebeu nenhum evento.

## O que será feito

1. **Publicar o site** com a correção já feita no disparo da conversão (helper que espera o gtag carregar e deduplica por protocolo).
2. **Criar eventos intermediários** em `src/lib/analytics.ts`, para o Google Ads ter sinal mesmo antes do pagamento:
   - `generate_lead` quando o pedido é criado (chegada em `/pedido/{protocolo}`), com valor do pedido em BRL;
   - `begin_checkout` ao abrir `/solicitar`.
   Ambos deduplicados por sessão/protocolo, sem alterar o snippet de compra.
3. **Manter a conversão principal** (`AW-18411209847/ZLw3CNazkOgcEPeIk8tE`) exclusiva do pedido pago, que é a conversão de venda real.
4. **Validar** no preview interceptando o `dataLayer` para confirmar que os eventos saem com os parâmetros corretos, e rodar typecheck/build.

## O que você precisa fazer no Google Ads (fora do site)

Para os eventos novos aparecerem, é preciso criar no Google Ads ações de conversão adicionais (ex.: "Pedido iniciado" e "Solicitação iniciada") e me passar os IDs `AW-18411209847/XXXX` de cada uma. Se preferir, publico primeiro só a correção da venda e adicionamos os eventos secundários depois.

## O que não muda

- ID da conta e da conversão de venda.
- Fluxo de pedido, pagamento, webhooks ou preços.
