import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  jsonb,
  boolean,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => createId());
const createdAt = () =>
  timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow();

export const standardLevel = pgEnum("standard_level", [
  "primary",
  "secondary",
  "higher_secondary",
]);

export const questionType = pgEnum("question_type", [
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

export const difficulty = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const exerciseType = pgEnum("exercise_type", [
  "exercise",
  "miscellaneous",
  "additional",
  "intext",
]);

export const userRole = pgEnum("user_role", ["student", "teacher", "admin"]);

export const contentType = pgEnum("content_type", [
  "exercise",
  "chapter",
  "note",
  "past_paper",
  "mcq",
]);

export const boards = pgTable(
  "boards",
  {
    id: id(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    state: text("state"),
    description: text("description"),
    logoUrl: text("logo_url"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("boards_slug_uniq").on(t.slug),
    index("boards_sort_idx").on(t.sortOrder),
  ]
);

export const standards = pgTable(
  "standards",
  {
    id: id(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    classNumber: integer("class_number").notNull(),
    level: standardLevel("level").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("standards_board_slug_uniq").on(t.boardId, t.slug),
    uniqueIndex("standards_board_class_uniq").on(t.boardId, t.classNumber),
    index("standards_board_idx").on(t.boardId, t.sortOrder),
  ]
);

export const subjects = pgTable(
  "subjects",
  {
    id: id(),
    standardId: text("standard_id")
      .notNull()
      .references(() => standards.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    iconUrl: text("icon_url"),
    color: text("color"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("subjects_standard_slug_uniq").on(t.standardId, t.slug),
    index("subjects_standard_idx").on(t.standardId, t.sortOrder),
  ]
);

export const chapters = pgTable(
  "chapters",
  {
    id: id(),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    chapterNumber: integer("chapter_number").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("chapters_subject_slug_uniq").on(t.subjectId, t.slug),
    uniqueIndex("chapters_subject_number_uniq").on(t.subjectId, t.chapterNumber),
    index("chapters_subject_sort_idx").on(t.subjectId, t.sortOrder),
  ]
);

export const exercises = pgTable(
  "exercises",
  {
    id: id(),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    exerciseNumber: text("exercise_number").notNull(),
    type: exerciseType("type").notNull().default("exercise"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("exercises_chapter_slug_uniq").on(t.chapterId, t.slug),
    index("exercises_chapter_sort_idx").on(t.chapterId, t.sortOrder),
  ]
);

export const questions = pgTable(
  "questions",
  {
    id: id(),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    questionNumber: text("question_number").notNull(),
    questionText: text("question_text").notNull(),
    questionHtml: text("question_html"),
    difficulty: difficulty("difficulty").notNull().default("medium"),
    marks: integer("marks"),
    type: questionType("type").notNull().default("short"),
    meta: jsonb("meta").$type<QuestionMeta>(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("questions_exercise_idx").on(t.exerciseId, t.sortOrder),
    index("questions_text_fts").using(
      "gin",
      sql`to_tsvector('english', ${t.questionText})`
    ),
  ]
);

// Per-format payload stored on questions.meta. Each variant matches the
// renderer that consumes it. New format → new variant; older rows just have
// `meta: null` and the renderer falls back to plain text.
export type QuestionMeta =
  | {
      kind: "match";
      columnAHeading?: string;
      columnBHeading?: string;
      pairs: Array<{ left: string; right: string }>;
      // Optional: alternative options shown as multiple choice picks.
      // Each option's `mapping` lists the right-side index for each left row.
      options?: Array<{
        label: string;
        mapping: number[];
      }>;
      // Index into options[] of the correct combination.
      correctOption?: number;
    }
  | {
      kind: "multi_correct";
      // Subset of A/B/C/D that are correct.
      correctOptions: Array<"A" | "B" | "C" | "D">;
    }
  | {
      kind: "assertion_reason";
      assertion: string;
      reason: string;
      // 1-based index of the chosen statement among the four standard
      // assertion/reason options. See `ASSERTION_REASON_OPTIONS` for the
      // canonical wording rendered to the user.
      correctOption: 1 | 2 | 3 | 4;
    }
  | {
      kind: "case_based";
      passage: string;
      // Optional caption for an image accompanying the passage.
      figureCaption?: string;
      figureUrl?: string;
    }
  | {
      kind: "diagram";
      figureUrl: string;
      figureCaption?: string;
      // Pre-numbered labels rendered alongside the diagram.
      labels?: Array<{ marker: string; text: string }>;
    };

export const solutions = pgTable(
  "solutions",
  {
    id: id(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    solutionText: text("solution_text").notNull(),
    solutionHtml: text("solution_html"),
    steps: jsonb("steps").$type<Array<{ text: string; expression?: string }>>(),
    isVerified: boolean("is_verified").notNull().default(false),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("solutions_question_idx").on(t.questionId),
    index("solutions_text_fts").using(
      "gin",
      sql`to_tsvector('english', ${t.solutionText})`
    ),
  ]
);

export const mcqs = pgTable(
  "mcqs",
  {
    id: id(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    optionA: text("option_a").notNull(),
    optionB: text("option_b").notNull(),
    optionC: text("option_c").notNull(),
    optionD: text("option_d").notNull(),
    correctOption: text("correct_option").notNull(),
    explanation: text("explanation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("mcqs_question_uniq").on(t.questionId)]
);

export const pastPapers = pgTable(
  "past_papers",
  {
    id: id(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    standardId: text("standard_id")
      .notNull()
      .references(() => standards.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    year: integer("year").notNull(),
    month: text("month"),
    paperUrl: text("paper_url"),
    solutionAvailable: boolean("solution_available").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("past_papers_subject_slug_uniq").on(t.subjectId, t.slug),
    index("past_papers_taxonomy_idx").on(
      t.boardId,
      t.standardId,
      t.subjectId,
      t.year
    ),
  ]
);

export const notes = pgTable(
  "notes",
  {
    id: id(),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id").references(() => chapters.id, {
      onDelete: "cascade",
    }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    contentHtml: text("content_html"),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("notes_subject_slug_uniq").on(t.subjectId, t.slug),
    index("notes_subject_idx").on(t.subjectId),
  ]
);

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name"),
    role: userRole("role").notNull().default("student"),
    avatarUrl: text("avatar_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_uniq").on(t.email)]
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentType: contentType("content_type").notNull(),
    contentId: text("content_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.contentType, t.contentId] }),
    index("bookmarks_user_idx").on(t.userId),
  ]
);

export const views = pgTable(
  "views",
  {
    contentType: contentType("content_type").notNull(),
    contentId: text("content_id").notNull(),
    day: date("day").notNull().defaultNow(),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.contentType, t.contentId, t.day] }),
    index("views_content_idx").on(t.contentType, t.contentId),
  ]
);

export const feedback = pgTable("feedback", {
  id: id(),
  contentType: contentType("content_type").notNull(),
  contentId: text("content_id").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  message: text("message").notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// Relations -----------------------------------------------------------------

export const boardsRelations = relations(boards, ({ many }) => ({
  standards: many(standards),
  pastPapers: many(pastPapers),
}));

export const standardsRelations = relations(standards, ({ one, many }) => ({
  board: one(boards, { fields: [standards.boardId], references: [boards.id] }),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  standard: one(standards, {
    fields: [subjects.standardId],
    references: [standards.id],
  }),
  chapters: many(chapters),
  notes: many(notes),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  chapter: one(chapters, {
    fields: [exercises.chapterId],
    references: [chapters.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  exercise: one(exercises, {
    fields: [questions.exerciseId],
    references: [exercises.id],
  }),
  solutions: many(solutions),
  mcq: one(mcqs, {
    fields: [questions.id],
    references: [mcqs.questionId],
  }),
}));

export const solutionsRelations = relations(solutions, ({ one }) => ({
  question: one(questions, {
    fields: [solutions.questionId],
    references: [questions.id],
  }),
  author: one(users, {
    fields: [solutions.authorId],
    references: [users.id],
  }),
}));

// Types ---------------------------------------------------------------------

export type Board = typeof boards.$inferSelect;
export type Standard = typeof standards.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Solution = typeof solutions.$inferSelect;
export type Mcq = typeof mcqs.$inferSelect;
