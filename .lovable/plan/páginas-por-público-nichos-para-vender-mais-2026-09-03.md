# Páginas por público (nichos) para vender mais

Hoje o site tem páginas por estado, por tribunal, guias e blog — mas nenhuma página que fale a língua de quem realmente precisa da certidão ("meu processo apareceu no cadastro", "fui bloqueado no aplicativo", "preciso registrar candidatura"). A proposta é criar uma nova família de páginas de venda por público, reaproveitando o mesmo motor de conteúdo já usado nos guias.

## Estrutura

- Hub: `/certidao-de-objeto-e-pe/para` — lista todos os públicos atendidos.
- Página por público: `/certidao-de-objeto-e-pe/para/<publico>`.

Cada página tem: título e H1 com a dor do público, resumo, "quando você precisa", passo a passo, prazos e preços (mesma tabela oficial do site), FAQ específico, prova de uso oficial (TSE/TRE, CRECI, OAB, tribunais) quando aplicável, e CTA direto para `/solicitar`.

## Fase 1 — os 5 nichos de maior volume (+ eleições)

1. `caminhoneiro` — motorista de caminhão bloqueado por gerenciadora de risco
2. `motorista-de-aplicativo` — conta bloqueada em Uber/99 por apontamento judicial
3. `concurso-publico` — investigação social e vida pregressa (PM, PC, PF, PRF, penal, bombeiros, guardas)
4. `candidato-eleicoes-2026` — registro de candidatura com certidão criminal positiva
5. `advogado` — terceirização do pedido para escritórios (B2B)
6. `compra-e-venda-de-imovel` — due diligence de vendedor com processo

## Fase 2 — ampliação (mesma estrutura, só conteúdo novo)

`entregador`, `certidao-criminal-positiva`, `processo-arquivado`, `licitacao`, `empresa-e-socios`, `financiamento`, `rh-e-compliance`, `oab`, `corretor-de-imoveis`, `recuperacao-judicial`, `inventario`, `processo-trabalhista`.

## Posicionamento

O texto de topo de cada página parte do gatilho real ("apareceu um processo no seu nome?") e só depois nomeia o documento, para captar tanto quem já conhece o termo quanto quem não conhece.

Regra de conteúdo: nenhuma afirmação sobre exigência de órgão entra na página sem fonte oficial verificável. Onde a exigência varia (imigração, marketplaces), o texto diz "pode ser solicitado", sem prometer obrigatoriedade.

## Ligações internas

- Home e `/guias` ganham um bloco "Para o seu caso" apontando ao hub.
- Cada página de público linka 3 páginas irmãs, o guia de como solicitar e a página do tribunal/estado quando fizer sentido.
- Todas as URLs novas entram no `sitemap.xml`.

## Detalhes técnicos

- Novo módulo `src/lib/publicos-seo.ts` com a interface `PublicoSeo` (slug, título, h1, descrição, resumo, gatilhos, seções, faq, fontes) e o `Map` por slug — mesmo padrão de `src/lib/guias-seo.ts`.
- Rotas `src/routes/certidao-de-objeto-e-pe.para.index.tsx` e `src/routes/certidao-de-objeto-e-pe.para.$slug.tsx` (segmento estático `para` tem prioridade sobre a rota `$uf` existente).
- `head()` por página: title, description, og/twitter, canonical, hreflang; JSON-LD `BreadcrumbList` + `FAQPage`, e `Service` com `offers` usando os preços de `src/lib/site.ts`.
- Reaproveitar `PageShell`, `AlternativasContato` e o layout de `guias.$slug.tsx`; `notFound()` para slug inexistente.
- `src/routes/sitemap[.]xml.ts`: acrescentar o hub e o `map` de `PUBLICOS_SEO`.
- Sem mudanças em banco, pagamento ou formulário.

## Verificação

Typecheck e abertura das novas páginas no preview, conferindo H1, FAQ, links internos e presença no `sitemap.xml`.
