import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildContentBreadcrumb,
  itemListJsonLd,
} from "@/lib/seo/structured-data";
import { buildBoardMetadata } from "@/lib/seo/metadata";
import { getAllBoardSlugs, getBoardWithStandards } from "@/lib/db/queries";
import { standardPath } from "@/lib/seo/slugs";

type Params = Promise<{ board: string }>;

export async function generateStaticParams() {
  try {
    const rows = await getAllBoardSlugs();
    if (rows.length === 0) return [{ board: "__placeholder__" }];
    return rows.map((r) => ({ board: r.slug }));
  } catch {
    return [{ board: "__placeholder__" }];
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  const { board: slug } = await params;
  const data = await getBoardWithStandards(slug).catch(() => null);
  if (!data) return {};
  return buildBoardMetadata(data);
}

export default async function BoardPage({ params }: { params: Params }) {
  const { board: slug } = await params;
  const data = await getBoardWithStandards(slug).catch(() => null);
  if (!data) notFound();

  const breadcrumb = buildContentBreadcrumb({ board: data });

  return (
    <main id="main" className="flex-1">
      <Container className="py-10 lg:py-14">
        <Breadcrumb items={breadcrumb} />
        <header className="mt-8 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {data.standards.length} classes
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {data.name} Textbook Solutions
          </h1>
          {data.description ? (
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">
              {data.description}
            </p>
          ) : null}
        </header>

        <section aria-labelledby="classes" className="mt-12">
          <h2
            id="classes"
            className="mb-6 font-display text-2xl font-semibold"
          >
            Pick a class
          </h2>
          {data.standards.length === 0 ? (
            <p className="rounded-card border border-dashed border-border bg-bg-alt p-8 text-fg-muted">
              Classes for this board will appear here soon.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.standards.map((std) => (
                <li key={std.id}>
                  <Link
                    href={standardPath(data, std)}
                    className="group flex h-full items-center justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                  >
                    <div>
                      <div className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                        {std.name}
                      </div>
                      <div className="mt-0.5 text-xs uppercase tracking-wide text-fg-subtle">
                        {std.level.replace("_", " ")}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="grid h-9 w-9 place-items-center rounded-full bg-bg-alt text-fg-subtle transition-all group-hover:bg-primary group-hover:text-primary-fg"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <JsonLd
          data={itemListJsonLd({
            name: `${data.name} classes`,
            items: data.standards.map((s) => ({
              name: s.name,
              url: standardPath(data, s),
            })),
          })}
        />
      </Container>
    </main>
  );
}
