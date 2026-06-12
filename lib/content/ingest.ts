 
import { eq, and, inArray, notInArray } from "drizzle-orm";
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
import type { Manifest, ManifestQuestion } from "./manifest";

// Idempotent ingest. Given a parsed manifest, this function ensures the
// database matches it exactly:
//   - Adds new rows
//   - Updates changed rows in place
//   - Deletes any rows under this (board, class, subject) that are no
//     longer present in the manifest
// Order in the manifest's arrays becomes sortOrder in the DB.
//
// Each ingest runs in a single transaction so a half-applied update can't
// leave the site in a broken state.

export type IngestStats = {
  board: { slug: string; created: boolean };
  standard: { classNumber: number; created: boolean };
  subject: { slug: string; created: boolean };
  chapters: { added: number; updated: number; removed: number };
  exercises: { added: number; updated: number; removed: number };
  questions: { added: number; updated: number; removed: number };
  solutions: { upserted: number };
};

export async function ingestManifest(manifest: Manifest): Promise<IngestStats> {
  return db.transaction(async (tx) => {
    const stats: IngestStats = {
      board: { slug: manifest.board.slug, created: false },
      standard: { classNumber: manifest.standard.classNumber, created: false },
      subject: { slug: manifest.subject.slug, created: false },
      chapters: { added: 0, updated: 0, removed: 0 },
      exercises: { added: 0, updated: 0, removed: 0 },
      questions: { added: 0, updated: 0, removed: 0 },
      solutions: { upserted: 0 },
    };

    // Board ----------------------------------------------------------------
    let board = (
      await tx
        .select()
        .from(boards)
        .where(eq(boards.slug, manifest.board.slug))
        .limit(1)
    )[0];
    if (!board) {
      board = (
        await tx
          .insert(boards)
          .values({
            slug: manifest.board.slug,
            name: manifest.board.name,
            state: manifest.board.state,
            description: manifest.board.description,
            metaTitle: `${manifest.board.name} Solutions, Question Banks and Past Papers`,
            metaDescription: manifest.board.description,
          })
          .returning()
      )[0]!;
      stats.board.created = true;
    } else {
      await tx
        .update(boards)
        .set({
          name: manifest.board.name,
          state: manifest.board.state,
          description: manifest.board.description,
          updatedAt: new Date(),
        })
        .where(eq(boards.id, board.id));
    }

    // Standard -------------------------------------------------------------
    let standard = (
      await tx
        .select()
        .from(standards)
        .where(
          and(
            eq(standards.boardId, board.id),
            eq(standards.classNumber, manifest.standard.classNumber)
          )
        )
        .limit(1)
    )[0];
    if (!standard) {
      standard = (
        await tx
          .insert(standards)
          .values({
            boardId: board.id,
            slug: `class-${manifest.standard.classNumber}`,
            name: `Class ${manifest.standard.classNumber}`,
            classNumber: manifest.standard.classNumber,
            level: manifest.standard.level,
            description: manifest.standard.description,
            sortOrder: manifest.standard.classNumber,
          })
          .returning()
      )[0]!;
      stats.standard.created = true;
    } else {
      await tx
        .update(standards)
        .set({
          level: manifest.standard.level,
          description: manifest.standard.description,
          updatedAt: new Date(),
        })
        .where(eq(standards.id, standard.id));
    }

    // Subject --------------------------------------------------------------
    let subject = (
      await tx
        .select()
        .from(subjects)
        .where(
          and(
            eq(subjects.standardId, standard.id),
            eq(subjects.slug, manifest.subject.slug)
          )
        )
        .limit(1)
    )[0];
    if (!subject) {
      subject = (
        await tx
          .insert(subjects)
          .values({
            standardId: standard.id,
            slug: manifest.subject.slug,
            name: manifest.subject.name,
            color: manifest.subject.color,
            description: manifest.subject.description,
          })
          .returning()
      )[0]!;
      stats.subject.created = true;
    } else {
      await tx
        .update(subjects)
        .set({
          name: manifest.subject.name,
          color: manifest.subject.color,
          description: manifest.subject.description,
          updatedAt: new Date(),
        })
        .where(eq(subjects.id, subject.id));
    }

    // Chapters -------------------------------------------------------------
    const existingChapters = await tx
      .select()
      .from(chapters)
      .where(eq(chapters.subjectId, subject.id));
    const existingChapterBySlug = new Map(
      existingChapters.map((c) => [c.slug, c])
    );

    const manifestChapterSlugs = new Set(manifest.chapters.map((c) => c.slug));
    const removedChapterIds = existingChapters
      .filter((c) => !manifestChapterSlugs.has(c.slug))
      .map((c) => c.id);
    if (removedChapterIds.length > 0) {
      await tx
        .delete(chapters)
        .where(inArray(chapters.id, removedChapterIds));
      stats.chapters.removed = removedChapterIds.length;
    }

    for (let i = 0; i < manifest.chapters.length; i++) {
      const mch = manifest.chapters[i]!;
      const existing = existingChapterBySlug.get(mch.slug);
      let chapterRow: typeof chapters.$inferSelect;
      if (!existing) {
        chapterRow = (
          await tx
            .insert(chapters)
            .values({
              subjectId: subject.id,
              slug: mch.slug,
              name: mch.name,
              chapterNumber: mch.chapterNumber,
              description: mch.description,
              sortOrder: i,
            })
            .returning()
        )[0]!;
        stats.chapters.added++;
      } else {
        chapterRow = (
          await tx
            .update(chapters)
            .set({
              name: mch.name,
              chapterNumber: mch.chapterNumber,
              description: mch.description,
              sortOrder: i,
              updatedAt: new Date(),
            })
            .where(eq(chapters.id, existing.id))
            .returning()
        )[0]!;
        stats.chapters.updated++;
      }

      // Exercises ----------------------------------------------------------
      const existingExercises = await tx
        .select()
        .from(exercises)
        .where(eq(exercises.chapterId, chapterRow.id));
      const existingExerciseBySlug = new Map(
        existingExercises.map((e) => [e.slug, e])
      );
      const manifestExerciseSlugs = new Set(
        mch.exercises.map((e) => e.slug)
      );
      const removedExerciseIds = existingExercises
        .filter((e) => !manifestExerciseSlugs.has(e.slug))
        .map((e) => e.id);
      if (removedExerciseIds.length > 0) {
        await tx
          .delete(exercises)
          .where(inArray(exercises.id, removedExerciseIds));
        stats.exercises.removed += removedExerciseIds.length;
      }

      for (let j = 0; j < mch.exercises.length; j++) {
        const mex = mch.exercises[j]!;
        const existingEx = existingExerciseBySlug.get(mex.slug);
        let exerciseRow: typeof exercises.$inferSelect;
        if (!existingEx) {
          exerciseRow = (
            await tx
              .insert(exercises)
              .values({
                chapterId: chapterRow.id,
                slug: mex.slug,
                name: mex.name,
                exerciseNumber: mex.exerciseNumber,
                type: mex.type,
                sortOrder: j,
              })
              .returning()
          )[0]!;
          stats.exercises.added++;
        } else {
          exerciseRow = (
            await tx
              .update(exercises)
              .set({
                name: mex.name,
                exerciseNumber: mex.exerciseNumber,
                type: mex.type,
                sortOrder: j,
                updatedAt: new Date(),
              })
              .where(eq(exercises.id, existingEx.id))
              .returning()
          )[0]!;
          stats.exercises.updated++;
        }

        // Questions --------------------------------------------------------
        await syncQuestionsForExercise(tx, exerciseRow.id, mex.questions, stats);
      }
    }

    return stats;
  });
}

// Sync questions + solutions + mcqs for one exercise. Natural key for a
// question is (exerciseId, questionNumber). Solutions are 1:1 with
// questions, MCQs are 1:1 when type is "mcq".
async function syncQuestionsForExercise(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  exerciseId: string,
  manifestQuestions: ManifestQuestion[],
  stats: IngestStats
) {
  const existingQuestions = await tx
    .select()
    .from(questions)
    .where(eq(questions.exerciseId, exerciseId));
  const existingByNumber = new Map(
    existingQuestions.map((q) => [q.questionNumber, q])
  );
  const manifestNumbers = new Set(
    manifestQuestions.map((q) => q.questionNumber)
  );
  const removedQuestionIds = existingQuestions
    .filter((q) => !manifestNumbers.has(q.questionNumber))
    .map((q) => q.id);
  if (removedQuestionIds.length > 0) {
    await tx
      .delete(questions)
      .where(inArray(questions.id, removedQuestionIds));
    stats.questions.removed += removedQuestionIds.length;
  }

  for (let i = 0; i < manifestQuestions.length; i++) {
    const mq = manifestQuestions[i]!;
    const existing = existingByNumber.get(mq.questionNumber);
    let questionRow: typeof questions.$inferSelect;
    if (!existing) {
      questionRow = (
        await tx
          .insert(questions)
          .values({
            exerciseId,
            questionNumber: mq.questionNumber,
            questionText: mq.question,
            questionHtml: mq.questionHtml,
            difficulty: mq.difficulty,
            marks: mq.marks,
            type: mq.type,
            meta: (mq.meta ?? null) as never,
            sortOrder: i,
          })
          .returning()
      )[0]!;
      stats.questions.added++;
    } else {
      questionRow = (
        await tx
          .update(questions)
          .set({
            questionText: mq.question,
            questionHtml: mq.questionHtml,
            difficulty: mq.difficulty,
            marks: mq.marks,
            type: mq.type,
            meta: (mq.meta ?? null) as never,
            sortOrder: i,
            updatedAt: new Date(),
          })
          .where(eq(questions.id, existing.id))
          .returning()
      )[0]!;
      stats.questions.updated++;
    }

    // Solution: 1:1 with question. Replace whatever is there.
    const solutionText =
      mq.solution.text ??
      mq.solution.steps.map((s) => s.text).join("\n\n") +
        (mq.solution.answer ? `\n\nAnswer: ${mq.solution.answer}` : "");
    await tx
      .delete(solutions)
      .where(eq(solutions.questionId, questionRow.id));
    await tx.insert(solutions).values({
      questionId: questionRow.id,
      solutionText,
      steps: mq.solution.steps,
      isVerified: false,
    });
    stats.solutions.upserted++;

    // MCQ: 1:1 when present. Replace whatever is there.
    await tx.delete(mcqs).where(eq(mcqs.questionId, questionRow.id));
    if (mq.mcq) {
      await tx.insert(mcqs).values({
        questionId: questionRow.id,
        optionA: mq.mcq.optionA,
        optionB: mq.mcq.optionB,
        optionC: mq.mcq.optionC,
        optionD: mq.mcq.optionD,
        correctOption: mq.mcq.correctOption,
        explanation: mq.mcq.explanation,
      });
    }
  }

  // Suppress unused-import warning when no MCQs are involved across all
  // questions; notInArray is kept available in case we extend pruning.
  void notInArray;
}

export function summarizeStats(stats: IngestStats): string {
  const lines = [
    `  Board    : ${stats.board.slug} (${stats.board.created ? "created" : "updated"})`,
    `  Class    : ${stats.standard.classNumber} (${stats.standard.created ? "created" : "updated"})`,
    `  Subject  : ${stats.subject.slug} (${stats.subject.created ? "created" : "updated"})`,
    `  Chapters : +${stats.chapters.added} ~${stats.chapters.updated} -${stats.chapters.removed}`,
    `  Exercises: +${stats.exercises.added} ~${stats.exercises.updated} -${stats.exercises.removed}`,
    `  Questions: +${stats.questions.added} ~${stats.questions.updated} -${stats.questions.removed}`,
    `  Solutions: ${stats.solutions.upserted} upserted`,
  ];
  return lines.join("\n");
}
