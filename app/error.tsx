"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <main id="main" className="flex-1">
      <Container className="flex flex-col items-center py-24 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-warning-soft text-warning shadow-card">
          <RefreshCw className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          We hit a snag loading this page
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-fg-muted">
          Refresh the page to try again. If the problem keeps happening, head
          back home and let us know via the report button on any solution.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-fg-subtle">
            error id: {error.digest}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg shadow-card transition-colors hover:bg-primary-hover"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border-strong bg-surface px-6 text-sm font-semibold text-fg transition-colors hover:bg-bg-alt"
          >
            <Home className="h-4 w-4" aria-hidden />
            Go home
          </Link>
        </div>
      </Container>
    </main>
  );
}
