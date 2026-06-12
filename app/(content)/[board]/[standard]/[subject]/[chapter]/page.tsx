import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ListOrdered } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildContentBreadcrumb,
  itemListJsonLd,
  articleJsonLd,
} from "@/lib/seo/structured-data";
import { buildChapterMetadata } from "@/lib/seo/metadata";
import {
  getAllChapterRoutes,
  getChapterWithExercises,
} from "@/lib/db/queries";
import {
  parseClassSegment,
  parseChapterSegment,
  exercisePath,
  chapterPath,
} from "@/lib/seo/slugs";
import { Badge } from "@/components/ui/badge";

type Params = Promise<{
  board: string;
  standard: string;
  subject: string;
  chapter: string;
}>;

const PLACEHOLDER_PARAMS = {
  board: "__placeholder__",
  standard: "class-1",
  subject: "_",
  chapter: "chapter-1-_",
};

export async function generateStaticParams() {
  try {
    const rows = await getAllChapterRoutes();
    if (rows.length === 0) return [PLACEHOLDER_PARAMS];
    return rows.slice(0, 100).map((r) => ({
      board: r.boardSlug,
      standard: `class-${r.classNumber}`,
      subject: r.subjectSlug,
      chapter: `chapter-${r.chapterNumber}-${r.chapterSlug}`,
    }));
  } catch {
    return [PLACEHOLDER_PARAMS];
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  const p = await params;
  const classNumber = parseClassSegment(p.standard);
  const ch = parseChapterSegment(p.chapter);
  if (!classNumber || !ch) return {};
  const data = await getChapterWithExercises(
    p.board,
    classNumber,
    p.subject,
    ch.chapterNumber,
    ch.slug
  ).catch(() => null);
  if (!data) return {};
  return buildChapterMetadata(
    data.board,
    data.standard,
    data.subject,
    data.chapter,
    data.exercises.length
  );
}

export default async function ChapterPage({ params }: { params: Params }) {
  const p = await params;
  const classNumber = parseClassSegment(p.standard);
  const ch = parseChapterSegment(p.chapter);
  if (!classNumber || !ch) notFound();
  const data = await getChapterWithExercises(
    p.board,
    classNumber,
    p.subject,
    ch.chapterNumber,
    ch.slug
  ).catch(() => null);
  if (!data) notFound();

  const breadcrumb = buildContentBreadcrumb({
    board: data.board,
    standard: data.standard,
    subject: data.subject,
    chapter: data.chapter,
  });

  const firstExercise = data.exercises[0];

  return (
    <main id="main" className="flex-1">
      <Container className="py-10 lg:py-14">
        <Breadcrumb items={breadcrumb} />
        <article className="mt-8">
          <header className="max-w-3xl">
            <Badge variant="soft" className="mb-4">
              Chapter {data.chapter.chapterNumber}
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {data.chapter.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">
              {data.subject.name} · {data.standard.name} · {data.board.name}
            </p>
            {data.chapter.description ? (
              <p className="mt-3 max-w-prose text-fg-muted">
                {data.chapter.description}
              </p>
            ) : null}
            {firstExercise ? (
              <Link
                href={exercisePath(
                  data.board,
                  data.standard,
                  data.subject,
                  data.chapter,
                  firstExercise
                )}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg shadow-card transition-colors hover:bg-primary-hover"
              >
                Start with Exercise {firstExercise.exerciseNumber}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </header>

          <section aria-labelledby="exercises" className="mt-12">
            <h2
              id="exercises"
              className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold"
            >
              <ListOrdered aria-hidden className="h-5 w-5 text-primary" />
              Exercises
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-sans text-sm font-semibold text-primary">
                {data.exercises.length}
              </span>
            </h2>
            {data.exercises.length === 0 ? (
              <p className="rounded-card border border-dashed border-border bg-bg-alt p-8 text-fg-muted">
                Solutions for this chapter are being added.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.exercises.map((exercise) => (
                  <li key={exercise.id}>
                    <Link
                      href={exercisePath(
                        data.board,
                        data.standard,
                        data.subject,
                        data.chapter,
                        exercise
                      )}
                      className="group flex h-full items-start gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                    >
                      <span
                        aria-hidden
                        className="rounded-xl bg-primary-soft px-2.5 py-1 font-mono text-sm font-semibold text-primary"
                      >
                        {exercise.exerciseNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-semibold leading-snug transition-colors group-hover:text-primary">
                          {exercise.name}
                        </div>
                        <div className="mt-0.5 text-xs uppercase tracking-wide text-fg-subtle">
                          {exercise.type}
                        </div>
                      </div>
                      <ArrowRight
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

        <JsonLd
          data={itemListJsonLd({
            name: `${data.chapter.name} exercises`,
            items: data.exercises.map((e) => ({
              name: `${data.chapter.name} ${e.name}`,
              url: exercisePath(data.board, data.standard, data.subject, data.chapter, e),
            })),
          })}
          id="ld-exercise-list"
        />
        <JsonLd
          data={articleJsonLd({
            headline: `${data.chapter.name} - ${data.subject.name} ${data.standard.name} ${data.board.name}`,
            description: `Step-by-step solutions for ${data.chapter.name} from Class ${data.standard.classNumber} ${data.subject.name} (${data.board.name}).`,
            path: chapterPath(data.board, data.standard, data.subject, data.chapter),
            dateModified: data.chapter.updatedAt ?? undefined,
            datePublished: data.chapter.createdAt ?? undefined,
          })}
          id="ld-article"
        />
      </Container>
    </main>
  );
}
