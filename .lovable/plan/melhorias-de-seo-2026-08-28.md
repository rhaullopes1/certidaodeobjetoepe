# Melhorias de SEO

O scan atual está quase todo verde (metadados, structured data, robots, sitemap, SSR). O ganho agora vem de cobertura de conteúdo e de ajustes técnicos de crawl.

## 1. Páginas de tribunais federais (TRF1–TRF6)

Hoje os TRFs existem apenas dentro de `/tribunais/$sigla`. Criar páginas de alta intenção no mesmo formato da página TJSP, começando pelo TRF3 (110 buscas/mês, dificuldade 30 segundo Semrush):

- `/certidao-objeto-e-pe-trf3` (prioridade), depois TRF1, TRF2, TRF4, TRF5, TRF6.
- Conteúdo próprio por página: jurisdição (estados atendidos), sistema processual (PJe/eproc), prazo típico, o que a certidão informa, como enviar o número do processo, FAQ específica.
- Metadados próprios (title, description, og, canonical), schemas `Service`, `BreadcrumbList` e `FAQPage`.
- CTA direto para `/solicitar` e link para a página de tribunal correspondente.

## 2. Cobertura completa por estado (27 UFs)

Hoje há 12 estados. Completar as 15 UFs faltantes em `src/lib/estados-seo.ts`, com o mesmo padrão já usado: tribunal estadual, capital e principais comarcas, FAQ local, CTAs. Ordem por demanda (RJ/SP já cobertos primeiro; depois CE, PA, MA, RN, AL, PI, SE, RO, AC, AP, RR, TO, MS, ES conforme faltarem).

## 3. Blog e links internos

- Novos artigos de alta intenção comercial: "quanto custa certidão de objeto e pé", "quanto tempo demora", "certidão de objeto e pé x certidão de inteiro teor", "certidão de objeto e pé para concurso público", "para cartório/imóvel", "para visto e imigração".
- Interligação sistemática: cada artigo aponta para a UF e o tribunal citados; cada página de UF/tribunal aponta para 2–3 artigos relevantes.
- Bloco "conteúdo relacionado" reutilizável para não duplicar código.

## 4. Ajustes técnicos

- `public/llms.txt` listando apenas páginas públicas (home, solicitar, acompanhar, hub de estados, hub de tribunais, blog), excluindo `/auth`, `/admin`, `/minha-conta`, `/api`.
- Sitemap atualizado automaticamente com as novas rotas de TRF e UFs.
- Revisão de `lastmod`: manter apenas valores realmente específicos por página.
- Performance/Core Web Vitals: `loading="lazy"` e `width/height` em imagens fora da dobra, carregamento assíncrono das tags do Google Ads, revisão do peso da imagem hero.
- Revisão de headings (um `h1` por página) e alt text nas novas páginas.

## Detalhes técnicos

- Novas rotas em `src/routes/` seguindo o padrão de `certidao-objeto-e-pe-tjsp.tsx`; dados de conteúdo em `src/lib/` (novo `trf-seo.ts` ou extensão de `tribunais.ts`).
- `src/lib/estados-seo.ts` estendido; as rotas `certidao-de-objeto-e-pe.$uf.tsx` e o hub já geram tudo automaticamente.
- Novos posts em `src/lib/blog/posts-*.ts`, categorias já existentes.
- `src/routes/sitemap[.]xml.ts` passa a incluir as novas entradas.
- Sem mudanças em backend, pagamentos ou fluxo de pedidos.

## Entrega

Ordem sugerida: TRF3 → demais TRFs → UFs faltantes → artigos e links internos → ajustes técnicos. Publicar ao final para que o Google veja as páginas.
