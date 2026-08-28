# Concluir a caixa de entrada contato@certidaodeobjetoepe.org

## O que foi identificado
A conta ImprovMX mostra dois problemas:
- O domínio `certidaodeobjetoepe.org` ainda está com o botão vermelho **Configurar** — os registros DNS de e-mail (MX/SPF) ainda não foram adicionados.
- A segunda linha de alias está com o campo "novo-alias" vazio, gerando o erro "É necessário um pseudônimo".

## Ações que serão feitas pelo agente
1. Acessar o ImprovMX uma única vez com as credenciais enviadas no chat (não serão armazenadas/repetidas).
2. Preencher/completar o alias `contato` apontando para `certidaoobjetoepe@gmail.com`.
3. Remover ou ignorar a linha vazia de "novo-alias" para eliminar o erro.

## Ação necessária do usuário após o passo acima
No Lovable, em **Configurações do projeto → Domains → certidaodeobjetoepe.org → ⋯ → Configurar → Gerenciar registros DNS**, adicionar:

```text
MX   @   mx1.improvmx.com   10
MX   @   mx2.improvmx.com   20
TXT  @   v=spf1 include:spf.improvmx.com ~all
```

Se já houver um TXT SPF, editar o existente incluindo `include:spf.improvmx.com`.

## Validação
- Aguardar propagação e clicar em **Configurar/Verificar** no ImprovMX até o selo ficar verde.
- Enviar e-mail de teste para `contato@certidaodeobjetoepe.org` e confirmar recebimento no Gmail.
