"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updatePassword, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="space-y-4">
      <label htmlFor="field-password" className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">
          New password
        </span>
        <input
          id="field-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
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
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
