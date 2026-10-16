"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Stacks every variant in one grid cell (so the box never jumps) and
 * dissolves words of the inactive ones through blur while the active one condenses in.
 */
export function MorphText({
  variants,
  active,
  className = "",
}: {
  variants: readonly string[];
  active: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={`grid ${className}`}>
      {variants.map((text, v) => {
        const on = v === active;
        return (
          <span key={v} aria-hidden={!on} className="col-start-1 row-start-1">
            {text.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block whitespace-pre"
                initial={false}
                animate={
                  on
                    ? { opacity: 1, filter: "blur(0px)", y: "0em" }
                    : { opacity: 0, filter: reduce ? "blur(0px)" : "blur(10px)", y: reduce ? "0em" : "0.35em" }
                }
                transition={{
                  duration: reduce ? 0 : 0.55,
                  delay: reduce ? 0 : on ? 0.12 + i * 0.025 : i * 0.012,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
