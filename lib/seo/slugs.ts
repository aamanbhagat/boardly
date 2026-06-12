import type {
  Board,
  Standard,
  Subject,
  Chapter,
  Exercise,
  Question,
} from "@/lib/db/schema";

// Centralized URL builders. Sitemap, breadcrumbs, internal links, and
// canonical tags all call into here so URL shape can never drift.

export type BoardLike = Pick<Board, "slug">;
export type StandardLike = Pick<Standard, "slug" | "classNumber">;
export type SubjectLike = Pick<Subject, "slug">;
export type ChapterLike = Pick<Chapter, "slug" | "chapterNumber">;
export type ExerciseLike = Pick<Exercise, "slug" | "exerciseNumber">;
export type QuestionLike = Pick<Question, "questionNumber">;

export const boardPath = (b: BoardLike) => `/${b.slug}`;

export const standardPath = (b: BoardLike, s: StandardLike) =>
  `${boardPath(b)}/class-${s.classNumber}`;

export const subjectPath = (
  b: BoardLike,
  s: StandardLike,
  sub: SubjectLike
) => `${standardPath(b, s)}/${sub.slug}`;

export const chapterPath = (
  b: BoardLike,
  s: StandardLike,
  sub: SubjectLike,
  c: ChapterLike
) =>
  `${subjectPath(b, s, sub)}/chapter-${c.chapterNumber}-${c.slug}`;

export const exercisePath = (
  b: BoardLike,
  s: StandardLike,
  sub: SubjectLike,
  c: ChapterLike,
  e: ExerciseLike
) =>
  `${chapterPath(b, s, sub, c)}/exercise-${e.exerciseNumber}-${e.slug}`;

export const questionPath = (
  b: BoardLike,
  s: StandardLike,
  sub: SubjectLike,
  c: ChapterLike,
  e: ExerciseLike,
  q: QuestionLike
) => `${exercisePath(b, s, sub, c, e)}/q-${q.questionNumber}`;

const SLUG_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

export function assertValidSlug(slug: string) {
  if (!SLUG_OK.test(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
}

// Reverse helpers for parsing route params --------------------------------

const CHAPTER_RE = /^chapter-(\d+)-(.+)$/;
const EXERCISE_RE = /^exercise-(\d+(?:-\d+)*)-(.+)$/;
const CLASS_RE = /^class-(\d+)$/;
const QUESTION_RE = /^q-(.+)$/;

export function parseChapterSegment(segment: string) {
  const m = CHAPTER_RE.exec(segment);
  if (!m) return null;
  const [, chapterNumber, slug] = m;
  return { chapterNumber: Number(chapterNumber), slug: slug ?? "" };
}

export function parseExerciseSegment(segment: string) {
  const m = EXERCISE_RE.exec(segment);
  if (!m) return null;
  const [, exerciseNumber, slug] = m;
  return { exerciseNumber: exerciseNumber ?? "", slug: slug ?? "" };
}

export function parseClassSegment(segment: string) {
  const m = CLASS_RE.exec(segment);
  if (!m) return null;
  return Number(m[1]);
}

export function parseQuestionSegment(segment: string) {
  const m = QUESTION_RE.exec(segment);
  if (!m) return null;
  return { questionNumber: m[1] ?? "" };
}
