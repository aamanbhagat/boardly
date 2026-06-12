"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "compact" | "md" | "lg";

export function SearchBar({
  initialQuery = "",
  size = "md",
  autoFocus,
  className,
}: {
  initialQuery?: string;
  size?: Variant;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (size !== "compact") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable);
      if (typing) return;
      if (
        e.key === "/" ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [size]);

  const submit = () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const styles = {
    compact: {
      wrap: "h-10 rounded-full border border-border bg-bg-alt focus-within:border-primary focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/20",
      icon: "left-3.5 h-4 w-4",
      input: "h-10 rounded-full pl-10 pr-10 text-sm",
      kbd: "right-2",
      button: null,
    },
    md: {
      wrap: "h-12 rounded-full border border-border-strong bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
      icon: "left-4 h-5 w-5",
      input: "h-12 rounded-l-full pl-11 pr-3 text-sm",
      kbd: "",
      button:
        "h-12 rounded-r-full bg-primary px-6 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover",
    },
    lg: {
      wrap: "h-16 rounded-pill border border-border-strong bg-surface shadow-card-hover focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
      icon: "left-5 h-5 w-5",
      input: "h-16 rounded-l-pill pl-14 pr-4 text-base",
      kbd: "",
      button:
        "h-16 rounded-r-pill bg-primary px-8 text-base font-semibold text-primary-fg transition-colors hover:bg-primary-hover",
    },
  }[size];

  return (
    <form
      role="search"
      action="/search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn("flex w-full", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search textbook solutions
      </label>
      <div
        className={cn(
          "relative flex w-full items-center transition-shadow",
          styles.wrap
        )}
      >
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute text-fg-subtle",
            styles.icon
          )}
        />
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            size === "compact"
              ? "Search any chapter or topic…"
              : "Search any chapter, exercise or question…"
          }
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "w-full border-none bg-transparent placeholder:text-fg-subtle focus:outline-none",
            styles.input
          )}
        />
        {size === "compact" && !q ? (
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-3 hidden rounded-md border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle lg:block"
          >
            /
          </kbd>
        ) : null}
        {size === "compact" && q ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className={cn(
              "absolute grid h-7 w-7 place-items-center rounded-full text-fg-subtle hover:bg-bg hover:text-fg",
              styles.kbd
            )}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
        {styles.button ? <button type="submit" className={styles.button}>Search</button> : null}
      </div>
    </form>
  );
}
