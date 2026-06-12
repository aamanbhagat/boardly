import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  boards,
  standards,
  subjects,
  chapters,
  exercises,
  questions,
} from "@/lib/db/schema";
import {
  ensureContentIndex,
  type ContentDoc,
  CONTENT_INDEX,
  adminClient,
} from "@/lib/search/client";
import {
  exercisePath,
  chapterPath,
  subjectPath,
} from "@/lib/seo/slugs";

// Build full-corpus search documents by walking the taxonomy. The result is
// flat enough for Meilisearch to rank across types in one query while still
// supporting filtering by `type`/`boardSlug`/`classNumber`/`subjectSlug`.

async function buildDocs(): Promise<ContentDoc[]> {
  const rows = await db
    .select({
      boardId: boards.id,
      boardSlug: boards.slug,
      boardName: boards.name,
      standardId: standards.id,
      standardSlug: standards.slug,
      classNumber: standards.classNumber,
      standardName: standards.name,
      subjectId: subjects.id,
      subjectSlug: subjects.slug,
      subjectName: subjects.name,
    })
    .from(subjects)
    .innerJoin(standards, eq(subjects.standardId, standards.id))
    .innerJoin(boards, eq(standards.boardId, boards.id))
    .orderBy(asc(boards.sortOrder), asc(standards.classNumber));

  const docs: ContentDoc[] = [];

  for (const r of rows) {
    const subjectShape = {
      board: { slug: r.boardSlug, name: r.boardName },
      standard: {
        slug: r.standardSlug,
        classNumber: r.classNumber,
        name: r.standardName,
      },
      subject: { slug: r.subjectSlug, name: r.subjectName },
    };

    docs.push({
      id: `subject:${r.subjectId}`,
      type: "subject",
      title: `${r.subjectName} ${r.standardName} ${r.boardName}`,
      body: `Solutions, notes and past papers for ${r.subjectName} ${r.standardName} ${r.boardName}.`,
      url: subjectPath(subjectShape.board, subjectShape.standard, subjectShape.subject),
      boardSlug: r.boardSlug,
      boardName: r.boardName,
      classNumber: r.classNumber,
      subjectSlug: r.subjectSlug,
      subjectName: r.subjectName,
      popularity: 50,
    });

    const chapterRows = await db
      .select()
      .from(chapters)
      .where(eq(chapters.subjectId, r.subjectId))
      .orderBy(asc(chapters.chapterNumber));

    for (const ch of chapterRows) {
      const chapterShape = { ...ch };
      docs.push({
        id: `chapter:${ch.id}`,
        type: "chapter",
        title: `${ch.name} - ${r.subjectName} ${r.standardName}`,
        body: ch.description ?? `Chapter ${ch.chapterNumber}: ${ch.name}.`,
        url: chapterPath(
          subjectShape.board,
          subjectShape.standard,
          subjectShape.subject,
          chapterShape
        ),
        boardSlug: r.boardSlug,
        boardName: r.boardName,
        classNumber: r.classNumber,
        subjectSlug: r.subjectSlug,
        subjectName: r.subjectName,
        chapterSlug: ch.slug,
        chapterName: ch.name,
        popularity: 60,
      });

      const exerciseRows = await db
        .select()
        .from(exercises)
        .where(eq(exercises.chapterId, ch.id))
        .orderBy(asc(exercises.exerciseNumber));

      for (const ex of exerciseRows) {
        docs.push({
          id: `exercise:${ex.id}`,
          type: "exercise",
          title: `${ch.name} Exercise ${ex.exerciseNumber} - ${r.subjectName}`,
          body: `Step-by-step solutions for ${ch.name} Exercise ${ex.exerciseNumber}.`,
          url: exercisePath(
            subjectShape.board,
            subjectShape.standard,
            subjectShape.subject,
            chapterShape,
            ex
          ),
          boardSlug: r.boardSlug,
          boardName: r.boardName,
          classNumber: r.classNumber,
          subjectSlug: r.subjectSlug,
          subjectName: r.subjectName,
          chapterSlug: ch.slug,
          chapterName: ch.name,
          popularity: 80,
        });

        const questionRows = await db
          .select()
          .from(questions)
          .where(eq(questions.exerciseId, ex.id))
          .orderBy(asc(questions.questionNumber));

        for (const q of questionRows) {
          docs.push({
            id: `question:${q.id}`,
            type: "question",
            title: `Q${q.questionNumber}: ${q.questionText.slice(0, 80)}`,
            body: q.questionText,
            url: `${exercisePath(
              subjectShape.board,
              subjectShape.standard,
              subjectShape.subject,
              chapterShape,
              ex
            )}#q-${q.questionNumber}`,
            boardSlug: r.boardSlug,
            boardName: r.boardName,
            classNumber: r.classNumber,
            subjectSlug: r.subjectSlug,
            subjectName: r.subjectName,
            chapterSlug: ch.slug,
            chapterName: ch.name,
            popularity: 40,
          });
        }
      }
    }
  }

  return docs;
}

export async function reindexAll() {
  const index = await ensureContentIndex();
  const docs = await buildDocs();
  if (docs.length === 0) return { count: 0 };
  // Replace the whole index in batches.
  const BATCH = 1000;
  for (let i = 0; i < docs.length; i += BATCH) {
    await index.addDocuments(docs.slice(i, i + BATCH));
  }
  return { count: docs.length };
}

export async function clearIndex() {
  const client = adminClient();
  await client.index(CONTENT_INDEX).deleteAllDocuments();
}
