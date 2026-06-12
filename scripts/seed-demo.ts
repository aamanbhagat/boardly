 
/**
 * Inserts a "Format Showcase" exercise on Maharashtra > Class 12 > Biology >
 * Chapter 1, with one question per supported format. Idempotent — drops the
 * existing demo exercise (if any) before re-inserting.
 *
 * Run: pnpm tsx scripts/seed-demo.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { and, eq } from "drizzle-orm";
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
  type QuestionMeta,
} from "@/lib/db/schema";

const DEMO_SLUG = "format-showcase";
const DEMO_EXERCISE_NUMBER = "0";

type DemoQuestion = {
  number: string;
  type:
    | "mcq"
    | "multi_correct"
    | "fill_in_blank"
    | "true_false"
    | "one_word"
    | "short"
    | "long"
    | "numerical"
    | "match"
    | "assertion_reason"
    | "case_based"
    | "diagram";
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  text: string;
  meta?: QuestionMeta;
  mcq?: {
    a: string;
    b: string;
    c: string;
    d: string;
    correct: "A" | "B" | "C" | "D";
    explanation?: string;
  };
  solution: string;
  steps?: Array<{ text: string; expression?: string }>;
};

const DEMO: DemoQuestion[] = [
  {
    number: "1",
    type: "mcq",
    difficulty: "easy",
    marks: 1,
    text: "Insect-pollinated flowers usually possess ______.",
    mcq: {
      a: "==Sticky pollens== with rough surface",
      b: "Large quantities of dry pollens",
      c: "Smooth, light-coloured pollens",
      d: "No pollen at all",
      correct: "A",
      explanation:
        "Insect-pollinated (==entomophilous==) flowers produce sticky pollens with a rough surface so the pollen sticks to the body of visiting insects.",
    },
    solution:
      "The correct answer is sticky pollens with rough surface — a hallmark of insect pollination.",
  },
  {
    number: "2",
    type: "multi_correct",
    difficulty: "medium",
    marks: 2,
    text: "Which of the following are ==prime numbers==? Select all that apply.",
    meta: {
      kind: "multi_correct",
      correctOptions: ["A", "C", "D"],
    },
    mcq: {
      a: "$2$",
      b: "$9$",
      c: "$13$",
      d: "$29$",
      correct: "A",
      explanation:
        "A prime number is a natural number greater than $1$ with no positive divisors other than $1$ and itself. $9 = 3 \\times 3$ is composite.",
    },
    solution:
      "Primes among the options are $2$, $13$ and $29$. $9$ is composite because $9 = 3 \\times 3$.",
  },
  {
    number: "3",
    type: "fill_in_blank",
    difficulty: "easy",
    marks: 1,
    text: "The ______ contains the egg or ovum.",
    solution: "embryo sac",
  },
  {
    number: "4",
    type: "true_false",
    difficulty: "easy",
    marks: 1,
    text: "State whether True or False: The chemical formula of water is $\\ce{H2O}$ and water is a ==polar molecule==.",
    solution: "True",
  },
  {
    number: "5",
    type: "one_word",
    difficulty: "easy",
    marks: 1,
    text: "Name the process by which green plants prepare their own food using sunlight, $\\ce{CO2}$ and $\\ce{H2O}$.",
    solution: "Photosynthesis",
  },
  {
    number: "6",
    type: "short",
    difficulty: "medium",
    marks: 3,
    text: "Define ==double fertilisation== and state where it occurs.",
    solution:
      "Double fertilisation is the fusion of one male gamete with the egg (==syngamy==) and another male gamete with the secondary nucleus (==triple fusion==), occurring in the embryo sac of angiosperms.",
    steps: [
      { text: "==Syngamy== — fusion of one male gamete with the egg to form a diploid zygote." },
      {
        text: "==Triple fusion== — fusion of the second male gamete with the diploid secondary nucleus to form a triploid Primary Endosperm Nucleus (PEN).",
      },
      { text: "Both fusions occur inside the embryo sac, hence the term double fertilisation." },
    ],
  },
  {
    number: "7",
    type: "long",
    difficulty: "hard",
    marks: 5,
    text: "Describe the process of ==double fertilisation== in angiosperms.",
    solution:
      "Double fertilisation is the characteristic feature of angiosperms in which two male gametes participate in fertilisation simultaneously.",
    steps: [
      {
        text: "When the pollen grain reaches the stigma, it ==germinates== and forms a pollen tube.",
      },
      {
        text: "The pollen tube grows through the style and ovary, guided by chemicals secreted by the synergids.",
      },
      {
        text: "Usually it enters the ovule through the ==micropyle== — this is called porogamy.",
      },
      {
        text: "Inside the embryo sac, the contents of one synergid are absorbed and the pollen tube ruptures, releasing two non-motile male gametes.",
      },
      {
        text: "Syngamy: one male gamete fuses with the egg (n) to form a diploid zygote (2n) which develops into the embryo.",
      },
      {
        text: "Triple fusion: the second male gamete fuses with the diploid secondary nucleus (2n) to form a triploid Primary Endosperm Nucleus (3n) which develops into nutritive endosperm.",
      },
      {
        text: "Because both male gametes participate, fertilisation effectively occurs ==twice== in the same embryo sac — hence double fertilisation.",
      },
    ],
  },
  {
    number: "8",
    type: "numerical",
    difficulty: "medium",
    marks: 4,
    text: "A neutralisation reaction occurs as $\\ce{HCl + NaOH -> NaCl + H2O}$. If $25\\,\\text{mL}$ of $0.1\\,\\text{M}$ $\\ce{HCl}$ is fully neutralised by $\\ce{NaOH}$ of unknown concentration in $20\\,\\text{mL}$, find the molarity of the $\\ce{NaOH}$ solution.",
    solution: "$0.125\\,\\text{M}$",
    steps: [
      { text: "Use the dilution / titration relation:", expression: "M_1 V_1 = M_2 V_2" },
      {
        text: "Substitute the known values:",
        expression: "0.1 \\times 25 = M_2 \\times 20",
      },
      { text: "Solve for $M_2$:", expression: "M_2 = \\frac{2.5}{20} = 0.125 \\,\\text{M}" },
      {
        text: "Hence the ==molarity== of the $\\ce{NaOH}$ solution is $0.125\\,\\text{M}$.",
      },
    ],
  },
  {
    number: "9",
    type: "match",
    difficulty: "medium",
    marks: 4,
    text: "Match the structures before seed formation (Column I) with their structures after seed formation (Column II).",
    meta: {
      kind: "match",
      columnAHeading: "Column I (Before)",
      columnBHeading: "Column II (After)",
      pairs: [
        { left: "Funiculus", right: "Hilum" },
        { left: "Scar of ovule", right: "Tegmen" },
        { left: "Zygote", right: "Embryo" },
        { left: "Inner integument", right: "Stalk of seed" },
      ],
      // mapping[i] = index in `pairs[].right` that left[i] maps to
      options: [
        { label: "A→V, B→I, C→II, D→IV", mapping: [0, 1, 0, 0] },
        { label: "A→III, B→IV, C→I, D→V", mapping: [2, 3, 0, 0] },
        { label: "A→IV, B→I, C→V, D→II", mapping: [3, 0, 2, 1] },
        { label: "A→IV, B→V, C→III, D→II", mapping: [3, 0, 2, 1] },
      ],
      correctOption: 2,
    },
    solution: "A → IV, B → I, C → V, D → II",
  },
  {
    number: "10",
    type: "assertion_reason",
    difficulty: "medium",
    marks: 2,
    text: "Read the assertion (A) and reason (R) below and choose the correct option.",
    meta: {
      kind: "assertion_reason",
      assertion:
        "==Geitonogamy== is functionally cross-pollination but genetically similar to autogamy.",
      reason:
        "Geitonogamy involves a pollinator transferring pollen between two flowers of the ==same== plant.",
      correctOption: 1,
    },
    solution:
      "Both Assertion and Reason are true and the Reason correctly explains the Assertion. Geitonogamy uses an external agent (like autogamy doesn't), but the pollen and the egg come from the same plant — so genetically the offspring are like those from autogamy.",
  },
  {
    number: "11",
    type: "case_based",
    difficulty: "hard",
    marks: 5,
    text: "Read the passage and answer the question that follows.",
    meta: {
      kind: "case_based",
      passage:
        "A student observes a flowering plant that produces ==unisexual== flowers. The male and female flowers are present on the same plant but the anthers and stigma mature at different times. This temporal separation prevents the flower from pollinating itself. The student wonders what kind of contrivance the plant has evolved and why it matters for genetic variation.",
    },
    solution:
      "The plant shows ==dichogamy== — a temporal separation between anther dehiscence and stigma receptivity. Combined with monoecy (separate male and female flowers on the same plant), this prevents self-pollination, thereby promoting cross-pollination and increasing genetic variation in the offspring.",
    steps: [
      {
        text: "Identify the contrivance: anthers and stigma maturing at different times = ==dichogamy==.",
      },
      {
        text: "If anthers mature first the flower is protandrous; if the stigma matures first it is protogynous.",
      },
      {
        text: "Such mechanisms enforce ==xenogamy== (cross-pollination), increasing genetic variability.",
      },
    ],
  },
  {
    number: "12",
    type: "diagram",
    difficulty: "medium",
    marks: 4,
    text: "Identify the labelled parts of the embryo sac and explain ==double fertilisation==.",
    meta: {
      kind: "diagram",
      figureUrl:
        "https://images.unsplash.com/photo-1507298434392-1cd00f1bb1c1?auto=format&fit=crop&w=900&q=70",
      figureCaption: "Schematic of an angiosperm embryo sac (illustrative).",
      labels: [
        { marker: "1", text: "Stigma — receptive surface for the pollen grain." },
        {
          marker: "2",
          text: "Pollen tube growing through the style toward the ovule.",
        },
        { marker: "3", text: "==Synergids== — flank the egg cell." },
        { marker: "4", text: "==Egg cell== (n) — fuses with one male gamete in syngamy." },
        {
          marker: "5",
          text: "==Secondary nucleus== (2n) — fuses with the second male gamete in triple fusion.",
        },
      ],
    },
    solution:
      "The pollen tube discharges two male gametes into the embryo sac. One fuses with the egg (==syngamy==) → diploid zygote → embryo. The other fuses with the secondary nucleus (==triple fusion==) → triploid Primary Endosperm Nucleus → endosperm. Because two fusions occur, the process is called double fertilisation.",
  },
];

async function main() {
  const board = await db.query.boards.findFirst({
    where: eq(boards.slug, "maharashtra-state-board"),
  });
  if (!board) throw new Error("Run `pnpm db:seed` first — boards are missing.");

  const standard = await db.query.standards.findFirst({
    where: and(eq(standards.boardId, board.id), eq(standards.classNumber, 12)),
  });
  if (!standard) throw new Error("Class 12 not found for Maharashtra.");

  const subject = await db.query.subjects.findFirst({
    where: and(eq(subjects.standardId, standard.id), eq(subjects.slug, "biology")),
  });
  if (!subject) throw new Error("Biology subject not found.");

  const chapter = await db.query.chapters.findFirst({
    where: and(eq(chapters.subjectId, subject.id), eq(chapters.chapterNumber, 1)),
  });
  if (!chapter) throw new Error("Chapter 1 of Biology not found.");

  console.log(`Seeding demo into: ${board.name} > ${standard.name} > ${subject.name} > ${chapter.name}`);

  // Drop any existing demo exercise for idempotent runs.
  const existing = await db.query.exercises.findFirst({
    where: and(eq(exercises.chapterId, chapter.id), eq(exercises.slug, DEMO_SLUG)),
  });
  if (existing) {
    await db.delete(exercises).where(eq(exercises.id, existing.id));
    console.log("  Removed previous demo exercise.");
  }

  const [exercise] = await db
    .insert(exercises)
    .values({
      chapterId: chapter.id,
      slug: DEMO_SLUG,
      name: "Format Showcase",
      exerciseNumber: DEMO_EXERCISE_NUMBER,
      type: "exercise",
      sortOrder: -1,
    })
    .returning();
  if (!exercise) throw new Error("Could not insert demo exercise.");

  for (let i = 0; i < DEMO.length; i++) {
    const q = DEMO[i]!;
    const [inserted] = await db
      .insert(questions)
      .values({
        exerciseId: exercise.id,
        questionNumber: q.number,
        questionText: q.text,
        difficulty: q.difficulty,
        marks: q.marks,
        type: q.type,
        meta: q.meta ?? null,
        sortOrder: i,
      })
      .returning();
    if (!inserted) continue;

    if (q.mcq) {
      await db.insert(mcqs).values({
        questionId: inserted.id,
        optionA: q.mcq.a,
        optionB: q.mcq.b,
        optionC: q.mcq.c,
        optionD: q.mcq.d,
        correctOption: q.mcq.correct,
        explanation: q.mcq.explanation ?? null,
      });
    }

    await db.insert(solutions).values({
      questionId: inserted.id,
      solutionText: q.solution,
      isVerified: true,
      steps: q.steps ?? null,
    });
  }

  const base = `/${board.slug}/class-${standard.classNumber}/${subject.slug}/chapter-${chapter.chapterNumber}-${chapter.slug}/exercise-${DEMO_EXERCISE_NUMBER}-${DEMO_SLUG}`;
  console.log(`\nDemo seeded. ${DEMO.length} questions inserted.`);
  console.log(`\nExercise overview:\n  ${base}`);
  console.log(`\nPer-question links:`);
  for (const q of DEMO) {
    console.log(`  [${q.type.padEnd(17)}] ${base}/q-${q.number}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
