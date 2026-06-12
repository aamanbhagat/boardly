"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export function SearchInput({ initial }: { initial: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initial);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const submit = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    if (next.trim()) sp.set("q", next.trim());
    else sp.delete("q");
    startTransition(() => {
      router.replace(`/search?${sp.toString()}`);
    });
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit(q);
      }}
      className="relative"
    >
      <label htmlFor="search-q" className="sr-only">
        Search
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle"
      />
      <input
        id="search-q"
        type="search"
        value={q}
        autoFocus
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => submit(q)}
        placeholder="Search exercises, chapters, questions..."
        className="h-14 w-full rounded-pill border border-border-strong bg-surface pl-14 pr-12 text-base shadow-card focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
      />
      {q ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQ("");
            submit("");
          }}
          className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:bg-bg-alt hover:text-fg"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
      {isPending ? (
        <span
          aria-hidden
          className="absolute -bottom-px left-6 right-6 h-0.5 animate-pulse rounded-full bg-primary"
        />
      ) : null}
    </form>
  );
}

type FilterOption = { value: string; label: string };

export function FilterSelect({
  name,
  current,
  options,
  placeholder,
}: {
  name: string;
  current: string;
  options: FilterOption[];
  placeholder: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const onChange = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set(name, next);
    else sp.delete(name);
    router.replace(`/search?${sp.toString()}`);
  };
  return (
    <label className="flex items-center gap-2 text-sm text-fg-muted">
      <span className="sr-only">{placeholder}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-border-strong bg-surface px-3.5 text-sm font-medium text-fg shadow-card focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
