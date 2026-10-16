"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/** Rises, scales up and un-blurs into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  x = 0,
  scale = 0.96,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y, x, scale, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, delay, ease }}
    >
      {children}
    </Tag>
  );
}

/**
 * Scroll-linked drift: moves against the scroll by `speed` × 100px across the
 * time it is on screen. Negative speeds move with the scroll.
 */
export function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [speed * 100, speed * -100]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Grows from a smaller, rounder card to full size as it scrolls in — used for
 * big closing blocks so they "arrive" rather than just appear.
 */
export function ScrollZoom({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], reduce ? [32, 32] : [72, 32]);
  return (
    <motion.div ref={ref} style={{ scale, borderRadius: radius }} className={`overflow-hidden ${className}`}>
      {children}
    </motion.div>
  );
}

/**
 * Large serif heading whose words slide up from behind a mask, one after another.
 * The heading itself is observed (not each word): a word parked below its
 * overflow-hidden mask never intersects, so it could never trigger itself.
 */
export function SplitHeading({
  text,
  className = "",
  as = "h2",
  id,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: 0.06 }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, i) => (
          <span key={i} className="inline-flex overflow-hidden pb-[0.1em] mb-[-0.1em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
              transition={{ duration: 1, ease }}
            >
              {word}
              {"\u00a0"}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
