import { ImageResponse } from "next/og";
import { og, ogFonts } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The nav monogram: "HA" on ink, with a cobalt dot. */
export default async function Icon() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: og.ink,
          borderRadius: 999,
          color: "#ffffff",
          fontFamily: "Geist",
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: -1.5,
        }}
      >
        HA
        <div style={{ position: "absolute", right: 6, top: 6, width: 12, height: 12, borderRadius: 999, background: og.accent }} />
      </div>
    ),
    { ...size, fonts },
  );
}
