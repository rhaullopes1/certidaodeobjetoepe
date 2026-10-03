# Auditoria: erro ao abrir o pedido entregue (TESTE-PDF-OPERADOR-0002)

## Causa raiz (confirmada no navegador)

Erro reproduzido no preview, logado como administrador: Admin > Entregas, clique no cartão TESTE-PDF-OPERADOR-0002. A página do pedido quebra com:

```text
TypeError: (ops.data ?? []).map is not a function
  at EnviarParaOperacao (src/components/admin/operacao-admin.tsx)
```

Duas consultas diferentes usam o mesmo nome de cache, `["operadores"]`, em `src/components/admin/operacao-admin.tsx`:

- `useOperadoresMap()`, usada em Entregas para mostrar o nome do operador no cartão, guarda um **Map**.
- `BotaoEnviarOperacao` (Entregas) e `EnviarParaOperacao` (detalhe /admin/$protocolo) leem a mesma chave esperando uma **lista**, e chamam `.map` / `.find` nela.

Ao sair de Entregas para o detalhe, o cache já contém o Map. `Map.map` não existe, e a seção "Operação" derruba a página inteira antes de os anexos aparecerem.

- **Tipo do erro:** frontend (colisão de chave de cache do React Query). O TypeScript não detecta porque cada consulta tem seu próprio tipo.
- **Não é** banco, RPC, RLS nem storage. Conferido: a atribuição está em "concluido", o PDF está registrado e o arquivo existe no armazenamento. Não há erros de servidor nos logs.
- **Origem:** começou com a melhoria visual dos cartões de Entregas (nome do operador no cartão, commit ecefd1a), **não** com o fluxo de PDF.
- **Impacto: alto para o administrador.** Depois de abrir Entregas, qualquer detalhe de pedido falha até recarregar a página. "Enviar para operação" em Entregas também pode falhar se a lista de nomes carregar primeiro. Não há risco a dados nem a pagamentos.

## Erro relacionado encontrado

Há a mesma colisão com `["operacao-ativas"]`:

- `useAtribuicoesAtivas()`, na lista de Pedidos, guarda pedido → etapa (texto).
- `useAtribuicoesOperacao()`, em Entregas, guarda pedido → atribuição (objeto).

Indo de Entregas para Pedidos, o selo "Operação" recebe um objeto no lugar do texto e pode mostrar a etapa errada ou quebrar.

## Painel do operador (/operacao/$id)

- A inspeção do código e do banco não mostrou defeito: as consultas de detalhe, histórico e anexos e a leitura do arquivo continuam liberadas para operações concluídas e ainda não validadas.
- Não consegui entrar como o advogado, porque essa sessão exige sua aprovação, que não estava disponível. Se o erro também acontece na conta do operador, isso ainda precisa ser confirmado.
- Ponto menor: "abrir anexo" abre a nova aba só depois de gerar o link. Alguns navegadores, como o Opera usado no teste, podem bloquear essa aba como pop-up. O link não abre, mas não aparece erro na tela.

## Correção proposta (somente após sua aprovação)

1. Separar as chaves de cache: `["operadores","mapa"]` para o Map e `["operadores","lista"]` para a lista. Fazer o mesmo com `["operacao-ativas","etapas"]` e `["operacao-ativas","detalhe"]`, e atualizar as invalidações para o prefixo comum.
2. Opcional: abrir o anexo de forma compatível com bloqueador de pop-up (abrir a aba no clique e depois apontar para o link).
3. Teste no navegador: Entregas → detalhe do TESTE-PDF-OPERADOR-0002 → abrir o PDF; Entregas → Pedidos.
4. Rodar verificação de tipos, testes e build. Sem publicar.

Sem mudanças em banco, dados, pagamentos, Ads, cores ou luzinhas de Entregas.
