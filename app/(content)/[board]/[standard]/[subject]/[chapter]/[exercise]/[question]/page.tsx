import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import "katex/dist/katex.min.css";

import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildContentBreadcrumb,
  qaPageJsonLd,
  articleJsonLd,
} from "@/lib/seo/structured-data";
import { buildQuestionMetadata } from "@/lib/seo/metadata";
import {
  getAllQuestionRoutes,
  getQuestionFull,
} from "@/lib/db/queries";
import {
  parseClassSegment,
  parseChapterSegment,
  parseExerciseSegment,
  parseQuestionSegment,
  questionPath,
  exercisePath,
  chapterPath,
} from "@/lib/seo/slugs";

import { SolutionActions } from "@/components/content/SolutionActions";
import { MathText } from "@/components/content/MathRenderer";
import {
  QuestionPrompt,
  McqOptions,
  SolutionBody,
  type FullQuestion,
} from "@/components/content/QuestionFormatRenderer";

type Params = Promise<{
  board: string;
  standard: string;
  subject: string;
  chapter: string;
  exercise: string;
  question: string;
}>;

const PLACEHOLDER_PARAMS = {
  board: "__placeholder__",
  standard: "class-1",
  subject: "_",
  chapter: "chapter-1-_",
  exercise: "exercise-1.1-_",
  question: "q-1",
};

export async function generateStaticParams() {
  try {
    const rows = await getAllQuestionRoutes();
    if (rows.length === 0) return [PLACEHOLDER_PARAMS];
    // Prerender top 100 hottest question paths; rest fall back to runtime ISR.
    return rows.slice(0, 100).map((r) => ({
      board: r.boardSlug,
      standard: `class-${r.classNumber}`,
      subject: r.subjectSlug,
      chapter: `chapter-${r.chapterNumber}-${r.chapterSlug}`,
      exercise: `exercise-${r.exerciseNumber}-${r.exerciseSlug}`,
      question: `q-${r.questionNumber}`,
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
  const q = parseQuestionSegment(p.question);
  if (!classNumber || !ch || !ex || !q) return {};
  const data = await getQuestionFull(
    p.board,
    classNumber,
    p.subject,
    ch.chapterNumber,
    ch.slug,
    ex.exerciseNumber,
    ex.slug,
    q.questionNumber
  ).catch(() => null);
  if (!data) return {};
  return buildQuestionMetadata(
    data.board,
    data.standard,
    data.subject,
    data.chapter,
    data.exercise,
    data.question
  );
}

export default async function QuestionPage({ params }: { params: Params }) {
  const p = await params;
  const classNumber = parseClassSegment(p.standard);
  const ch = parseChapterSegment(p.chapter);
  const ex = parseExerciseSegment(p.exercise);
  const q = parseQuestionSegment(p.question);
  if (!classNumber || !ch || !ex || !q) notFound();

  const data = await getQuestionFull(
    p.board,
    classNumber,
    p.subject,
    ch.chapterNumber,
    ch.slug,
    ex.exerciseNumber,
    ex.slug,
    q.questionNumber
  ).catch(() => null);
  if (!data) notFound();

  const breadcrumb = buildContentBreadcrumb({
    board: data.board,
    standard: data.standard,
    subject: data.subject,
    chapter: data.chapter,
    exercise: data.exercise,
    question: data.question,
  });

  const path = questionPath(
    data.board,
    data.standard,
    data.subject,
    data.chapter,
    data.exercise,
    data.question
  );

  const question = data.question as FullQuestion;
  const primarySolution = question.solutions[0];

  return (
    <main id="main" className="flex-1">
      <Container className="py-6 sm:py-10 lg:py-14">
        <Breadcrumb items={breadcrumb} />

        <article className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div id="qa-pdf-target">
              <section
                aria-labelledby="question"
                className="rounded-card-lg border border-border bg-surface p-4 shadow-card sm:p-8"
              >
                <SectionLabel id="question">Question</SectionLabel>
                <QuestionPrompt question={question} />
                <QuestionTypeChip question={question} />
              </section>

              <section
                aria-labelledby="solution"
                className="mt-4 rounded-card-lg border border-border bg-surface p-4 shadow-card sm:mt-6 sm:p-8"
              >
                <SectionLabel id="solution">Solution</SectionLabel>
                <SolutionBody question={question} />
              </section>
            </div>

            <PrevNextNav
              prevPath={
                data.prev
                  ? questionPath(
                      data.board,
                      data.standard,
                      data.subject,
                      data.chapter,
                      data.exercise,
                      data.prev
                    )
                  : null
              }
              prevLabel={
                data.prev ? `Q ${data.prev.questionNumber}` : null
              }
              nextPath={
                data.next
                  ? questionPath(
                      data.board,
                      data.standard,
                      data.subject,
                      data.chapter,
                      data.exercise,
                      data.next
                    )
                  : null
              }
              nextLabel={
                data.next ? `Q ${data.next.questionNumber}` : null
              }
            />

            <div className="mt-8 flex justify-center sm:justify-start">
              <SolutionActions
                contentType="exercise"
                contentId={data.question.id}
                shareUrl={path}
                shareTitle={`${data.chapter.name} Q${data.question.questionNumber}`}
                pdfTargetId="qa-pdf-target"
                pdfFilename={`${data.subject.name}-${data.chapter.name}-Q${data.question.questionNumber}`}
              />
            </div>

            {data.related.length > 0 ? (
              <RelatedQuestions
                items={data.related.map((r) => ({
                  number: r.questionNumber,
                  text: r.questionText,
                  href: questionPath(
                    data.board,
                    data.standard,
                    data.subject,
                    data.chapter,
                    data.exercise,
                    r
                  ),
                }))}
              />
            ) : null}
          </div>

          <SidebarRail
            chapterName={data.chapter.name}
            chapterHref={chapterPath(
              data.board,
              data.standard,
              data.subject,
              data.chapter
            )}
            exerciseLabel={`Exercise ${data.exercise.exerciseNumber}`}
            exerciseHref={exercisePath(
              data.board,
              data.standard,
              data.subject,
              data.chapter,
              data.exercise
            )}
            questions={data.questions.map((q) => ({
              number: q.questionNumber,
              isCurrent: q.id === data.question.id,
              href: questionPath(
                data.board,
                data.standard,
                data.subject,
                data.chapter,
                data.exercise,
                q
              ),
            }))}
          />
        </article>

        <JsonLd
          data={qaPageJsonLd({
            question: data.question,
            answerText: primarySolution?.solutionText ?? "",
            path,
          })}
          id="ld-qa-page"
        />
        <JsonLd
          data={articleJsonLd({
            headline: `${data.chapter.name} Q${data.question.questionNumber} Solution`,
            description: `Step-by-step solution for ${data.chapter.name} Q${data.question.questionNumber} - ${data.subject.name} ${data.standard.name} (${data.board.name}).`,
            path,
            dateModified: data.question.updatedAt ?? undefined,
            datePublished: data.question.createdAt ?? undefined,
          })}
          id="ld-article-question"
        />
      </Container>
    </main>
  );
}

function SectionLabel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-4 inline-block rounded-md bg-bg-alt px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-fg-muted sm:mb-6 sm:px-4 sm:py-1.5 sm:text-xs"
    >
      {children}
    </h2>
  );
}

const QUESTION_TYPE_CHIP_LABEL: Record<string, string> = {
  short: "Answer in Brief",
  long: "Long Answer",
  mcq: "MCQ",
  multi_correct: "Multiple Correct",
  numerical: "Numerical",
  true_false: "True or False",
  fill_in_blank: "Fill in the Blanks",
  match: "Match the Columns",
  assertion_reason: "Assertion & Reason",
  case_based: "Case-based",
  diagram: "Diagram-based",
  one_word: "Answer in One Word",
};

function QuestionTypeChip({ question }: { question: FullQuestion }) {
  const label = QUESTION_TYPE_CHIP_LABEL[question.type];
  if (!label) return null;
  return (
    <div className="mt-5 sm:mt-6">
      <span className="inline-flex items-center rounded-full border border-success/30 bg-success-soft px-3.5 py-1.5 text-xs font-semibold text-success sm:text-sm">
        {label}
      </span>
    </div>
  );
}

function PrevNextNav({
  prevPath,
  prevLabel,
  nextPath,
  nextLabel,
}: {
  prevPath: string | null;
  prevLabel: string | null;
  nextPath: string | null;
  nextLabel: string | null;
}) {
  if (!prevPath && !nextPath) return null;
  return (
    <nav
      aria-label="Adjacent questions"
      className="mt-8 grid grid-cols-2 gap-2 border-t border-border pt-6 sm:gap-3"
    >
      {prevPath && prevLabel ? (
        <Link
          href={prevPath}
          rel="prev"
          className="group flex items-center gap-2 rounded-card border border-border bg-surface p-3 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover sm:gap-3 sm:p-5"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg-alt text-fg-subtle transition-colors group-hover:bg-primary group-hover:text-primary-fg sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-fg-subtle sm:text-xs">
              Previous
            </div>
            <div className="truncate text-sm font-medium sm:text-base">
              {prevLabel}
            </div>
          </div>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {nextPath && nextLabel ? (
        <Link
          href={nextPath}
          rel="next"
          className="group ml-auto flex w-full items-center gap-2 rounded-card border border-border bg-surface p-3 text-right shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover sm:gap-3 sm:p-5"
        >
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wide text-fg-subtle sm:text-xs">
              Next
            </div>
            <div className="truncate text-sm font-medium sm:text-base">
              {nextLabel}
            </div>
          </div>
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-fg transition-colors group-hover:bg-primary-hover sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

function RelatedQuestions({
  items,
}: {
  items: Array<{ number: string; text: string; href: string }>;
}) {
  return (
    <section
      aria-labelledby="related"
      className="mt-8 rounded-card-lg border border-border bg-surface p-4 shadow-card sm:mt-12 sm:p-8"
    >
      <SectionLabel id="related">Related questions</SectionLabel>
      <ul className="space-y-4 sm:space-y-5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block text-[0.95rem] leading-relaxed text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline sm:text-base"
            >
              <MathText>{item.text}</MathText>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SidebarRail({
  chapterName,
  chapterHref,
  exerciseLabel,
  exerciseHref,
  questions,
}: {
  chapterName: string;
  chapterHref: string;
  exerciseLabel: string;
  exerciseHref: string;
  questions: Array<{ number: string; isCurrent: boolean; href: string }>;
}) {
  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <nav
        aria-label="Exercise contents"
        className="rounded-card-lg border border-border bg-surface p-5 shadow-card"
      >
        <Link
          href={chapterHref}
          className="flex items-center gap-3 rounded-xl bg-bg-alt p-3 transition-colors hover:bg-primary-soft"
        >
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-fg-subtle">
              Chapter
            </div>
            <div className="truncate font-display font-semibold">
              {chapterName}
            </div>
          </div>
        </Link>
        <Link
          href={exerciseHref}
          className="mt-3 block rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          ← Back to {exerciseLabel}
        </Link>

        <p className="mb-2 mt-5 px-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Questions in this exercise
        </p>
        <ol className="grid grid-cols-5 gap-1.5 lg:grid-cols-4 xl:grid-cols-5">
          {questions.map((q) => (
            <li key={q.href}>
              <Link
                href={q.href}
                aria-current={q.isCurrent ? "page" : undefined}
                className={
                  q.isCurrent
                    ? "grid h-9 place-items-center rounded-md bg-primary text-xs font-mono font-semibold text-primary-fg shadow-card"
                    : "grid h-9 place-items-center rounded-md bg-bg-alt text-xs font-mono font-medium text-fg-muted transition-colors hover:bg-primary-soft hover:text-primary"
                }
              >
                {q.number}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
