import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every request except:
     * - _next/static, _next/image, favicon, manifest, robots, sitemap
     * - api/og (we don't need session there and it's edge)
     * - public file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|sitemaps.xml|api/og|api/revalidate|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
