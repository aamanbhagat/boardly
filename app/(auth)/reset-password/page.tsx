import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Boardly account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Set a new password
      </h1>
      <p className="mt-1.5 text-sm text-fg-muted">
        Choose something you haven&apos;t used before.
      </p>
      <div className="mt-6">
        <ResetPasswordForm />
      </div>
    </>
  );
}
