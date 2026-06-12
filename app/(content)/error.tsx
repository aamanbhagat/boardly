"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Content route error:", error);
  }, [error]);

  return (
    <main id="main" className="flex-1">
      <Container className="py-14">
        <div className="rounded-card-lg border border-border bg-surface p-8 shadow-card">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning"
            >
              <RefreshCw className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold">
                We couldn&apos;t load this content
              </h1>
              <p className="mt-2 max-w-prose text-fg-muted">
                The data source might be temporarily unreachable. Try again or
                navigate back to find what you need.
              </p>
              {error.digest ? (
                <p className="mt-3 font-mono text-xs text-fg-subtle">
                  error id: {error.digest}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg shadow-card transition-colors hover:bg-primary-hover"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Retry
                </button>
                <Link
                  href="/"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-5 text-sm font-semibold text-fg transition-colors hover:bg-bg-alt"
                >
                  <Home className="h-4 w-4" aria-hidden />
                  Go home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
