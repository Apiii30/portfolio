import { ImageResponse } from "next/og";
import { og, ogFonts, ogSize } from "@/lib/og";
import { getProject, projects } from "@/lib/projects";
import { site } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug) ?? projects[0];
  const fonts = await ogFonts();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 64,
          background: og.bg,
          borderBottom: `24px solid ${project.accent}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: og.soft, fontFamily: "Geist" }}>
          <span style={{ color: og.accent }}>Case study {project.index}</span>
          <span>{site.shortName}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Geist", fontWeight: 600, fontSize: 104, lineHeight: 0.95, letterSpacing: -5, color: og.ink }}>{project.title}</div>
          <div style={{ marginTop: 28, fontSize: 32, lineHeight: 1.3, color: og.soft, maxWidth: 960, fontFamily: "Geist" }}>
            {project.hook}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: og.faint, fontFamily: "Geist" }}>{project.stack.join("  ·  ")}</div>
      </div>
    ),
    { ...size, fonts },
  );
}
