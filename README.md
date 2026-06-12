# Boardly

Production-grade educational content platform at **boardly.in**. SEO-first textbook solutions, question banks, past papers, MCQs, and notes for Indian school boards.

Stack:

- Next.js 16 App Router with **Cache Components** (`'use cache'` + `cacheLife()` + `cacheTag()`), Partial Prerendering by default, React Compiler
- React 19 + TypeScript strict
- Tailwind CSS v4 (CSS-first `@theme`) + shadcn primitives
- PostgreSQL via Neon, Drizzle ORM
- Meilisearch self-hosted
- Upstash Redis (rate-limit / feedback)
- KaTeX server-rendered math
- `schema-dts`-typed JSON-LD (FAQ, HowTo, Course, ItemList, Article, Breadcrumb, WebSite, Organization)
- `@vercel/og` dynamic OG images
- Vercel Analytics + Speed Insights, optional GA4

## Quick start

```bash
pnpm install
cp .env.example .env.local
# fill in DATABASE_URL, MEILISEARCH_HOST, MEILISEARCH_MASTER_KEY, NEXT_PUBLIC_SITE_URL
pnpm dev
```

The site renders without a database — content pages fall through to `notFound()` and the homepage shows fallbacks. Provision the DB and reindex search to fill in real content.

## Local infrastructure

The repo ships a `docker-compose.yml` for local Postgres + Meilisearch:

```bash
docker compose up -d
pnpm db:push
pnpm db:seed          # 5 boards × 12 classes × ~7 chapters × 3 exercises × 5 questions
pnpm search:reindex   # build the Meilisearch corpus from the DB
```

## Common scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Next dev server (Turbopack) |
| `pnpm build` | Production build with cacheComponents validation |
| `pnpm start` | Run the production build locally |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` | Drizzle migration from schema diff |
| `pnpm db:push` | Push the schema to the database |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:seed` | Populate the DB with structurally correct sample content |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm search:reindex` | Resync Meilisearch from the DB |

## Project layout

```
app/
  layout.tsx                          Root layout, fonts, theme, JSON-LD, analytics
  page.tsx                            Homepage
  (content)/[board]/...               Board → standard → subject → chapter → exercise
  search/                             Search page (no-index)
  api/og/                             Dynamic OG images via @vercel/og
  sitemap.ts                          generateSitemaps() shards
  robots.ts                           Bots config
components/
  layout/                             Header, Footer, Breadcrumb, ThemeToggle, SearchBar
  content/                            QuestionAnswer, ChapterSidebar, MathRenderer, SolutionActions
  seo/JsonLd                          Safe JSON-LD wrapper (escapes < > & U+2028/9)
  search/SearchControls               Client-side search input + filters
lib/
  cache.ts                            Cache lifetime profiles
  db/{schema,index,queries}.ts        Drizzle schema + cached accessors
  search/{client,query,indexer}.ts    Meilisearch wiring
  seo/{slugs,metadata,structured-data}.ts
scripts/
  seed.ts                             DB seed
  reindex-search.ts                   Search reindex
```

## URL shape

`/[board-slug]/class-[N]/[subject]/chapter-[N]-[chapter-slug]/exercise-[N.M]-[exercise-slug]`

Every URL is constructed by `lib/seo/slugs.ts` so the sitemap, breadcrumbs, internal links, and canonicals never drift.

## Cache Components

- All read accessors in `lib/db/queries.ts` use `'use cache'` with `cacheLife()` and `cacheTag()`.
- Tag convention: `boards`, `board:{slug}`, `standard:{boardSlug}/{classNumber}`, `subject:...`, `chapter:...`, `exercise:...`, `sitemap:{type}`.
- Surgical revalidation: call `updateTag('exercise:...')` from a server action when the CMS publishes a fix.
- Content routes prerender as Partial Prerender — verify with `pnpm build` (`◐` in the route table).

## Production checklist

Before going live:

1. Set `NEXT_PUBLIC_SITE_URL` to `https://boardly.in`. Canonicals, sitemap, robots, OG, and JSON-LD all read this once.
2. Provision Neon (Postgres), Upstash Redis, Meilisearch, Sentry.
3. `pnpm db:push && pnpm db:seed`, then `pnpm search:reindex`.
4. Replace seed lorem with real solution content. Google penalizes thin content.
5. Submit `/sitemaps.xml` to Google Search Console.
6. Verify each content tier with the schema validator at <https://validator.schema.org>.
7. Run Lighthouse on home + board + subject + exercise (mobile + desktop). Targets: Performance ≥ 95, SEO 100, A11y ≥ 95.

## Phase-2 work (out of scope here)

- `better-auth` + user-synced bookmarks
- Past papers, notes, MCQs as full features
- Video lectures
- Admin/CMS UI
- Discussions
