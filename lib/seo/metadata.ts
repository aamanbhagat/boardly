import type { Metadata } from "next";
import type {
  Board,
  Standard,
  Subject,
  Chapter,
  Exercise,
  Question,
} from "@/lib/db/schema";
import {
  boardPath,
  standardPath,
  subjectPath,
  chapterPath,
  exercisePath,
  questionPath,
} from "@/lib/seo/slugs";
import { absoluteUrl } from "@/lib/utils";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Boardly";

const baseRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large" as const,
    "max-video-preview": -1,
  },
};

function ogImage(params: Record<string, string | number>) {
  const search = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  );
  return absoluteUrl(`/api/og?${search.toString()}`);
}

function buildMeta(opts: {
  title: string;
  description: string;
  path: string;
  ogParams: Record<string, string | number>;
  ogType?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(opts.path);
  const image = ogImage(opts.ogParams);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: opts.ogType ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: baseRobots,
  };
}

// ---- Factories per page type --------------------------------------------

export function buildBoardMetadata(board: Board): Metadata {
  const title = `${board.name} Textbook Solutions, Question Banks & Past Papers`;
  const description =
    board.metaDescription ??
    `Free ${board.name} solutions for every class. Chapter-wise answers, question banks, MCQs, and past papers — verified by educators.`;
  return buildMeta({
    title,
    description,
    path: boardPath(board),
    ogParams: { type: "board", board: board.name },
  });
}

export function buildStandardMetadata(
  board: Board,
  standard: Standard
): Metadata {
  const title = `${board.name} Class ${standard.classNumber} All Subject Solutions & Notes`;
  const description = `Find all Class ${standard.classNumber} subject solutions, chapter explanations, MCQs and past papers for the ${board.name}. Free, complete and step-by-step.`;
  return buildMeta({
    title,
    description,
    path: standardPath(board, standard),
    ogParams: {
      type: "standard",
      board: board.name,
      class: standard.classNumber,
    },
  });
}

export function buildSubjectMetadata(
  board: Board,
  standard: Standard,
  subject: Subject,
  chapterCount: number
): Metadata {
  const title = `${subject.name} Class ${standard.classNumber} ${board.name} Solutions, Notes & Question Bank`;
  const description = `Step-by-step solutions for Class ${standard.classNumber} ${subject.name} (${board.name}). Covers all ${chapterCount} chapters with detailed explanations, MCQs, and important questions.`;
  return buildMeta({
    title,
    description,
    path: subjectPath(board, standard, subject),
    ogParams: {
      type: "subject",
      board: board.name,
      class: standard.classNumber,
      subject: subject.name,
    },
  });
}

export function buildChapterMetadata(
  board: Board,
  standard: Standard,
  subject: Subject,
  chapter: Chapter,
  exerciseCount: number
): Metadata {
  const title = `${chapter.name} - Class ${standard.classNumber} ${subject.name} ${board.name} Solutions`;
  const description = `Get step-by-step solutions for ${chapter.name} from Class ${standard.classNumber} ${subject.name} (${board.name}). All ${exerciseCount} exercises solved with detailed working and concept explanations.`;
  return buildMeta({
    title,
    description,
    path: chapterPath(board, standard, subject, chapter),
    ogParams: {
      type: "chapter",
      board: board.name,
      class: standard.classNumber,
      subject: subject.name,
      chapter: chapter.name,
    },
    ogType: "article",
  });
}

export function buildExerciseMetadata(
  board: Board,
  standard: Standard,
  subject: Subject,
  chapter: Chapter,
  exercise: Exercise,
  questionCount: number
): Metadata {
  const title = `${subject.name} Class ${standard.classNumber} ${board.name} Chapter ${chapter.chapterNumber} Exercise ${exercise.exerciseNumber} Solutions`;
  const description = `Free step-by-step solutions for Class ${standard.classNumber} ${subject.name} (${board.name}) Chapter ${chapter.chapterNumber} '${chapter.name}' Exercise ${exercise.exerciseNumber}. All ${questionCount} questions answered with detailed working.`;
  return buildMeta({
    title,
    description,
    path: exercisePath(board, standard, subject, chapter, exercise),
    ogParams: {
      type: "exercise",
      board: board.name,
      class: standard.classNumber,
      subject: subject.name,
      chapter: chapter.name,
      exercise: exercise.exerciseNumber,
      qCount: questionCount,
    },
    ogType: "article",
  });
}

const QUESTION_TEXT_MAX = 140;
const QUESTION_DESC_SNIPPET_MAX = 70;

function trimQuestion(text: string, max = QUESTION_TEXT_MAX) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + "…";
}

export function buildQuestionMetadata(
  board: Board,
  standard: Standard,
  subject: Subject,
  chapter: Chapter,
  exercise: Exercise,
  question: Question
): Metadata {
  const snippet = trimQuestion(question.questionText);
  const descSnippet = trimQuestion(question.questionText, QUESTION_DESC_SNIPPET_MAX);
  const title = `${snippet} - ${subject.name} Class ${standard.classNumber} ${board.name}`;
  const description = `Free step-by-step solution: ${descSnippet} — ${subject.name} Class ${standard.classNumber} ${board.name}.`;
  return buildMeta({
    title,
    description,
    path: questionPath(board, standard, subject, chapter, exercise, question),
    ogParams: {
      type: "question",
      board: board.name,
      class: standard.classNumber,
      subject: subject.name,
      chapter: chapter.name,
      exercise: exercise.exerciseNumber,
      question: question.questionNumber,
      qText: snippet,
    },
    ogType: "article",
  });
}
