"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signInWithPassword, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(
    signInWithPassword,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />
      <div className="flex justify-end -mt-2">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {state.error ? <ErrorBanner message={state.error} /> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg shadow-card transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="pt-2 text-center text-sm text-fg-muted">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = `field-${props.name}`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      <input
        id={id}
        {...props}
        className="block h-11 w-full rounded-card border border-border bg-surface px-4 text-sm text-fg shadow-card outline-none transition-colors placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-card border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {message}
    </div>
  );
}
