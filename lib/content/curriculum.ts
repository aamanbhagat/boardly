import type { Manifest } from "./manifest";

// The curriculum spine: which boards, classes, subjects, and chapters exist.
// Hand-curated from public board syllabi (NCERT, ICSE, etc.). This is the
// only manually-maintained data — chapter order, names, and chapter numbers
// come from here. Question/solution content is generated against this spine.
//
// Add a board → class → subject → chapter list, and `pnpm content:generate`
// can fill in questions and solutions for it.

export type Level = "primary" | "secondary" | "higher_secondary";

export type CurriculumSubject = {
  slug: string;
  name: string;
  color: "math" | "science" | "english" | "language" | "history" | "geography";
  description: string;
  chapters: Array<{
    slug: string;
    name: string;
    chapterNumber: number;
    description?: string;
  }>;
};

export type CurriculumClass = {
  classNumber: number;
  level: Level;
  subjects: CurriculumSubject[];
};

export type CurriculumBoard = {
  slug: string;
  name: string;
  state?: string;
  description: string;
  classes: CurriculumClass[];
};

export const levelFor = (classNumber: number): Level =>
  classNumber <= 5
    ? "primary"
    : classNumber <= 10
      ? "secondary"
      : "higher_secondary";

// CBSE Class 10 — the canonical NCERT chapter list for 2025-26 syllabus.
// Source: NCERT textbook table of contents.
const CBSE_CLASS_10_MATH: CurriculumSubject = {
  slug: "mathematics",
  name: "Mathematics",
  color: "math",
  description:
    "NCERT Class 10 Mathematics — Real Numbers, Polynomials, Coordinate Geometry, Trigonometry, Statistics and Probability.",
  chapters: [
    { slug: "real-numbers", name: "Real Numbers", chapterNumber: 1 },
    { slug: "polynomials", name: "Polynomials", chapterNumber: 2 },
    {
      slug: "pair-of-linear-equations-in-two-variables",
      name: "Pair of Linear Equations in Two Variables",
      chapterNumber: 3,
    },
    { slug: "quadratic-equations", name: "Quadratic Equations", chapterNumber: 4 },
    {
      slug: "arithmetic-progressions",
      name: "Arithmetic Progressions",
      chapterNumber: 5,
    },
    { slug: "triangles", name: "Triangles", chapterNumber: 6 },
    { slug: "coordinate-geometry", name: "Coordinate Geometry", chapterNumber: 7 },
    {
      slug: "introduction-to-trigonometry",
      name: "Introduction to Trigonometry",
      chapterNumber: 8,
    },
    {
      slug: "some-applications-of-trigonometry",
      name: "Some Applications of Trigonometry",
      chapterNumber: 9,
    },
    { slug: "circles", name: "Circles", chapterNumber: 10 },
    { slug: "areas-related-to-circles", name: "Areas Related to Circles", chapterNumber: 11 },
    { slug: "surface-areas-and-volumes", name: "Surface Areas and Volumes", chapterNumber: 12 },
    { slug: "statistics", name: "Statistics", chapterNumber: 13 },
    { slug: "probability", name: "Probability", chapterNumber: 14 },
  ],
};

const CBSE_CLASS_10_SCIENCE: CurriculumSubject = {
  slug: "science",
  name: "Science",
  color: "science",
  description:
    "NCERT Class 10 Science — Physics, Chemistry, and Biology fundamentals.",
  chapters: [
    {
      slug: "chemical-reactions-and-equations",
      name: "Chemical Reactions and Equations",
      chapterNumber: 1,
    },
    { slug: "acids-bases-and-salts", name: "Acids, Bases and Salts", chapterNumber: 2 },
    { slug: "metals-and-non-metals", name: "Metals and Non-metals", chapterNumber: 3 },
    {
      slug: "carbon-and-its-compounds",
      name: "Carbon and its Compounds",
      chapterNumber: 4,
    },
    { slug: "life-processes", name: "Life Processes", chapterNumber: 5 },
    {
      slug: "control-and-coordination",
      name: "Control and Coordination",
      chapterNumber: 6,
    },
    {
      slug: "how-do-organisms-reproduce",
      name: "How do Organisms Reproduce?",
      chapterNumber: 7,
    },
    { slug: "heredity", name: "Heredity", chapterNumber: 8 },
    {
      slug: "light-reflection-and-refraction",
      name: "Light - Reflection and Refraction",
      chapterNumber: 9,
    },
    {
      slug: "human-eye-and-colourful-world",
      name: "The Human Eye and the Colourful World",
      chapterNumber: 10,
    },
    { slug: "electricity", name: "Electricity", chapterNumber: 11 },
    {
      slug: "magnetic-effects-of-electric-current",
      name: "Magnetic Effects of Electric Current",
      chapterNumber: 12,
    },
    {
      slug: "our-environment",
      name: "Our Environment",
      chapterNumber: 13,
    },
  ],
};

// Top-level export. Add more boards/classes/subjects here as the project
// grows. Generation iterates this tree.
export const CURRICULUM: CurriculumBoard[] = [
  {
    slug: "cbse",
    name: "CBSE",
    state: "All India",
    description:
      "Central Board of Secondary Education — the largest national board in India, following NCERT curriculum.",
    classes: [
      {
        classNumber: 10,
        level: "secondary",
        subjects: [CBSE_CLASS_10_MATH, CBSE_CLASS_10_SCIENCE],
      },
    ],
  },
];

// Lookup helpers used by generate.ts to build a manifest skeleton.
export function findCurriculumSubject(
  boardSlug: string,
  classNumber: number,
  subjectSlug: string
) {
  const board = CURRICULUM.find((b) => b.slug === boardSlug);
  if (!board) return null;
  const cls = board.classes.find((c) => c.classNumber === classNumber);
  if (!cls) return null;
  const subject = cls.subjects.find((s) => s.slug === subjectSlug);
  if (!subject) return null;
  return { board, class: cls, subject };
}

export function manifestSkeleton(
  boardSlug: string,
  classNumber: number,
  subjectSlug: string
): Pick<Manifest, "board" | "standard" | "subject"> & {
  chapters: Array<Pick<Manifest["chapters"][number], "slug" | "name" | "chapterNumber" | "description">>;
} {
  const found = findCurriculumSubject(boardSlug, classNumber, subjectSlug);
  if (!found) {
    throw new Error(
      `Unknown curriculum target: ${boardSlug}/class-${classNumber}/${subjectSlug}`
    );
  }
  const { board, class: cls, subject } = found;
  return {
    board: {
      slug: board.slug,
      name: board.name,
      state: board.state,
      description: board.description,
    },
    standard: { classNumber: cls.classNumber, level: cls.level },
    subject: {
      slug: subject.slug,
      name: subject.name,
      color: subject.color,
      description: subject.description,
    },
    chapters: subject.chapters.map((c) => ({
      slug: c.slug,
      name: c.name,
      chapterNumber: c.chapterNumber,
      description: c.description,
    })),
  };
}
