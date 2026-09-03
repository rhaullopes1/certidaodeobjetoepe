# Favicon nas buscas + 89 páginas não indexadas

## O que confirmei agora no Search Console

- A página inicial está **"Enviada e indexada"**, canônica correta, robots liberado, último rastreamento em 26/08/2026.
- Últimos 28 dias: **2 cliques e 231 impressões**, posição média 27,7. A home teve 51 impressões.
- Os dois motivos das 89 páginas (nos seus prints) são **"Detectada, mas não indexada"** e **"Rastreada, mas não indexada"** — nenhuma falha técnica, nenhum erro de rastreamento.

## 1. Reindexação da página inicial (favicon)

Isso **não pode ser feito por mim**: a API do Search Console só lê o estado da URL, não envia pedido de indexação. Quem clica é você:

1. Publicar o site (a correção do favicon ainda não está no ar).
2. Abrir o Search Console > barra de "Inspeção de URL" > colar `https://certidaodeobjetoepe.org/` > **Solicitar indexação**.

Importante: o ícone da busca é atualizado por um robô próprio do Google (favicon crawler), num ciclo separado da indexação — costuma levar de alguns dias a algumas semanas mesmo depois da reindexação. Não existe forma de forçar.

## 2. As 89 páginas não indexadas

"Detectada/Rastreada, mas não indexada" quer dizer: o Google conhece as URLs, mas ainda não achou que valem espaço no índice. É o padrão para sites novos com muitas páginas geradas a partir do mesmo modelo. O que farei para mudar isso:

**a) Diferenciar as páginas que hoje são quase iguais**
As 27 páginas de UF, as de tribunais e as de TRF seguem o mesmo esqueleto. Vou dar a cada uma conteúdo que só existe ali: nome e endereço do tribunal, sistema processual usado (eSAJ, PJe, Projudi, eproc), comarcas principais, prazo típico da região e uma FAQ com perguntas locais.

**b) Reduzir páginas de baixo valor que competem entre si**
As páginas de categoria do blog (`/blog/categoria/...`) são listas curtas e aparecem entre as não indexadas. Vou avaliar: manter só as categorias com volume real de artigos e marcar as demais como não indexáveis, mantendo os artigos no sitemap.

**c) Reforçar links internos**
Hoje muitas páginas só são alcançadas pelo sitemap. Vou criar links reais: home e `/certidao-de-objeto-e-pe` apontando para os hubs; cada artigo apontando para a UF/tribunal citado e para 2–3 artigos relacionados; cada página de UF apontando para artigos e para "Para o seu caso".

**d) Priorizar o que já tem sinal**
Suas impressões se concentram na home, `/blog` e alguns artigos. Vou melhorar título, descrição e primeiro parágrafo das páginas que já estão entre as posições 10–30 (é onde o ganho é mais rápido), incluindo `/certidao-de-objeto-e-pe/rj` e os artigos "é gratuita", "cível", "criminal".

**e) Conferir o sitemap**
Garantir que só entram páginas públicas e indexáveis, sem `/auth`, `/admin`, `/minha-conta`, e sem URLs marcadas como não indexáveis no item (b).

## Detalhes técnicos

- Conteúdo por UF/tribunal: `src/lib/estados-seo.ts`, `src/lib/tribunais.ts`, `src/lib/trf-seo.ts`.
- Meta robots por rota via `head()` do TanStack Router nas rotas de categoria do blog.
- Links internos: componente reutilizável de "conteúdo relacionado" usado em `blog.$slug.tsx`, `certidao-de-objeto-e-pe.$uf.tsx` e `tribunais.$sigla.tsx`.
- Sitemap: `src/routes/sitemap[.]xml.ts` ajustado às decisões acima.
- Sem mudanças em pedidos, pagamento ou área do cliente.

## Expectativa realista

Indexação das páginas reforçadas: de 1 a 4 semanas após a publicação. Não há botão que force indexação em massa — o que funciona é conteúdo distinto, links internos e publicação contínua.
