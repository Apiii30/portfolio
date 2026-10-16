"use client";

import { useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ProjectComposition, accentPanel } from "@/components/work/project-composition";
import { Shot } from "@/components/shot";
import { motion } from "motion/react";
import type { Project, Shot as ShotData } from "@/lib/projects";

/** Case-study header visual: the same composition as the home card, drifting as you scroll past. */
export function CaseCover({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-0.8, 0.8]);
  const back = useTransform(drift, (d) => d * -30);
  const front = useTransform(drift, (d) => d * -70);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] overflow-hidden rounded-[28px] sm:aspect-[16/10] lg:aspect-[16/8]"
      style={accentPanel(project.accent)}
    >
      <ProjectComposition project={project} back={back} front={front} priority />
    </div>
  );
}

/** One screenshot that drifts against the scroll; `depth` sets how far. */
export function ParallaxShot({ shot, depth = 40, sizes }: { shot: ShotData; depth?: number; sizes: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [depth, -depth]);

  return (
    <motion.figure ref={ref} style={{ y }}>
      <Shot shot={shot} sizes={sizes} />
      {shot.caption && (
        <figcaption className="mt-3 text-[0.8rem] font-medium text-ink-faint">
          {shot.caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
