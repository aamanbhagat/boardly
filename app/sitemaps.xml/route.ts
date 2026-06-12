import { generateSitemaps } from "@/app/sitemap";
import { siteUrl } from "@/lib/utils";

// Sitemap index at /sitemaps.xml (the framework already owns /sitemap.xml
// via app/sitemap.ts; with generateSitemaps the shards live at
// /sitemap/<id>.xml). robots.ts points search engines here so they can
// discover every shard.
export async function GET() {
  const shards = await generateSitemaps();
  const base = siteUrl();
  const now = new Date().toISOString();
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...shards.map(
      (s) =>
        `  <sitemap><loc>${base}/sitemap/${s.id}.xml</loc><lastmod>${now}</lastmod></sitemap>`
    ),
    "</sitemapindex>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
