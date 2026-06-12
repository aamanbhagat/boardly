import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  gradient?: boolean;
  /**
   * Render the mark as a flat single-color glyph (uses currentColor).
   * Useful for monochrome contexts like dark headers.
   */
  monochrome?: boolean;
  /** Aria label for screen readers. */
  title?: string;
};

/**
 * Boardly mark. A rounded "board" with two writing rules and a coral
 * chalk-mark — implies a chalkboard/whiteboard surface and reads as a stylised
 * lowercase B from the negative space. Scales cleanly from favicon to hero.
 */
export function BoardlyMark({
  className,
  gradient = true,
  monochrome = false,
  title,
}: Props) {
  const gradientId = "boardly-mark-gradient";
  return (
    <svg
      viewBox="0 0 40 40"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {gradient && !monochrome ? (
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="oklch(0.62 0.11 175)" />
            <stop offset="100%" stopColor="oklch(0.42 0.09 180)" />
          </linearGradient>
        </defs>
      ) : null}
      <rect
        width="40"
        height="40"
        rx="10"
        fill={
          monochrome
            ? "currentColor"
            : gradient
              ? `url(#${gradientId})`
              : "oklch(0.52 0.1 175)"
        }
      />
      {/* Two rounded writing rules */}
      <rect
        x="9.5"
        y="13"
        width="21"
        height="3.2"
        rx="1.6"
        fill={monochrome ? "var(--color-bg)" : "white"}
        fillOpacity={monochrome ? 0.92 : 0.96}
      />
      <rect
        x="9.5"
        y="20"
        width="14"
        height="3.2"
        rx="1.6"
        fill={monochrome ? "var(--color-bg)" : "white"}
        fillOpacity={monochrome ? 0.92 : 0.96}
      />
      {/* Coral chalk-mark accent */}
      <circle
        cx="27.5"
        cy="21.6"
        r="2.1"
        fill={monochrome ? "var(--color-bg)" : "oklch(0.74 0.16 35)"}
      />
    </svg>
  );
}

/**
 * Boardly wordmark. Mark + "Boardly" set in the display font with a coral
 * accent dot above the second 'l' to echo the chalk-mark on the icon.
 */
export function BoardlyWordmark({
  className,
  monochrome = false,
}: {
  className?: string;
  monochrome?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight",
        className
      )}
    >
      <span aria-hidden className="block h-9 w-9 shrink-0">
        <BoardlyMark monochrome={monochrome} />
      </span>
      <span className="leading-none">
        Board<span className="text-primary">l</span>y
      </span>
    </span>
  );
}
