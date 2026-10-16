import Image from "next/image";
import { sizeOf } from "@/lib/image-sizes";
import type { Shot as ShotData } from "@/lib/projects";

const frame: Record<ShotData["kind"], string> = {
  desktop: "rounded-[14px] sm:rounded-[18px]",
  panel: "rounded-[18px]",
  mobile: "rounded-[22px] sm:rounded-[28px] ring-[5px] ring-ink/90",
};

/** A screenshot at its intrinsic aspect ratio, framed by kind. No fake browser chrome. */
export function Shot({
  shot,
  sizes,
  className = "",
  priority = false,
  fill = false,
}: {
  shot: ShotData;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Fill the parent box (parent sets the size) instead of sizing by width. */
  fill?: boolean;
}) {
  const { width, height } = sizeOf(shot.src);
  return (
    <Image
      src={shot.src}
      alt={shot.alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`block ${fill ? "h-full w-full object-cover object-top" : "h-auto w-full"} bg-surface shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)] ${frame[shot.kind]} ${className}`}
    />
  );
}
