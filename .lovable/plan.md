# Auditoria de lacunas — MCP listar_pedidos (somente leitura)

## Evidências reais por arquivo

| Arquivo | Teste | O que prova (com banco simulado) |
|---|---|---|
| `src/lib/mcp/access.test.ts:5` | "autoriza equipe administrativa: admin/equipe" | regra de papel → staff |
| `src/lib/mcp/access.test.ts:8` | "nega acesso geral ao operador" | operador → denied |
| `src/lib/mcp/access.test.ts:11` | "limita clientes ao caminho de pedidos próprios" | sem papel → customer |
| `src/lib/mcp/tools/list-orders.test.ts:34` | "cliente sempre filtrado pelo próprio user_id" | filtro `user_id` aplicado |
| `src/lib/mcp/tools/list-orders.test.ts:40` | "operador é recusado" | handler lança erro |
| `src/lib/mcp/tools/list-orders.test.ts:45` | "não retorna dados pessoais" | saída só com 5 campos |
| `src/lib/mcp/tools/list-orders.test.ts:51` | "equipe e admin não recebem filtro por user_id" | staff sem filtro extra |
| `src/lib/mcp/tools/list-orders.test.ts:59` | "aceita os estados reais emitido e gratuito..." | enum aceita 9 estados e rejeita "inventado" |
| `src/lib/mcp/tools/list-orders.test.ts:66` | "filtro de status chega à consulta" | `eq("status", ...)` |
| `src/lib/oauth-return-path.test.ts:5,8` | retorno local preservado; 5 redirecionamentos externos recusados | proteção do `next` |

Comandos executados nesta sessão (saída registrada):
- `bunx vitest run` → "Test Files 14 passed, Tests 157 passed" (todos os testes do projeto, não só MCP).
- `bunx tsgo --noEmit` → código de saída 0.
- `bun run build` → código de saída 0, nitro "You can deploy this build".
- `curl` POST `/mcp` em produção: sem token, token inventado e chave pública → 401.

## Correção do relato anterior
- **Status inválido:** coberto por teste automatizado real (linha 59, "inventado" rejeitado).
- **Limite 51:** NÃO há teste automatizado. A recusa observada veio da validação do próprio assistente antes de enviar a chamada, não do servidor publicado.
- **RLS:** só leitura das políticas; nenhum teste executa as políticas com contas reais.

## Cenários ainda sem teste
1. `limite` fora de 1–50 e `offset` fora de 0–10000 (validação do schema).
2. `protocolo` vazio/>80 caracteres e conversão para maiúsculas.
3. Handler sem `userId` (deve recusar).
4. Falha ao ler papéis → erro "Não foi possível verificar suas permissões".
5. Erro na consulta de pedidos → mensagem genérica, sem detalhes internos.
6. Paginação (`range(offset, offset+limite-1)`).
7. Verificação do token no servidor (issuer, audiência, exigência de `client_id`) — só provado por curl manual, sem teste automatizado.
8. RLS real no banco: cliente A não vê pedidos do cliente B; operador sem acesso; staff vê todos — exige contas reais.
9. Fluxo OAuth completo (login → Aprovar/Recusar → retorno) — exige pessoa.

## Proposta (só após aprovação)
- Adicionar em `src/lib/mcp/tools/list-orders.test.ts` testes para os itens 1–6 (simulados, sem banco, sem contas). Nenhuma mudança de produção.
- Itens 7–9 permanecem manuais ou exigem autorização explícita para criar contas de teste.
