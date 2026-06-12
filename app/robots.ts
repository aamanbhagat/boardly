import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/auth/",
          "/account",
          "/bookmarks",
        ],
      },
      // Block aggressive AI/LLM crawlers from training on our content.
      // Note: Google-Extended is intentionally NOT blocked — it controls
      // whether our content can power Google AI Overview citations, which
      // are an organic traffic source.
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "Claude-Web", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
    ],
    sitemap: `${siteUrl()}/sitemaps.xml`,
    host: siteUrl(),
  };
}
