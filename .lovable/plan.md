# Situação atual do formulário e do pagamento

Verifiquei o código de checkout e a configuração real da conta de pagamentos.

**Funcionando hoje (testado ponta a ponta):**
- Formulário de solicitação cria o pedido, abre a conta do cliente e gera o protocolo.
- O link de pagamento é criado automaticamente e a tela de pagamento abre com cartão de crédito, Apple Pay e Google Pay.
- O pedido fica em "aguardando pagamento" e o retorno do pagamento atualiza o status.

**Único ponto em aberto:** o Pix está desligado na conta de pagamentos (cartão, Apple Pay e Google Pay estão ativos). Isso não trava a venda — apenas o Pix da Stripe não aparece no checkout. A ativação do Pix só pode ser feita por você no painel da Stripe (Configurações > Métodos de pagamento); a API disponível aqui é somente leitura para essa opção.

# O que proponho fazer para blindar a venda

1. **Rede de segurança no checkout**: se por qualquer motivo o link de pagamento não for gerado (chave inválida, instabilidade), a tela do pedido mostra uma mensagem clara com botão "Tentar novamente" e contato direto, em vez de deixar o cliente parado.
2. **Botão de repetir cobrança**: se o link expirar (23h), o cliente gera um novo link com um clique na própria página do pedido.
3. **Alerta interno**: registrar no painel administrativo quando um pedido ficar sem link de pagamento, para a equipe agir no mesmo dia.
4. **Aparecer o Pix automaticamente**: nenhum código novo é preciso — assim que você ativar o Pix no painel da Stripe, ele passa a aparecer sozinho no checkout, pois já não fixamos os meios de pagamento.
5. **Teste final real**: novo pedido de ponta a ponta, conferindo criação, pagamento e mudança de status, com remoção dos dados de teste ao final.

# Detalhes técnicos

- `src/lib/stripe.server.ts`: sessão de Checkout sem `payment_method_types` fixos (usa a configuração da conta), BRL, expiração de 23h, `idempotencyKey` por protocolo.
- `src/routes/pedido.$protocolo.tsx`: estado de erro quando `checkoutUrl` é nulo + ação de regerar cobrança.
- `src/lib/pedidos.server.ts`: `gerarCobranca` já limpa sessão vencida e recria; expor essa ação ao cliente.
- Configuração de meios de pagamento atual: cartão on, Apple Pay on, Google Pay on, Pix off, boleto off.
