import { useId } from "react";

/**
 * The HA mark, traced from public/logo at 1024px so each of its four pieces
 * can be coloured and animated on its own: the H's stem, the ribbon (the H's
 * crossbar running up into the A's left slash), the small wedge under the
 * ribbon, and the A's right leg.
 */
export const LOGO_VIEWBOX = "112 235 800 551";

export const LOGO_PIECES = {
  stem: "M118 337L221 241V780H118Z",
  ribbon: "M221 482H347Q371 482 388 463L548 290Q565 272 590 272H698L446 565Q430 583 405 583H221Z",
  wedge: "M510 575V757Q510 779 488 779H334Z",
  leg: "M573 487L659 390L905 780H789Q767 780 755 762Z",
} as const;

export type LogoPiece = keyof typeof LOGO_PIECES;

/** Gradient axes, in viewBox units: along the ribbon and down the leg. */
export const LOGO_AXES = {
  ribbon: { x1: 221, y1: 530, x2: 698, y2: 272 },
  leg: { x1: 617, y1: 440, x2: 848, y2: 780 },
} as const;

type LogoProps = {
  /** "brand" follows the theme (navy + blue on light, white + blue on dark); "mono" uses currentColor. */
  tone?: "brand" | "mono";
  /** Ease the pieces apart while the nearest `.group` is hovered. */
  hover?: boolean;
  className?: string;
};

export function Logo({ tone = "brand", hover = false, className = "" }: LogoProps) {
  const id = useId().replace(/:/g, "");
  const fill = (piece: LogoPiece) => {
    if (tone === "mono") return "currentColor";
    if (piece === "ribbon" || piece === "leg") return `url(#${id}-${piece})`;
    return "var(--logo-solid)";
  };

  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden className={`logo-mark ${hover ? "logo-hover" : ""} ${className}`}>
      {tone === "brand" && (
        <defs>
          {(["ribbon", "leg"] as const).map((g) => (
            <linearGradient key={g} id={`${id}-${g}`} gradientUnits="userSpaceOnUse" {...LOGO_AXES[g]}>
              <stop offset="0" style={{ stopColor: `var(--logo-${g}-0)` }} />
              <stop offset="0.45" style={{ stopColor: `var(--logo-${g}-1)` }} />
              <stop offset="1" style={{ stopColor: `var(--logo-${g}-2)` }} />
            </linearGradient>
          ))}
        </defs>
      )}
      {(Object.keys(LOGO_PIECES) as LogoPiece[]).map((p) => (
        <path key={p} data-piece={p} d={LOGO_PIECES[p]} fill={fill(p)} />
      ))}
    </svg>
  );
}
