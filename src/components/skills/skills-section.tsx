"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal, SplitHeading } from "@/components/reveal";
import { learning, skillCount, skillGroups, type Skill, type SkillGroup } from "@/lib/skills";

const ease = [0.16, 1, 0.3, 1] as const;

export function SkillsSection() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="mx-auto max-w-310 px-4 pt-24 sm:px-8 sm:pt-32">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[0.85rem] font-medium text-ink-faint">
              <span className="mr-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold tabular-nums text-on-accent">
                05
              </span>
              Skills
            </p>
          </Reveal>
          <SplitHeading
            id="skills-title"
            text="The toolbox."
            className="mt-4 font-display text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.95]"
          />
        </div>
        <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
          <p className="max-w-[40ch] leading-snug text-ink-soft">
            <span className="font-semibold text-ink">{skillCount} tools</span>, grouped by where they sit in the stack.
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-12">
        {skillGroups.map((g, i) => (
          <Reveal key={g.id} delay={i * 0.06} className={g.span}>
            <GroupCard group={g} />
          </Reveal>
        ))}

        <Reveal delay={0.1} className="lg:col-span-12">
          <div className="flex flex-col gap-5 rounded-[28px] bg-accent p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[0.8rem] font-medium text-white/70">Currently learning</p>
              <p className="mt-1 font-display text-2xl">Getting deeper on the back-end.</p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {learning.map((s) => (
                <li key={s.name} className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/20">
                  {s.icon && <Icon skill={s} className="size-4 fill-white" />}
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** A category card with a soft spotlight that follows the cursor. */
function GroupCard({ group }: { group: SkillGroup }) {
  const reduce = useReducedMotion();
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const wide = group.span.includes("7");

  return (
    <div
      onPointerMove={onMove}
      className="group/card relative h-full overflow-hidden rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), var(--accent-soft), transparent 60%)" }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl">{group.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{group.blurb}</p>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium tabular-nums text-ink-soft">
          {String(group.skills.length).padStart(2, "0")}
        </span>
      </div>

      <motion.ul
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ staggerChildren: 0.035, delayChildren: 0.15 }}
        className={`relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 ${wide ? "2xl:grid-cols-4" : ""}`}
      >
        {group.skills.map((s) => (
          <motion.li
            key={s.name}
            variants={{ hidden: { opacity: 0, y: 14, scale: 0.92 }, shown: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.6, ease }}
          >
            <SkillTile skill={s} />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

function SkillTile({ skill }: { skill: Skill }) {
  const brand = skill.icon && !isDark(skill.icon.hex) ? `#${skill.icon.hex}` : "var(--ink)";
  return (
    <div
      style={{ "--brand": brand } as React.CSSProperties}
      className="group/tile flex h-full items-center gap-2.5 rounded-2xl bg-surface-2 px-2.5 py-2.5 ring-1 ring-transparent transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-surface hover:shadow-[0_10px_24px_-14px_var(--brand)] hover:ring-[color-mix(in_oklab,var(--brand)_35%,transparent)]"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface ring-1 ring-line transition-colors duration-300 group-hover/tile:ring-transparent">
        {skill.icon ? (
          <Icon skill={skill} className="size-4 fill-ink-soft transition-colors duration-300 group-hover/tile:fill-(--brand)" />
        ) : (
          <span className="text-[0.7rem] font-semibold text-ink-soft">{initials(skill.name)}</span>
        )}
      </span>
      <span className="min-w-0 text-[0.85rem] font-medium leading-tight sm:whitespace-nowrap">{skill.name}</span>
    </div>
  );
}

function Icon({ skill, className }: { skill: Skill; className: string }) {
  if (!skill.icon) return null;
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden className={className}>
      <path d={skill.icon.path} />
    </svg>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Near-black brand colours (Next.js, Vercel, GitHub…) would vanish in dark mode, so those use ink instead. */
function isDark(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.2;
}
