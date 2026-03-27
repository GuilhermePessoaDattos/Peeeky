import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Peeeky — Share documents. Know who reads them.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1A1A2E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: "white", display: "flex" }}>
          p<span style={{ color: "#6C5CE7" }}>eee</span>ky
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "white",
            marginTop: 24,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          Share documents.
          <br />
          <span style={{ color: "#6C5CE7" }}>Know who reads them.</span>
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#8E8EA8",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Page-level analytics • AI Chat • Smart Follow-ups
        </div>
      </div>
    ),
    { ...size }
  );
}
