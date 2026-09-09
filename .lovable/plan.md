# Auditoria do funil de pagamento — diagnóstico (nada foi alterado)

Nenhum arquivo foi modificado, nenhuma configuração alterada, nenhum deploy feito.

## A) Fluxo atual real

```text
Home / páginas de SEO
   -> /solicitar (formulário: processos + dados do solicitante)
   -> pedido gravado no banco (status "aguardando_pagamento")
   -> link de pagamento criado na Stripe no mesmo instante
   -> cliente é levado para /pedido/{protocolo}
   -> precisa clicar em "Pagar agora com segurança" (abre nova aba)
   -> página de pagamento da Stripe
   -> retorno para /pedido/{protocolo}?pagamento=ok
   -> confirmação: hoje só acontece porque a página consulta a Stripe
      a cada leitura (o aviso automático da Stripe não existe)
```

## B) Ponto provável de abandono

O abandono está concentrado **dentro da página de pagamento da Stripe**, e a causa mais provável é a **ausência de Pix**. Hoje a conta oferece apenas cartão, Apple Pay e Google Pay. Para um serviço jurídico de R$ 297,00 vendido no Brasil, tirar o Pix da mesa derruba a conversão de forma drástica — e o site promete Pix no próprio título da página ("Pedido e pagamento Pix").

Secundariamente, o pedido é criado **antes** do pagamento e a pessoa precisa dar mais um clique numa página cheia de informação (resumo, PDF, selo, WhatsApp) antes de chegar ao pagamento.

## C) Evidências

- 23 pedidos no banco: 22 em "pagamento pendente", 1 pago (01/09). Os 5 recentes (08 e 09/09) são todos R$ 297,00, 1 certidão cada, de SP, RJ, GO, MG e PR.
- Todos os 5 têm link de pagamento gerado com sucesso — ou seja, a criação do pedido e a integração com a Stripe **funcionam**.
- Na Stripe, todas as sessões desses pedidos estão "abertas / não pagas", e os meios oferecidos são **somente cartão**.
- A configuração de meios de pagamento da conta mostra: cartão ligado, Apple Pay ligado, Google Pay ligado, **Pix indisponível/desligado**, boleto desligado.
- **Nenhum aviso automático (webhook) está cadastrado na Stripe** — a lista de endpoints está vazia. E o segredo de assinatura desse aviso não está configurado no projeto, então mesmo que a Stripe avisasse, o site recusaria (responde 503).
- A tabela de eventos de webhook está **vazia** desde sempre.
- Nenhuma cobrança de cartão chegou a ser iniciada na Stripe.
- O único pedido pago foi confirmado pela consulta de segurança que o site faz à Stripe ao abrir a página do pedido — essa rede de segurança está funcionando.
- A alternativa de Pix na página é um Pix **estático manual**, escondido atrás de um "Prefiro pagar por Pix" recolhido, e exige enviar comprovante por WhatsApp.

## D) Problemas críticos

1. **Sem Pix.** Principal meio de pagamento do país está desligado na conta Stripe (aparece como "indisponível" — normalmente depende de habilitação/documentação junto à Stripe).
2. **Sem aviso automático de pagamento.** Nenhum endpoint cadastrado na Stripe e segredo de assinatura ausente. Se um cliente pagar e não voltar ao site, o pedido pode ficar como pendente por horas (só muda quando alguém abre a página do pedido).
3. **Promessa quebrada.** Título/descrição da página e vários textos falam em Pix; na prática só há cartão. Quem chega decidido a pagar por Pix sai.

## E) Problemas secundários

4. Página do pedido não é uma página de pagamento: o botão de pagar aparece abaixo de resumo, download de PDF e selos.
5. O botão abre o pagamento em **nova aba** — no celular isso frequentemente confunde e perde o cliente.
6. Pix manual (comprovante por WhatsApp) convive com o texto "confirmação é automática" — mensagem contraditória.
7. Comprovante em PDF disponível antes de pagar, o que reduz a urgência.
8. Sem tela de "estamos confirmando seu pagamento" nem de "pagamento não concluído" ao voltar da Stripe.
9. Analytics: o evento de "lead" dispara a cada visita à página do pedido e não há evento no clique real de pagar — impossível medir a queda entre pedido criado e checkout aberto.
10. Existem ainda rotas e arquivos de meios de pagamento antigos (Mercado Pago / PagBank) sem uso, e um token antigo guardado nos segredos.
11. Nenhum lembrete efetivo chegou a converter: vale conferir se a rotina de recuperação está rodando de fato.

## F) Correções recomendadas, por prioridade

1. **Habilitar Pix na conta Stripe** (Stripe → Configurações → Métodos de pagamento). Sem isso, nada mais move a agulha. Se a Stripe não liberar rápido, ativar Pix automático por outro provedor.
2. **Cadastrar o aviso automático** de pagamento na Stripe para `https://certidaodeobjetoepe.org/api/public/webhooks/stripe` e guardar o segredo de assinatura no projeto.
3. **Transformar `/pedido/{protocolo}` em página de pagamento**: valor e botão no topo, na mesma aba, resumo abaixo, PDF só depois de pago.
4. **Estados claros de retorno**: "confirmando pagamento", "pagamento não concluído — tentar de novo".
5. **Alinhar os textos** ao que realmente existe (não prometer Pix enquanto não estiver ligado).
6. **Medir de verdade**: evento no clique de pagar, lead só na criação do pedido, conversão só no pagamento confirmado.
7. **Testar o pagamento por celular** de ponta a ponta e conferir a rotina de recuperação de pedidos pendentes.
8. Remover as rotas e o token dos meios de pagamento antigos.

Nenhuma dessas correções foi aplicada — aguardo sua autorização.
