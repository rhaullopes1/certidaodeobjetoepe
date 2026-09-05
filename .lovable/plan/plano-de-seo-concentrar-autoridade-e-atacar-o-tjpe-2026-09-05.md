# Plano de SEO: concentrar autoridade e atacar o TJPE

## O que confirmei agora no projeto

- Não existe página dedicada ao TJPE. Hoje o assunto só aparece dentro de `/certidao-de-objeto-e-pe/pe` e `/tribunais/tjpe`. Existe página própria só para TJSP e TRF1–TRF6.
- Os dados estruturados de Organização (no cabeçalho global e na página Sobre) realmente **não têm logo**.
- Os artigos do blog realmente **não têm imagem** nos dados estruturados de Artigo.
- `/blog/para-que-serve-certidao-de-objeto-e-pe` já foi consolidado e responde com redirecionamento permanente para `/blog/o-que-e-certidao-de-objeto-e-pe`. A "falha de rastreamento" do auditor nessa URL é o próprio redirecionamento — não é erro.
- A falha de rastreamento da home eu **não consegui confirmar** como problema real: o Search Console mostra a home indexada e com impressões. Verificar isso será o primeiro passo, não uma suposição.

## Fase 1 — Arrumação

### 1.1 Página TJPE (prioridade máxima)
Criar `/certidao-objeto-e-pe-tjpe` no mesmo padrão da página do TJSP: como solicitar online, sistema processual usado no TJPE, comarcas principais, prazo, preço, passo a passo e perguntas frequentes locais. Links internos apontando para ela a partir da home, do hub de estados, da página de PE, da página de tribunais e dos artigos que citam Pernambuco.

### 1.2 Fim da canibalização
Definir uma única página oficial por intenção:

| Intenção | Página oficial |
| --- | --- |
| certidão de objeto e pé (termo principal, comercial) | `/certidao-de-objeto-e-pe` |
| o que é / para que serve | artigo "o que é certidão de objeto e pé" |
| como tirar / como solicitar | um único artigo de "como solicitar" |
| quanto custa / quanto demora | um artigo cada |
| processo arquivado, cível, criminal, trabalhista, família | um artigo por tema |

Os artigos que hoje repetem a mesma intenção são consolidados no oficial e redirecionados permanentemente para ele, saindo do sitemap. Todos os links internos passam a apontar para a página escolhida, e cada artigo aponta para a página comercial.

### 1.3 Verificar o rastreamento da home
Buscar a home como o Google a busca e conferir resposta, tempo e conteúdo entregue. Só depois disso decidir se há correção a fazer — e qual.

### 1.4 Dados estruturados
- Adicionar logo à Organização (cabeçalho global e Sobre), com a imagem já usada no site.
- Adicionar imagem aos artigos do blog e aos guias, com uma imagem de capa por artigo (usa a imagem existente do site quando o artigo não tiver a própria).

## Fase 2 — Domínio por tribunal

Depois da arrumação, páginas de alta intenção no formato do TJSP/TJPE para: TJSC, TJPR, TJRS, TJMG, TJRJ, e páginas por sistema processual (PJe, e-SAJ, eproc). Os TRFs já existem; os TRTs entram na sequência seguinte.

## Fase 3 — Autoridade

Backlinks, citações e menções externas dependem de ações fora do site (parcerias, diretórios jurídicos, perfis). Eu preparo a lista e os textos; a execução precisa de você. Não invento depoimentos nem citações.

## Ordem de execução

1. Página TJPE + links internos
2. Verificação do rastreamento da home
3. Logo na Organização e imagem nos artigos
4. Consolidação dos artigos duplicados + redirecionamentos + sitemap
5. Reforço da página principal do serviço
6. Fase 2 (demais tribunais e sistemas)

## Detalhes técnicos

- Nova rota `src/routes/certidao-objeto-e-pe-tjpe.tsx` reaproveitando o padrão de `certidao-objeto-e-pe-tjsp.tsx`; conteúdo em `src/lib/` (extensão de `tribunais.ts` ou novo módulo).
- Logo: campo `logo` no JSON-LD de Organização em `src/routes/__root.tsx` e `src/routes/sobre.tsx`, com URL absoluta.
- Imagem: campo `image` no JSON-LD de Artigo em `blog.$slug.tsx` e `guias.$slug.tsx`, mais `og:image`/`twitter:image` correspondentes.
- Consolidações via `src/lib/blog/redirecionamentos.ts` (já existente) e ajuste em `src/routes/sitemap[.]xml.ts`.
- Sem alterações em pedidos, pagamento, e-mails ou área do cliente.

## Expectativa realista

Nada disso vale no site ao vivo antes de publicar. Depois de publicar, pedir reindexação das páginas alteradas. TJPE, por já estar na posição 10, é a que tende a se mover primeiro — em semanas. O termo principal (posição ~27) leva meses e depende também da Fase 3.
