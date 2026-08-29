# Ajustes no formulário de solicitação

## 1. Liberar cadastros (sem bloqueio de senha fraca)
Desativar a proteção contra senhas vazadas na configuração de autenticação do backend, para que senhas simples (mínimo padrão) sejam aceitas no cadastro feito durante a solicitação. As mensagens de erro específicas continuam funcionando para os demais casos (e-mail inválido, conta já existente, limite de tentativas).

Observação: isso reduz a segurança das contas dos clientes, mas atende ao pedido de não travar o cadastro.

## 2. Campo Observações
Remover o texto de exemplo "Vara, comarca, nome das partes ou qualquer detalhe que ajude na localização." do campo, deixando-o vazio.

## 3. Máscara automática do número do processo
Aplicar formatação automática enquanto o cliente digita, no padrão oficial CNJ:

```text
0000000-00.0000.0.00.0000
```

- Vale para o processo principal e para as certidões adicionais.
- Apenas dígitos são aceitos; pontos, hífen e agrupamentos são inseridos automaticamente, igual ao campo de CPF.
- A validação atual do número continua valendo (a verificação já ignora a pontuação), então pedidos existentes e o backend não são afetados.

## Detalhes técnicos
- `supabase--configure_auth` com `password_hibp_enabled: false`.
- `src/routes/solicitar.tsx`: remover o `placeholder` das observações; aplicar `mascararProcesso` nos handlers `atualizarPrincipal`/`atualizarExtra` e usar `inputMode="numeric"`.
- `src/lib/pedidos.schema.ts`: adicionar helper `mascararProcesso` ao lado de `mascararCPF`, sem alterar `numeroProcessoValido`.
