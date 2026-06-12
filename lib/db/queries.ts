import "server-only";
import { eq, and, asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import {
  boards,
  standards,
  subjects,
  chapters,
  exercises,
  questions,
  solutions,
  mcqs,
} from "@/lib/db/schema";
import { CACHE_PROFILE } from "@/lib/cache";

// All read accessors are cached. Cache keys are derived from arguments.
// Tags follow `entity:slug` convention so /api/revalidate can invalidate
// surgically when content changes.

// Each accessor is defensive against DB unavailability: missing connection
// or transient failure resolves to null/[]. This lets the production build
// prerender the placeholder routes (required by Cache Components rules)
// even when the DB is not provisioned yet.

export async function getAllBoards() {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag("boards");
  try {
    return await db
      .select()
      .from(boards)
      .orderBy(asc(boards.sortOrder), asc(boards.name));
  } catch {
    return [];
  }
}

export async function getBoardBySlug(slug: string) {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag(`board:${slug}`);
  try {
    const rows = await db
      .select()
      .from(boards)
      .where(eq(boards.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getBoardWithStandards(slug: string) {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag(`board:${slug}`);
  try {
    return (
      (await db.query.boards.findFirst({
        where: eq(boards.slug, slug),
        with: {
          standards: {
            orderBy: [asc(standards.classNumber)],
          },
        },
      })) ?? null
    );
  } catch {
    return null;
  }
}

export async function getStandardWithSubjects(
  boardSlug: string,
  classNumber: number
) {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag(`standard:${boardSlug}/${classNumber}`);
  try {
    const board = await db.query.boards.findFirst({
      where: eq(boards.slug, boardSlug),
    });
    if (!board) return null;

    const standard = await db.query.standards.findFirst({
      where: and(
        eq(standards.boardId, board.id),
        eq(standards.classNumber, classNumber)
      ),
      with: {
        subjects: {
          orderBy: [asc(subjects.sortOrder), asc(subjects.name)],
        },
      },
    });
    if (!standard) return null;

    return { board, standard };
  } catch {
    return null;
  }
}

export async function getSubjectWithChapters(
  boardSlug: string,
  classNumber: number,
  subjectSlug: string
) {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag(`subject:${boardSlug}/${classNumber}/${subjectSlug}`);
  try {
    const ctx = await getStandardWithSubjects(boardSlug, classNumber);
    if (!ctx) return null;

    const subject = ctx.standard.subjects.find((s) => s.slug === subjectSlug);
    if (!subject) return null;

    const chapterRows = await db
      .select()
      .from(chapters)
      .where(eq(chapters.subjectId, subject.id))
      .orderBy(asc(chapters.chapterNumber));

    return {
      board: ctx.board,
      standard: ctx.standard,
      subject,
      chapters: chapterRows,
    };
  } catch {
    return null;
  }
}

export async function getChapterWithExercises(
  boardSlug: string,
  classNumber: number,
  subjectSlug: string,
  chapterNumber: number,
  chapterSlug: string
) {
  "use cache";
  cacheLife(CACHE_PROFILE.solutions);
  cacheTag(
    `chapter:${boardSlug}/${classNumber}/${subjectSlug}/${chapterNumber}-${chapterSlug}`
  );
  try {
    const ctx = await getSubjectWithChapters(boardSlug, classNumber, subjectSlug);
    if (!ctx) return null;

    const chapter = ctx.chapters.find(
      (c) => c.chapterNumber === chapterNumber && c.slug === chapterSlug
    );
    if (!chapter) return null;

    const exerciseRows = await db
      .select()
      .from(exercises)
      .where(eq(exercises.chapterId, chapter.id))
      .orderBy(asc(exercises.sortOrder), asc(exercises.exerciseNumber));

    return { ...ctx, chapter, exercises: exerciseRows };
  } catch {
    return null;
  }
}

export async function getExerciseFull(
  boardSlug: string,
  classNumber: number,
  subjectSlug: string,
  chapterNumber: number,
  chapterSlug: string,
  exerciseNumber: string,
  exerciseSlug: string
) {
  "use cache";
  cacheLife(CACHE_PROFILE.solutions);
  cacheTag(
    `exercise:${boardSlug}/${classNumber}/${subjectSlug}/${chapterNumber}-${chapterSlug}/${exerciseNumber}-${exerciseSlug}`
  );
  try {
    const ctx = await getChapterWithExercises(
      boardSlug,
      classNumber,
      subjectSlug,
      chapterNumber,
      chapterSlug
    );
    if (!ctx) return null;

    const exercise = ctx.exercises.find(
      (e) => e.exerciseNumber === exerciseNumber && e.slug === exerciseSlug
    );
    if (!exercise) return null;

    const questionRows = await db.query.questions.findMany({
      where: eq(questions.exerciseId, exercise.id),
      orderBy: [asc(questions.sortOrder), asc(questions.questionNumber)],
      with: {
        solutions: {
          orderBy: [asc(solutions.createdAt)],
        },
        mcq: true,
      },
    });

    return { ...ctx, exercise, questions: questionRows };
  } catch {
    return null;
  }
}

export async function getQuestionFull(
  boardSlug: string,
  classNumber: number,
  subjectSlug: string,
  chapterNumber: number,
  chapterSlug: string,
  exerciseNumber: string,
  exerciseSlug: string,
  questionNumber: string
) {
  "use cache";
  cacheLife(CACHE_PROFILE.solutions);
  cacheTag(
    `question:${boardSlug}/${classNumber}/${subjectSlug}/${chapterNumber}-${chapterSlug}/${exerciseNumber}-${exerciseSlug}/${questionNumber}`
  );
  try {
    const ctx = await getExerciseFull(
      boardSlug,
      classNumber,
      subjectSlug,
      chapterNumber,
      chapterSlug,
      exerciseNumber,
      exerciseSlug
    );
    if (!ctx) return null;

    const idx = ctx.questions.findIndex(
      (q) => q.questionNumber === questionNumber
    );
    if (idx === -1) return null;
    const question = ctx.questions[idx]!;
    const prev = idx > 0 ? ctx.questions[idx - 1] : null;
    const next = idx < ctx.questions.length - 1 ? ctx.questions[idx + 1] : null;

    const related = ctx.questions
      .filter((q) => q.id !== question.id)
      .slice(0, 12);

    return { ...ctx, question, prev, next, related };
  } catch {
    return null;
  }
}

// Sitemap accessors --------------------------------------------------------

export async function getAllBoardSlugs() {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag("sitemap:boards");
  try {
    return await db
      .select({ slug: boards.slug, updatedAt: boards.updatedAt })
      .from(boards);
  } catch {
    return [];
  }
}

export async function getAllStandardRoutes() {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag("sitemap:standards");
  try {
    return await db
      .select({
        boardSlug: boards.slug,
        classNumber: standards.classNumber,
        updatedAt: standards.updatedAt,
      })
      .from(standards)
      .innerJoin(boards, eq(standards.boardId, boards.id));
  } catch {
    return [];
  }
}

export async function getAllSubjectRoutes() {
  "use cache";
  cacheLife(CACHE_PROFILE.taxonomy);
  cacheTag("sitemap:subjects");
  try {
    return await db
      .select({
        boardSlug: boards.slug,
        classNumber: standards.classNumber,
        subjectSlug: subjects.slug,
        updatedAt: subjects.updatedAt,
      })
      .from(subjects)
      .innerJoin(standards, eq(subjects.standardId, standards.id))
      .innerJoin(boards, eq(standards.boardId, boards.id));
  } catch {
    return [];
  }
}

export async function getAllChapterRoutes() {
  "use cache";
  cacheLife(CACHE_PROFILE.solutions);
  cacheTag("sitemap:chapters");
  try {
    return await db
      .select({
        boardSlug: boards.slug,
        classNumber: standards.classNumber,
        subjectSlug: subjects.slug,
        chapterNumber: chapters.chapterNumber,
        chapterSlug: chapters.slug,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
      .innerJoin(standards, eq(subjects.standardId, standards.id))
      .innerJoin(boards, eq(standards.boardId, boards.id));
  } catch {
    return [];
  }
}

export async function getAllExerciseRoutes() {
  "use cache";
  cacheLife(CACHE_PROFILE.solutions);
  cacheTag("sitemap:exercises");
  try {
    return await db
      .select({
        boardSlug: boards.slug,
        classNumber: standards.classNumber,
        subjectSlug: subjects.slug,
        chapterNumber: chapters.chapterNumber,
        chapterSlug: chapters.slug,
        exerciseNumber: exercises.exerciseNumber,
        exerciseSlug: exercises.slug,
        updatedAt: exercises.updatedAt,
      })
      .from(exercises)
      .innerJoin(chapters, eq(exercises.chapterId, chapters.id))
      .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
      .innerJoin(standards, eq(subjects.standardId, standards.id))
      .innerJoin(boards, eq(standards.boardId, boards.id));
  } catch {
    return [];
  }
}

export async function getAllQuestionRoutes() {
  "use cache";
  cacheLife(CACHE_PROFILE.solutions);
  cacheTag("sitemap:questions");
  try {
    return await db
      .select({
        boardSlug: boards.slug,
        classNumber: standards.classNumber,
        subjectSlug: subjects.slug,
        chapterNumber: chapters.chapterNumber,
        chapterSlug: chapters.slug,
        exerciseNumber: exercises.exerciseNumber,
        exerciseSlug: exercises.slug,
        questionNumber: questions.questionNumber,
        updatedAt: questions.updatedAt,
      })
      .from(questions)
      .innerJoin(exercises, eq(questions.exerciseId, exercises.id))
      .innerJoin(chapters, eq(exercises.chapterId, chapters.id))
      .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
      .innerJoin(standards, eq(subjects.standardId, standards.id))
      .innerJoin(boards, eq(standards.boardId, boards.id));
  } catch {
    return [];
  }
}
