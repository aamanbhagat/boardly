import Link from "next/link";
import { Suspense } from "react";
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Heart,
  Zap,
  BookOpen,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/layout/SearchBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { getAllBoards } from "@/lib/db/queries";
import { boardPath } from "@/lib/seo/slugs";

const POPULAR_SEARCHES = [
  "Real Numbers Class 10",
  "Quadratic Equations CBSE",
  "Light Reflection Refraction",
  "Trigonometry Class 11",
  "Cell Structure Biology",
  "Newton's Laws Physics",
];

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: "Step-by-step solutions",
    description:
      "Every question solved with full working — never just a one-line answer.",
    accent: "primary",
  },
  {
    icon: ShieldCheck,
    title: "Educator verified",
    description:
      "Solutions reviewed by teachers who teach the syllabus every day.",
    accent: "success",
  },
  {
    icon: Sparkles,
    title: "All boards covered",
    description:
      "Maharashtra, CBSE, ICSE, Karnataka, Gujarat — and more, all in one place.",
    accent: "accent",
  },
  {
    icon: Heart,
    title: "Free forever",
    description:
      "No paywalls, no logins required. Bookmark anything and revisit anytime.",
    accent: "danger",
  },
] as const;

const STUDY_FLOW = [
  {
    icon: BookOpen,
    title: "Pick your board & class",
    body: "Find the exact textbook your school uses, in the language you study.",
  },
  {
    icon: Zap,
    title: "Jump to the chapter",
    body: "Type a topic or scroll the chapter list. We index every exercise.",
  },
  {
    icon: GraduationCap,
    title: "Learn step-by-step",
    body: "Read working that mirrors how teachers solve it on the board.",
  },
];

const FAQS = [
  {
    question: "Are these textbook solutions free to use?",
    answer:
      "Yes. Every solution, question bank, MCQ, past paper and note on this site is free to read. We never paywall content and you don't need to sign in to view solutions.",
  },
  {
    question: "Which boards are covered?",
    answer:
      "We cover Maharashtra State Board, CBSE, ICSE, Karnataka State Board, and Gujarat Board for classes 1 through 12, with more boards added regularly.",
  },
  {
    question: "How accurate are the solutions?",
    answer:
      "Solutions are written and reviewed by qualified educators. Every solution links to a 'Report an error' form so we can correct mistakes within 24 hours of being notified.",
  },
  {
    question: "Can I download solutions for offline study?",
    answer:
      "Each exercise page includes a Print/Save as PDF action that produces a clean printable layout — no ads, no navigation, just the solutions.",
  },
];

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <JsonLd data={faqJsonLd(FAQS)} id="ld-faq" />

      <Hero />

      <section id="boards" className="scroll-mt-20 border-b border-border bg-bg py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Browse by board"
            title="Pick your board to begin"
            description="Every Indian board, every class, every subject — chapter-wise solutions for the textbooks students actually use."
          />
          <Suspense fallback={<BoardGridSkeleton />}>
            <BoardGrid />
          </Suspense>
        </Container>
      </section>

      <section className="border-b border-border bg-bg-alt py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="From a confused exercise to a confident answer"
            description="Three steps. No sign-up. No friction."
          />
          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {STUDY_FLOW.map((step, i) => (
              <li
                key={step.title}
                className="rounded-card-lg border border-border bg-surface p-6 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft font-display text-base font-semibold text-primary"
                  >
                    {i + 1}
                  </span>
                  <step.icon
                    aria-hidden
                    className="h-5 w-5 text-fg-subtle"
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-b border-border bg-bg py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Why students choose us"
            title="Built for the way Indian students study"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="group rounded-card-lg border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div
                  aria-hidden
                  className={`grid h-11 w-11 place-items-center rounded-xl ${ACCENT_BG[h.accent]}`}
                >
                  <h.icon
                    className={`h-5 w-5 ${ACCENT_FG[h.accent]}`}
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {h.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {h.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-bg-alt py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Common questions"
            title="Frequently asked questions"
          />
          <div className="mx-auto max-w-3xl divide-y divide-border rounded-card-lg border border-border bg-surface shadow-card">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group p-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-base font-semibold">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-transform group-open:rotate-90"
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-bg py-16 lg:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-primary to-primary-hover px-6 py-12 text-center shadow-card-strong sm:px-12 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary-fg/10 blur-3xl"
            />
            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-primary-fg sm:text-4xl">
              Ready to ace your next exam?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-fg/85">
              Join over 2.4 million students using free, educator-verified
              solutions every day.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#boards"
                className="inline-flex items-center gap-2 rounded-pill bg-surface px-6 py-3 text-sm font-semibold text-primary shadow-card transition-transform hover:-translate-y-0.5"
              >
                Browse your board
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-pill border border-primary-fg/30 px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-fg/10"
              >
                Search a topic
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

const ACCENT_BG: Record<string, string> = {
  primary: "bg-primary-soft",
  success: "bg-success-soft",
  accent: "bg-accent-soft",
  danger: "bg-danger-soft",
};
const ACCENT_FG: Record<string, string> = {
  primary: "text-primary",
  success: "text-success",
  accent: "text-accent",
  danger: "text-danger",
};

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bg-soft via-bg to-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-accent/8 blur-3xl"
      />
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60"
      />
      <Container className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="soft" className="mb-6 gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Free for every Indian student
          </Badge>
          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]">
            Solutions for every textbook,{" "}
            <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent">
              every board, every class.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-fg-muted">
            Step-by-step textbook solutions, question banks, MCQs, past
            papers, and notes — searched in seconds, verified by educators.
          </p>
          <div className="mx-auto mt-9 max-w-2xl">
            <SearchBar size="lg" />
          </div>
          <div className="mx-auto mt-6 max-w-3xl text-sm">
            <span className="block text-fg-subtle sm:mr-2 sm:inline">
              Popular:
            </span>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:inline-flex sm:flex-wrap sm:justify-center">
              {POPULAR_SEARCHES.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="truncate rounded-full border border-border bg-surface/70 px-3 py-1 text-center text-fg-muted backdrop-blur transition-colors hover:border-primary hover:bg-surface hover:text-primary sm:text-left"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-fg-muted">
            <Stat icon={Users} label="2.4M+ students learning" />
            <Stat icon={BookOpen} label="50,000+ solved exercises" />
            <Stat icon={ShieldCheck} label="Educator verified" />
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
      {label}
    </span>
  );
}

async function BoardGrid() {
  let boards: Awaited<ReturnType<typeof getAllBoards>> = [];
  try {
    boards = await getAllBoards();
  } catch {
    boards = [];
  }

  if (boards.length === 0) {
    return (
      <div className="rounded-card-lg border border-dashed border-border bg-surface p-10 text-center shadow-card">
        <p className="text-fg-muted">
          Boards will appear here once the database is seeded. Run{" "}
          <code className="rounded-md bg-bg-alt px-1.5 py-0.5 text-sm">
            pnpm db:push && pnpm db:seed
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board, i) => (
        <li key={board.id}>
          <Link
            href={boardPath(board)}
            className="group relative block h-full overflow-hidden rounded-card-lg border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
          >
            <div
              aria-hidden
              className={`absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-90 ${BOARD_GLOW[i % BOARD_GLOW.length]}`}
            />
            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-base font-semibold text-primary-fg shadow-card"
                >
                  {board.name[0]}
                </span>
                <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                  {board.name}
                </h3>
              </div>
              {board.description ? (
                <p className="text-sm leading-relaxed text-fg-muted line-clamp-2">
                  {board.description}
                </p>
              ) : null}
              <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary">
                Browse classes
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const BOARD_GLOW = [
  "bg-primary/10",
  "bg-accent/10",
  "bg-success/10",
  "bg-warning/10",
  "bg-primary/10",
  "bg-accent/10",
];

function BoardGridSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          aria-hidden
          className="h-40 animate-pulse rounded-card-lg border border-border bg-bg-alt"
        />
      ))}
    </ul>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-12 text-center">
      {eyebrow ? (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-fg-muted">{description}</p>
      ) : null}
    </div>
  );
}
