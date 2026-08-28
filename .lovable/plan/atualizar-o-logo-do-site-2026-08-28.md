# Atualizar o logo do site

Substituir o logo atual pelo novo emblema enviado (selo circular azul/dourado "Certidão de Objeto e Pé"), mantendo todos os lugares onde ele já aparece.

## O que muda

- Novo logo publicado no CDN e apontado por `src/assets/logo-certidao.png.asset.json`, substituindo o arquivo antigo.
- O logo novo passa a aparecer automaticamente em:
  - cabeçalho e rodapé da home (`src/routes/index.tsx`)
  - cabeçalho das páginas internas (`src/components/site/page-shell.tsx`)
- Favicon atualizado a partir do mesmo emblema: nova `public/favicon.png` quadrada (64×64), já referenciada em `src/routes/__root.tsx`.

## O que não muda

- Nenhum texto, layout, cor do site, fluxo de pedido, pagamento ou SEO.
- As páginas que hoje usam o ícone de balança (páginas de estado e TRF) continuam iguais, salvo pedido em contrário.

## Detalhes técnicos

1. `lovable-assets create --file /mnt/user-uploads/7E0CB00F-...png --filename logo-certidao.png` e gravar a saída em `src/assets/logo-certidao.png.asset.json` (o ponteiro antigo é removido com `lovable-assets delete`).
2. Gerar `public/favicon.png` com ImageMagick, redimensionando para 64×64 com padding transparente (sem distorcer).
3. Rodar `bunx tsgo --noEmit` e conferir a home no preview.
