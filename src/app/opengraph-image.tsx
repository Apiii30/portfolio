import { ImageResponse } from "next/og";
import { dataUrl, og, ogFonts, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.shortName} — ${site.role} in Bandung`;
export const size = ogSize;
export const contentType = "image/png";

/** Same bento as the hero: a white intro card next to a cobalt card the portrait breaks out of. */
export default async function Image() {
  const [fonts, photo] = await Promise.all([ogFonts(), dataUrl("assets/og-portrait.png")]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: og.bg, padding: 28, gap: 20, fontFamily: "Geist" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            background: og.surface,
            borderRadius: 32,
            padding: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 10,
              fontSize: 22,
              color: og.accent,
              background: "rgba(58,91,255,0.1)",
              borderRadius: 999,
              padding: "8px 18px",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: og.accent }} />
            Open to internships & freelance
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontWeight: 600, fontSize: 104, lineHeight: 0.9, letterSpacing: -5 }}>
            <span style={{ color: og.ink }}>Hafidz Asmar</span>
            <span style={{ color: og.faint }}>Meisanda</span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: og.soft }}>Full-stack developer · Founder of Webkeun.id</div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 380 }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 70, background: og.accent, borderRadius: 32 }} />
          <img src={photo} alt="" width={380} height={570} style={{ position: "absolute", bottom: 0, left: 0, objectFit: "contain" }} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
