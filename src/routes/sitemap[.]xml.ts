import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ESTADOS_SEO } from "@/lib/estados-seo";
import { TRIBUNAIS } from "@/lib/tribunais";
import { CATEGORIAS, POSTS } from "@/lib/blog";
import { GUIAS_SEO } from "@/lib/guias-seo";
import { TRFS_SEO } from "@/lib/trf-seo";
import { PUBLICOS_SEO } from "@/lib/publicos-seo";


const BASE_URL = "https://certidaodeobjetoepe.org";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/solicitar", changefreq: "weekly", priority: "0.9" },
          { path: "/acompanhar", changefreq: "monthly", priority: "0.6" },
          { path: "/sobre", changefreq: "monthly", priority: "0.5" },
          { path: "/garantia", changefreq: "monthly", priority: "0.6" },
          { path: "/guias", changefreq: "weekly", priority: "0.8" },
          ...GUIAS_SEO.map((g) => ({
            path: `/guias/${g.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          { path: "/certidao-de-objeto-e-pe", changefreq: "weekly", priority: "0.8" },
          { path: "/certidao-de-objeto-e-pe/para", changefreq: "weekly", priority: "0.8" },
          ...PUBLICOS_SEO.map((p) => ({
            path: `/certidao-de-objeto-e-pe/para/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          { path: "/certidao-objeto-e-pe-tjsp", changefreq: "monthly", priority: "0.8" },
          { path: "/certidao-objeto-e-pe-tjpe", changefreq: "monthly", priority: "0.8" },
          ...TRFS_SEO.map((t) => ({
            path: t.path,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...ESTADOS_SEO.map((e) => ({
            path: `/certidao-de-objeto-e-pe/${e.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/tribunais", changefreq: "weekly", priority: "0.8" },
          ...TRIBUNAIS.map((t) => ({
            path: `/tribunais/${t.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          ...CATEGORIAS.map((c) => ({
            path: `/blog/categoria/${c.slug}`,
            changefreq: "weekly" as const,
            priority: "0.6",
          })),
          ...POSTS.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/politica-de-privacidade", changefreq: "yearly", priority: "0.3" },
          { path: "/termos-de-uso", changefreq: "yearly", priority: "0.3" },
        ];



        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
