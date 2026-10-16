"use client";

import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import { LocalTime } from "@/components/local-time";
import { Magnetic } from "@/components/magnetic";
import { LiquidPortrait } from "@/components/hero/liquid-portrait";
import { MorphText } from "@/components/hero/morph-text";
import { useIntroDone } from "@/lib/intro";
import { site } from "@/lib/site";

const sides = [
  {
    kicker: "Builds it",
    text: "I take web apps from the database schema to the last hover state. React, Next.js, Express, PostgreSQL.",
    tag: "01 — Developer",
    now: { title: "Full-stack Developer", note: "React · Next.js · Express · PostgreSQL", href: site.github },
  },
  {
    kicker: "Runs it",
    text: "Founder of Webkeun.id: digital invitations and business sites for real clients, from first call to launch day.",
    tag: "02 — Founder",
    now: { title: "Founder, Webkeun.id", note: "Invitations & small-business sites", href: site.webkeun },
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;
const card = "rounded-[28px] bg-surface ring-1 ring-line";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const ready = useIntroDone();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  const morph = useTransform(smooth, [0.1, 0.65], [0, 1], { clamp: true });
  const [side, setSide] = useState(0);
  useMotionValueEvent(morph, "change", (v) => setSide(v > 0.5 ? 1 : 0));

  // Parallax layers
  const k = reduce ? 0 : 1;
  const nameX = useTransform(smooth, [0, 1], ["0%", `${-4 * k}%`]);
  // The figure sinks into the card as you scroll, so its cut-off bottom edge stays hidden.
  const personY = useTransform(smooth, [0, 1], ["0%", `${7 * k}%`]);
  const personScale = useTransform(smooth, [0, 1], [1, 1 + 0.04 * k]);
  const discY = useTransform(smooth, [0, 1], ["0%", `${10 * k}%`]);
  const tagY = useTransform(smooth, [0, 1], ["0px", `${-40 * k}px`]);
  const exit = useTransform(smooth, [0.85, 1], [1, 0.94]);
  const exitOpacity = useTransform(smooth, [0.85, 1], [1, 0.4]);
  const progressWidth = useTransform(morph, (v) => `${v * 100}%`);
  const [portraitRef, cardTop] = useCardTop();

  return (
    <section ref={ref} id="top" className="relative h-[220svh] lg:h-[240vh]" aria-label="Introduction">
      <motion.div
        style={{ scale: exit, opacity: exitOpacity }}
        className="sticky top-0 mx-auto grid h-svh max-w-310 grid-rows-[auto_minmax(0,1fr)] gap-3 px-3 pb-3 pt-22 sm:px-6 sm:pt-24 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-4 lg:pb-6"
      >
        {/* Intro */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease }}
          className={`${card} relative flex flex-col justify-between gap-4 overflow-hidden p-5 sm:gap-6 sm:p-8 lg:col-span-7 lg:row-span-2 lg:p-10`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[0.8rem] font-medium text-accent">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              {site.status}
            </span>
          </div>

          <div>
            <h1 className="font-display text-[min(13.5vw,6.6svh)] leading-[0.86] sm:text-[min(9.5vw,8.5svh)] lg:text-[min(6.2vw,10svh)]">
              <span className="sr-only">{site.name}</span>
              <motion.span aria-hidden style={{ x: nameX }} className="block">
                <Letters text="Hafidz" delay={0.15} play={ready} />
              </motion.span>
              <motion.span aria-hidden style={{ x: nameX }} className="block">
                <Letters text="Asmar" delay={0.25} play={ready} />
              </motion.span>
              <motion.span aria-hidden style={{ x: nameX }} className="block text-ink-faint">
                <Letters text="Meisanda" delay={0.35} play={ready} />
              </motion.span>
            </h1>

            <div className="mt-4 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-[44ch]">
                <p className="text-[0.85rem] font-semibold text-accent">
                  <MorphText variants={sides.map((s) => s.kicker)} active={side} />
                </p>
                <p className="mt-2 text-[0.92rem] leading-snug text-ink-soft sm:text-lg">
                  <MorphText variants={sides.map((s) => s.text)} active={side} />
                </p>
              </div>
              <Actions />
            </div>
          </div>
        </motion.div>

        {/* Portrait: the figure stands on the card and its head breaks out of the top */}
        <motion.div
          ref={portraitRef}
          initial={reduce ? false : { opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 0.4, ease }}
          className="relative min-h-0 lg:col-span-5 lg:row-span-3"
        >
          <div
            data-intro-target
            style={{ top: cardTop }}
            className="absolute inset-x-0 bottom-0 top-[14%] overflow-hidden rounded-[28px] bg-accent"
          >
            <motion.div
              aria-hidden
              style={{ y: discY }}
              className="absolute left-1/2 top-[6%] aspect-square w-[78%] -translate-x-1/2 rounded-full bg-white/12 ring-1 ring-white/20"
            />
            <span
              aria-hidden
              className="absolute bottom-3 right-5 font-display text-[clamp(4rem,9vw,8rem)] leading-none text-white/12"
            >
              HA
            </span>
          </div>

          {/* Clip only the bottom and sides, so the head can rise above the card */}
          <div className="absolute inset-0 [clip-path:inset(-20%_0_0_0_round_0_0_28px_28px)]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: "18%" }}
              animate={ready ? { opacity: 1, y: "0%" } : undefined}
              transition={{ duration: 1.2, delay: 0.55, ease }}
              className="absolute inset-0"
            >
            <motion.div style={{ y: personY, scale: personScale }} className="absolute inset-x-0 top-0 -bottom-[4%] origin-bottom">
              <LiquidPortrait
                progress={morph}
                className="h-full w-full"
                from={{ src: "/images/hafidz-casual-cutout.webp", alt: "Hafidz in a denim jacket" }}
                to={{ src: "/images/hafidz-formal-cutout.webp", alt: "Hafidz in a black suit" }}
              />
            </motion.div>
            </motion.div>
          </div>

          <motion.div style={{ y: tagY }} className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto">
            <LiquidGlass radius={20} className="flex items-center gap-4 bg-ink/30 px-4 py-3 text-white">
              <span className="text-[0.8rem] font-medium tabular-nums">
                <MorphText variants={sides.map((s) => s.tag)} active={side} />
              </span>
              <span className="relative h-1 w-20 overflow-hidden rounded-full bg-white/25 sm:w-24" aria-hidden>
                <motion.span style={{ width: progressWidth }} className="absolute inset-y-0 left-0 rounded-full bg-white" />
              </span>
            </LiquidGlass>
          </motion.div>
        </motion.div>

        {/* Small facts — desktop only, the phone layout stays two cards tall */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className={`${card} hidden flex-col justify-between gap-3 p-6 lg:col-span-3 lg:flex`}
        >
          <p className="text-[0.8rem] text-ink-faint">Based in</p>
          <div>
            <p className="font-display text-2xl">Bandung, ID</p>
            <p className="mt-1 font-mono text-xs text-ink-soft">
              {site.coords} · <LocalTime />
            </p>
          </div>
        </motion.div>
        {/* Follows the portrait: developer while in denim, founder once in the suit */}
        <motion.a
          href={sides[side].now.href}
          target="_blank"
          rel="noreferrer"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.32, ease }}
          className={`${card} group hidden flex-col justify-between gap-3 overflow-hidden p-6 transition-colors hover:bg-surface-2 lg:col-span-4 lg:flex`}
        >
          <p className="flex items-center justify-between text-[0.8rem] text-ink-faint">
            <span className="flex items-center gap-2">
              Currently
              <span className="flex gap-1" aria-hidden>
                {sides.map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ width: side === i ? 18 : 6, opacity: side === i ? 1 : 0.35 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="h-1.5 rounded-full bg-accent"
                  />
                ))}
              </span>
            </span>
            <span className="grid size-7 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 ease-out-expo group-hover:-rotate-45">
              <Arrow />
            </span>
          </p>
          <div>
            <p className="font-display text-2xl">
              <MorphText variants={sides.map((s) => s.now.title)} active={side} />
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              <MorphText variants={sides.map((s) => s.now.note)} active={side} />
            </p>
          </div>
        </motion.a>
      </motion.div>
    </section>
  );
}

/**
 * Where the cobalt card should start so the head always rises a little above
 * it. Mirrors the portrait shader's fit: the figure is contained in 86% of the
 * width and stands on the bottom (canvas is 4% taller than this box).
 */
function useCardTop() {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const IMAGE_RATIO = 1024 / 1536;
    const HAIR_TOP = 117 / 1536; // first opaque row of the cutouts
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const canvasH = h * 1.04;
      const imgH = Math.min(canvasH, (w * 0.86) / IMAGE_RATIO);
      const hair = canvasH - imgH + imgH * HAIR_TOP;
      setTop(Math.max(h * 0.06, hair + imgH * 0.045));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, top] as const;
}

function Actions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Magnetic>
        <Link
          href="/#work"
          className="group inline-flex h-12 items-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-[0.95rem] font-medium text-bg"
        >
          Selected work
          <span className="grid size-9 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 ease-out-expo group-hover:rotate-90">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 2v12M3 9l5 5 5-5" />
            </svg>
          </span>
        </Link>
      </Magnetic>
      <a
        href={site.cv}
        download
        className="inline-flex h-12 items-center rounded-full px-5 text-[0.95rem] font-medium ring-1 ring-line transition-colors hover:bg-surface-2"
      >
        Download CV
      </a>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  );
}

function Letters({ text, delay, play }: { text: string; delay: number; play: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="inline-flex overflow-hidden pb-[0.06em] mb-[-0.06em]">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={reduce ? false : { y: "105%" }}
          animate={play ? { y: "0%" } : undefined}
          transition={{ duration: 1.1, delay: delay + i * 0.04, ease }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
