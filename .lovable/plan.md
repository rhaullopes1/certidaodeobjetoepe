# E-mail contato@certidaodeobjetoepe.org

## Parte 1 — Caixa de entrada (fora do código)
O Lovable envia e-mails pelo domínio, mas **não cria caixa postal**. Para receber mensagens em `contato@certidaodeobjetoepe.org` é preciso contratar um serviço de e-mail (Google Workspace, Zoho Mail — tem plano gratuito para 1 domínio, Microsoft 365 etc.) e adicionar os registros **MX** desse provedor no domínio raiz `certidaodeobjetoepe.org`.

Isso não conflita com o envio atual: a delegação do Lovable está no subdomínio `noreply.certidaodeobjetoepe.org`, então os MX do domínio raiz ficam livres para o provedor escolhido.

Passos (você faz no registrador/DNS):
1. Criar a conta `contato@certidaodeobjetoepe.org` no provedor escolhido.
2. Adicionar os registros MX (e SPF/DKIM que o provedor indicar) no domínio raiz.
3. Aguardar propagação (até 72h, normalmente minutos).

Posso orientar registro por registro assim que você escolher o provedor.

## Parte 2 — Alterações no site (o que eu faço agora)

1. `src/lib/site.ts`: `EMAIL_CONTATO` passa a ser `contato@certidaodeobjetoepe.org`.
   - Isso já atualiza automaticamente o bloco de contatos alternativos exibido na home, rodapé e demais páginas.
2. `src/lib/pedidos.server.ts`: incluir `contato@certidaodeobjetoepe.org` na lista de destinatários das notificações internas de novos pedidos (mantendo os dois Gmails até a caixa nova estar ativa).
3. `src/lib/email-templates/send-email.ts`: definir `contato@certidaodeobjetoepe.org` como **reply-to padrão** dos e-mails enviados ao cliente, para que as respostas cheguem à nova caixa. O remetente visível continua `noreply@certidaodeobjetoepe.org` (domínio já verificado).
4. Revisar os templates de e-mail (`src/lib/email-templates/*`) e trocar qualquer menção ao Gmail pelo novo endereço.

## Observação
Enquanto a caixa `contato@` não existir de fato, as respostas dos clientes não serão entregues. Por isso os Gmails atuais permanecem recebendo as notificações internas até você confirmar que a caixa está funcionando.

## Validação
- `bunx tsgo --noEmit`
- Conferir rodapé/contatos no preview e o preview dos templates de e-mail.
