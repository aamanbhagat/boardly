import "server-only";
import katex from "katex";
import "katex/contrib/mhchem";

// Parse text containing inline `$...$` and block `$$...$$` math segments
// and render them server-side via KaTeX. Plain text passes through unchanged.
//
// Two extensions on top of plain LaTeX:
//   1. mhchem — `\ce{H2O}`, `$\ce{2H2 + O2 -> 2H2O}$` for chemistry.
//   2. `==highlight==` — wraps the inner text in a styled <mark> for
//      important terms students should remember.

const SEGMENT_RE = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|==[^=\n][^\n]*?==)/g;
const HIGHLIGHT_RE = /^==([\s\S]+?)==$/;

function isMathSegment(s: string): boolean {
  return (
    (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) ||
    (s.startsWith("$") &&
      s.endsWith("$") &&
      s.length >= 2 &&
      !s.startsWith("$$"))
  );
}

function isHighlightSegment(s: string): boolean {
  return HIGHLIGHT_RE.test(s);
}

function renderMathSegment(segment: string, key: number): React.ReactNode {
  const isBlock = segment.startsWith("$$");
  const tex = isBlock
    ? segment.slice(2, -2).trim()
    : segment.slice(1, -1).trim();

  try {
    const html = katex.renderToString(tex, {
      displayMode: isBlock,
      throwOnError: false,
      strict: "ignore",
      output: "html",
      trust: true,
    });
    return (
      <span
        key={key}
        className={isBlock ? "block my-3 text-center" : "inline-block"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <span key={key}>{segment}</span>;
  }
}

function renderHighlightSegment(
  segment: string,
  key: number
): React.ReactNode {
  const m = HIGHLIGHT_RE.exec(segment);
  const inner = m?.[1] ?? segment;
  return (
    <mark
      key={key}
      className="rounded-md bg-warning-soft px-1.5 py-0.5 font-semibold text-fg"
    >
      {inner}
    </mark>
  );
}

export function MathText({ children }: { children: string }) {
  if (!children.includes("$") && !children.includes("==")) {
    return <>{children}</>;
  }
  const parts = children.split(SEGMENT_RE).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (isMathSegment(part)) return renderMathSegment(part, i);
        if (isHighlightSegment(part)) return renderHighlightSegment(part, i);
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
