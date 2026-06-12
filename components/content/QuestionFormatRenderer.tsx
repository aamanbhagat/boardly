import { MathText } from "@/components/content/MathRenderer";
import { Badge } from "@/components/ui/badge";
import type {
  Question,
  Solution,
  Mcq,
  QuestionMeta,
} from "@/lib/db/schema";

type Step = { text: string; expression?: string };

export type FullQuestion = Question & {
  solutions: Solution[];
  mcq: Mcq | null;
};

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "MCQ",
  multi_correct: "Multiple Correct",
  fill_in_blank: "Fill in the Blanks",
  short: "Short Answer",
  long: "Long Answer",
  numerical: "Numerical",
  true_false: "True or False",
  match: "Match the Columns",
  assertion_reason: "Assertion & Reason",
  case_based: "Case-based",
  diagram: "Diagram-based",
  one_word: "One-word Answer",
};

const ASSERTION_REASON_OPTIONS = [
  "Both Assertion and Reason are true and the Reason is the correct explanation of the Assertion.",
  "Both Assertion and Reason are true but the Reason is not the correct explanation of the Assertion.",
  "Assertion is true but the Reason is false.",
  "Assertion is false but the Reason is true.",
] as const;

function difficultyVariant(d: Question["difficulty"]) {
  return d === "easy" ? "success" : d === "hard" ? "warning" : "muted";
}

export function QuestionMeta({ question }: { question: FullQuestion }) {
  const verified = question.solutions[0]?.isVerified;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">{TYPE_LABEL[question.type]}</Badge>
      <Badge variant={difficultyVariant(question.difficulty)}>
        {question.difficulty}
      </Badge>
      {question.marks ? (
        <Badge variant="muted">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </Badge>
      ) : null}
      {verified ? <Badge variant="success">Educator verified</Badge> : null}
    </div>
  );
}

export function QuestionPrompt({ question }: { question: FullQuestion }) {
  const meta = question.meta as QuestionMeta | null;

  return (
    <div className="space-y-5">
      <div className="prose-solution text-base font-medium text-fg sm:text-lg">
        <MathText>{question.questionText}</MathText>
      </div>

      {meta?.kind === "case_based" ? (
        <CasePassage meta={meta} />
      ) : meta?.kind === "diagram" ? (
        <DiagramFigure meta={meta} />
      ) : meta?.kind === "assertion_reason" ? (
        <AssertionReasonPrompt meta={meta} />
      ) : meta?.kind === "match" ? (
        <MatchTable meta={meta} />
      ) : null}

      {/* Format-specific option blocks rendered below the prompt */}
      {question.type === "mcq" || question.type === "multi_correct" ? (
        <McqOptions question={question} />
      ) : null}
      {meta?.kind === "match" && meta.options ? (
        <MatchOptions meta={meta} />
      ) : null}
      {meta?.kind === "assertion_reason" ? (
        <AssertionReasonOptions meta={meta} />
      ) : null}
    </div>
  );
}

function CasePassage({
  meta,
}: {
  meta: Extract<QuestionMeta, { kind: "case_based" }>;
}) {
  return (
    <figure className="rounded-card border border-border bg-bg-alt p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
        Read the case carefully
      </div>
      <div className="prose-solution mt-2">
        <MathText>{meta.passage}</MathText>
      </div>
      {meta.figureUrl ? (
        <div className="mt-4 overflow-hidden rounded-card border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.figureUrl}
            alt={meta.figureCaption ?? "Case figure"}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
          {meta.figureCaption ? (
            <figcaption className="border-t border-border bg-bg-alt px-4 py-2 text-xs text-fg-muted">
              {meta.figureCaption}
            </figcaption>
          ) : null}
        </div>
      ) : null}
    </figure>
  );
}

function DiagramFigure({
  meta,
}: {
  meta: Extract<QuestionMeta, { kind: "diagram" }>;
}) {
  return (
    <figure className="rounded-card border border-border bg-bg-alt p-5">
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.figureUrl}
          alt={meta.figureCaption ?? "Diagram"}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
        {meta.figureCaption ? (
          <figcaption className="border-t border-border bg-bg-alt px-4 py-2 text-xs text-fg-muted">
            {meta.figureCaption}
          </figcaption>
        ) : null}
      </div>
      {meta.labels && meta.labels.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {meta.labels.map((label) => (
            <li
              key={label.marker}
              className="flex items-start gap-2.5 text-sm text-fg-muted"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary-soft font-mono text-xs font-semibold text-primary">
                {label.marker}
              </span>
              <span>
                <MathText>{label.text}</MathText>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}

function AssertionReasonPrompt({
  meta,
}: {
  meta: Extract<QuestionMeta, { kind: "assertion_reason" }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-card border border-border bg-bg-alt p-5 sm:grid-cols-2">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Assertion (A)
        </div>
        <div className="prose-solution mt-1.5 text-sm">
          <MathText>{meta.assertion}</MathText>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Reason (R)
        </div>
        <div className="prose-solution mt-1.5 text-sm">
          <MathText>{meta.reason}</MathText>
        </div>
      </div>
    </div>
  );
}

function AssertionReasonOptions({
  meta,
}: {
  meta: Extract<QuestionMeta, { kind: "assertion_reason" }>;
}) {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ASSERTION_REASON_OPTIONS.map((text, i) => {
        const isCorrect = meta.correctOption === i + 1;
        return (
          <li key={i}>
            <div
              className={
                isCorrect
                  ? "flex items-start gap-3 rounded-card border border-success/40 bg-success-soft p-4"
                  : "flex items-start gap-3 rounded-card border border-border bg-surface p-4"
              }
            >
              <span
                aria-hidden
                className={
                  isCorrect
                    ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success font-mono text-xs font-bold text-white"
                    : "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg-alt font-mono text-xs font-semibold text-fg-muted"
                }
              >
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1 text-sm leading-relaxed text-fg-muted">
                {text}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function MatchTable({
  meta,
}: {
  meta: Extract<QuestionMeta, { kind: "match" }>;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-bg-alt">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            <th className="w-10 p-3"></th>
            <th className="p-3">{meta.columnAHeading ?? "Column I"}</th>
            <th className="w-10 border-l border-border p-3"></th>
            <th className="border-l border-border p-3">
              {meta.columnBHeading ?? "Column II"}
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({
            length: Math.max(meta.pairs.length, meta.pairs.length),
          }).map((_, i) => {
            const pair = meta.pairs[i];
            return (
              <tr
                key={i}
                className="border-t border-border align-top text-fg-muted"
              >
                <td className="p-3 font-mono text-xs font-semibold text-fg-subtle">
                  {String.fromCharCode(65 + i)}.
                </td>
                <td className="p-3">
                  {pair?.left ? <MathText>{pair.left}</MathText> : null}
                </td>
                <td className="border-l border-border p-3 font-mono text-xs font-semibold text-fg-subtle">
                  {romanize(i + 1)}.
                </td>
                <td className="border-l border-border p-3">
                  {pair?.right ? <MathText>{pair.right}</MathText> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatchOptions({
  meta,
}: {
  meta: Extract<QuestionMeta, { kind: "match" }>;
}) {
  if (!meta.options) return null;
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {meta.options.map((opt, i) => {
        const isCorrect = meta.correctOption === i;
        return (
          <li key={i}>
            <div
              className={
                isCorrect
                  ? "flex items-start gap-3 rounded-card border border-success/40 bg-success-soft p-4"
                  : "flex items-start gap-3 rounded-card border border-border bg-surface p-4"
              }
            >
              <span
                aria-hidden
                className={
                  isCorrect
                    ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success font-mono text-xs font-bold text-white"
                    : "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg-alt font-mono text-xs font-semibold text-fg-muted"
                }
              >
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1 font-mono text-sm">{opt.label}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function romanize(n: number): string {
  const map: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [val, sym] of map) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out;
}

export function McqOptions({ question }: { question: FullQuestion }) {
  if (!question.mcq) return null;
  const meta = question.meta as QuestionMeta | null;
  const multi =
    question.type === "multi_correct" && meta?.kind === "multi_correct"
      ? new Set(meta.correctOptions)
      : null;

  const opts: Array<{ key: "A" | "B" | "C" | "D"; text: string }> = [
    { key: "A", text: question.mcq.optionA },
    { key: "B", text: question.mcq.optionB },
    { key: "C", text: question.mcq.optionC },
    { key: "D", text: question.mcq.optionD },
  ];
  const correct = question.mcq.correctOption;

  return (
    <ol
      aria-label="Answer options"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {opts.map((opt) => {
        const isCorrect = multi ? multi.has(opt.key) : opt.key === correct;
        return (
          <li key={opt.key}>
            <div
              className={
                isCorrect
                  ? "flex items-start gap-3 rounded-card border border-success/40 bg-success-soft p-4"
                  : "flex items-start gap-3 rounded-card border border-border bg-bg-alt p-4"
              }
            >
              <span
                aria-hidden
                className={
                  isCorrect
                    ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success font-mono text-xs font-bold text-white"
                    : "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface font-mono text-xs font-semibold text-fg-muted"
                }
              >
                {opt.key}
              </span>
              <div className="prose-solution flex-1 text-base">
                <MathText>{opt.text}</MathText>
              </div>
              {isCorrect ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-success">
                  Correct
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function SolutionBody({ question }: { question: FullQuestion }) {
  const primary = question.solutions[0];
  if (!primary) {
    return (
      <p className="rounded-card border border-dashed border-border bg-bg-alt p-5 text-fg-muted">
        Solution coming soon.
      </p>
    );
  }

  switch (question.type) {
    case "mcq":
    case "multi_correct":
      return <McqSolution question={question} solution={primary} />;
    case "match":
      return <MatchSolution question={question} solution={primary} />;
    case "assertion_reason":
      return <AssertionReasonSolution question={question} solution={primary} />;
    case "fill_in_blank":
    case "true_false":
    case "one_word":
      return <ShortAnswerSolution question={question} solution={primary} />;
    case "long":
    case "short":
    case "numerical":
    case "case_based":
    case "diagram":
    default:
      return <DetailedSolution solution={primary} />;
  }
}

function McqSolution({
  question,
  solution,
}: {
  question: FullQuestion;
  solution: Solution;
}) {
  const meta = question.meta as QuestionMeta | null;
  const correctKeys: Array<"A" | "B" | "C" | "D"> = (() => {
    if (question.type === "multi_correct" && meta?.kind === "multi_correct") {
      return meta.correctOptions;
    }
    if (question.mcq?.correctOption) {
      return [question.mcq.correctOption as "A" | "B" | "C" | "D"];
    }
    return [];
  })();

  const optionLookup: Record<"A" | "B" | "C" | "D", string | undefined> = {
    A: question.mcq?.optionA,
    B: question.mcq?.optionB,
    C: question.mcq?.optionC,
    D: question.mcq?.optionD,
  };
  const explanation = question.mcq?.explanation ?? solution.solutionText;

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-success/40 bg-success-soft p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-success">
          {correctKeys.length > 1 ? "Correct answers" : "Correct answer"}
        </div>
        <ul className="prose-solution mt-1 space-y-1 text-base font-semibold text-fg sm:text-lg">
          {correctKeys.length === 0 ? (
            <li>—</li>
          ) : (
            correctKeys.map((k) => (
              <li key={k}>
                {k}.{" "}
                {optionLookup[k] ? (
                  <MathText>{optionLookup[k]!}</MathText>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
      {explanation ? (
        <div>
          <h3 className="font-display text-base font-semibold">Explanation</h3>
          <div className="prose-solution mt-2">
            <MathText>{explanation}</MathText>
          </div>
        </div>
      ) : null}
      {solution.steps && solution.steps.length > 0 ? (
        <StepList steps={solution.steps as Step[]} />
      ) : null}
    </div>
  );
}

function MatchSolution({
  question,
  solution,
}: {
  question: FullQuestion;
  solution: Solution;
}) {
  const meta = question.meta as QuestionMeta | null;
  const matchMeta = meta?.kind === "match" ? meta : null;
  const correct =
    matchMeta?.correctOption !== undefined && matchMeta.options
      ? matchMeta.options[matchMeta.correctOption]
      : null;

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-success/40 bg-success-soft p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-success">
          Correct match
        </div>
        <div className="prose-solution mt-1 text-base font-semibold text-fg sm:text-lg">
          {correct ? (
            <span className="font-mono">{correct.label}</span>
          ) : (
            <MathText>{solution.solutionText}</MathText>
          )}
        </div>
      </div>
      {matchMeta && correct ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {matchMeta.pairs.map((pair, i) => {
            const targetIdx = correct.mapping[i];
            const target =
              targetIdx !== undefined ? matchMeta.pairs[targetIdx] : null;
            return (
              <li
                key={i}
                className="flex items-center gap-3 rounded-card border border-border bg-bg-alt p-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary-soft font-mono text-xs font-semibold text-primary">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="prose-solution flex-1 text-sm">
                  <MathText>{pair.left}</MathText>
                </span>
                <span className="text-fg-subtle">→</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary-soft font-mono text-xs font-semibold text-primary">
                  {targetIdx !== undefined ? romanize(targetIdx + 1) : "?"}
                </span>
                <span className="prose-solution flex-1 text-sm">
                  {target ? <MathText>{target.right}</MathText> : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {solution.steps && solution.steps.length > 0 ? (
        <StepList steps={solution.steps as Step[]} />
      ) : null}
    </div>
  );
}

function AssertionReasonSolution({
  question,
  solution,
}: {
  question: FullQuestion;
  solution: Solution;
}) {
  const meta = question.meta as QuestionMeta | null;
  const arMeta = meta?.kind === "assertion_reason" ? meta : null;
  const optText = arMeta
    ? ASSERTION_REASON_OPTIONS[arMeta.correctOption - 1]
    : null;

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-success/40 bg-success-soft p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-success">
          Correct option
        </div>
        <div className="prose-solution mt-1 text-base font-semibold text-fg sm:text-lg">
          {arMeta
            ? `${String.fromCharCode(64 + arMeta.correctOption)}. ${optText}`
            : null}
        </div>
      </div>
      <div>
        <h3 className="font-display text-base font-semibold">Explanation</h3>
        <div className="prose-solution mt-2">
          <MathText>{solution.solutionText}</MathText>
        </div>
      </div>
      {solution.steps && solution.steps.length > 0 ? (
        <StepList steps={solution.steps as Step[]} />
      ) : null}
    </div>
  );
}

function ShortAnswerSolution({
  question,
  solution,
}: {
  question: FullQuestion;
  solution: Solution;
}) {
  const filled =
    question.type === "fill_in_blank"
      ? fillBlank(question.questionText, solution.solutionText)
      : null;

  return (
    <div className="space-y-5">
      <div className="rounded-card border border-success/40 bg-success-soft p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-success">
          Answer
        </div>
        <div className="prose-solution mt-1 text-base font-semibold text-fg sm:text-lg">
          <MathText>{solution.solutionText}</MathText>
        </div>
      </div>
      {filled ? (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Completed sentence
          </div>
          <p className="prose-solution mt-1.5">
            <MathText>{filled.before}</MathText>
            <span className="rounded-md bg-primary-soft px-2 py-0.5 font-semibold text-primary">
              {filled.answer}
            </span>
            <MathText>{filled.after}</MathText>
          </p>
        </div>
      ) : null}
      {solution.steps && solution.steps.length > 0 ? (
        <StepList steps={solution.steps as Step[]} />
      ) : null}
    </div>
  );
}

function DetailedSolution({ solution }: { solution: Solution }) {
  return (
    <div className="prose-solution">
      {solution.steps && solution.steps.length > 0 ? (
        <StepList steps={solution.steps as Step[]} />
      ) : (
        <MathText>{solution.solutionText}</MathText>
      )}
    </div>
  );
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="solution-steps space-y-3 pl-5">
      {steps.map((step, i) => (
        <li key={i}>
          <MathText>{step.text}</MathText>
          {step.expression ? (
            <div className="mt-2 overflow-x-auto">
              <MathText>{`$$${step.expression}$$`}</MathText>
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function fillBlank(
  prompt: string,
  answer: string
): { before: string; answer: string; after: string } | null {
  if (!answer) return null;
  const m = /_{3,}/.exec(prompt);
  if (!m) return null;
  return {
    before: prompt.slice(0, m.index),
    answer: answer.trim(),
    after: prompt.slice(m.index + m[0].length),
  };
}
