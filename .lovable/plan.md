# Deixar contato@certidaodeobjetoepe.org recebendo e-mails

Objetivo: encaminhamento funcionando 100% — mensagens enviadas para `contato@certidaodeobjetoepe.org` chegam na sua caixa do Gmail.

## Etapas

1. **Acessar a conta ImprovMX** com as credenciais que você enviou (uso único; não serão exibidas, registradas nem salvas em arquivos do projeto).
2. **Corrigir os aliases**: deixar `contato` → `certidaoobjetoepe@gmail.com` salvo corretamente e remover a linha de alias vazia que causava o erro "É necessário um pseudônimo".
3. **Ler no ImprovMX os registros DNS exatos** exigidos para o domínio (MX de entrada + SPF).
4. **Aplicar os registros no DNS da Lovable** (domínio comprado lá): Configurações do projeto → Domínios → certidaodeobjetoepe.org → Configurar → Gerenciar DNS.
   - MX `@` → `mx1.improvmx.com`, prioridade 10
   - MX `@` → `mx2.improvmx.com`, prioridade 20
   - TXT `@` → `v=spf1 include:spf.improvmx.com ~all`
   Se já houver um TXT SPF no raiz, ele é mesclado numa única linha em vez de duplicado.
5. **Validar**: clicar em Verificar no ImprovMX após a propagação e enviar um e-mail de teste para `contato@certidaodeobjetoepe.org`, confirmando a chegada no Gmail.

## Ponto importante sobre o passo 4

Esse painel de DNS da Lovable é uma tela de configurações do produto, à qual eu não tenho acesso automatizado. Vou entregar os valores prontos, campo a campo, e se você preferir posso guiar em tempo real enquanto você cola cada registro — a partir daí eu verifico a propagação e faço a validação final no ImprovMX e o teste de envio.

## Observações técnicas

- O subdomínio `noreply.certidaodeobjetoepe.org`, usado pelo site para enviar e-mails, não conflita com os registros MX/SPF do domínio raiz.
- Nenhum arquivo do projeto é alterado neste plano. A troca do endereço exibido no site (Gmail → contato@) fica para uma etapa separada, se você quiser.
