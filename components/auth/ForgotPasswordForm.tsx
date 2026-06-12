"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { sendPasswordReset, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    sendPasswordReset,
    initialState
  );

  if (state.ok) {
    return (
      <div className="rounded-card-lg border border-success/30 bg-success-soft p-5 text-center">
        <MailCheck aria-hidden className="mx-auto mb-3 h-8 w-8 text-success" />
        <h2 className="font-display text-xl font-semibold text-fg">
          Check your email
        </h2>
        <p className="mt-1.5 text-sm text-fg-muted">
          If an account exists for that email, we&apos;ve sent a password
          reset link.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <label htmlFor="field-email" className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">Email</span>
        <input
          id="field-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="block h-11 w-full rounded-card border border-border bg-surface px-4 text-sm text-fg shadow-card outline-none transition-colors placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      {state.error ? (
        <div
          role="alert"
          className="rounded-card border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg shadow-card transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {pending ? "Sending..." : "Send reset link"}
      </button>

      <p className="pt-2 text-center text-sm text-fg-muted">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
