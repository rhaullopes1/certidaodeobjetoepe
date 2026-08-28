# Plano: adicionar Google e TikTok às redes sociais do site

## Contexto
As redes sociais do projeto (YouTube, Instagram, Facebook) já estão centralizadas na constante `src/lib/site.ts` e replicadas no rodapé (`src/components/site/page-shell.tsx`) e no schema `Organization` de `src/routes/__root.tsx`. O usuário solicitou incluir:

- Conta do Google / Google Business: `https://share.google/Nw44tGEnb6HR84jZN`
- TikTok: `https://www.tiktok.com/@certidodeobjetoepe`

## Tarefas

1. **Centralizar URLs em `src/lib/site.ts`**
   - Adicionar `GOOGLE_PROFILE` e `TIKTOK_PROFILE` junto às demais redes sociais.

2. **Atualizar o rodapé**
   - Incluir links para Google e TikTok no footer de `src/components/site/page-shell.tsx`, usando as novas constantes.

3. **Atualizar schema estruturado `Organization`**
   - Incluir as duas novas URLs em `sameAs` dentro do JSON-LD de `src/routes/__root.tsx`.

4. **Verificar outros componentes sociais**
   - Conferir se `src/components/site/alternativas-contato.tsx` ou outro componente exibe ícones/links sociais; se sim, replicar as novas redes lá também.

5. **Validar**
   - Rodar `bunx tsgo --noEmit` para garantir que não há erros de tipo.
   - Verificar visualmente o rodapé e os metadados no preview.
