 
/**
 * Minimal seeder: creates only Maharashtra > Class 12 > Biology > Chapter 1.
 * This is the path `seed-demo.ts` looks for. Use this to bootstrap the demo
 * quickly while a full `db:seed` is impractical (Neon HTTP driver is slow
 * for the deeply nested full seed).
 */
import { db } from "@/lib/db";
import { boards, standards, subjects, chapters } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

async function main() {
  let board = await db.query.boards.findFirst({
    where: eq(boards.slug, "maharashtra-state-board"),
  });
  if (!board) {
    [board] = await db
      .insert(boards)
      .values({
        slug: "maharashtra-state-board",
        name: "Maharashtra State Board",
        state: "Maharashtra",
        description:
          "Maharashtra State Board of Secondary and Higher Secondary Education syllabi.",
        sortOrder: 0,
      })
      .returning();
    console.log("Inserted board: Maharashtra State Board");
  }
  if (!board) throw new Error("Board insert failed.");

  let standard = await db.query.standards.findFirst({
    where: and(eq(standards.boardId, board.id), eq(standards.classNumber, 12)),
  });
  if (!standard) {
    [standard] = await db
      .insert(standards)
      .values({
        boardId: board.id,
        slug: "class-12",
        name: "Class 12",
        classNumber: 12,
        level: "higher_secondary",
        description: "Higher secondary, Class 12.",
        sortOrder: 12,
      })
      .returning();
    console.log("Inserted standard: Class 12");
  }
  if (!standard) throw new Error("Standard insert failed.");

  let subject = await db.query.subjects.findFirst({
    where: and(eq(subjects.standardId, standard.id), eq(subjects.slug, "biology")),
  });
  if (!subject) {
    [subject] = await db
      .insert(subjects)
      .values({
        standardId: standard.id,
        slug: "biology",
        name: "Biology",
        description: "Cell biology, genetics, ecology and physiology.",
        color: "science",
        sortOrder: 3,
      })
      .returning();
    console.log("Inserted subject: Biology");
  }
  if (!subject) throw new Error("Subject insert failed.");

  let chapter = await db.query.chapters.findFirst({
    where: and(eq(chapters.subjectId, subject.id), eq(chapters.chapterNumber, 1)),
  });
  if (!chapter) {
    [chapter] = await db
      .insert(chapters)
      .values({
        subjectId: subject.id,
        slug: "reproduction-in-organisms",
        name: "Reproduction in Organisms",
        chapterNumber: 1,
        description: "An overview of asexual and sexual reproduction.",
        sortOrder: 1,
      })
      .returning();
    console.log("Inserted chapter: Reproduction in Organisms");
  }
  if (!chapter) throw new Error("Chapter insert failed.");

  console.log("\nDemo path ready:");
  console.log(`  ${board.name} > ${standard.name} > ${subject.name} > ${chapter.name}`);
  console.log(
    `  /${board.slug}/class-${standard.classNumber}/${subject.slug}/chapter-${chapter.chapterNumber}-${chapter.slug}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
