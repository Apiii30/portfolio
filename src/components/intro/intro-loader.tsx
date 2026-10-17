"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { INTRO_KEY, intro } from "@/lib/intro";
import { projects } from "@/lib/projects";

type Phase = "loading" | "leaving" | "gone";

const MIN_MS = 1600;

const noop = () => () => {};
const readSeen = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
};
const MAX_MS = 4500;

/**
 * First-visit loader. The counter follows real work (fonts, the two hero
 * portraits, the first project covers), then the cobalt screen shrinks into
 * the hero's cobalt portrait card — the loader becomes part of the page.
 * Plays once per session; reduced motion gets a short fade.
 */
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [status, setStatus] = useState("Loading fonts");
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shown = useMotionValue(0);
  const counter = useTransform(shown, (v) => String(Math.round(v)).padStart(3, "0"));
  const bar = useTransform(shown, (v) => `${v}%`);
  const lenis = useLenis();
  // Already played this session: the inline script in <head> hid it before paint.
  const seen = useSyncExternalStore(noop, readSeen, () => false);

  useEffect(() => {
    if (phase !== "gone" && !seen) lenis?.stop();
    else lenis?.start();
  }, [lenis, phase, seen]);

  useEffect(() => {
    if (seen) {
      intro.finish();
      return;
    }

    const html = document.documentElement;
    html.classList.add("intro-lock");
    window.scrollTo(0, 0);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = reduce ? 300 : MIN_MS;

    const steps: [string, Promise<unknown>][] = [
      ["Loading fonts", document.fonts.ready],
      ["Loading portraits", Promise.all([load("/images/hafidz-casual-cutout.webp"), load("/images/hafidz-formal-cutout.webp")])],
      ["Loading projects", Promise.all(projects.map((p) => load(p.cover.src)))],
    ];
    let completed = 0;
    steps.forEach(([, task], i) =>
      task
        .catch(() => {})
        .then(() => {
          completed++;
          setStatus(completed === steps.length ? "Ready" : steps[Math.min(i + 1, steps.length - 1)][0]);
        }),
    );

    const start = performance.now();
    let raf = 0;
    let left = false;
    const tick = () => {
      const elapsed = performance.now() - start;
      const real = elapsed > MAX_MS ? 100 : (completed / steps.length) * 100;
      const pace = Math.min(100, (elapsed / minMs) * 100);
      const target = Math.min(real, pace);
      const next = shown.get() + (target - shown.get()) * 0.12;
      shown.set(target - next < 0.4 ? target : next);
      if (shown.get() >= 100 && !left) {
        left = true;
        leave(reduce);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const leave = async (reduceMotion: boolean) => {
      setPhase("leaving");
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      const root = rootRef.current;
      const content = contentRef.current;
      if (!root) return;

      if (content) await animate(content, { opacity: 0, y: -24 }, { duration: reduceMotion ? 0.15 : 0.35, ease: [0.7, 0, 0.84, 0] });
      intro.finish();

      const target = document.querySelector<HTMLElement>("[data-intro-target]")?.getBoundingClientRect();
      const fits = target && target.width > 0 && target.bottom > 0 && target.top < innerHeight;
      if (reduceMotion) {
        await animate(root, { opacity: 0 }, { duration: 0.3 });
      } else if (fits) {
        const inset = `inset(${target.top}px ${innerWidth - target.right}px ${innerHeight - target.bottom}px ${target.left}px round 28px)`;
        await animate(root, { clipPath: ["inset(0px 0px 0px 0px round 0px)", inset] }, { duration: 1, ease: [0.76, 0, 0.24, 1] });
        await animate(root, { opacity: 0 }, { duration: 0.35 });
      } else {
        // No portrait card on this page: lift the screen away instead.
        await animate(root, { clipPath: ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"] }, { duration: 0.9, ease: [0.76, 0, 0.24, 1] });
      }
      html.classList.remove("intro-lock");
      setPhase("gone");
    };

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("intro-lock");
    };
  }, [shown, seen]);

  if (seen || phase === "gone") return null;

  return (
    <div
      ref={rootRef}
      id="intro-loader"
      role="status"
      aria-live="polite"
      aria-label={status}
      className="fixed inset-0 z-[100] bg-accent-fill text-white"
    >
      <div ref={contentRef} className="flex h-full flex-col justify-between p-5 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium">
            <span className="grid size-8 place-items-center rounded-full bg-white text-[0.75rem] font-semibold text-accent-fill">HA</span>
            Hafidz Asmar Meisanda
          </span>
          <span className="opacity-85">Portfolio — 2026</span>
        </div>

        <div>
          <motion.p key={status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.8, y: 0 }} className="text-sm sm:text-base">
            {status}
          </motion.p>
          <div className="mt-2 flex items-end justify-between gap-6">
            <motion.span className="font-display text-[clamp(6rem,24vw,20rem)] leading-[0.8] tabular-nums">{counter}</motion.span>
            <span className="mb-[0.6em] hidden max-w-[22ch] text-right text-sm opacity-85 sm:block">
              Full-stack developer and founder of Webkeun.id, in Bandung.
            </span>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/20">
            <motion.div style={{ width: bar }} className="h-full rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function load(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}
