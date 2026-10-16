"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: !reduce, anchors: { offset: -24 } }}>
      {children}
    </ReactLenis>
  );
}
