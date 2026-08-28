# Caixa de entrada contato@certidaodeobjetoepe.org (encaminhamento para o Gmail)

Objetivo: qualquer e-mail enviado para contato@certidaodeobjetoepe.org cai automaticamente na sua caixa do Gmail (certidaoobjetoepe@gmail.com), sem contratar caixa postal paga.

## Como vai funcionar

```text
cliente -> contato@certidaodeobjetoepe.org -> encaminhador (ImprovMX) -> certidaoobjetoepe@gmail.com
```

O domínio foi comprado pela Lovable, então os registros de DNS são adicionados direto no painel do projeto (Configurações do projeto > Domínios > menu ⋯ > Configurar > Gerenciar registros DNS).

## Passos que você faz (eu te guio com os valores exatos)

1. Criar conta gratuita no ImprovMX e cadastrar o domínio certidaodeobjetoepe.org, com alias `contato` apontando para certidaoobjetoepe@gmail.com.
2. Adicionar no painel de DNS da Lovable os 2 registros MX e o registro TXT (SPF) que o ImprovMX indicar.
3. Aguardar a verificação (normalmente minutos, até 24h) e fazer um teste enviando um e-mail para contato@certidaodeobjetoepe.org.
4. Opcional: no Gmail, configurar "Enviar e-mail como" contato@certidaodeobjetoepe.org via SMTP do ImprovMX, para responder com o endereço do domínio.

Observação: o encaminhamento é só de entrada. Os e-mails automáticos do site continuam saindo pelo remetente do domínio já verificado.

## O que eu altero no site

- Trocar o e-mail de contato exibido (hoje certidaoobjetoepe@gmail.com) por contato@certidaodeobjetoepe.org em todas as páginas, rodapé, páginas de contato/FAQ e templates de e-mail.
- Usar contato@certidaodeobjetoepe.org como endereço de resposta (reply-to) dos e-mails enviados ao cliente, mantendo o remetente atual.
- Incluir contato@certidaodeobjetoepe.org na lista que recebe as notificações internas de novos pedidos, mantendo os endereços atuais como backup.

## Detalhes técnicos

- `src/lib/site.ts`: `EMAIL_CONTATO` passa a ser `contato@certidaodeobjetoepe.org`; demais telas já leem essa constante.
- `src/lib/pedidos.server.ts`: adicionar o novo endereço à lista de destinatários administrativos e definir reply-to nos envios ao cliente.
- Templates de e-mail: substituir menções ao Gmail pelo novo endereço.
- Nenhuma mudança em preços, checkout ou fluxo de solicitação.

## Verificação

- Typecheck e build.
- Conferência visual do rodapé e páginas de contato.
- Teste de entrega enviando mensagem para contato@certidaodeobjetoepe.org depois que o DNS propagar.
