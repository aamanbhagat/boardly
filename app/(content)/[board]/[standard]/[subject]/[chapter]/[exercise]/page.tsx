import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import "katex/dist/katex.min.css";

import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildContentBreadcrumb,
  faqJsonLd,
  howToJsonLd,
  questionsToFaqPairs,
  articleJsonLd,
} from "@/lib/seo/structured-data";
import { buildExerciseMetadata } from "@/lib/seo/metadata";
import {
  getAllExerciseRoutes,
  getExerciseFull,
} from "@/lib/db/queries";
import {
  parseClassSegment,
  parseChapterSegment,
  parseExerciseSegment,
  exercisePath,
  questionPath,
} from "@/lib/seo/slugs";

import { ChapterSidebar } from "@/components/content/ChapterSidebar";
import { QuestionAnswer } from "@/components/content/QuestionAnswer";
import { SolutionActions } from "@/components/content/SolutionActions";
import { Badge } from "@/components/ui/badge";

type Params = Promise<{
  board: string;
  standard: string;
  subject: string;
  chapter: string;
  exercise: string;
}>;

const PLACEHOLDER_PARAMS = {
  board: "__placeholder__",
  standard: "class-1",
  subject: "_",
  chapter: "chapter-1-_",
  exercise: "exercise-1-_",
};

export async function generateStaticParams() {
  try {
    const rows = await getAllExerciseRoutes();
    if (rows.length === 0) return [PLACEHOLDER_PARAMS];
    return rows.slice(0, 100).map((r) => ({
      board: r.boardSlug,
      standard: `class-${r.classNumber}`,
      subject: r.subjectSlug,
      chapter: `chapter-${r.chapterNumber}-${r.chapterSlug}`,
      exercise: `exercise-${r.exerciseNumber}-${r.exerciseSlug}`,
    }));
  } catch {
    return [PLACEHOLDER_PARAMS];
  }
}

export async function generateMetadata({ params }: { params: Params }) {
  const p = await params;
  const classNumber = parseClassSegment(p.standard);
  const ch = parseChapterSegment(p.chapter);
  const ex = parseExerciseSegment(p.exercise);
  if (!classNumber || !ch || !ex) return {};
  const data = await getExerciseFull(
    p.board,
    classNumber,
    p.subject,
    ch.chapterNumber,
    ch.slug,
    ex.exerciseNumber,
    ex.slug
  ).catch(() => null);
  if (!data) return {};
  return buildExerciseMetadata(
    data.board,
    data.standard,
    data.subject,
    data.chapter,
    data.exercise,
    data.questions.length
  );
}

export default async function ExercisePage({ params }: { params: Params }) {
  const p = await params;
  const classNumber = parseClassSegment(p.standard);
  const ch = parseChapterSegment(p.chapter);
  const ex = parseExerciseSegment(p.exercise);
  if (!classNumber || !ch || !ex) notFound();

  const data = await getExerciseFull(
    p.board,
    classNumber,
    p.subject,
    ch.chapterNumber,
    ch.slug,
    ex.exerciseNumber,
    ex.slug
  ).catch(() => null);
  if (!data) notFound();

  const breadcrumb = buildContentBreadcrumb({
    board: data.board,
    standard: data.standard,
    subject: data.subject,
    chapter: data.chapter,
    exercise: data.exercise,
  });

  const idx = data.exercises.findIndex((e) => e.id === data.exercise.id);
  const prev = idx > 0 ? data.exercises[idx - 1] : undefined;
  const next =
    idx >= 0 && idx < data.exercises.length - 1
      ? data.exercises[idx + 1]
      : undefined;

  const path = exercisePath(
    data.board,
    data.standard,
    data.subject,
    data.chapter,
    data.exercise
  );

  const faqPairs = questionsToFaqPairs(data.questions);
  const allSteps = data.questions
    .flatMap((q) =>
      (q.solutions[0]?.steps as Array<{ text: string }> | null)?.map((s) => ({
        name: `Q${q.questionNumber}`,
        text: s.text,
      })) ?? []
    )
    .slice(0, 30);

  return (
    <main id="main" className="flex-1">
      <Container className="py-10 lg:py-14">
        <Breadcrumb items={breadcrumb} />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ChapterSidebar
            board={data.board}
            standard={data.standard}
            subject={data.subject}
            chapter={data.chapter}
            exercises={data.exercises}
            currentExerciseId={data.exercise.id}
          />

          <article>
            <header>
              <Badge variant="soft" className="mb-4 gap-1.5">
                <Sparkles className="h-3 w-3" aria-hidden />
                Chapter {data.chapter.chapterNumber} · Exercise{" "}
                {data.exercise.exerciseNumber}
              </Badge>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                {data.chapter.name}
                <span className="block text-fg-muted">
                  Exercise {data.exercise.exerciseNumber}
                </span>
              </h1>
              <p className="mt-4 max-w-prose text-lg text-fg-muted">
                Step-by-step solutions for all {data.questions.length}{" "}
                questions in {data.chapter.name} Exercise{" "}
                {data.exercise.exerciseNumber} — {data.standard.name}{" "}
                {data.subject.name} ({data.board.name}).
              </p>
              <div className="mt-6">
                <SolutionActions
                  contentType="exercise"
                  contentId={data.exercise.id}
                  shareUrl={path}
                  shareTitle={`${data.chapter.name} Exercise ${data.exercise.exerciseNumber}`}
                />
              </div>
            </header>

            <section
              aria-labelledby="solutions"
              className="mt-12 space-y-5"
            >
              <h2
                id="solutions"
                className="flex items-center gap-2 font-display text-2xl font-semibold"
              >
                Solutions
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-sans text-sm font-semibold text-primary">
                  {data.questions.length}
                </span>
              </h2>
              {data.questions.length === 0 ? (
                <p className="rounded-card border border-dashed border-border bg-bg-alt p-8 text-fg-muted">
                  Solutions for this exercise are being added.
                </p>
              ) : (
                data.questions.map((q, i) => (
                  <QuestionAnswer
                    key={q.id}
                    question={q}
                    solutions={q.solutions}
                    index={i}
                    href={questionPath(
                      data.board,
                      data.standard,
                      data.subject,
                      data.chapter,
                      data.exercise,
                      q
                    )}
                  />
                ))
              )}
            </section>

            <nav
              aria-label="Adjacent exercises"
              className="mt-12 grid grid-cols-1 gap-3 border-t border-border pt-8 sm:grid-cols-2"
            >
              {prev ? (
                <Link
                  href={exercisePath(
                    data.board,
                    data.standard,
                    data.subject,
                    data.chapter,
                    prev
                  )}
                  rel="prev"
                  className="group flex items-center gap-3 rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                >
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg-alt text-fg-subtle transition-colors group-hover:bg-primary group-hover:text-primary-fg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-fg-subtle">
                      Previous
                    </div>
                    <div className="truncate font-medium">
                      Exercise {prev.exerciseNumber}
                    </div>
                  </div>
                </Link>
              ) : (
                <span aria-hidden />
              )}
              {next ? (
                <Link
                  href={exercisePath(
                    data.board,
                    data.standard,
                    data.subject,
                    data.chapter,
                    next
                  )}
                  rel="next"
                  className="group ml-auto flex w-full items-center gap-3 rounded-card border border-border bg-surface p-5 text-right shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover sm:col-start-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wide text-fg-subtle">
                      Next
                    </div>
                    <div className="truncate font-medium">
                      Exercise {next.exerciseNumber}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-fg transition-colors group-hover:bg-primary-hover"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : null}
            </nav>
          </article>
        </div>

        {faqPairs.length > 0 ? (
          <JsonLd data={faqJsonLd(faqPairs)} id="ld-faq-exercise" />
        ) : null}
        {allSteps.length > 0 ? (
          <JsonLd
            data={howToJsonLd({
              name: `${data.chapter.name} Exercise ${data.exercise.exerciseNumber}`,
              description: `Solving Exercise ${data.exercise.exerciseNumber} from ${data.chapter.name} - ${data.subject.name}.`,
              steps: allSteps,
            })}
            id="ld-howto"
          />
        ) : null}
        <JsonLd
          data={articleJsonLd({
            headline: `${data.chapter.name} Exercise ${data.exercise.exerciseNumber} Solutions`,
            description: `Step-by-step solutions for ${data.chapter.name} Exercise ${data.exercise.exerciseNumber} - ${data.subject.name} ${data.standard.name} (${data.board.name}).`,
            path,
            dateModified: data.exercise.updatedAt ?? undefined,
            datePublished: data.exercise.createdAt ?? undefined,
          })}
          id="ld-article-exercise"
        />
      </Container>
    </main>
  );
}
