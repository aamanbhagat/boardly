import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Boardly to bookmark solutions and track progress.",
  robots: { index: false, follow: false },
};

async function SignInError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mt-4 rounded-card border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {error}
    </div>
  );
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-fg-muted">
        Sign in to bookmark solutions and pick up where you left off.
      </p>
      <Suspense fallback={null}>
        <SignInError searchParams={searchParams} />
      </Suspense>
      <div className="mt-6">
        <SignInForm />
      </div>
    </>
  );
}
