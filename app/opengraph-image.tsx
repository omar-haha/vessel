import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const runtime = "edge";
export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 80, fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {BRAND.name}
          </div>
          <div style={{ width: 60, height: 1, backgroundColor: "rgba(255,255,255,0.25)" }} />
          <div
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.01em",
              textAlign: "center",
              maxWidth: 540,
              lineHeight: 1.4,
            }}
          >
            {BRAND.tagline}
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginTop: 6, letterSpacing: "0.05em" }}>
            {BRAND.domain}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
