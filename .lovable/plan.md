# Adicionar Google AdSense (apenas no blog e guias)

## Situação atual
- O site é um site de produção focado em conversão (solicitação + checkout). Anúncios em `/`, `/solicitar`, `/pedido/*`, `/acompanhar` e `/minha-conta` prejudicariam a conversão.
- O usuário quer anúncios do AdSense **somente nas páginas de conteúdo** (blog e guias), que recebem tráfego orgânico e não fazem parte do funil de venda.
- Conta/verificação AdSense: `ca-pub-5483844450043006` (já verificada, segundo o usuário).
- Não existe `public/ads.txt` hoje.

## Decisão de escopo
- **Auto ads** no blog/guias: carregar o snippet do AdSense apenas nessas rotas. O AdSense posiciona os anúncios automaticamente dentro do conteúdo do blog e dos guias.
- **Sem anúncios** nas páginas de conversão (`/`, `/solicitar`, `/pedido/*`, `/acompanhar`, `/minha-conta`, `/admin/*`, tribunais, estados, etc.) — o script do AdSense não é carregado nessas rotas, então nenhum anúncio aparece.
- O snippet base do Google Ads (`AW-18411209847`, gtag) em `__root.tsx` **não é tocado**.

## O que será feito

### 1. Criar `src/lib/adsense.ts`
Módulo central com a configuração do AdSense, para evitar espalhar o ID:
```ts
export const ADSENSE_CLIENT = "ca-pub-5483844450043006";

/** Script da biblioteca do AdSense (auto ads). Espalhar em head().scripts das rotas de blog/guias. */
export const adsenseScripts = [
  {
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
    async: true,
    crossOrigin: "anonymous",
  },
];
```

### 2. Carregar o AdSense nas rotas de blog e guias
Adicionar `...adsenseScripts` ao array `scripts` do `head()` das rotas:
- `src/routes/blog.index.tsx` (hub do blog)
- `src/routes/blog.$slug.tsx` (artigos)
- `src/routes/blog.categoria.$slug.tsx` (categorias)
- `src/routes/guias.index.tsx` (hub dos guias)
- `src/routes/guias.$slug.tsx` (guias individuais)

O `head()` do TanStack/unhead adiciona a tag `<script>` ao entrar na rota e a remove ao sair, então o AdSense só fica ativo nessas páginas. Ao navegar para `/solicitar` ou `/pedido/*`, o script é removido e nenhum anúncio é exibido.

### 3. Criar `public/ads.txt`
Mesmo o site já verificado, o AdSense exige `ads.txt` na raiz do domínio para que os anúncios veiculem corretamente:
```
google.com, pub-5483844450043006, DIRECT, f08c47fec0942fa0
```
Este arquivo é servido estaticamente em `https://certidaodeobjetoepe.org/ads.txt`.

## Não será alterado
- ID do AdSense (`ca-pub-5483844450043006`).
- Tag base do Google Ads (`AW-18411209847`) em `src/routes/__root.tsx`.
- Lógica de pedidos, pagamento, checkout ou webhook.
- Layout, conteúdo ou SEO das páginas de blog/guias.
- `public/robots.txt` ou `src/routes/sitemap[.]xml.ts`.

## Validação
- `bunx tsgo --noEmit` sem erros.
- No preview: abrir `/blog` e um artigo e confirmar (via DevTools/Network) que `adsbygoogle.js` carrega; abrir `/solicitar` e `/pedido/...` e confirmar que o script **não** carrega.
- Confirmar `https://certidaodeobjetoepe.org/ads.txt` acessível após publicação.
