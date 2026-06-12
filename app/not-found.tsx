import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Home } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/layout/SearchBar";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main" className="flex-1">
      <Container className="flex flex-col items-center py-24 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary shadow-card">
          <span className="font-mono text-base font-bold">404</span>
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-fg-muted">
          The page you&apos;re looking for has moved, been renamed, or never
          existed. Try the search or pick a board to start browsing.
        </p>
        <div className="mt-8 w-full max-w-md">
          <SearchBar size="md" />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg shadow-card transition-colors hover:bg-primary-hover"
          >
            <Home className="h-4 w-4" aria-hidden />
            Go home
          </Link>
          <Link
            href="/#boards"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border-strong bg-surface px-6 text-sm font-semibold text-fg transition-colors hover:bg-bg-alt"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Browse boards
          </Link>
        </div>
      </Container>
    </main>
  );
}
