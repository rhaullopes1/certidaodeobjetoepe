# Adicionar Google e TikTok ao rodapé da home

## Situação atual
As URLs já existem em `src/lib/site.ts` (`GOOGLE_PROFILE`, `TIKTOK_PROFILE`), já aparecem no `sameAs` do JSON-LD e no rodapé compartilhado (`page-shell.tsx`). Porém o rodapé da página inicial (`src/routes/index.tsx`) — o da imagem, com o bloco CONTATO — lista apenas YouTube, Instagram e Facebook.

## O que fazer
Em `src/routes/index.tsx`, na coluna "Contato" do rodapé, logo abaixo do link do Facebook:

1. Importar `GOOGLE_PROFILE` e `TIKTOK_PROFILE` de `@/lib/site`.
2. Adicionar link "Google" (ícone Google em SVG, mesmo estilo dourado dos demais) apontando para `GOOGLE_PROFILE`.
3. Adicionar link "TikTok" (ícone TikTok em SVG) apontando para `TIKTOK_PROFILE`.
4. Manter exatamente o mesmo padrão visual: `mt-3 flex items-center gap-2`, ícone `h-5 w-5 text-gold`, `target="_blank"`, `rel="noopener noreferrer"` e `aria-label` descritivo.

Apenas alteração de apresentação; nada de lógica, preços ou back-end.

## Validação
- `bunx tsgo --noEmit`
- Conferir o rodapé no preview em viewport mobile.
