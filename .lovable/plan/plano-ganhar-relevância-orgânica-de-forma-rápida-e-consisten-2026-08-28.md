# Plano: ganhar relevância orgânica de forma rápida e consistente

## Situação atual (verificada)

- O Search Console confirma: `https://certidaodeobjetoepe.org` está **"Enviada e indexada"**, canônica correta, robots liberado, rastreada como mobile em 26/08/2026.
- Desempenho de 29/07 a 25/08: **0 cliques e 0 impressões reportados** — normal, porque a coleta de impressões só começou em 26/08.
- O site já tem sitemap dinâmico (home, /solicitar, /acompanhar, TJSP, TRF1–TRF6, 27 UFs, tribunais, blog e categorias), robots.txt correto e ~41 artigos de blog.

Ou seja: a base técnica está pronta. O que falta é **cobertura de propriedade no Search Console, profundidade de conteúdo e sinais de autoridade**.

## O que farei (etapas)

### 1. Search Console — cobertura completa das variações
- Verificar e adicionar a propriedade de domínio (`sc-domain:certidaodeobjetoepe.org`), que cobre `www`, sem `www`, http e https de uma vez.
- Confirmar que `www.certidaodeobjetoepe.org` redireciona 301 para o domínio principal (evita conteúdo duplicado).
- Reenviar o sitemap na propriedade escolhida e conferir o status de processamento.

### 2. Cobertura de indexação das páginas internas
- Auditar quais URLs do sitemap já estão indexadas e quais não estão.
- Corrigir páginas com conteúdo raso ou muito parecido entre si (UFs e tribunais), que é o motivo mais comum de "Descoberta — não indexada".
- Reforçar links internos: home e /certidao-de-objeto-e-pe apontando para os hubs de UF, tribunais e blog; cada artigo linkando para a página de solicitação e para 2–3 artigos relacionados.

### 3. Conteúdo que captura busca de intenção alta (ganho rápido)
Criar/expandir páginas que respondem exatamente ao que quem precisa da certidão pesquisa:
- "Como pedir certidão de objeto e pé" (passo a passo, prazos, documentos necessários).
- "Quanto custa certidão de objeto e pé" (tabela de preços transparente, prazos, o que está incluso).
- "Certidão de objeto e pé para concurso público / licitação / imóvel / visto" (páginas por finalidade).
- FAQ ampliada com perguntas reais, marcada com FAQPage.
Cada página com título, meta description, H1 único e um CTA claro para /solicitar.

### 4. Diferenciação das páginas por estado e tribunal
- Adicionar em cada UF/tribunal informação genuinamente específica: nome do tribunal, prazos típicos, comarcas principais, particularidades do sistema (PJe, eSAJ, Projudi).
- Isso transforma páginas quase duplicadas em páginas indexáveis e rankeáveis.

### 5. Sinais de confiança (E-E-A-T)
- Página "Sobre" com CNPJ, endereço, responsável e política de reembolso.
- Depoimentos reais somente se você fornecer (não invento nenhum).
- Dados estruturados: Organization com contato e endereço, Service com preço, BreadcrumbList em todas as páginas internas.

### 6. Performance e Core Web Vitals
- Medir LCP/CLS no mobile na home e em /solicitar e corrigir o que estiver acima do limite (imagens, fontes, JS inicial).

### 7. Monitoramento contínuo
- Após ~2 semanas, revisar no Search Console: consultas que já geram impressão, páginas com posição 11–20 (as mais fáceis de subir para a página 1) e erros de rastreamento — e otimizar títulos/conteúdo dessas páginas primeiro.

## Detalhes técnicos

- Sitemap: `src/routes/sitemap[.]xml.ts` (server route dinâmica) — novas páginas entram nas `entries`.
- Conteúdo de UF/tribunal/blog: `src/lib/estados-seo.ts`, `src/lib/tribunais.ts`, `src/lib/trf-seo.ts`, `src/lib/blog/*`.
- Metadados por rota via `head()` do TanStack Router; JSON-LD injetado no `head` da rota correspondente.
- Nenhuma alteração em preços, checkout ou fluxo de solicitação.

## Expectativa realista

Indexação de novas páginas: dias a 2 semanas. Primeiras impressões consistentes: 2–4 semanas. Cliques em volume: 1–3 meses, com publicação contínua. Não existe caminho legítimo mais rápido que isso.
