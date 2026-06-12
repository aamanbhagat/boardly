import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
          padding: "0 28px",
          background:
            "linear-gradient(135deg, #2A988A, #115B55)",
          position: "relative",
        }}
      >
        <div
          style={{
            height: 16,
            width: 124,
            background: "white",
            borderRadius: 8,
            opacity: 0.96,
          }}
        />
        <div
          style={{
            height: 16,
            width: 78,
            background: "white",
            borderRadius: 8,
            opacity: 0.96,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 76,
            right: 28,
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "#F08C5A",
          }}
        />
      </div>
    ),
    size
  );
}
