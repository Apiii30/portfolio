"use client";

import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  useVelocity,
  wrap,
} from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Parallax, Reveal, SplitHeading } from "@/components/reveal";
import { coreStack, foundations, learning, type Skill } from "@/lib/skills";

const ease = [0.16, 1, 0.3, 1] as const;

export function SkillsSection() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="mx-auto max-w-310 px-4 pt-24 sm:px-8 sm:pt-32">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
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
            className="mt-3 font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.95]"
          />
        </div>
        <Reveal delay={0.1}>
          <p className="max-w-[42ch] leading-snug text-ink-soft lg:text-right">
            The stack I build with most, the foundations and tools around it, and what I&rsquo;m learning now.
          </p>
        </Reveal>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <Reveal className="min-w-0 lg:col-span-8">
          <Parallax speed={0.04} className="h-full">
            <CoreStack />
          </Parallax>
        </Reveal>
        <Reveal delay={0.1} className="min-w-0 lg:col-span-4">
          <Parallax speed={0.12} className="h-full">
            <Learning />
          </Parallax>
        </Reveal>
        <Reveal delay={0.06} className="min-w-0 lg:col-span-12">
          <Parallax speed={0.08}>
            <Foundations />
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Core stack ───────────────────────────── */

/**
 * Inverted card (ink background) so the main stack is the first thing you see.
 * One running lane per layer, alternating direction. Lanes speed up with
 * scroll velocity, reverse when you scroll up, and ease to a stop on hover.
 */
function CoreStack() {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${mx}px ${my}px, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(-400);
        my.set(-400);
      }}
      className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-ink py-6 text-bg sm:py-8"
    >
      {/* dot grid + cursor light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--bg) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <motion.div aria-hidden style={{ background: spotlight }} className="pointer-events-none absolute inset-0" />

      <div className="relative flex flex-wrap items-end justify-between gap-3 px-6 sm:px-8">
        <div>
          <h3 className="font-display text-2xl">Core stack</h3>
          <p className="mt-1 text-sm opacity-75">The technologies I use most in my web projects.</p>
        </div>
        <span className="hidden items-center gap-2 text-[0.75rem] opacity-70 [@media(hover:hover)]:flex">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
            <span className="relative size-1.5 rounded-full bg-accent" />
          </span>
          Hover a lane to pause
        </span>
      </div>

      <div className="relative mt-5 flex flex-1 flex-col justify-center gap-3 sm:gap-4">
        {coreStack.map((g, i) => (
          <Lane key={g.layer} layer={g.layer} skills={g.skills} speed={i % 2 ? 2.2 : -2.2} />
        ))}
      </div>

      {/* Screen-reader version: the lanes repeat items for the loop */}
      <ul className="sr-only">
        {coreStack.map((g) => (
          <li key={g.layer}>
            {g.layer}: {g.skills.map((s) => s.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Two copies, each wider than the card; speeds are a share of both copies.
const COPIES = 2;

function Lane({ layer, skills, speed }: { layer: string; skills: readonly Skill[]; speed: number }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const boost = useSpring(useTransform(velocity, [-1500, 0, 1500], [-2.5, 0, 2.5]), { damping: 50, stiffness: 300 });
  const laneRef = useRef<HTMLDivElement>(null);
  // Only run while near the screen.
  const visible = useInView(laneRef, { margin: "200px 0px" });
  const visibleRef = useRef(false);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);
  const hoverRef = useRef(1);
  const hoverTarget = useRef(1);
  const [hovered, setHovered] = useState(false);
  const hover = (on: boolean) => {
    hoverTarget.current = on ? 0 : 1;
    setHovered(on);
  };
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`);

  // Enough repeats inside one copy that a copy is wider than the card, even for 2-item lanes.
  const copy = useMemo(() => {
    const out: Skill[] = [];
    while (out.length < 8) out.push(...skills);
    return out;
  }, [skills]);

  useAnimationFrame((_, delta) => {
    if (reduce || !visibleRef.current) return;
    // ease toward 0 while hovered, back to 1 after
    hoverRef.current += (hoverTarget.current - hoverRef.current) * 0.08;
    const b = boost.get();
    const dir = b < -0.05 ? -1 : 1;
    const v = speed * dir * (1 + Math.abs(b)) * hoverRef.current;
    baseX.set(baseX.get() + v * (delta / 1000));
  });

  return (
    <div ref={laneRef} onPointerEnter={() => hover(true)} onPointerLeave={() => hover(false)} className="group/lane relative min-w-0" aria-hidden>
      <div className="mb-2 flex items-center gap-2 px-6 sm:px-8">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold transition-colors duration-300 ${hovered ? "bg-accent text-white" : "[background:color-mix(in_oklab,var(--bg)_10%,transparent)]"}`}
        >
          {layer}
        </span>
        <span className="h-px flex-1 [background:color-mix(in_oklab,var(--bg)_12%,transparent)]" />
      </div>
      <div className="-my-4 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <motion.div style={{ x }} className="flex w-max">
          {Array.from({ length: COPIES }).map((_, c) => (
            <div key={c} className="flex shrink-0 gap-3 pr-3">
              {copy.map((s, i) => (
                <LogoPill key={`${c}-${i}`} skill={s} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function LogoPill({ skill }: { skill: Skill }) {
  const brand = skill.icon && !isDark(skill.icon.hex) ? `#${skill.icon.hex}` : "var(--ink)";
  return (
    <span
      style={{ "--brand": brand } as React.CSSProperties}
      className="group/pill flex shrink-0 items-center gap-3 rounded-2xl py-2 pl-2 pr-4 ring-1 ring-[color-mix(in_oklab,var(--bg)_14%,transparent)] transition-[box-shadow,transform,background-color] duration-300 [background:color-mix(in_oklab,var(--bg)_7%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_var(--brand)] hover:ring-[color-mix(in_oklab,var(--brand)_55%,transparent)]"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-bg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--ink)_8%,transparent)]">
        {skill.icon && (
          <svg viewBox="0 0 24 24" aria-hidden className="size-5 transition-transform duration-300 group-hover/pill:scale-110" style={{ fill: "var(--brand)" }}>
            <path d={skill.icon.path} />
          </svg>
        )}
      </span>
      <span className="whitespace-nowrap font-display text-base">{skill.name}</span>
    </span>
  );
}

/* ─────────────────────────── Foundations ─────────────────────────── */

/**
 * Everything visible at once, as a five-column index. Hovering a column
 * lights its logos in their brand colours and quietly dims the others.
 */
function Foundations() {
  const [hot, setHot] = useState<number | null>(null);

  return (
    <div className="rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl">Foundations &amp; supporting tools</h3>
        <p className="text-sm text-ink-soft">The base layer, and everything I&rsquo;ve shipped alongside the core stack.</p>
      </div>

      <div
        onPointerLeave={() => setHot(null)}
        className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1.15fr_1.7fr_1.25fr_0.9fr]"
      >
        {foundations.map((g, i) => {
          const on = hot === i;
          const dim = hot !== null && !on;
          return (
            <motion.section
              key={g.title}
              onPointerEnter={() => setHot(i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease }}
              aria-label={g.title}
              className={`relative overflow-hidden rounded-2xl p-4 transition-[background-color,opacity] duration-300 ${on ? "bg-accent-soft" : "bg-surface-2"} ${dim ? "opacity-55" : ""}`}
            >
              <span
                aria-hidden
                className={`absolute inset-x-0 top-0 h-0.5 origin-left bg-accent transition-transform duration-500 ease-out-expo ${on ? "scale-x-100" : "scale-x-0"}`}
              />
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-[0.8rem] font-semibold">{g.title}</span>
                <span className={`text-[0.7rem] font-medium tabular-nums ${on ? "text-accent" : "text-ink-faint"}`}>0{i + 1}</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {g.skills.map((s, k) => (
                  <motion.li
                    key={s.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.06 + k * 0.03, ease }}
                    className="max-w-full"
                  >
                    <Chip skill={s} lit={on} />
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ skill, lit }: { skill: Skill; lit: boolean }) {
  const brand = skill.icon && !isDark(skill.icon.hex) ? `#${skill.icon.hex}` : "var(--ink)";
  return (
    <span
      style={{ "--brand": brand } as React.CSSProperties}
      className={`group/chip inline-flex max-w-full items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-[0.8rem] font-medium leading-snug ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_var(--brand)] ${lit ? "ring-[color-mix(in_oklab,var(--brand)_35%,transparent)]" : "ring-line"}`}
    >
      {skill.icon && (
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`size-3.5 shrink-0 transition-colors duration-300 group-hover/chip:fill-(--brand) ${lit ? "fill-(--brand)" : "fill-ink-soft"}`}
        >
          <path d={skill.icon.path} />
        </svg>
      )}
      <span className="min-w-0">{skill.name}</span>
    </span>
  );
}

/* ─────────────────────────── Currently learning ─────────────────────────── */

function Learning() {
  return (
    <div className="relative flex h-full flex-col justify-between gap-5 overflow-hidden rounded-[28px] bg-accent-fill p-6 text-white sm:p-7">
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/10 ring-1 ring-white/15" />
      <div className="relative">
      <p className="relative flex items-center gap-2 text-[0.8rem] font-medium text-white/85">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-60" />
          <span className="relative size-2 rounded-full bg-white" />
        </span>
        Currently learning
      </p>
      <p className="relative mt-1 text-balance font-display text-xl leading-tight">Exploring backend and Android development.</p>
      </div>
      <dl className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {learning.map((g) => (
          <div key={g.title} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
            <dt className="text-[0.75rem] font-medium text-white/85">{g.title}</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {g.skills.map((s) => (
                <span key={s.name} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[0.8rem] font-medium">
                  {s.icon && (
                    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 shrink-0 fill-white">
                      <path d={s.icon.path} />
                    </svg>
                  )}
                  {s.name}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Near-black brand colours (Next.js, Express, GitHub…) would vanish on dark surfaces, so those fall back. */
function isDark(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.2;
}
