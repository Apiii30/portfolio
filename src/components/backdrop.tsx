"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useMedia } from "@/lib/use-media";

/**
 * Fixed page background: a fine dot grid that fades out toward the edges,
 * two soft cobalt lights that drift at different speeds as you scroll, and a
 * whisper of film grain so the flat surfaces don't look digital-flat.
 *
 * The lights are radial gradients rather than blurred circles: same softness,
 * no full-screen blur for the GPU to recompute. On phones the background holds
 * still and skips the grain, which costs a blend pass on every scroll frame.
 */
export function Backdrop() {
  const reduce = useReducedMotion();
  const small = useMedia("(max-width: 767px)");
  const still = reduce || small;
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 30 });
  const k = still ? 0 : 1;
  const aY = useTransform(p, [0, 1], ["0vh", `${-60 * k}vh`]);
  const aX = useTransform(p, [0, 1], ["0vw", `${-18 * k}vw`]);
  const bY = useTransform(p, [0, 1], ["0vh", `${40 * k}vh`]);
  const bX = useTransform(p, [0, 1], ["0vw", `${22 * k}vw`]);
  const gridY = useTransform(p, [0, 1], ["0px", `${-120 * k}px`]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ x: aX, y: aY, background: "radial-gradient(circle, var(--accent) 0%, transparent 68%)" }}
        className="absolute right-[-25vw] top-[-32vh] h-[95vh] w-[95vh] rounded-full opacity-[0.16] dark:opacity-25"
      />
      <motion.div
        style={{ x: bX, y: bY, background: "radial-gradient(circle, #8fb0ff 0%, transparent 68%)" }}
        className="absolute left-[-30vw] top-[35vh] h-[85vh] w-[85vh] rounded-full opacity-[0.18]"
      />
      <motion.div
        style={{
          y: gridY,
          backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--ink) 16%, transparent) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, #000 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, #000 20%, transparent 80%)",
        }}
        className="absolute -inset-y-50 inset-x-0"
      />
      {!small && (
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
