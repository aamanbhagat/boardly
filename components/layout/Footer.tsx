import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BoardlyMark } from "@/components/brand/Boardly";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Boardly";

const COPYRIGHT_YEAR = 2026;

const FOOTER_BOARDS = [
  { name: "Maharashtra State Board", slug: "maharashtra-state-board" },
  { name: "CBSE", slug: "cbse" },
  { name: "ICSE", slug: "icse" },
  { name: "Karnataka Board", slug: "karnataka-board" },
  { name: "Gujarat Board", slug: "gujarat-board" },
];

const FOOTER_FEATURES = [
  { name: "Textbook Solutions", href: "/textbook-solutions" },
  { name: "Question Bank", href: "/question-bank" },
  { name: "Past Papers", href: "/past-papers" },
  { name: "Notes", href: "/notes" },
  { name: "MCQs", href: "/mcq" },
];

const FOOTER_INFO = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Report an error", href: "/feedback" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-alt">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-lg font-semibold"
            >
              <span aria-hidden className="block h-9 w-9 shrink-0">
                <BoardlyMark />
              </span>
              <span>
                Board<span className="text-primary">l</span>y
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              Free, step-by-step textbook solutions, question banks, past
              papers, MCQs and notes — designed for the way Indian students
              actually study.
            </p>
            <p className="mt-4 text-xs uppercase tracking-wide text-fg-subtle">
              Made with care · Free forever
            </p>
          </div>

          <FooterColumn title="Boards">
            {FOOTER_BOARDS.map((b) => (
              <FooterLink key={b.slug} href={`/${b.slug}`}>
                {b.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Resources">
            {FOOTER_FEATURES.map((f) => (
              <FooterLink key={f.href} href={f.href}>
                {f.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {FOOTER_INFO.map((f) => (
              <FooterLink key={f.href} href={f.href}>
                {f.name}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.</p>
          <p className="font-medium text-fg">
            Built so every student can learn — without paywalls.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
        {title}
      </h3>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-fg-muted transition-colors hover:text-primary"
      >
        {children}
      </Link>
    </li>
  );
}
