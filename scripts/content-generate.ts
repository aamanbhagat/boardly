 
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { manifestSkeleton, findCurriculumSubject } from "@/lib/content/curriculum";
import {
  buildChapterPlanPrompt,
  buildExercisePrompt,
  type ExercisePromptInput,
} from "@/lib/content/prompts";
import { grokJson } from "@/lib/content/grok";
import {
  manifestSchema,
  exerciseSchema,
  type Manifest,
  type ManifestExercise,
} from "@/lib/content/manifest";
import { z } from "zod";

// LLM-driven manifest generator.
//
// Usage:
//   pnpm content:generate --board cbse --class 10 --subject mathematics
//
// Output: content/<board>/class-<N>/<subject>.draft.json
// (drafts are gitignored; rename to <subject>.json after review)
//
// Resumable: per-chapter results are cached under content/.cache/. Re-run
// to pick up where a previous run failed. Pass --force to ignore cache.

type Args = {
  board: string;
  classNumber: number;
  subject: string;
  force: boolean;
  onlyChapter: number | null;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const board = get("--board");
  const cls = get("--class");
  const subject = get("--subject");
  if (!board || !cls || !subject) {
    console.error(
      "Usage: pnpm content:generate --board <slug> --class <N> --subject <slug> [--force] [--chapter <N>]"
    );
    process.exit(2);
  }
  const onlyChapterStr = get("--chapter");
  return {
    board,
    classNumber: Number(cls),
    subject,
    force: argv.includes("--force"),
    onlyChapter: onlyChapterStr ? Number(onlyChapterStr) : null,
  };
}

const planResponseSchema = z.object({
  exercises: z
    .array(
      z.object({
        exerciseNumber: z.string().min(1),
        name: z.string().min(1),
        type: z.enum(["exercise", "miscellaneous", "additional", "intext"]),
        questionsRequested: z.number().int().min(3).max(20),
        topicHints: z.array(z.string()).optional(),
      })
    )
    .min(1)
    .max(8),
});

async function planChapter(input: {
  boardName: string;
  className: string;
  subjectName: string;
  chapterName: string;
  chapterNumber: number;
}) {
  const messages = buildChapterPlanPrompt(input);
  const { data, usage } = await grokJson<unknown>(messages, {
    temperature: 0.3,
    maxTokens: 2000,
  });
  const parsed = planResponseSchema.parse(data);
  return { plan: parsed.exercises, usage };
}

async function generateExercise(input: ExercisePromptInput) {
  const messages = buildExercisePrompt(input);
  const { data, usage } = await grokJson<unknown>(messages, {
    temperature: 0.5,
    maxTokens: 6000,
  });
  // The model returns the exercise body. Slug is derived here so the
  // prompt doesn't have to know about kebab-case rules.
  const slug = `exercise-${input.exerciseNumber.replace(/\./g, "-")}`;
  const withSlug = { ...(data as object), slug };
  const parsed = exerciseSchema.parse(withSlug);
  return { exercise: parsed, usage };
}

async function fileExists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists<T>(p: string): Promise<T | null> {
  if (!(await fileExists(p))) return null;
  const raw = await readFile(p, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(p: string, data: unknown) {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  const args = parseArgs();
  const skeleton = manifestSkeleton(args.board, args.classNumber, args.subject);
  const found = findCurriculumSubject(args.board, args.classNumber, args.subject)!;

  const cwd = process.cwd();
  const cacheDir = path.join(
    cwd,
    "content",
    ".cache",
    args.board,
    `class-${args.classNumber}`,
    args.subject
  );
  const outPath = path.join(
    cwd,
    "content",
    args.board,
    `class-${args.classNumber}`,
    `${args.subject}.draft.json`
  );

  console.log(
    `Generating ${args.board}/class-${args.classNumber}/${args.subject}`
  );
  console.log(`  ${skeleton.chapters.length} chapters in curriculum`);
  console.log(`  Cache: ${path.relative(cwd, cacheDir)}`);
  console.log(`  Output: ${path.relative(cwd, outPath)}`);

  const className = `Class ${args.classNumber}`;
  const totals = { promptTokens: 0, completionTokens: 0, calls: 0 };

  const generatedChapters: Manifest["chapters"] = [];

  for (const chapter of skeleton.chapters) {
    if (args.onlyChapter && chapter.chapterNumber !== args.onlyChapter) {
      continue;
    }
    const cachePath = path.join(cacheDir, `chapter-${chapter.chapterNumber}.json`);

    let cached =
      args.force
        ? null
        : await readJsonIfExists<{
            chapter: typeof chapter;
            exercises: ManifestExercise[];
          }>(cachePath);

    if (cached) {
      console.log(
        `  [${chapter.chapterNumber}/${skeleton.chapters.length}] ${chapter.name} — cached (${cached.exercises.length} exercises)`
      );
      generatedChapters.push({
        slug: chapter.slug,
        name: chapter.name,
        chapterNumber: chapter.chapterNumber,
        description: chapter.description,
        exercises: cached.exercises,
      });
      continue;
    }

    console.log(
      `  [${chapter.chapterNumber}/${skeleton.chapters.length}] ${chapter.name} — planning...`
    );
    const { plan, usage: planUsage } = await planChapter({
      boardName: found.board.name,
      className,
      subjectName: found.subject.name,
      chapterName: chapter.name,
      chapterNumber: chapter.chapterNumber,
    });
    totals.promptTokens += planUsage.prompt_tokens;
    totals.completionTokens += planUsage.completion_tokens;
    totals.calls += 1;
    console.log(`    plan: ${plan.length} exercise(s) — ${plan.map((p) => p.exerciseNumber).join(", ")}`);

    const exercises: ManifestExercise[] = [];
    for (const ex of plan) {
      console.log(
        `    generating ${ex.exerciseNumber} (${ex.type}, ${ex.questionsRequested}q)...`
      );
      const { exercise, usage } = await generateExercise({
        boardName: found.board.name,
        className,
        subjectName: found.subject.name,
        chapterName: chapter.name,
        chapterNumber: chapter.chapterNumber,
        exerciseNumber: ex.exerciseNumber,
        exerciseType: ex.type,
        questionsRequested: ex.questionsRequested,
        topicHints: ex.topicHints,
      });
      totals.promptTokens += usage.prompt_tokens;
      totals.completionTokens += usage.completion_tokens;
      totals.calls += 1;
      exercises.push(exercise);
    }

    cached = {
      chapter: {
        slug: chapter.slug,
        name: chapter.name,
        chapterNumber: chapter.chapterNumber,
        description: chapter.description,
      },
      exercises,
    };
    await writeJson(cachePath, cached);

    generatedChapters.push({
      slug: chapter.slug,
      name: chapter.name,
      chapterNumber: chapter.chapterNumber,
      description: chapter.description,
      exercises,
    });
  }

  // If --chapter was passed, merge with any existing draft so we don't lose
  // unrelated chapters from a prior run.
  let draft: Manifest;
  if (args.onlyChapter) {
    const existing = await readJsonIfExists<Manifest>(outPath);
    const existingByNumber = new Map(
      (existing?.chapters ?? []).map((c) => [c.chapterNumber, c])
    );
    for (const ch of generatedChapters) {
      existingByNumber.set(ch.chapterNumber, ch);
    }
    const merged: Manifest["chapters"] = skeleton.chapters
      .map((c) => existingByNumber.get(c.chapterNumber))
      .filter((c): c is NonNullable<typeof c> => c != null);
    draft = manifestSchema.parse({
      board: skeleton.board,
      standard: skeleton.standard,
      subject: skeleton.subject,
      chapters: merged,
    });
  } else {
    draft = manifestSchema.parse({
      board: skeleton.board,
      standard: skeleton.standard,
      subject: skeleton.subject,
      chapters: generatedChapters,
    });
  }

  await writeJson(outPath, draft);

  console.log("");
  console.log(`Wrote ${path.relative(cwd, outPath)}`);
  console.log(
    `  ${draft.chapters.length} chapters / ${countExercises(draft)} exercises / ${countQuestions(draft)} questions`
  );
  console.log(
    `  ${totals.calls} API call(s), ${totals.promptTokens} prompt + ${totals.completionTokens} completion tokens`
  );
  console.log("");
  console.log(
    "Next: review the draft, rename .draft.json -> .json, then run pnpm content:ingest"
  );
}

function countExercises(m: Manifest) {
  return m.chapters.reduce((n, c) => n + c.exercises.length, 0);
}

function countQuestions(m: Manifest) {
  return m.chapters.reduce(
    (n, c) => n + c.exercises.reduce((m, e) => m + e.questions.length, 0),
    0
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
