import { ImageResponse } from "next/og";
import { productName, productFullName, tagline } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = `${productName} — ${tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Varsayılan Open Graph görseli (sosyal paylaşımlarda görünür) — marka renkleri,
 * ürün adı ve slogan. Next.js bu dosyayı tüm rotalar için OG/Twitter görseli
 * olarak otomatik kullanır (sayfa kendi görselini tanımlamadıkça).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 0% 0%, #0A2342 0%, #050C16 55%)",
          color: "#E3E2E5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#B2C7EF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A2342",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            i
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            {productName}
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#B2C7EF" }}>
          {productFullName}
        </div>
      </div>
    ),
    { ...size },
  );
}
