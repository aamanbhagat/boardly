import { z } from "zod";

// Manifest = the single source of truth for one (board, class, subject).
// Ingest reads these JSON files and upserts the database. Order in arrays =
// sortOrder in the DB. Slugs are natural keys; remove a row from the array
// and it disappears from the DB on the next ingest.

const slug = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case");

const nonEmpty = z.string().min(1).trim();

export const standardLevelSchema = z.enum([
  "primary",
  "secondary",
  "higher_secondary",
]);

export const questionTypeSchema = z.enum([
  "short",
  "long",
  "mcq",
  "multi_correct",
  "numerical",
  "true_false",
  "fill_in_blank",
  "match",
  "assertion_reason",
  "case_based",
  "diagram",
  "one_word",
]);

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const exerciseTypeSchema = z.enum([
  "exercise",
  "miscellaneous",
  "additional",
  "intext",
]);

const subjectColorSchema = z.enum([
  "math",
  "science",
  "english",
  "language",
  "history",
  "geography",
]);

const stepSchema = z.object({
  text: nonEmpty,
  expression: z.string().optional(),
});

const solutionSchema = z.object({
  steps: z.array(stepSchema).min(1),
  answer: z.string().optional(),
  text: z.string().optional(),
});

const mcqSchema = z.object({
  optionA: nonEmpty,
  optionB: nonEmpty,
  optionC: nonEmpty,
  optionD: nonEmpty,
  correctOption: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().optional(),
});

export const questionSchema = z.object({
  questionNumber: nonEmpty,
  type: questionTypeSchema.default("short"),
  difficulty: difficultySchema.default("medium"),
  marks: z.number().int().positive().optional(),
  question: nonEmpty.refine((s) => s.length >= 20, {
    message: "question must be at least 20 chars",
  }),
  questionHtml: z.string().optional(),
  solution: solutionSchema,
  mcq: mcqSchema.optional(),
  meta: z.unknown().optional(),
});

export const exerciseSchema = z.object({
  slug,
  name: nonEmpty,
  exerciseNumber: nonEmpty,
  type: exerciseTypeSchema.default("exercise"),
  questions: z.array(questionSchema).min(1),
});

export const chapterSchema = z.object({
  slug,
  name: nonEmpty,
  chapterNumber: z.number().int().positive(),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1),
});

export const manifestSchema = z.object({
  board: z.object({
    slug,
    name: nonEmpty,
    state: z.string().optional(),
    description: z.string().optional(),
  }),
  standard: z.object({
    classNumber: z.number().int().min(1).max(12),
    level: standardLevelSchema,
    description: z.string().optional(),
  }),
  subject: z.object({
    slug,
    name: nonEmpty,
    color: subjectColorSchema,
    description: z.string().optional(),
  }),
  chapters: z.array(chapterSchema).min(1),
});

export type Manifest = z.infer<typeof manifestSchema>;
export type ManifestChapter = z.infer<typeof chapterSchema>;
export type ManifestExercise = z.infer<typeof exerciseSchema>;
export type ManifestQuestion = z.infer<typeof questionSchema>;
export type ManifestSolution = z.infer<typeof solutionSchema>;

export function parseManifest(input: unknown): Manifest {
  return manifestSchema.parse(input);
}

export function safeParseManifest(input: unknown) {
  return manifestSchema.safeParse(input);
}
