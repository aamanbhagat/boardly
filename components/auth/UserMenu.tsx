"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon, Bookmark } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type UserSummary = {
  email: string;
  name: string | null;
};

export function UserMenu({ user }: { user: UserSummary }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const initial =
    (user.name?.trim()?.[0] ?? user.email.trim()[0] ?? "?").toUpperCase();
  const label = user.name?.trim() || user.email;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border border-border-strong bg-surface pl-1 pr-3 text-sm font-medium text-fg transition-colors hover:bg-bg-alt",
          open && "bg-bg-alt"
        )}
      >
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-fg font-semibold"
        >
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{label}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-card border border-border bg-surface p-1.5 shadow-card-strong"
        >
          <div className="px-2.5 py-2">
            <p className="text-xs uppercase tracking-wide text-fg-subtle">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-fg">
              {user.email}
            </p>
          </div>
          <div className="my-1 h-px bg-border" />
          <MenuLink href="/account" icon={UserIcon} onClick={() => setOpen(false)}>
            Account
          </MenuLink>
          <MenuLink href="/bookmarks" icon={Bookmark} onClick={() => setOpen(false)}>
            Bookmarks
          </MenuLink>
          <div className="my-1 h-px bg-border" />
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-fg transition-colors hover:bg-bg-alt"
            >
              <LogOut aria-hidden className="h-4 w-4 text-fg-muted" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg transition-colors hover:bg-bg-alt"
    >
      <Icon aria-hidden className="h-4 w-4 text-fg-muted" />
      {children}
    </Link>
  );
}
