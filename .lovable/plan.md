# Configurar recebimento em contato@certidaodeobjetoepe.org

Objetivo: deixar o encaminhamento do ImprovMX ativo e válido, para que e-mails enviados a `contato@certidaodeobjetoepe.org` cheguem na caixa do Gmail informada.

## O que será feito

1. **Acesso à conta ImprovMX** (uma única vez, com as credenciais que você enviou; elas não serão exibidas, registradas nem salvas em nenhum arquivo do projeto).
2. **Conferir/ajustar o alias** `contato` → Gmail informado, e remover a linha de alias vazia que estava gerando o erro "É necessário um pseudônimo".
3. **Ler os registros DNS exatos** que o ImprovMX exige e anotá-los.
4. **Entregar os registros para você aplicar** no gerenciador de DNS da Lovable (Configurações do projeto → Domínios → certidaodeobjetoepe.org → Configurar → Gerenciar DNS). Esse passo é manual: não tenho ferramenta para gravar DNS nesse painel.
   - MX `@` → `mx1.improvmx.com` (prioridade 10)
   - MX `@` → `mx2.improvmx.com` (prioridade 20)
   - TXT `@` → `v=spf1 include:spf.improvmx.com ~all`
5. **Validar** no ImprovMX depois da propagação (botão Verificar) e confirmar com um e-mail de teste.

## Observações técnicas

- O subdomínio `noreply.certidaodeobjetoepe.org`, usado pelo envio de e-mails do site, não conflita com os registros MX/SPF do domínio raiz.
- Se já existir um TXT SPF no raiz, ele deve ser mesclado em uma única linha, não duplicado.
- Nenhum arquivo do projeto é alterado neste plano. A troca do e-mail exibido no site (Gmail → contato@) fica para uma etapa separada, se você quiser.

## Depois de aprovado

Executo o acesso ao ImprovMX, corrijo os aliases e te devolvo os valores DNS exatos para colar no painel da Lovable.
