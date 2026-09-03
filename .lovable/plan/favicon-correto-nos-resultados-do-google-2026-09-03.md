# Favicon correto nos resultados do Google

Nas buscas o Google ainda mostra um ícone genérico em vez do seu logo. O que encontrei no site publicado:

- O ícone atual existe e é entregue em `/favicon.png` (64x64), mas o endereço `/favicon.ico` — que o robô de favicons do Google procura primeiro — responde "não encontrado".
- O tamanho 64x64 não é o recomendado pelo Google (múltiplos de 48px: 48, 96, 144, 192).
- O logo atual tem muito texto ("CERTIDÃO DE OBJETO E PÉ" dentro do selo). Em 16px na busca isso vira um borrão, mesmo depois de indexado.

## O que farei

1. Criar `/favicon.ico` real (48x48 + 32x32 + 16x16 dentro do mesmo arquivo), a partir do logo atual.
2. Gerar versões PNG em 96x96 e 192x192 e declarar todas no cabeçalho do site, junto com o `.ico`, para que Google, Bing e navegadores encontrem o ícone por qualquer caminho.
3. Manter o `apple-touch-icon` e o manifesto apontando para o mesmo ícone, sem conflito de imagens diferentes.
4. Conferir que o robots.txt não bloqueia o robô de favicons (hoje está liberado, apenas confirmo).
5. Ajustar a arte para leitura em tamanho pequeno: manter o símbolo (selo/balança) e remover o texto miúdo, preservando as cores da marca. Se preferir manter a arte exatamente como está, faço só os itens 1–4.

## Depois da publicação

O ícone da busca só muda quando o Google rebuscar o site — normalmente de alguns dias a algumas semanas. Não existe botão para forçar isso; o que acelera é publicar a correção e pedir a reindexação da página inicial no Search Console.

## Detalhes técnicos

- Novos arquivos em `public/`: `favicon.ico` (multi-resolução), `favicon-96.png`, `favicon-192.png`, gerados com `magick` a partir de `public/favicon.png`/`public/icons/icon-512.png`.
- `src/routes/__root.tsx`: entradas em `links` para `icon` (`.ico` com `sizes="any"`, 96 e 192 em PNG), `apple-touch-icon` e `manifest` — todas absolutas na raiz, aplicadas a todas as rotas.
- `public/manifest.webmanifest`: alinhar os ícones ao mesmo símbolo.
- Sem mudanças em pedidos, pagamento ou conteúdo das páginas.
