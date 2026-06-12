import type {
  WithContext,
  WebSite,
  Organization,
  BreadcrumbList,
  FAQPage,
  HowTo,
  Course,
  ItemList,
  Article,
  QAPage,
} from "schema-dts";
import type {
  Board,
  Standard,
  Subject,
  Chapter,
  Exercise,
  Question,
  Solution,
} from "@/lib/db/schema";
import {
  boardPath,
  standardPath,
  subjectPath,
  chapterPath,
  exercisePath,
  questionPath,
} from "@/lib/seo/slugs";
import { absoluteUrl, siteUrl } from "@/lib/utils";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Boardly";

export type BreadcrumbItem = { name: string; url: string };

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl()}/search?q={search_term_string}`,
      },
      // schema-dts requires an array for query-input
      "query-input": "required name=search_term_string",
    } as never,
  };
}

export function organizationJsonLd(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    alternateName: SITE_NAME,
    url: siteUrl(),
    logo: absoluteUrl("/icon.png"),
    description:
      "Free step-by-step textbook solutions, question banks, past papers, MCQs and notes for every Indian board and class.",
    sameAs: [],
  };
}

export function breadcrumbJsonLd(
  items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function faqJsonLd(
  pairs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: p.answer,
      },
    })),
  };
}

export function howToJsonLd(opts: {
  name: string;
  description?: string;
  steps: Array<{ name?: string; text: string }>;
}): WithContext<HowTo> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name ?? `Step ${i + 1}`,
      text: s.text,
    })),
  };
}

export function courseJsonLd(opts: {
  board: Board;
  standard: Standard;
  subject: Subject;
}): WithContext<Course> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${opts.subject.name} - Class ${opts.standard.classNumber} (${opts.board.name})`,
    description:
      opts.subject.description ??
      `${opts.subject.name} curriculum for Class ${opts.standard.classNumber} students of the ${opts.board.name}.`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
    educationalLevel: opts.standard.level,
    inLanguage: "en",
  };
}

export function itemListJsonLd(opts: {
  name: string;
  items: Array<{ name: string; url: string }>;
}): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished?: Date;
  dateModified?: Date;
}): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(opts.path) },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
    },
    datePublished: opts.datePublished?.toISOString(),
    dateModified: opts.dateModified?.toISOString(),
  };
}

// Helpers for building breadcrumbs from content -----------------------------

export function buildContentBreadcrumb(opts: {
  board?: Board;
  standard?: Standard;
  subject?: Subject;
  chapter?: Chapter;
  exercise?: Exercise;
  question?: Question;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: "Home", url: "/" }];
  if (opts.board) {
    items.push({ name: opts.board.name, url: boardPath(opts.board) });
    if (opts.standard) {
      items.push({
        name: `Class ${opts.standard.classNumber}`,
        url: standardPath(opts.board, opts.standard),
      });
      if (opts.subject) {
        items.push({
          name: opts.subject.name,
          url: subjectPath(opts.board, opts.standard, opts.subject),
        });
        if (opts.chapter) {
          items.push({
            name: opts.chapter.name,
            url: chapterPath(
              opts.board,
              opts.standard,
              opts.subject,
              opts.chapter
            ),
          });
          if (opts.exercise) {
            items.push({
              name: `Exercise ${opts.exercise.exerciseNumber}`,
              url: exercisePath(
                opts.board,
                opts.standard,
                opts.subject,
                opts.chapter,
                opts.exercise
              ),
            });
            if (opts.question) {
              items.push({
                name: `Q ${opts.question.questionNumber}`,
                url: questionPath(
                  opts.board,
                  opts.standard,
                  opts.subject,
                  opts.chapter,
                  opts.exercise,
                  opts.question
                ),
              });
            }
          }
        }
      }
    }
  }
  return items;
}

export function qaPageJsonLd(opts: {
  question: Question;
  answerText: string;
  path: string;
}): WithContext<QAPage> {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: opts.question.questionText,
      text: opts.question.questionText,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: opts.answerText,
        url: absoluteUrl(opts.path),
      },
    },
  };
}

export function questionsToFaqPairs(
  rows: Array<Question & { solutions: Solution[] }>
) {
  return rows
    .filter((q) => q.solutions[0]?.solutionText)
    .map((q) => ({
      question: q.questionText,
      answer: q.solutions[0]!.solutionText,
    }));
}
