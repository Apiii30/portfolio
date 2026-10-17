"use client";

import { useEffect, useId, useRef, useState } from "react";

type LiquidGlassProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Corner radius in px — must match the element's border-radius for the refraction to line up. */
  radius: number;
  /** Width of the refracting rim in px. */
  bezel?: number;
  /** How far (px) the rim pulls the backdrop inward. */
  strength?: number;
  /** Backdrop blur applied after refraction, in px. */
  blur?: number;
};

/**
 * Refracting glass surface. Every browser gets the frosted `.glass` look;
 * Chromium (the only engine that accepts SVG filters in `backdrop-filter`)
 * also gets a rim that bends whatever is behind it, built from a
 * displacement map generated for this element's exact size and radius.
 */
export function LiquidGlass({
  radius,
  bezel = 18,
  strength = 46,
  blur = 6,
  className = "",
  style,
  children,
  ...rest
}: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const filterId = `lg-${useId().replace(/:/g, "")}`;
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supportsBackdropSvgFilter()) return;

    let frame = 0;
    const build = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = Math.round(el.offsetWidth);
        const h = Math.round(el.offsetHeight);
        if (w < 2 || h < 2) return;
        setMap({ url: displacementMap(w, h, radius, bezel), w, h });
      });
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [radius, bezel]);

  const backdrop = map
    ? `url(#${filterId}) blur(${blur}px) saturate(1.8)`
    : undefined;

  return (
    <div
      ref={ref}
      className={`glass ${className}`}
      style={{
        borderRadius: radius,
        ...(backdrop && { backdropFilter: backdrop, WebkitBackdropFilter: backdrop }),
        ...style,
      }}
      {...rest}
    >
      {map && (
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter
            id={filterId}
            x="0"
            y="0"
            width={map.w}
            height={map.h}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} result="map" preserveAspectRatio="none" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}

function supportsBackdropSvgFilter() {
  if (typeof navigator === "undefined") return false;
  // Refraction is a desktop treat: an SVG filter inside backdrop-filter is
  // re-run on every scroll frame, which mid-range phones feel.
  if (!matchMedia("(pointer: fine)").matches) return false;
  // userAgentData only exists in Chromium-based browsers.
  return "userAgentData" in navigator;
}

/** Signed distance from point to a rounded rectangle centred on the origin (negative inside). */
function roundedRectSdf(x: number, y: number, hw: number, hh: number, r: number) {
  const qx = Math.abs(x) - (hw - r);
  const qy = Math.abs(y) - (hh - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * R/G encode the x/y offset (128 = none). Inside the rim, pixels are pushed
 * along the inward normal with a convex falloff, like the thick edge of a lens.
 */
function displacementMap(w: number, h: number, radius: number, bezel: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(radius, hw, hh);

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const x = px + 0.5 - hw;
      const y = py + 0.5 - hh;
      const d = roundedRectSdf(x, y, hw, hh, r);
      const depth = -d;
      let dx = 0;
      let dy = 0;

      if (depth > 0 && depth < bezel) {
        const nx = roundedRectSdf(x + 1, y, hw, hh, r) - roundedRectSdf(x - 1, y, hw, hh, r);
        const ny = roundedRectSdf(x, y + 1, hw, hh, r) - roundedRectSdf(x, y - 1, hw, hh, r);
        const len = Math.hypot(nx, ny) || 1;
        const t = 1 - depth / bezel;
        const mag = t * t * (3 - 2 * t);
        // Sample from further inside the glass → the rim magnifies inward.
        dx = (-nx / len) * mag;
        dy = (-ny / len) * mag;
      }

      const i = (py * w + px) * 4;
      img.data[i] = 128 + dx * 127;
      img.data[i + 1] = 128 + dy * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}
