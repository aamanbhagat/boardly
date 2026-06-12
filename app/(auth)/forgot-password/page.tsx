import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Enter your email and we'll send a password reset link.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Reset your password
      </h1>
      <p className="mt-1.5 text-sm text-fg-muted">
        Enter your account email — we&apos;ll send a reset link.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
