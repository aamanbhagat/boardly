import Link from "next/link";
import { ChevronRight, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Board, Standard, Subject, Chapter, Exercise } from "@/lib/db/schema";
import { exercisePath, chapterPath } from "@/lib/seo/slugs";

type Props = {
  board: Board;
  standard: Standard;
  subject: Subject;
  chapter: Chapter;
  exercises: Exercise[];
  currentExerciseId?: string;
};

export function ChapterSidebar({
  board,
  standard,
  subject,
  chapter,
  exercises,
  currentExerciseId,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <nav
        aria-label="Chapter contents"
        className="rounded-card-lg border border-border bg-surface p-5 shadow-card"
      >
        <Link
          href={chapterPath(board, standard, subject, chapter)}
          className="mb-4 flex items-center gap-3 rounded-xl bg-bg-alt p-3 transition-colors hover:bg-primary-soft"
        >
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
          >
            <BookMarked className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-fg-subtle">
              Chapter {chapter.chapterNumber}
            </div>
            <div className="truncate font-display font-semibold">
              {chapter.name}
            </div>
          </div>
          <ChevronRight aria-hidden className="h-4 w-4 text-fg-subtle" />
        </Link>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Exercises
        </p>
        <ol className="space-y-1">
          {exercises.map((exercise) => {
            const isCurrent = exercise.id === currentExerciseId;
            return (
              <li key={exercise.id}>
                <Link
                  href={exercisePath(board, standard, subject, chapter, exercise)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors",
                    isCurrent
                      ? "bg-primary-soft font-semibold text-primary"
                      : "text-fg-muted hover:bg-bg-alt hover:text-fg"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono text-xs",
                      isCurrent
                        ? "bg-primary text-primary-fg"
                        : "bg-bg-alt text-fg-subtle"
                    )}
                  >
                    {exercise.exerciseNumber}
                  </span>
                  <span className="truncate">{exercise.name}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
