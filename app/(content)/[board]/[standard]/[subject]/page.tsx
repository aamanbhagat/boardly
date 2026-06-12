import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildContentBreadcrumb,
  courseJsonLd,
  itemListJsonLd,
} from "@/lib/seo/structured-data";
import { buildSubjectMetadata } from "@/lib/seo/metadata";
import {
  getAllSubjectRoutes,
  getSubjectWithChapters,
} from "@/lib/db/queries";
import { parseClassSegment, chapterPath } from "@/lib/seo/slugs";

type Params = Promise<{
  board: string;
  standard: string;
  subject: string;
}>;

export async function generateStaticParams() {
  try {
    const rows = await getAllSubjectRoutes();
    if (rows.length === 0)
      return [
        { board: "__placeholder__", standard: "class-1", subject: "_" },
      ];
    return rows.map((r) => ({
      board: r.boardSlug,
      standard: `class-${r.classNumber}`,
      subject: r.subjectSlug,
    }));
  } catch {
    return [{ board: "__placeholder__", standard: "class-1", subject: "_" }];
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  const { board, standard, subject } = await params;
  const classNumber = parseClassSegment(standard);
  if (!classNumber) return {};
  const data = await getSubjectWithChapters(board, classNumber, subject).catch(
    () => null
  );
  if (!data) return {};
  return buildSubjectMetadata(
    data.board,
    data.standard,
    data.subject,
    data.chapters.length
  );
}

export default async function SubjectPage({ params }: { params: Params }) {
  const { board, standard, subject } = await params;
  const classNumber = parseClassSegment(standard);
  if (!classNumber) notFound();
  const data = await getSubjectWithChapters(board, classNumber, subject).catch(
    () => null
  );
  if (!data) notFound();

  const breadcrumb = buildContentBreadcrumb({
    board: data.board,
    standard: data.standard,
    subject: data.subject,
  });

  return (
    <main id="main" className="flex-1">
      <Container className="py-10 lg:py-14">
        <Breadcrumb items={breadcrumb} />
        <header className="mt-8 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {data.chapters.length} chapters
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {data.subject.name} {data.standard.name} {data.board.name} Solutions
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">
            Step-by-step solutions for all {data.chapters.length}{" "}
            {data.subject.name} chapters in {data.standard.name} (
            {data.board.name}). Every exercise solved with detailed working.
          </p>
        </header>

        <section aria-labelledby="chapters" className="mt-12">
          <h2
            id="chapters"
            className="mb-6 font-display text-2xl font-semibold"
          >
            Chapters
          </h2>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={chapterPath(data.board, data.standard, data.subject, chapter)}
                  className="group flex h-full items-start gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                >
                  <span
                    aria-hidden
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-base font-semibold text-primary"
                  >
                    {chapter.chapterNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                      {chapter.name}
                    </div>
                    {chapter.description ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-muted">
                        {chapter.description}
                      </p>
                    ) : null}
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <JsonLd
          data={courseJsonLd({
            board: data.board,
            standard: data.standard,
            subject: data.subject,
          })}
          id="ld-course"
        />
        <JsonLd
          data={itemListJsonLd({
            name: `${data.subject.name} chapters`,
            items: data.chapters.map((c) => ({
              name: c.name,
              url: chapterPath(data.board, data.standard, data.subject, c),
            })),
          })}
          id="ld-chapter-list"
        />
      </Container>
    </main>
  );
}
