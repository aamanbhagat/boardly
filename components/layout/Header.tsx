"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchBar } from "@/components/layout/SearchBar";
import { BoardlyMark } from "@/components/brand/Boardly";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/textbook-solutions", label: "Solutions" },
  { href: "/question-bank", label: "Question Bank" },
  { href: "/past-papers", label: "Past Papers" },
  { href: "/notes", label: "Notes" },
  { href: "/mcq", label: "MCQs" },
];

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Boardly";

export function Header({
  userSlot,
  mobileSignInSlot,
}: {
  userSlot: ReactNode;
  mobileSignInSlot: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65">
      <Container>
        <div className="flex h-16 items-center gap-3 lg:gap-6">
          <Logo />

          <div className="hidden flex-1 max-w-xl lg:block">
            <SearchBar size="compact" />
          </div>

          <PrimaryNav pathname={pathname} className="hidden xl:flex" />

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {userSlot}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface text-fg transition-colors hover:bg-bg-alt xl:hidden"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" aria-hidden />
              ) : (
                <Menu className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <PrimaryNav
          pathname={pathname}
          className="hidden h-12 justify-center border-t border-border lg:flex xl:hidden"
        />

        <div className="hidden border-t border-border py-3 md:block lg:hidden">
          <SearchBar size="compact" />
        </div>
      </Container>

      <MobileMenu
        open={mobileOpen}
        pathname={pathname}
        signInSlot={mobileSignInSlot}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5 rounded-full transition-opacity hover:opacity-90"
      aria-label={`${SITE_NAME} home`}
    >
      <span
        aria-hidden
        className="block h-9 w-9 shrink-0 transition-transform group-hover:scale-[1.04]"
      >
        <BoardlyMark />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Board<span className="text-primary">l</span>y
      </span>
    </Link>
  );
}

function PrimaryNav({
  pathname,
  className,
}: {
  pathname: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className={cn("items-center gap-1 text-sm", className)}
    >
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium transition-colors",
              active
                ? "text-primary"
                : "text-fg-muted hover:bg-bg-alt hover:text-fg"
            )}
          >
            {item.label}
            {active ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileMenu({
  open,
  pathname,
  signInSlot,
  onClose,
}: {
  open: boolean;
  pathname: string;
  signInSlot: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 top-16 z-10 animate-fade-in bg-fg/20 backdrop-blur-sm xl:hidden"
      />
      <div
        id="mobile-nav"
        className="fixed inset-x-0 top-16 z-20 animate-slide-down border-b border-border bg-bg shadow-card-strong xl:hidden"
      >
      <Container>
        <nav aria-label="Mobile" className="flex flex-col py-3">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                className={cn(
                  "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-fg hover:bg-bg-alt"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {signInSlot}
        </nav>
      </Container>
      </div>
    </>
  );
}
