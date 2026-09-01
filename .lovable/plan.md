# Ativar Pix no checkout

## Situação verificada agora

Consultei a conta Stripe conectada:

- Cartão, Apple Pay e Google Pay: ativos
- Pix: `available: false` e `preference: off`

O `available: false` significa que a **capacidade de Pix ainda não foi concedida à conta** — não é só um botão de exibição desligado. Além disso, a integração disponível aqui só permite **ler** a configuração de métodos de pagamento; não existe operação de escrita para ativar Pix nem para solicitar a capacidade. Ou seja, mesmo com sua autorização, essa ativação não pode ser feita por mim — ela só existe no painel da Stripe.

## O que você precisa fazer (2 minutos)

1. Acesse https://dashboard.stripe.com/settings/payment_methods
2. Procure **Pix** na lista
3. Clique em **Ativar** e conclua o formulário (pode pedir CNPJ/CPF e dados bancários; o representante já está verificado)
4. A ativação costuma ser imediata; em alguns casos a Stripe leva algumas horas para liberar

## O que eu faço depois que você ativar

1. Reconferir pela API que a conta passou a mostrar Pix como disponível e ligado
2. Rodar um teste ponta a ponta em `/solicitar`: criar pedido, gerar o checkout e confirmar que a tela da Stripe oferece **cartão e Pix**
3. Conferir o retorno do pagamento (`/pedido/<protocolo>?pagamento=ok`), o webhook e a mudança de status para pago
4. Remover os dados de teste ao final

## Detalhe técnico

O código já está pronto: `criarCheckout` em `src/lib/stripe.server.ts` tenta criar a sessão com `payment_method_types: ["card", "pix"]` e, se a Stripe recusar, refaz sem lista fixa (hoje resultando só em cartão). Assim que o Pix for ativado na conta, a primeira tentativa passa a funcionar e o Pix aparece no checkout automaticamente — sem nenhuma alteração de código.
