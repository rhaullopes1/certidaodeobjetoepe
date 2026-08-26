# Auditoria do site — resultados e plano de correções

## O que foi testado agora

- Todas as 129 URLs do sitemap responderam 200 (home, hub, 12 estados, TJSP, blog, tribunais, legais, /solicitar, /acompanhar).
- Fluxo real de pedido executado ponta a ponta: etapa 1 (processo, nome, CPF) → etapa 2 com 2 certidões → R$ 497,00 → protocolo gerado, comprovante em PDF, QR Code e Pix copia-e-cola dinâmicos do provedor de pagamento. Sem erros de console ou de servidor.
- Validação de CPF/nome/processo em tempo real funciona; o botão de envio fica bloqueado enquanto faltam dados de qualquer certidão.
- E-mails automáticos (cliente + certidaoobjetoepe@gmail.com e objetoepe@gmail.com) disparam na criação do pedido sem bloquear o fluxo.

Conclusão: não há bug que quebre o site. Os pontos abaixo são falhas funcionais e de qualidade, em ordem de impacto.

## Problemas encontrados

1. **Botões de WhatsApp não funcionam.** O número configurado é o 0800 (`558000004604`). Links `wa.me` com 0800 não abrem conversa — todos os CTAs "Falar pelo WhatsApp" (home, estados, blog, página do pedido, /acompanhar, rodapé) levam a erro. É o problema mais grave para conversão.
2. **Nenhum pagamento confirmado até hoje.** Há 11 pedidos no banco, todos em "aguardando pagamento". O caminho "pago" (webhook do provedor Pix) nunca foi exercitado em produção, então a confirmação automática ainda não está comprovada.
3. **Pedidos de teste no banco.** Os 11 registros são testes meus e da auditoria; poluem o painel administrativo e o histórico.
4. **Campos das certidões adicionais sem rótulo acessível.** A partir da 2ª certidão, os campos não têm `name`/`id` associados ao rótulo — prejudica leitores de tela, autopreenchimento e testes.
5. **Sem página de retorno pós-pagamento nem lembrete.** Quem fecha a página do pedido só volta pelo protocolo; não existe reenvio do link por e-mail nem aviso de pedido expirado/abandonado.
6. **Avisos técnicos no build.** Uso de API depreciada (`inputValidator`) nas funções de pedido — não quebra hoje, mas quebra em atualização futura.

## Plano de correção (em ordem)

### 1. WhatsApp funcional
- Trocar o número usado nos links `wa.me` por um celular real com WhatsApp (mantendo o 0800 apenas como telefone de voz), ou
- se não houver celular, remover os CTAs de WhatsApp e substituir por "Falar por e-mail" / "Ligar 0800".

### 2. Validar a confirmação automática de pagamento
- Conferir se a URL do webhook cadastrada no provedor aponta para o domínio publicado.
- Fazer um pagamento real de valor mínimo em ambiente de teste e confirmar que o pedido muda para "pago" no painel e na página pública.
- Adicionar registro de eventos do webhook para diagnóstico quando algo falhar.

### 3. Limpeza e higiene de dados
- Remover os pedidos de teste do banco.
- Marcar automaticamente como "expirado" pedidos sem pagamento após X dias (sugestão: 7), para o painel refletir a realidade.

### 4. Acessibilidade e qualidade do formulário
- Dar `id`/`name` únicos e rótulos associados a cada campo das certidões adicionais.
- Exibir um resumo de erros no topo quando o envio for bloqueado, explicando o que falta.

### 5. Retenção do cliente
- E-mail de lembrete de pagamento pendente (24 h) com o link do pedido.
- Botão "reenviar link do pedido por e-mail" em /acompanhar.

### 6. Manutenção técnica
- Migrar `inputValidator` para `validator` nas funções de pedido.

## Detalhes técnicos

- Número de WhatsApp: `WHATSAPP_NUMBER` em `src/lib/site.ts` (usado por `whatsappLink()` em todas as páginas).
- Webhook Pix: `src/routes/api/public/webhooks/mercadopago.ts`; atualização de status em `src/lib/pagamentos.server.ts`.
- Campos das certidões: `src/routes/solicitar.tsx` (bloco por certidão, linhas ~430-480).
- Expiração de pedidos: coluna `status` em `public.pedidos` + rotina agendada ou verificação na leitura.
- API depreciada: `src/lib/pedidos.functions.ts`.

## Fora deste plano
Nada de alterações em preços, tabela de valores, back office existente ou SEO.
