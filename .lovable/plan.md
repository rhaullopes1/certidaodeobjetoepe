# Concluir a caixa de entrada contato@certidaodeobjetoepe.org (ImprovMX)

## O que a tela mostra
No ImprovMX o domínio `certidaodeobjetoepe.org` ainda está com o selo vermelho **Configurar** (DNS pendente) e a segunda linha está com o campo de alias vazio, por isso o aviso "É necessário um pseudônimo". Nenhuma alteração de código é necessária — o site já exibe e usa `contato@certidaodeobjetoepe.org`.

## Passos no ImprovMX
1. Na primeira linha, confirme o alias `contato` → `certidaoobjetoepe@gmail.com` (terminar de digitar o e-mail e salvar).
2. A segunda linha ("novo-alias") só serve para criar outro encaminhamento. Se não quiser um segundo alias, deixe-a em branco e ignore — o aviso some. Se quiser tudo o que chegar no domínio, crie o alias `*` → seu Gmail.

## Passos no DNS (Configurações do projeto → Domínios → ⋯ → Configurar → Gerenciar registros DNS)
Adicionar, no domínio raiz `certidaodeobjetoepe.org`:

```text
MX   @   mx1.improvmx.com   prioridade 10
MX   @   mx2.improvmx.com   prioridade 20
TXT  @   v=spf1 include:spf.improvmx.com ~all
```

Se já existir um TXT SPF, edite o existente incluindo `include:spf.improvmx.com` em vez de criar outro.

## Validação
1. Aguardar a propagação (normalmente 15 min a algumas horas) e clicar em **Configurar/Verificar** no ImprovMX até o selo ficar verde.
2. Enviar um e-mail de teste para `contato@certidaodeobjetoepe.org` e confirmar a chegada no Gmail.
3. Opcional: responder a partir do Gmail usando "Enviar como" com SMTP do ImprovMX (recurso pago) ou continuar respondendo pelo Gmail atual.

Posso verificar os registros publicados assim que você adicioná-los.
