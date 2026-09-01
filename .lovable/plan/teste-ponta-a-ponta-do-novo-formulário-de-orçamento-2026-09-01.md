# Teste ponta a ponta do novo formulário de orçamento

Objetivo: criar um cadastro real pelo formulário `/solicitar`, confirmar que a conta aparece em `/minha-conta` e que o pedido fica em "aguardando pagamento".

## O que será feito

1. Abrir `/solicitar` em um navegador automatizado (viewport de celular) e preencher um pedido real:
   - 1 processo com número CNJ válido, nome da parte e uma observação.
   - Dados do solicitante: e-mail de teste, nome completo, CPF e WhatsApp.
2. Enviar com "Solicitar Orçamento e Enviar Pedido" e registrar o protocolo gerado.
3. Conferir a tela de resumo `/pedido/<protocolo>`: processos listados com observação, valor total e botão "Gerar QR Code e Código Pix".
4. Conferir no banco que o pedido foi gravado com `status = aguardando_pagamento`, `uf`/`cidade` derivados do número do processo e as certidões em JSON.
5. Conferir que o cadastro foi criado: usuário em `auth.users`, linha correspondente em `profiles` e vínculo `pedidos.user_id` preenchido pelo gatilho de vinculação por e-mail.
6. Entrar como esse usuário e abrir `/minha-conta`, confirmando que o pedido aparece na lista de pendentes com o link de pagamento.
7. Ao final, remover os dados de teste (pedido, perfil e usuário) para não poluir o painel e as automações de e-mail.

## Detalhes técnicos

- Automação com Playwright em `/tmp/browser/`, contra `http://localhost:8080`.
- Verificações de banco por consulta de leitura nas tabelas `pedidos`, `profiles` e `auth.users`.
- Login em `/minha-conta` feito com uma sessão gerada para o usuário criado, já que o cadastro usa link mágico por e-mail (sem senha).
- Limpeza final por SQL, apagando apenas as linhas do e-mail de teste.

## Fora do escopo

- Nenhuma alteração de código; se o teste revelar um defeito, ele será reportado e corrigido em um passo seguinte.
- Nenhum pagamento real será concluído na Stripe (o teste para na geração do checkout).
