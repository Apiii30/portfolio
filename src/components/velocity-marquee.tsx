"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { useRef } from "react";

type Row = { items: readonly string[]; speed: number; tone?: "ink" | "faint" | "accent" };

/**
 * Running text that drifts on its own, races when you scroll fast, and
 * eases back when you stop. Scrolling up reverses it.
 */
export function VelocityMarquee({ rows, className = "" }: { rows: readonly Row[]; className?: string }) {
  return (
    <div aria-hidden className={`relative overflow-hidden py-6 sm:py-10 ${className}`}>
      {rows.map((row, i) => (
        <MarqueeRow key={i} {...row} />
      ))}
    </div>
  );
}

function MarqueeRow({ items, speed, tone = "ink" }: Row) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [0, 1000], [0, 6], { clamp: false });
  const skew = useTransform(smoothVelocity, [-2500, 0, 2500], [7, 0, -7]);
  const direction = useRef(1);

  // Four copies of the content; we loop across one copy's width (25%).
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    // Scrolling down keeps the row's own direction, scrolling up flips it.
    if (b < 0) direction.current = -1;
    else if (b > 0) direction.current = 1;
    const dt = delta / 1000;
    baseX.set(baseX.get() + direction.current * speed * dt * (1 + Math.abs(b)));
  });

  const color = tone === "faint" ? "text-ink-faint" : tone === "accent" ? "text-accent" : "text-ink";

  return (
    <div className="flex whitespace-nowrap">
      <motion.div style={{ x, skewX: reduce ? 0 : skew }} className={`flex shrink-0 ${color}`}>
        {Array.from({ length: 4 }).map((_, copy) => (
          <span key={copy} className="flex shrink-0 items-center">
            {items.map((item) => (
              <span
                key={item}
                className="flex items-center font-display text-[clamp(2.4rem,7vw,6rem)] leading-[1.05]"
              >
                <span className="px-5 sm:px-8">{item}</span>
                <Spark />
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[0.42em] shrink-0 text-accent" fill="currentColor">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  );
}
