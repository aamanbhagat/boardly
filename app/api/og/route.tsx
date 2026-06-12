import { ImageResponse } from "next/og";

const PALETTE: Record<
  string,
  { bg: string; bg2: string; accent: string; chip: string }
> = {
  default: {
    bg: "#F1F5F2",
    bg2: "#FAFBF9",
    accent: "#0D7C6E",
    chip: "#FFFFFF",
  },
  board: {
    bg: "#F1F5F2",
    bg2: "#FAFBF9",
    accent: "#0D7C6E",
    chip: "#FFFFFF",
  },
  standard: {
    bg: "#F1F5F2",
    bg2: "#FAFBF9",
    accent: "#0D7C6E",
    chip: "#FFFFFF",
  },
  subject: {
    bg: "#EFF5F1",
    bg2: "#FAFBF9",
    accent: "#0F8B7B",
    chip: "#FFFFFF",
  },
  chapter: {
    bg: "#FBF1EE",
    bg2: "#FAFBF9",
    accent: "#E07856",
    chip: "#FFFFFF",
  },
  exercise: {
    bg: "#EEF5F4",
    bg2: "#FAFBF9",
    accent: "#0D7C6E",
    chip: "#FFFFFF",
  },
  question: {
    bg: "#EEF4F4",
    bg2: "#FAFBF9",
    accent: "#0D7C6E",
    chip: "#FFFFFF",
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "default";
  const board = searchParams.get("board") ?? "";
  const cls = searchParams.get("class") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const chapter = searchParams.get("chapter") ?? "";
  const exercise = searchParams.get("exercise") ?? "";
  const question = searchParams.get("question") ?? "";
  const qText = searchParams.get("qText") ?? "";
  const qCount = searchParams.get("qCount") ?? "";

  const colors = PALETTE[type] ?? PALETTE.default!;

  const headline = (() => {
    switch (type) {
      case "board":
        return board ? `${board} Solutions` : "Textbook Solutions";
      case "standard":
        return board ? `${board} · Class ${cls}` : `Class ${cls}`;
      case "subject":
        return subject || "Subject";
      case "chapter":
        return chapter || "Chapter";
      case "exercise":
        return exercise ? `Exercise ${exercise}` : "Exercise";
      case "question":
        return qText || (question ? `Question ${question}` : "Question");
      default:
        return "Free Textbook Solutions";
    }
  })();

  const subline = (() => {
    if (type === "question") {
      const parts = [
        chapter ? `${chapter} · Q${question}` : "",
        subject,
        cls ? `Class ${cls}` : "",
        board,
      ].filter(Boolean);
      return parts.join(" · ");
    }
    if (type === "exercise") {
      const parts = [
        chapter,
        subject,
        cls ? `Class ${cls}` : "",
        board,
      ].filter(Boolean);
      return parts.join(" · ");
    }
    if (type === "chapter") {
      const parts = [subject, cls ? `Class ${cls}` : "", board].filter(Boolean);
      return parts.join(" · ");
    }
    if (type === "subject") {
      const parts = [cls ? `Class ${cls}` : "", board].filter(Boolean);
      return parts.join(" · ");
    }
    return "Step-by-step answers · All boards · Free forever";
  })();

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Boardly";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg} 60%, ${colors.accent}1A 100%)`,
          padding: "72px 80px",
          color: "#0F1F1B",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {siteName[0]}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {siteName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: 1000,
          }}
        >
          {type === "exercise" && qCount ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: colors.chip,
                color: colors.accent,
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(15, 31, 27, 0.08)",
              }}
            >
              {qCount} solved questions
            </div>
          ) : null}
          <div
            style={{
              fontSize: headline.length > 40 ? 64 : 80,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              color: "#0F1F1B",
            }}
          >
            {headline}
          </div>
          {subline ? (
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: "#4A5C58",
                lineHeight: 1.3,
              }}
            >
              {subline}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#677470",
            fontSize: 22,
          }}
        >
          <div>Step-by-step solutions · Free forever</div>
          <div style={{ color: colors.accent, fontWeight: 600 }}>
            Read solution →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
