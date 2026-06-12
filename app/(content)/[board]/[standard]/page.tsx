import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildContentBreadcrumb,
  itemListJsonLd,
} from "@/lib/seo/structured-data";
import { buildStandardMetadata } from "@/lib/seo/metadata";
import {
  getAllStandardRoutes,
  getStandardWithSubjects,
} from "@/lib/db/queries";
import { parseClassSegment, subjectPath } from "@/lib/seo/slugs";

type Params = Promise<{ board: string; standard: string }>;

export async function generateStaticParams() {
  try {
    const rows = await getAllStandardRoutes();
    if (rows.length === 0)
      return [{ board: "__placeholder__", standard: "class-1" }];
    return rows.map((r) => ({
      board: r.boardSlug,
      standard: `class-${r.classNumber}`,
    }));
  } catch {
    return [{ board: "__placeholder__", standard: "class-1" }];
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  const { board, standard } = await params;
  const classNumber = parseClassSegment(standard);
  if (!classNumber) return {};
  const data = await getStandardWithSubjects(board, classNumber).catch(
    () => null
  );
  if (!data) return {};
  return buildStandardMetadata(data.board, data.standard);
}

export default async function StandardPage({ params }: { params: Params }) {
  const { board, standard } = await params;
  const classNumber = parseClassSegment(standard);
  if (!classNumber) notFound();
  const data = await getStandardWithSubjects(board, classNumber).catch(
    () => null
  );
  if (!data) notFound();

  const breadcrumb = buildContentBreadcrumb({
    board: data.board,
    standard: data.standard,
  });

  const subjectAccents: Record<string, { bg: string; fg: string }> = {
    math: {
      bg: "bg-[oklch(0.94_0.04_240)] dark:bg-[oklch(0.28_0.06_240)]",
      fg: "text-[oklch(0.4_0.14_240)] dark:text-[oklch(0.85_0.12_240)]",
    },
    science: {
      bg: "bg-[oklch(0.94_0.04_165)] dark:bg-[oklch(0.28_0.06_165)]",
      fg: "text-[oklch(0.4_0.14_165)] dark:text-[oklch(0.85_0.12_165)]",
    },
    english: {
      bg: "bg-[oklch(0.94_0.04_295)] dark:bg-[oklch(0.28_0.06_295)]",
      fg: "text-[oklch(0.42_0.16_295)] dark:text-[oklch(0.85_0.13_295)]",
    },
    history: {
      bg: "bg-[oklch(0.95_0.05_60)] dark:bg-[oklch(0.28_0.06_60)]",
      fg: "text-[oklch(0.42_0.13_60)] dark:text-[oklch(0.85_0.13_60)]",
    },
    geography: {
      bg: "bg-[oklch(0.94_0.04_200)] dark:bg-[oklch(0.28_0.06_200)]",
      fg: "text-[oklch(0.4_0.12_200)] dark:text-[oklch(0.85_0.11_200)]",
    },
    language: {
      bg: "bg-[oklch(0.94_0.04_340)] dark:bg-[oklch(0.28_0.06_340)]",
      fg: "text-[oklch(0.42_0.16_340)] dark:text-[oklch(0.85_0.13_340)]",
    },
  };

  return (
    <main id="main" className="flex-1">
      <Container className="py-10 lg:py-14">
        <Breadcrumb items={breadcrumb} />
        <header className="mt-8 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.board.name} {data.standard.name} — All Subjects
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            Pick a subject to see chapter-wise textbook solutions, MCQs, and
            past papers for {data.standard.name} ({data.board.name}).
          </p>
        </header>

        <section aria-labelledby="subjects" className="mt-12">
          <h2
            id="subjects"
            className="mb-6 font-display text-2xl font-semibold"
          >
            Subjects
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.standard.subjects.map((subject) => {
              const accent = subjectAccents[subject.color ?? ""] ?? {
                bg: "bg-bg-alt",
                fg: "text-fg-muted",
              };
              return (
                <li key={subject.id}>
                  <Link
                    href={subjectPath(data.board, data.standard, subject)}
                    className="group flex h-full items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                  >
                    <span
                      aria-hidden
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-lg font-semibold ${accent.bg} ${accent.fg}`}
                    >
                      {subject.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-lg font-semibold transition-colors group-hover:text-primary">
                        {subject.name}
                      </div>
                      {subject.description ? (
                        <p className="mt-0.5 truncate text-sm text-fg-muted">
                          {subject.description}
                        </p>
                      ) : null}
                    </div>
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <JsonLd
          data={itemListJsonLd({
            name: `${data.board.name} ${data.standard.name} subjects`,
            items: data.standard.subjects.map((s) => ({
              name: s.name,
              url: subjectPath(data.board, data.standard, s),
            })),
          })}
        />
      </Container>
    </main>
  );
}
