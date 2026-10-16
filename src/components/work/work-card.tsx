"use client";

import { CurtainLink } from "@/components/curtain";
import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useState } from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import { ProjectComposition, accentPanel } from "@/components/work/project-composition";
import type { Project } from "@/lib/projects";

/**
 * `drift` is this card's position relative to the viewport centre, roughly -1…1.
 * Layers move by different amounts of it, which is the parallax.
 */
export function WorkCard({
  project,
  drift,
  className = "",
}: {
  project: Project;
  drift: MotionValue<number>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const k = reduce ? 0 : 1;
  const back = useTransform(drift, (d) => d * -18 * k);
  const front = useTransform(drift, (d) => d * -42 * k);
  const textShift = useTransform(drift, (d) => d * 14 * k);
  const cardScale = useTransform(drift, (d) => 1 - Math.min(1, Math.abs(d)) * 0.08 * k);
  const cardRotate = useTransform(drift, (d) => d * -2.5 * k);

  return (
    <motion.div style={{ scale: cardScale, rotateY: cardRotate, transformPerspective: 1600 }} className={className}>
    <CurtainLink
      href={`/work/${project.slug}`}
      color={project.accent}
      label={project.title}
      fromSelector="[data-curtain-from]"
      className="group relative grid h-full overflow-hidden rounded-[28px] bg-surface ring-1 ring-line lg:grid-cols-12"
    >
      <motion.div
        style={{ x: textShift }}
        className="relative z-10 flex min-h-0 flex-col justify-between gap-6 p-6 sm:p-7 lg:col-span-5 lg:p-8"
      >
        <div>
          <div className="flex items-center justify-between text-[0.8rem] text-ink-faint">
            <span>
              <span className="text-accent">{project.index}</span> — {project.year}
            </span>
            <span className="hidden sm:inline">{project.role.split("·")[0].trim()}</span>
          </div>
          <h3 className="mt-5 font-display text-[2rem] leading-[0.95] tracking-[-0.045em] sm:text-4xl lg:text-[2.6rem]">
            {project.title}
          </h3>
          <p className="mt-4 max-w-[34ch] leading-snug text-ink-soft">{project.hook}</p>
        </div>

        <div>
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <li
                key={s}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] tracking-wide text-ink-soft"
              >
                {s}
              </li>
            ))}
          </ul>
          <span className="mt-5 inline-flex items-center gap-3 text-[0.95rem] font-medium">
            <span className="relative">
              Read the case study
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:-rotate-45">
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 8h12M9 3l5 5-5 5" />
              </svg>
            </span>
          </span>
        </div>
      </motion.div>

      <Visual project={project} back={back} front={front} />
    </CurtainLink>
    </motion.div>
  );
}

function Visual({
  project,
  back,
  front,
}: {
  project: Project;
  back: MotionValue<number>;
  front: MotionValue<number>;
}) {
  const [lens, setLens] = useState(false);
  const lx = useSpring(0, { stiffness: 300, damping: 28 });
  const ly = useSpring(0, { stiffness: 300, damping: 28 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    lx.set(e.clientX - r.left);
    ly.set(e.clientY - r.top);
    if (!lens) setLens(true);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={() => setLens(false)}
      data-curtain-from
      className="relative min-h-[300px] overflow-hidden max-lg:order-first lg:col-span-7 lg:min-h-0"
      style={accentPanel(project.accent)}
    >
      <ProjectComposition project={project} back={back} front={front} />

      {/* Glass lens that follows the cursor and bends the screenshot under it */}
      <motion.div
        aria-hidden
        style={{ x: lx, y: ly }}
        className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
      >
        <motion.div
          initial={false}
          animate={{ scale: lens ? 1 : 0, opacity: lens ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="-translate-x-1/2 -translate-y-1/2"
        >
          <LiquidGlass radius={56} bezel={26} strength={70} blur={0} className="grid size-28 place-items-center bg-transparent">
            <span className="text-[0.75rem] font-medium text-ink">Open</span>
          </LiquidGlass>
        </motion.div>
      </motion.div>
    </div>
  );
}
