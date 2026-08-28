# Finalizar configuração do e-mail `contato@certidaodeobjetoepe.org`

## Contexto
O usuário acabou de confirmar que os 3 registros DNS (MX1, MX2 e TXT SPF do ImprovMX) entraram na lista do painel Lovable. Agora é necessário verificar a propagação e validar o encaminhamento do alias `contato` para o Gmail.

## Passos
1. Verificar propagação dos registros MX e TXT (SPF) via consulta DNS pública.
2. Verificar o status do alias `contato` no painel ImprovMX.
3. Testar o encaminhamento enviando um e-mail para `contato@certidaodeobjetoepe.org` e confirmando se chega ao Gmail de destino.
4. Atualizar o site para usar `contato@certidaodeobjetoepe.org` como remetente/reply-to, substituindo os endereços Gmail/`noreply@` existentes (somente se a propagação e o teste confirmarem que está funcionando).

## Pontos de atenção
- Propagação DNS pode levar alguns minutos ou até 48h; o TTL dos registros foi configurado para 300 segundos.
- Não alterar a estrutura de envio de e-mails transacionais da Lovable, apenas substituir o endereço de contato/remetente.
