import type { GrokMessage } from "./grok";

// Prompt templates kept separate from the generator so a teacher or editor
// can tune them without touching the orchestration code. Every prompt is
// designed for json_object responses — the schema is described inline so
// the model produces output that matches our manifest.ts contract.

export type ExercisePromptInput = {
  boardName: string;
  className: string;
  subjectName: string;
  chapterName: string;
  chapterNumber: number;
  exerciseNumber: string; // e.g. "1.1"
  exerciseType: "exercise" | "miscellaneous" | "additional" | "intext";
  questionsRequested: number;
  // Optional list of sub-topics to focus on (helps the model stay on
  // syllabus). When empty, the model picks based on chapter name.
  topicHints?: string[];
};

const SYSTEM_PROMPT = `You are an expert curriculum author for Indian school education. You write
original, syllabus-aligned questions and worked solutions for textbook
exercise sets. You write at the level expected of a student in the given
class — neither too simple nor too advanced.

CRITICAL RULES:
1. Output is consumed by an automated pipeline. Output must be a single
   JSON object matching the schema described in the user message — no
   prose, no markdown fences, nothing outside the JSON.
2. Every question must be ORIGINAL — not copied verbatim from any
   textbook, prior board paper, or website. Avoid pasting NCERT exercise
   wording. Re-phrase, change numbers, or invent fresh contexts.
3. Solutions must be COMPLETE, STEP-BY-STEP, and PEDAGOGICALLY SOUND.
   Each step explains *why*, not just *what*.
4. For mathematical content, write expressions in LaTeX inside dollar
   signs (e.g. "Let $x = \\\\frac{a}{b}$"). The renderer is KaTeX.
5. Do not invent diagrams or images — describe them only when essential
   for the question, and the student-side renderer will not display them.
6. Match the difficulty to the question marks: 1-2 marks = easy recall,
   3 marks = applied, 5 marks = multi-step reasoning.`;

const QUESTION_TYPES_HINT = `Question type values (use these exactly): "short", "long", "mcq",
"multi_correct", "numerical", "true_false", "fill_in_blank", "match",
"assertion_reason", "case_based", "diagram", "one_word".
Difficulty values: "easy", "medium", "hard".`;

export function buildExercisePrompt(input: ExercisePromptInput): GrokMessage[] {
  const topicLine = input.topicHints?.length
    ? `Focus on these sub-topics: ${input.topicHints.join(", ")}.`
    : "";

  const schema = `{
  "exerciseNumber": "${input.exerciseNumber}",
  "type": "${input.exerciseType}",
  "name": "Exercise ${input.exerciseNumber}",
  "questions": [
    {
      "questionNumber": "1",
      "type": "short",
      "difficulty": "easy",
      "marks": 2,
      "question": "Write the question here, at least 20 chars. Use $latex$ for math.",
      "solution": {
        "steps": [
          { "text": "First step. Explain the concept being applied." },
          { "text": "Second step. Show the calculation: $x = 2 + 3 = 5$." },
          { "text": "Third step. State the conclusion." }
        ],
        "answer": "Final answer in one short line."
      }
    }
  ]
}`;

  const user = `Generate an exercise for the following:

Board: ${input.boardName}
Class: ${input.className}
Subject: ${input.subjectName}
Chapter: ${input.chapterName} (Chapter ${input.chapterNumber})
Exercise: ${input.exerciseNumber} (type: ${input.exerciseType})
Number of questions: ${input.questionsRequested}
${topicLine}

${QUESTION_TYPES_HINT}

Mix difficulties: roughly 30% easy, 50% medium, 20% hard. Number questions
sequentially as strings: "1", "2", "3", ... Each solution must have at
least 2 steps. Include an "answer" field with the final result.

Return JSON matching this exact shape (only the object, no wrapping):

${schema}`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user },
  ];
}

// Plan prompt: given a chapter, ask Grok to propose an exercise plan
// (how many exercises, what type, how many questions each). This lets
// generation work on a chapter at a time and parallelize per exercise.
export type ChapterPlanInput = {
  boardName: string;
  className: string;
  subjectName: string;
  chapterName: string;
  chapterNumber: number;
};

export function buildChapterPlanPrompt(input: ChapterPlanInput): GrokMessage[] {
  const schema = `{
  "exercises": [
    {
      "exerciseNumber": "${input.chapterNumber}.1",
      "name": "Exercise ${input.chapterNumber}.1",
      "type": "exercise",
      "questionsRequested": 10,
      "topicHints": ["sub-topic 1", "sub-topic 2"]
    }
  ]
}`;

  const user = `Plan the exercise structure for this chapter, mirroring how a typical
NCERT or board textbook lays it out:

Board: ${input.boardName}
Class: ${input.className}
Subject: ${input.subjectName}
Chapter: ${input.chapterName} (Chapter ${input.chapterNumber})

Propose 2-5 exercises. Use exerciseNumber format "${input.chapterNumber}.1",
"${input.chapterNumber}.2", etc. Type values: "exercise" (regular),
"intext" (worked-along intext questions), "additional" (extra practice),
"miscellaneous" (chapter-end mixed). Most chapters have 2-4 "exercise"
type entries plus one "additional" or "miscellaneous".

Each exercise should have between 6 and 14 questions depending on depth.
"questionsRequested" must be a number. "topicHints" is a short array of
specific sub-topics for that exercise.

Return JSON matching:

${schema}`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user },
  ];
}
