import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          padding: "0 5px",
          background:
            "linear-gradient(135deg, #2A988A, #115B55)",
          borderRadius: 7,
          position: "relative",
        }}
      >
        <div
          style={{
            height: 3,
            width: 22,
            background: "white",
            borderRadius: 2,
            opacity: 0.96,
          }}
        />
        <div
          style={{
            height: 3,
            width: 14,
            background: "white",
            borderRadius: 2,
            opacity: 0.96,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 13,
            right: 5,
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "#F08C5A",
          }}
        />
      </div>
    ),
    size
  );
}
