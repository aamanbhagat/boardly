import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BoardlyMark } from "@/components/brand/Boardly";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="flex-1">
      <Container className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-10 sm:py-16">
        <Link
          href="/"
          aria-label="Boardly home"
          className="mb-8 inline-flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
        >
          <span aria-hidden className="block h-9 w-9">
            <BoardlyMark />
          </span>
          <span>
            Board<span className="text-primary">l</span>y
          </span>
        </Link>
        <div className="w-full max-w-sm rounded-card-lg border border-border bg-surface p-6 shadow-card sm:p-8">
          {children}
        </div>
      </Container>
    </main>
  );
}
