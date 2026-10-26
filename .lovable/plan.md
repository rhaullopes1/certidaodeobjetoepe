# Auditoria somente leitura — Pedido e Pix/Mercado Pago (26/10/2026)

Nada foi alterado, publicado ou cobrado. Dados abaixo são só contagens, sem dados pessoais.

## 1. Formulário e validações
- Servidor recalcula o preço pela tabela oficial e recusa valor divergente; valida cada certidão de novo no servidor; exige uma linha de dados por certidão.
- Anti-duplicidade: mesmo processo + CPF + e-mail em 30 min reaproveita o pedido aberto.
- Contingência: se o banco falhar, e-mail à equipe e Pix com valor do pedido (confirmação manual).

## 2. Criação e gravação do pedido
- Gravação pelo servidor; dono vinculado quando há login.
- Contagem real (30 dias): 113 aguardando pagamento, 12 pagos, 7 cancelados, 5 protocolados, 3 em análise, 2 emitidos, 2 emitidas, 2 expirados, 2 gratuitos.
- Nenhum pedido gravado entre 14 e 24/10 (período do banco pausado). Em 25/10, 1 pedido novo gravado, com Pix do Mercado Pago gerado.
- Último pedido pago: 10/10.

## 3. Mercado Pago / Pix
- Criação do Pix: servidor, com chave de idempotência = protocolo (+ sufixo a cada renovação) e endereço de aviso fixo.
- Aviso (webhook): verifica assinatura HMAC com comparação segura, MAS **segue processando quando a assinatura é inválida** (só registra no log). Risco mitigado: o status nunca é lido do aviso, sempre consultado na API do Mercado Pago com o token do site. Ponto de atenção: avisos forjados podem gerar consultas e registros extras.
- Idempotência: pedido já pago não é reprocessado; atualização condicional "não pago"; eventos com ID único.
- Recusa/vencido não cancela; só estorno encerra.
- Consulta de reserva no servidor quando o cliente abre o pedido.
- Registros de avisos (30 dias): 405 status intermediário, 335 erro ao consultar a API (último em 12/10, época do apagão), 34 marcados pagos, 24 cancelados, 8 já processados. Sem erros novos depois de 12/10.

## 4. Emissão só após pagamento
- Antecedentes: emissão disparada só depois de pagamento confirmado pela API, e a função recusa pedido fora de gratuito/pago/emitido.
- Objeto e Pé: emissão é manual pela operação; não há disparo automático antes do pagamento.

## 5. Segredos (só nomes)
Presentes: MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PIX_ENABLED, MERCADOPAGO_WEBHOOK_SECRET, STRIPE_SECRET_KEY, CRON_SECRET, LOVABLE_API_KEY, DATAJUD_API_KEY, INFOSIMPLES_TOKEN. PUBLIC_SITE_URL não definido (usa o .org por padrão).

## 6. Testes executados
- `bunx vitest run` em pedidos-contingencia, recuperacao-regras, comercial: 12/12 passaram (simulados).
- Não existe teste automático do aviso do Mercado Pago (assinatura, idempotência, pago/estorno).

## O que NÃO está comprovado
- Pix de ponta a ponta (pagar → aviso → "pago" automático) depois da volta do banco: nenhum pagamento real desde 10/10.
- Se a assinatura dos avisos está batendo hoje (o código aceita mesmo inválida, então os logs precisam ser lidos).

## Próximo passo proposto (precisa da sua aprovação)
1. Adicionar testes automáticos do aviso do Mercado Pago (assinatura válida/inválida, pedido já pago, estorno, falha da API), simulando a API — só arquivo de teste.
2. Opcional, mudança de comportamento: recusar avisos com assinatura inválida (fecha o ponto de atenção). Só com sua autorização.
3. Teste seguro real, feito por você: criar um pedido seu de 1 certidão, pagar o Pix com sua própria conta e conferir "pago" no painel; depois estornar pelo Mercado Pago e confirmar que o pedido vira cancelado. Custa só a tarifa, sem cliente envolvido.
