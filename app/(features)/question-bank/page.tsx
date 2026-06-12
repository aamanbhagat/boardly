import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Library } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/utils";
import { getAllBoards } from "@/lib/db/queries";
import { boardPath } from "@/lib/seo/slugs";

export const metadata: Metadata = {
  title: "Question Bank — Practice by Board, Class & Subject",
  description:
    "Solved question banks for every board and class. Pick a textbook to start practising — chapter-wise questions, multiple-choice tests, and detailed solutions, all free.",
  alternates: { canonical: absoluteUrl("/question-bank") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/question-bank"),
    title: "Question Bank — Practice by Board, Class & Subject",
    description:
      "Chapter-wise practice question banks with verified, step-by-step solutions.",
  },
};

export default async function QuestionBankPage() {
  return (
    <main id="main" className="flex-1">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bg-soft via-bg to-bg">
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60"
        />
        <Container className="relative py-14 text-center sm:py-20">
          <Badge variant="soft" className="mb-4">
            <Library className="mr-1.5 h-3 w-3" aria-hidden /> Question Bank
          </Badge>
          <h1 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Practice solved questions by board
          </h1>
          <p className="mx-auto mt-4 max-w-prose text-lg text-fg-muted">
            Every textbook chapter has its own question bank — solved
            step-by-step by teachers. Pick a board to dive in.
          </p>
        </Container>
      </section>
      <Container className="py-12 sm:py-16">
        <h2 className="font-display text-2xl font-semibold">
          Choose your board
        </h2>
        <Suspense fallback={<BoardGridFallback />}>
          <BoardGrid />
        </Suspense>
      </Container>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Question Bank", url: "/question-bank" },
        ])}
        id="ld-breadcrumb-qb"
      />
    </main>
  );
}

async function BoardGrid() {
  const boards = await getAllBoards();
  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((b) => (
        <li key={b.id}>
          <Link
            href={boardPath(b)}
            className="group flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
          >
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-base font-semibold text-primary-fg shadow-card"
            >
              {b.name[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-lg font-semibold transition-colors group-hover:text-primary">
                {b.name}
              </span>
              <span className="block text-sm text-fg-muted">
                Browse classes
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function BoardGridFallback() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[84px] animate-pulse rounded-card border border-border bg-surface"
        />
      ))}
    </div>
  );
}
