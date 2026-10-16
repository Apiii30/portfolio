import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };

export async function ogFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), "assets/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/Geist-SemiBold.ttf")),
  ]);
  return [
    { name: "Geist", data: regular, style: "normal" as const, weight: 400 as const },
    { name: "Geist", data: semibold, style: "normal" as const, weight: 600 as const },
  ];
}

/** Inline an image for ImageResponse. Path is relative to the project root. Satori can't decode WebP, so use PNG/JPEG. */
export async function dataUrl(path: string, mime = "image/png") {
  const buf = await readFile(join(process.cwd(), path));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export const og = {
  bg: "#f2f2f0",
  surface: "#ffffff",
  ink: "#0b0b0d",
  soft: "#55555c",
  faint: "#94949b",
  accent: "#3a5bff",
};
