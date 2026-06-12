// Render JSON-LD safely. JSON.stringify output can contain `<` (which would
// break out of an inline <script>) and the U+2028 / U+2029 line/paragraph
// separators (valid JSON, invalid JS). We escape them per the OWASP JSON
// encoding cheatsheet and the Next.js JSON-LD guide.

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

const ESCAPE_MAP: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LS]: "\\u2028",
  [PS]: "\\u2029",
};

const ESCAPE_RE = new RegExp(`[<>&${LS}${PS}]`, "g");

function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(ESCAPE_RE, (c) => ESCAPE_MAP[c] ?? c);
}

export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: safeJson(data) }}
    />
  );
}
