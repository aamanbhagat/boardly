import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a free Boardly account to bookmark solutions and revisit them anytime.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-1.5 text-sm text-fg-muted">
        Free forever. No card. Bookmark anything and pick up later.
      </p>
      <div className="mt-6">
        <SignUpForm />
      </div>
    </>
  );
}
