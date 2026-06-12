 
import { db } from "@/lib/db";
import {
  boards,
  standards,
  subjects,
  chapters,
  exercises,
  questions,
  solutions,
} from "@/lib/db/schema";
import { slugify } from "@/lib/seo/slugs";

type SubjectSeed = {
  name: string;
  color: string;
  description: string;
};

const SUBJECTS_BY_LEVEL: Record<"primary" | "secondary" | "higher_secondary", SubjectSeed[]> = {
  primary: [
    { name: "Mathematics", color: "math", description: "Foundations of arithmetic, geometry and reasoning." },
    { name: "Science", color: "science", description: "Observation, experiments and the physical world." },
    { name: "English", color: "english", description: "Reading, comprehension, grammar and writing." },
    { name: "Hindi", color: "language", description: "Hindi language, literature and grammar." },
    { name: "Environmental Studies", color: "geography", description: "Plants, animals, communities and the environment." },
    { name: "General Knowledge", color: "history", description: "World awareness and current events for primary students." },
    { name: "Computer Studies", color: "math", description: "Introduction to computers and digital literacy." },
    { name: "Art and Craft", color: "english", description: "Creative expression through art and craft activities." },
  ],
  secondary: [
    { name: "Mathematics", color: "math", description: "Algebra, geometry, trigonometry and statistics." },
    { name: "Science", color: "science", description: "Physics, chemistry and biology fundamentals." },
    { name: "English", color: "english", description: "Literature, comprehension and language skills." },
    { name: "Hindi", color: "language", description: "Hindi literature, prose, poetry and grammar." },
    { name: "Social Science", color: "history", description: "History, civics, geography and economics." },
    { name: "Sanskrit", color: "language", description: "Classical Sanskrit grammar and literature." },
    { name: "Information Technology", color: "math", description: "Programming, productivity tools and IT skills." },
    { name: "Physical Education", color: "geography", description: "Health, fitness and sports education." },
  ],
  higher_secondary: [
    { name: "Mathematics", color: "math", description: "Calculus, vectors, probability and matrices." },
    { name: "Physics", color: "science", description: "Mechanics, thermodynamics, optics and modern physics." },
    { name: "Chemistry", color: "science", description: "Organic, inorganic and physical chemistry." },
    { name: "Biology", color: "science", description: "Cell biology, genetics, ecology and physiology." },
    { name: "English", color: "english", description: "Advanced literature and analytical writing." },
    { name: "Economics", color: "history", description: "Microeconomics, macroeconomics and Indian economy." },
    { name: "Accountancy", color: "math", description: "Accounting principles, partnerships and analysis." },
    { name: "Computer Science", color: "math", description: "Algorithms, data structures and programming." },
  ],
};

const CHAPTER_NAMES: Record<string, string[]> = {
  Mathematics: [
    "Real Numbers",
    "Polynomials",
    "Pair of Linear Equations",
    "Quadratic Equations",
    "Arithmetic Progressions",
    "Triangles",
    "Coordinate Geometry",
  ],
  Science: [
    "Chemical Reactions",
    "Acids, Bases and Salts",
    "Metals and Non-metals",
    "Carbon and its Compounds",
    "Life Processes",
    "Control and Coordination",
    "Light - Reflection and Refraction",
  ],
  Physics: [
    "Electric Charges and Fields",
    "Electrostatic Potential",
    "Current Electricity",
    "Moving Charges and Magnetism",
    "Magnetism and Matter",
    "Electromagnetic Induction",
    "Alternating Current",
  ],
  Chemistry: [
    "The Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "p-Block Elements",
    "Coordination Compounds",
  ],
  Biology: [
    "Reproduction in Organisms",
    "Sexual Reproduction in Flowering Plants",
    "Human Reproduction",
    "Reproductive Health",
    "Principles of Inheritance",
    "Molecular Basis of Inheritance",
    "Evolution",
  ],
  English: [
    "A Letter to God",
    "Nelson Mandela",
    "Two Stories about Flying",
    "From the Diary of Anne Frank",
    "The Hundred Dresses",
    "Glimpses of India",
    "Mijbil the Otter",
  ],
  default: [
    "Introduction",
    "Foundations",
    "Core Concepts",
    "Applications",
    "Advanced Topics",
    "Practical Skills",
    "Review and Synthesis",
  ],
};

const EXERCISE_PATTERN = ["1.1", "1.2", "1.3"];

function questionStub(n: number, chapter: string, subject: string) {
  const samples = [
    `Define ${chapter.toLowerCase()} in the context of ${subject.toLowerCase()} and give two examples.`,
    `Solve the following problem from ${chapter}: a sample situation requiring ${subject.toLowerCase()} concepts.`,
    `Explain the importance of the topic ${chapter} in everyday life.`,
    `State and prove the main result discussed in ${chapter}.`,
    `Compare and contrast two ideas introduced in ${chapter}.`,
    `Draw a labelled diagram illustrating a key concept from ${chapter}.`,
    `Write the formula derived in ${chapter} and apply it to a real-world scenario.`,
  ];
  return samples[n % samples.length] ?? samples[0]!;
}

function solutionStub(chapter: string, subject: string) {
  return [
    `To answer this question on ${chapter}, recall the core ideas of ${subject.toLowerCase()}.`,
    `Apply the relevant definition or formula step-by-step.`,
    `Verify the result and connect it back to the broader concept covered in ${chapter}.`,
  ].join("\n\n");
}

function levelFor(classNumber: number): "primary" | "secondary" | "higher_secondary" {
  if (classNumber <= 5) return "primary";
  if (classNumber <= 10) return "secondary";
  return "higher_secondary";
}

const BOARDS = [
  {
    name: "Maharashtra State Board",
    state: "Maharashtra",
    description: "Maharashtra State Board of Secondary and Higher Secondary Education syllabi.",
  },
  {
    name: "CBSE",
    state: null,
    description: "Central Board of Secondary Education NCERT-aligned syllabi for India.",
  },
  {
    name: "ICSE",
    state: null,
    description: "Indian Certificate of Secondary Education syllabi by CISCE.",
  },
  {
    name: "Karnataka Board",
    state: "Karnataka",
    description: "Karnataka State syllabi for primary, secondary and higher secondary classes.",
  },
  {
    name: "Gujarat Board",
    state: "Gujarat",
    description: "Gujarat Secondary and Higher Secondary Education Board syllabi.",
  },
];

// Postgres has a 65535 bind parameter cap per statement; chunk inserts to stay
// well under that.
async function batchInsert<TRow, TReturn>(
  rows: TRow[],
  perChunk: number,
  insert: (chunk: TRow[]) => Promise<TReturn[]>
): Promise<TReturn[]> {
  if (rows.length === 0) return [];
  const results: TReturn[] = [];
  for (let i = 0; i < rows.length; i += perChunk) {
    const chunk = rows.slice(i, i + perChunk);
    results.push(...(await insert(chunk)));
  }
  return results;
}

async function main() {
  const t0 = Date.now();
  console.log("Resetting all content tables...");
  await db.delete(solutions);
  await db.delete(questions);
  await db.delete(exercises);
  await db.delete(chapters);
  await db.delete(subjects);
  await db.delete(standards);
  await db.delete(boards);

  console.log("Inserting boards...");
  const insertedBoards = await db
    .insert(boards)
    .values(
      BOARDS.map((b, i) => ({
        slug: slugify(b.name),
        name: b.name,
        state: b.state,
        description: b.description,
        sortOrder: i,
        metaTitle: `${b.name} Solutions, Question Banks and Past Papers`,
        metaDescription: b.description,
      }))
    )
    .returning();
  console.log(`  Boards inserted: ${insertedBoards.length}`);

  // Standards — one batch across every board.
  const standardRows = insertedBoards.flatMap((board) =>
    Array.from({ length: 12 }, (_, i) => i + 1).map((classNumber) => ({
      boardId: board.id,
      slug: `class-${classNumber}`,
      name: `Class ${classNumber}`,
      classNumber,
      level: levelFor(classNumber),
      sortOrder: classNumber,
    }))
  );
  const insertedStandards = await batchInsert(
    standardRows,
    500,
    async (chunk) => db.insert(standards).values(chunk).returning()
  );
  console.log(`  Standards inserted: ${insertedStandards.length}`);

  // Subjects — one batch across every standard.
  const subjectRows = insertedStandards.flatMap((standard) => {
    const seeds = SUBJECTS_BY_LEVEL[standard.level];
    return seeds.map((s, i) => ({
      standardId: standard.id,
      slug: slugify(s.name),
      name: s.name,
      description: s.description,
      color: s.color,
      sortOrder: i,
    }));
  });
  const insertedSubjects = await batchInsert(
    subjectRows,
    500,
    async (chunk) => db.insert(subjects).values(chunk).returning()
  );
  console.log(`  Subjects inserted: ${insertedSubjects.length}`);

  // Chapters — one batch across every subject. We need the subject's
  // level for chapter naming, so look it up from the standards map.
  const standardLevelById = new Map(
    insertedStandards.map((s) => [s.id, s.name])
  );
  const chapterRows = insertedSubjects.flatMap((subject) => {
    const standardName = standardLevelById.get(subject.standardId) ?? "Class";
    const names = CHAPTER_NAMES[subject.name] ?? CHAPTER_NAMES.default!;
    return names.map((name, i) => ({
      subjectId: subject.id,
      slug: slugify(name),
      name,
      chapterNumber: i + 1,
      description: `Comprehensive coverage of ${name} for ${standardName} ${subject.name} students.`,
      sortOrder: i,
    }));
  });
  const insertedChapters = await batchInsert(
    chapterRows,
    500,
    async (chunk) => db.insert(chapters).values(chunk).returning()
  );
  console.log(`  Chapters inserted: ${insertedChapters.length}`);

  // Exercises — one batch across every chapter.
  const exerciseRows = insertedChapters.flatMap((chapter) =>
    EXERCISE_PATTERN.map((number, i) => ({
      chapterId: chapter.id,
      slug: slugify(`exercise-${number}`),
      name: `Exercise ${number}`,
      exerciseNumber: number,
      type: "exercise" as const,
      sortOrder: i,
    }))
  );
  const insertedExercises = await batchInsert(
    exerciseRows,
    500,
    async (chunk) => db.insert(exercises).values(chunk).returning()
  );
  console.log(`  Exercises inserted: ${insertedExercises.length}`);

  // Questions — one batch across every exercise.
  const chapterNameById = new Map(
    insertedChapters.map((c) => [c.id, c.name])
  );
  const subjectNameByChapterId = new Map(
    insertedChapters.map((c) => {
      const subj = insertedSubjects.find((s) => s.id === c.subjectId);
      return [c.id, subj?.name ?? "Subject"];
    })
  );
  const exerciseChapterMap = new Map(
    insertedExercises.map((ex) => [ex.id, ex.chapterId])
  );
  const questionRowsPlain = insertedExercises.flatMap((exercise) => {
    const chapterId = exerciseChapterMap.get(exercise.id)!;
    const chapterName = chapterNameById.get(chapterId) ?? "Chapter";
    const subjectName = subjectNameByChapterId.get(chapterId) ?? "Subject";
    return Array.from({ length: 5 }, (_, i) => ({
      exerciseId: exercise.id,
      questionNumber: `${exercise.exerciseNumber}.${i + 1}`,
      questionText: questionStub(i, chapterName, subjectName),
      difficulty:
        i < 2 ? ("easy" as const) : i < 4 ? ("medium" as const) : ("hard" as const),
      marks: i < 2 ? 2 : i < 4 ? 3 : 5,
      type: "short" as const,
      sortOrder: i,
      _chapterName: chapterName,
      _subjectName: subjectName,
    }));
  });
  const insertedQuestions = await batchInsert(
    questionRowsPlain.map(({ _chapterName, _subjectName, ...row }) => row),
    1000,
    async (chunk) => db.insert(questions).values(chunk).returning()
  );
  console.log(`  Questions inserted: ${insertedQuestions.length}`);

  // Solutions — one row per question.
  const questionContextById = new Map(
    questionRowsPlain.map((q, i) => [
      insertedQuestions[i]!.id,
      { chapter: q._chapterName, subject: q._subjectName },
    ])
  );
  const solutionRows = insertedQuestions.map((q) => {
    const ctx = questionContextById.get(q.id) ?? {
      chapter: "Chapter",
      subject: "Subject",
    };
    return {
      questionId: q.id,
      solutionText: solutionStub(ctx.chapter, ctx.subject),
      isVerified: true,
      steps: [
        { text: "Restate the question and identify the relevant concept." },
        { text: "Apply the definition, formula, or theorem from the chapter." },
        { text: "Conclude with the final result and a brief justification." },
      ],
    };
  });
  await batchInsert(solutionRows, 1000, async (chunk) =>
    db.insert(solutions).values(chunk).returning({ id: solutions.id })
  );
  console.log(`  Solutions inserted: ${solutionRows.length}`);

  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Seed complete in ${seconds}s.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
