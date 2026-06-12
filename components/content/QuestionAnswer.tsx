import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MathText } from "@/components/content/MathRenderer";
import { Badge } from "@/components/ui/badge";
import type { Question, Solution } from "@/lib/db/schema";

type Step = { text: string; expression?: string };

function difficultyVariant(d: Question["difficulty"]) {
  return d === "easy"
    ? "success"
    : d === "hard"
      ? "warning"
      : "muted";
}

export function QuestionAnswer({
  question,
  solutions,
  href,
}: {
  question: Question;
  solutions: Solution[];
  index: number;
  href?: string;
}) {
  const primary = solutions[0];
  return (
    <article
      id={`q-${question.questionNumber}`}
      className="rounded-card-lg border border-border bg-surface p-6 shadow-card scroll-mt-32 transition-shadow hover:shadow-card-hover"
      aria-labelledby={`q-${question.questionNumber}-heading`}
    >
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-xl bg-primary px-2.5 py-1 font-mono text-sm font-semibold text-primary-fg shadow-card">
          Q{question.questionNumber}
        </span>
        <Badge variant={difficultyVariant(question.difficulty)}>
          {question.difficulty}
        </Badge>
        {question.marks ? (
          <Badge variant="muted">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </Badge>
        ) : null}
        {primary?.isVerified ? (
          <Badge variant="success">Verified</Badge>
        ) : null}
        {href ? (
          <Link
            href={href}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
          >
            Open
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </header>

      <h3
        id={`q-${question.questionNumber}-heading`}
        className="prose-solution text-base font-medium"
      >
        <MathText>{question.questionText}</MathText>
      </h3>

      {primary ? (
        <details open className="group mt-5 border-t border-border pt-4">
          <summary className="no-print inline-flex cursor-pointer select-none items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary list-none [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show solution</span>
            <span className="hidden group-open:inline">Hide solution</span>
          </summary>
          <div className="prose-solution mt-4">
            <h4 className="sr-only">Solution</h4>
            {primary.steps && primary.steps.length > 0 ? (
              <ol className="solution-steps">
                {(primary.steps as Step[]).map((step, i) => (
                  <li key={i}>
                    <MathText>{step.text}</MathText>
                    {step.expression ? (
                      <div className="mt-2">
                        <MathText>{`$$${step.expression}$$`}</MathText>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p>
                <MathText>{primary.solutionText}</MathText>
              </p>
            )}
          </div>
        </details>
      ) : (
        <p className="mt-4 rounded-card border border-dashed border-border bg-bg-alt p-4 text-sm text-fg-muted">
          Solution coming soon.
        </p>
      )}
    </article>
  );
}
