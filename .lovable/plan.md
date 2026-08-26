# Blog de autoridade para ranquear em "Certidão de Objeto e Pé"

Objetivo: transformar o site em referência nacional do tema, cobrindo todos os tribunais e as matérias correlatas que o estudo enviado aponta como demanda (18.100 buscas/mês no termo principal, ~315 mil no ecossistema).

## Arquitetura (modelo silo)

```text
/blog                         hub do blog, listagem e busca por categoria
/blog/[categoria]             conceito | tribunais | ramos | usos | documentos
/blog/[slug]                  artigo
/tribunais                    índice de todos os tribunais
/tribunais/[sigla]            página por tribunal (tjsp, tjrj, trf3, trt2...)
```

As páginas já existentes por estado (/certidao-de-objeto-e-pe/[uf]) e a de TJSP continuam como estão e passam a receber links dos artigos e das páginas de tribunal.

## Cobertura de tribunais

Uma página dedicada para cada um, com sistema processual usado (e-SAJ, PJe, Projudi, eproc), prazo médio, comarcas principais, como pedir e CTA:

- 27 Tribunais de Justiça estaduais (TJSP, TJRJ, TJMG, TJBA, TJPE, TJDFT, TJPR, TJRS, TJSC, TJGO, TJCE, TJMT, TJMS, TJES, TJPA, TJAM, TJMA, TJPB, TJRN, TJAL, TJSE, TJPI, TJTO, TJRO, TJAC, TJAP, TJRR)
- 6 Tribunais Regionais Federais (TRF1 a TRF6)
- 24 Tribunais Regionais do Trabalho (TRT1 a TRT24)
- Tribunais superiores e especiais: STF, STJ, TST, STM, TSE e Justiça Militar estadual

## Matérias do blog (clusters)

1. **Conceito / topo de funil** — o que é a certidão, para que serve, o que aparece nela, validade, diferença para inteiro teor, para certidão narratória, para nada consta e para certidão criminal.
2. **Ramos da Justiça** — objeto e pé cível, criminal, trabalhista, federal, família, execução fiscal, juizado especial, militar.
3. **Como emitir por tribunal** — guias passo a passo por sistema (e-SAJ, PJe, Projudi, eproc) e por tribunal.
4. **Usos práticos** — gerenciadora de risco e motorista, compra e venda de imóvel, financiamento, licitação, concurso público, visto e imigração, admissão em emprego, due diligence empresarial.
5. **Dúvidas frequentes / cauda longa** — prazos, custos e taxas, como emitir de graça, processo sigiloso, processo arquivado, processo antigo em papel, certidão em nome de terceiro, autenticidade e validação.

Entrega inicial: todas as páginas de tribunal + 30 artigos completos (1.000–1.600 palavras cada), com estrutura pensada para snippet: resposta direta no primeiro parágrafo, sumário, subtítulos em pergunta, tabela de prazos/sistemas, checklist de documentos e CTA para /solicitar e WhatsApp.

## SEO técnico

- head() próprio em cada rota: title, description, canonical absoluto, hreflang pt-BR, og e twitter.
- JSON-LD: `Article` + `BreadcrumbList` + `FAQPage` nos artigos; `LegalService` e `FAQPage` nas páginas de tribunal; `Blog`/`ItemList` no hub.
- Links internos obrigatórios: artigo → tribunal → estado → /solicitar, e blocos "leia também" entre artigos do mesmo cluster.
- Sitemap atualizado automaticamente a partir dos dados do blog e dos tribunais.
- Blog no menu do cabeçalho e no rodapé.

## Expectativa realista

O termo principal tem dificuldade ~42% e o domínio é novo: conteúdo bem estruturado costuma começar a ranquear em cauda longa em 4–8 semanas e disputar o topo do termo principal em alguns meses, com publicação contínua. Primeiro lugar não é garantido por ninguém — a estratégia aqui é a que maximiza a chance.

## Detalhes técnicos

- Conteúdo em módulos tipados: `src/lib/blog/posts.ts` (artigos), `src/lib/blog/categorias.ts`, `src/lib/tribunais.ts`, com corpo em blocos estruturados (parágrafo, lista, tabela, callout, FAQ) renderizados por um componente, evitando HTML solto.
- Rotas TanStack: `blog.index.tsx`, `blog.categoria.$slug.tsx`, `blog.$slug.tsx`, `tribunais.index.tsx`, `tribunais.$sigla.tsx`.
- `src/routes/sitemap[.]xml.ts` passa a iterar posts, categorias e tribunais.
- Sem alterações no fluxo de pedido, pagamento ou back office.
