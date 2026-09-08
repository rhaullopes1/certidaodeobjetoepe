# Auditoria do funil de pagamento — resultados e plano

Auditei o caminho completo: `/solicitar` → criação do pedido → `/pedido/{protocolo}` → Stripe → webhook → status "pago". Nada foi alterado ainda.

## A. Problemas encontrados

1. **O aviso de pagamento da Stripe não é verificado.** A rota que recebe o aviso aceita qualquer mensagem enviada por qualquer pessoa da internet. Hoje ela confere o pagamento na Stripe antes de gravar (o que evita marcar "pago" indevidamente), mas um atacante pode apagar o link de pagamento de pedidos e encher o registro de eventos.
2. **Link de pagamento não é regerado quando vence.** A chave de segurança usada na Stripe é fixa por protocolo (`checkout-PROTOCOLO`), então, quando o link expira e o sistema tenta criar outro, a Stripe devolve o mesmo link vencido. O cliente fica preso.
3. **Qualquer pessoa com o protocolo vê os dados do cliente.** A página mostra nome, e-mail, WhatsApp, CPF parcial, números de processo e observações, sem nenhuma verificação.
4. **A página não parece uma página de pagamento.** O topo é ocupado por protocolo, botão de baixar PDF e selo de garantia; o botão de pagar aparece depois, à direita no computador e bem abaixo no celular.
5. **Volta da Stripe sem retorno visual.** Quem paga e volta pela `?pagamento=ok` não vê "estamos confirmando seu pagamento" — vê a mesma tela de cobrança até o próximo ciclo de atualização.
6. **Pix confuso.** Quando o link de cartão falha, o Pix estático é exibido em destaque e o texto diz que a confirmação é automática — mas esse Pix é manual (só a equipe confirma). Risco de cliente pagar e ficar sem confirmação.
7. **Data do pagamento nunca vem da Stripe** (a consulta devolve sempre vazio), então "pago em" é o horário da gravação.
8. **Rastreio Google Ads impreciso.** O evento de "lead" dispara em toda visita da página, e não existe evento no momento em que a pessoa clica em pagar. A conversão de venda já está correta (só com status pago) e agora com número do pedido.
9. **Baixar comprovante em PDF antes de pagar** carrega 400 KB no celular e sugere que o pedido já está concluído.
10. **Rotas de pagamento antigas ainda ativas** (PagBank/Mercado Pago), inclusive um recebimento de aviso sem verificação de origem.

## B. Riscos

- CRÍTICO: aviso da Stripe sem verificação de assinatura (1); link vencido que não regenera (2).
- ALTO: dados pessoais acessíveis só com o protocolo (3); Pix manual anunciado como automático (6); rotas de pagamento antigas expostas (10).
- MÉDIO: página não orientada a pagamento (4); ausência de "confirmando pagamento" (5); rastreio impreciso (8).
- BAIXO: data do pagamento (7); PDF antes de pagar (9).

## C. Arquivos que serão alterados

- `src/routes/pedido.$protocolo.tsx` — nova ordem de checkout, estados de confirmação/cancelamento/erro, Pix como alternativa secundária, dados pessoais reduzidos.
- `src/lib/stripe.server.ts` — verificação de assinatura, chave de idempotência versionada, data real do pagamento, mensagens de erro tratadas.
- `src/routes/api/public/webhooks/stripe.ts` — validação de assinatura e processamento à prova de repetição.
- `src/lib/pedidos.server.ts` — regeração de cobrança, campo de acesso seguro, dados retornados minimizados.
- `src/lib/pedidos.functions.ts` — parâmetro do token de acesso.
- `src/lib/analytics.ts` — evento no clique de pagar; lead só uma vez por pedido.
- `src/routes/solicitar.tsx` — apenas o redirecionamento passa a incluir o token de acesso.
- `src/routes/api/public/webhooks/pagbank.ts`, `src/lib/pagbank.server.ts`, `src/lib/mercadopago.server.ts`, `src/lib/pagamentos.server.ts` — desativação das rotas antigas (só com sua autorização).

## D. Arquivos que NÃO serão alterados

Landing page (`src/routes/index.tsx`), blog, guias, páginas de estados e tribunais, sitemap, textos e metadados de SEO, logo e identidade visual, `src/lib/site.ts` (preços intactos), painel administrativo e `/acompanhar`.

## E. Banco de dados

Uma migração aditiva: nova coluna de token de acesso em `pedidos` (preenchida para pedidos antigos), sem remover nada. Links já enviados continuam funcionando: pedidos antigos seguem acessíveis pelo protocolo por um período, e novos exigem o token.

## F. Plano de implementação

1. Guardar o segredo de assinatura do webhook e validar a assinatura antes de qualquer leitura do conteúdo.
2. Tornar o webhook à prova de repetição (evento já processado não repete efeito) e registrar falhas para o painel.
3. Corrigir a chave de idempotência para permitir novo link quando o anterior vence, mantendo protocolo e pedido.
4. Migração do token de acesso e ajuste das telas e e-mails que geram o link do pedido.
5. Reordenar `/pedido/{protocolo}` como checkout: resumo (serviço, processos, quantidade, valor unitário, total, prazo, garantia) → botão "Pagar agora com segurança" → segurança → Pix como alternativa recolhida.
6. Estados: confirmando pagamento, pagamento confirmado, pagamento não concluído (com "Pagar novamente"), link vencido, gateway indisponível — sempre em linguagem simples.
7. Ajustar rastreio do Google Ads e revisar a automação de recuperação (não enviar após o pagamento, link direto correto).
8. Desativar as rotas de pagamento antigas.

## G. Plano de testes

Cada um dos 15 cenários será verificado assim: pedido normal, duplo clique, refresh, cancelamento, volta pela success_url, celular e conexão lenta — no navegador automatizado, em 390 px e com rede limitada; checkout expirado, webhook repetido, webhook inválido e Stripe indisponível — por chamada direta às rotas com dados simulados; pagamento confirmado e conversão do Google Ads — com um pedido real de valor mínimo, conferindo o evento enviado; protocolo de outro pedido — tentando abrir sem o token. Ao final: verificação de tipos e build, e remoção dos dados de teste.

**Observação:** o pagamento com cartão só volta a funcionar quando a chave da Stripe tiver permissão de criação de checkout — isso depende de você no painel da Stripe.
