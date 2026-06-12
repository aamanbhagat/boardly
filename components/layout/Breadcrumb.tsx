import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  type BreadcrumbItem,
} from "@/lib/seo/structured-data";

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  const lastIndex = items.length - 1;

  return (
    <>
      <nav aria-label="Breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ol className="flex min-w-max items-center gap-1 text-sm text-fg-muted">
          {items.map((item, i) => {
            const isLast = i === lastIndex;
            return (
              <li
                key={`${item.url}-${i}`}
                className="flex items-center gap-1"
              >
                {i > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-fg-subtle"
                    aria-hidden
                  />
                )}
                {isLast ? (
                  <span aria-current="page" className="font-medium text-fg">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="rounded-full px-2 py-0.5 transition-colors hover:bg-bg-alt hover:text-primary"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
