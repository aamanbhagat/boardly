import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SearchInput, FilterSelect } from "@/components/search/SearchControls";
import { searchContent, type SearchHit } from "@/lib/search/query";
import { getAllBoards } from "@/lib/db/queries";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  board?: string;
  class?: string;
  subject?: string;
  page?: string;
}>;

export const metadata: Metadata = {
  title: "Search solutions, chapters, and exercises",
  description: "Search across boards, classes, subjects, and chapters.",
  alternates: { canonical: absoluteUrl("/search") },
  robots: { index: false, follow: true },
};

const TYPE_OPTIONS = [
  { value: "exercise", label: "Exercises" },
  { value: "chapter", label: "Chapters" },
  { value: "question", label: "Questions" },
  { value: "subject", label: "Subjects" },
];

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`,
}));

export default function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main id="main" className="flex-1">
      <Container className="py-10 lg:py-14">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "Search", url: "/search" },
          ]}
        />
        <header className="mt-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Search
          </h1>
          <p className="mt-3 max-w-prose text-lg text-fg-muted">
            Find any exercise, chapter, or question across boards and classes.
          </p>
        </header>

        <Suspense fallback={<InteractiveSkeleton />}>
          <Interactive searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function Interactive({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = sp.type as SearchHit["type"] | undefined;
  const boardSlug = sp.board?.trim() || undefined;
  const classNumber = sp.class ? Number(sp.class) : undefined;
  const subjectSlug = sp.subject?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const boards = await getAllBoards().catch(() => []);
  const boardOptions = boards.map((b) => ({ value: b.slug, label: b.name }));

  return (
    <>
      <div className="mt-8">
        <SearchInput initial={q} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <FilterSelect
          name="type"
          current={type ?? ""}
          options={TYPE_OPTIONS}
          placeholder="All types"
        />
        <FilterSelect
          name="board"
          current={boardSlug ?? ""}
          options={boardOptions}
          placeholder="All boards"
        />
        <FilterSelect
          name="class"
          current={classNumber ? String(classNumber) : ""}
          options={CLASS_OPTIONS}
          placeholder="All classes"
        />
      </div>

      <Results
        q={q}
        type={type}
        boardSlug={boardSlug}
        classNumber={classNumber}
        subjectSlug={subjectSlug}
        page={page}
      />
    </>
  );
}

async function Results({
  q,
  type,
  boardSlug,
  classNumber,
  subjectSlug,
  page,
}: {
  q: string;
  type?: SearchHit["type"];
  boardSlug?: string;
  classNumber?: number;
  subjectSlug?: string;
  page: number;
}) {
  if (!q) {
    return (
      <p className="mt-10 rounded-card-lg border border-dashed border-border bg-bg-alt p-8 text-center text-fg-muted">
        Type a query above to begin. Try chapter or topic names like
        &ldquo;real numbers&rdquo; or &ldquo;photosynthesis&rdquo;.
      </p>
    );
  }
  const { hits, total } = await searchContent({
    q,
    page,
    filters: { type, boardSlug, classNumber, subjectSlug },
  });

  if (hits.length === 0) {
    return (
      <div className="mt-10 rounded-card-lg border border-dashed border-border bg-bg-alt p-8 text-center text-fg-muted">
        No results for{" "}
        <span className="font-medium text-fg">&ldquo;{q}&rdquo;</span>. Try a
        broader query, or check that the search service is running.
      </div>
    );
  }

  return (
    <section aria-label="Search results" className="mt-8">
      <p className="text-sm font-medium text-fg-muted">
        {total} {total === 1 ? "result" : "results"}
      </p>
      <ol className="mt-4 space-y-3">
        {hits.map((hit) => (
          <li
            key={hit.id}
            className="rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
          >
            <Link href={hit.url} className="block">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {hit.type} · {hit.boardName} · Class {hit.classNumber} ·{" "}
                {hit.subjectName}
              </div>
              <div
                className="mt-1.5 font-display text-lg font-semibold"
                dangerouslySetInnerHTML={{
                  __html: hit._formatted?.title ?? hit.title,
                }}
              />
              <div
                className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-muted"
                dangerouslySetInnerHTML={{
                  __html: hit._formatted?.body ?? hit.body,
                }}
              />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function InteractiveSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-hidden>
      <div className="h-14 animate-pulse rounded-pill bg-bg-alt" />
      <div className="flex gap-3">
        <div className="h-10 w-32 animate-pulse rounded-full bg-bg-alt" />
        <div className="h-10 w-32 animate-pulse rounded-full bg-bg-alt" />
        <div className="h-10 w-32 animate-pulse rounded-full bg-bg-alt" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-card border border-border bg-bg-alt"
          />
        ))}
      </div>
    </div>
  );
}
