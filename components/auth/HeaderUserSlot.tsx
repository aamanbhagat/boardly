import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/UserMenu";

async function getSessionUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  
  const supabase = await createClient();
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Supabase auth error:", error);
    return null;
  }
}

export async function HeaderUserSlot() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="hidden h-9 items-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-bg-alt sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }

  return (
    <UserMenu
      user={{
        email: user.email ?? "",
        name:
          (user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          null,
      }}
    />
  );
}

export function HeaderUserSlotFallback() {
  return (
    <div
      aria-hidden
      className="hidden h-9 w-24 animate-pulse rounded-full border border-border bg-bg-alt sm:block"
    />
  );
}

export async function MobileSignInSlot() {
  const user = await getSessionUser();
  if (user) return null;
  return (
    <Link
      href="/sign-in"
      className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover sm:hidden"
    >
      Sign in
    </Link>
  );
}
