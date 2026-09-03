export const ADSENSE_CLIENT = "ca-pub-5483844450043006";

/**
 * Script da biblioteca do AdSense (auto ads).
 * Espalhar em `head().scripts` das rotas de blog/guias para veicular anúncios
 * apenas nessas páginas, sem afetar o funil de conversão.
 */
export const adsenseScripts = [
  {
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
    async: true,
    crossOrigin: "anonymous" as const,
  },
];
