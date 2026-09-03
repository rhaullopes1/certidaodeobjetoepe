# Resultado do teste de pagamento e correção pendente

## O que foi testado

Fiz um pedido real de ponta a ponta no site:

- Pedido criado com protocolo `COP2026UM8Y365690`, valor R$ 297,00, status "aguardando pagamento".
- A Stripe gerou a sessão de checkout normalmente (`cs_live_...`) e a página do pedido exibe o botão "Pagar agora com segurança" com cartão, carteiras digitais e a opção de Pix.
- Nenhum erro de console durante o fluxo.

Conclusão: a chave da Stripe está com a permissão de criar checkout e o pagamento voltou a funcionar.

## Problema encontrado durante o teste

Se o visitante preenche e clica em "Solicitar Orçamento e Enviar Pedido" antes de a página terminar de carregar, o formulário é enviado pelo navegador da forma antiga: a página recarrega, os campos ficam em branco e o pedido não é criado. Reproduzi isso na primeira tentativa do teste. Em conexões lentas de celular esse é um cenário real de perda de pedido.

## Correção proposta

1. Desabilitar o botão de envio (com texto "Carregando...") enquanto a página ainda não está interativa, liberando-o assim que a interface estiver pronta.
2. Garantir que o envio nativo do formulário seja bloqueado mesmo nesse intervalo, para que nenhum clique adiantado recarregue a página.
3. Repetir o teste automatizado clicando imediatamente após o carregamento, para confirmar que o pedido é criado em vez de a página recarregar.

## Limpeza

Remover o pedido de teste `COP2026UM8Y365690` (e o cadastro de e-mail associado) para não poluir o painel e os relatórios.

## Detalhes técnicos

- Arquivo: `src/routes/solicitar.tsx` — o `<form onSubmit={enviar}>` já chama `preventDefault`, mas isso só vale após a hidratação. A correção usa um estado de "pronto" (efeito no cliente) para controlar o `disabled` do botão de submit.
- Validação: script Playwright em `/tmp/browser/stripe-e2e/` com clique imediato e clique após carregamento.
- Nenhuma alteração em `src/lib/site.ts`, preços ou na integração da Stripe.
