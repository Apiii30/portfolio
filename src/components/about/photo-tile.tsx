"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Portrait tile sized to the photo (4:5), so the figure fills it. A giant
 * first name sits behind the cut-out and slides the other way as you scroll:
 * text at the back, you in front.
 */
export function PhotoTile() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const k = reduce ? 0 : 1;
  const textX = useTransform(p, [0, 1], [`${16 * k}%`, `${-24 * k}%`]);
  const personY = useTransform(p, [0, 1], [`${8 * k}%`, `${0 * k}%`]);
  const glowScale = useTransform(p, [0, 1], [0.85, 1.15]);

  return (
    <div ref={ref} className="relative aspect-4/5 w-full overflow-hidden rounded-[28px] bg-accent-soft ring-1 ring-line">
      <motion.div
        aria-hidden
        style={{ scale: glowScale }}
        className="absolute left-[2.5%] top-[-10%] aspect-square w-[95%] rounded-full bg-[radial-gradient(circle,var(--surface)_0%,transparent_65%)]"
      />

      <motion.p
        aria-hidden
        style={{ x: textX }}
        className="absolute left-0 top-[5%] whitespace-nowrap font-display text-[clamp(5.5rem,13vw,11rem)] leading-none text-accent"
      >
        HAFIDZ ASMAR
      </motion.p>

      {/* The cut-out stands on the bottom edge; it sinks slightly as you scroll so its cut stays hidden */}
      <motion.div style={{ y: personY }} className="absolute inset-x-[6%] bottom-[-2%] top-[9%]">
        <Image
          src="/images/hafidz-crossed-cutout.webp"
          alt="Hafidz in a black suit with arms crossed"
          fill
          sizes="(min-width: 1024px) 40vw, 92vw"
          className="object-contain object-bottom drop-shadow-[0_30px_40px_rgb(10_20_60/0.25)]"
        />
      </motion.div>

      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-surface/85 px-3 py-1.5 text-[0.75rem] font-medium backdrop-blur-md">
          Bandung, 2026
        </span>
        <span className="rounded-full bg-ink px-3 py-1.5 text-[0.75rem] font-medium text-bg">D3 · class of 2027</span>
      </div>
    </div>
  );
}
