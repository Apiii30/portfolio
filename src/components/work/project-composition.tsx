"use client";

import { motion, type MotionValue } from "motion/react";
import { Shot } from "@/components/shot";
import type { Project } from "@/lib/projects";

/**
 * The layered screenshots for a project, on its accent panel. Shared by the
 * home card and the case-study header, so the page transition lands on the
 * same picture it left from.
 */
export function ProjectComposition({
  project,
  back,
  front,
  priority = false,
}: {
  project: Project;
  back: MotionValue<number> | number;
  front: MotionValue<number> | number;
  priority?: boolean;
}) {
  const cover = (
    <Shot shot={project.cover} sizes="(min-width: 1024px) 50vw, 90vw" priority={priority} fill={project.cover.kind === "mobile"} />
  );

  if (project.cover.kind === "mobile") {
    return (
      // Phones are sized by the panel's height so they never overflow a wide, short panel.
      <div className="absolute inset-0 flex items-center justify-center gap-[3%] px-[5%]">
        <motion.div style={{ y: back }} className="aspect-[900/1777] h-[68%] max-w-[29%] translate-y-[8%]">
          <Shot shot={project.preview[0]} sizes="20vw" fill />
        </motion.div>
        <motion.div style={{ x: front }} className="aspect-[900/1777] h-[80%] max-w-[34%]">
          {cover}
        </motion.div>
        <motion.div style={{ y: back }} className="aspect-[900/1777] h-[68%] max-w-[29%] -translate-y-[8%]">
          <Shot shot={project.preview[1] ?? project.preview[0]} sizes="20vw" fill />
        </motion.div>
      </div>
    );
  }

  if (project.preview[0]?.kind === "mobile") {
    return (
      <div className="absolute inset-0">
        <motion.div style={{ x: back }} className="absolute left-[5%] top-1/2 w-[76%] -translate-y-[58%]">
          {cover}
        </motion.div>
        <motion.div style={{ x: front }} className="absolute bottom-[7%] right-[5%] w-[19%]">
          <Shot shot={project.preview[0]} sizes="15vw" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <motion.div style={{ x: back }} className="absolute right-[4%] top-[8%] w-[62%] opacity-90">
        <Shot shot={project.preview[0]} sizes="35vw" />
      </motion.div>
      <motion.div style={{ x: front }} className="absolute bottom-[8%] left-[5%] w-[70%]">
        {cover}
      </motion.div>
    </div>
  );
}

export const accentPanel = (accent: string) => ({
  background: `color-mix(in oklab, ${accent} 22%, var(--bg-elev))`,
});
