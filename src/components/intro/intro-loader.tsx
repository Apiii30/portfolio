"use client";

import { animate, motion, stagger, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { INTRO_KEY, intro } from "@/lib/intro";
import { projects } from "@/lib/projects";

type Phase = "loading" | "leaving" | "gone";

const MIN_MS = 1800;
const MAX_MS = 4500;
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const noop = () => () => {};
/** Played already this tab session, unless the URL asks for it again with ?intro. */
const readSeen = () => {
  try {
    if (new URLSearchParams(location.search).has("intro")) return false;
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * First-visit loader.
 *
 * In: the header and tagline slide up into place while an odometer counts
 *     with the real loading work (fonts, portraits, project covers).
 * Out: digits and text roll up and away, the cobalt screen shrinks into the
 *      hero's cobalt portrait card, and the page behind settles from a soft,
 *      slightly zoomed-out state as the nav drops in.
 *
 * Plays once per tab session (add ?intro to the URL to see it again);
 * reduced motion gets a short fade.
 */
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [status, setStatus] = useState("Loading fonts");
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shown = useMotionValue(0);
  const bar = useTransform(shown, (v) => `${v}%`);
  const lenis = useLenis();
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
    html.classList.remove("intro-seen");
    html.classList.add("intro-lock");
    window.scrollTo(0, 0);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = reduce ? 300 : MIN_MS;

    // The page waits behind the loader via the `intro-hold` class, set by the
    // head script before first paint (never inline styles: React owns <main>).
    const main = document.querySelector<HTMLElement>("main");
    const header = document.querySelector<HTMLElement>("header");
    if (reduce) html.classList.remove("intro-hold");
    else html.classList.add("intro-hold");

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
      const next = shown.get() + (target - shown.get()) * 0.1;
      shown.set(target - next < 0.4 ? target : next);
      if (shown.get() >= 100 && !left) {
        left = true;
        // A beat on "100" before leaving.
        setTimeout(() => leave(reduce), reduce ? 0 : 250);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Native Web Animations: once finished they leave no inline styles behind
    // (a lingering transform/filter on <main> would break fixed/sticky children).
    const settlePage = () => {
      const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
      // Drop the held state and animate from it in the same frame: no jump.
      html.classList.remove("intro-hold");
      if (main) {
        main.animate(
          [
            { transform: "scale(0.94)", filter: "blur(10px)", opacity: 0.4, transformOrigin: "50% 30vh" },
            { transform: "scale(1)", filter: "blur(0px)", opacity: 1, transformOrigin: "50% 30vh" },
          ],
          { duration: 1200, easing: ease },
        );
      }
      if (header) {
        header.animate(
          [
            { transform: "translateY(-120%)", opacity: 0 },
            { transform: "translateY(0%)", opacity: 1 },
          ],
          { duration: 900, delay: 450, easing: ease, fill: "backwards" },
        );
      }
    };

    const leave = async (reduceMotion: boolean) => {
      setPhase("leaving");
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      const root = rootRef.current;
      const content = contentRef.current;
      if (!root) return;

      if (reduceMotion) {
        html.classList.remove("intro-hold");
        intro.finish();
        await animate(root, { opacity: 0 }, { duration: 0.3 });
      } else {
        // 1. Everything inside rolls up and out, one piece after another.
        if (content) {
          await animate(
            content.querySelectorAll("[data-out]"),
            { y: "-110%", opacity: 0 },
            { duration: 0.55, delay: stagger(0.05), ease: [0.7, 0, 0.84, 0] },
          );
        }
        intro.finish();
        settlePage();

        // 2. The cobalt screen becomes the hero's portrait card.
        const target = document.querySelector<HTMLElement>("[data-intro-target]")?.getBoundingClientRect();
        const fits = target && target.width > 0 && target.bottom > 0 && target.top < innerHeight;
        if (fits) {
          const inset = `inset(${target.top}px ${innerWidth - target.right}px ${innerHeight - target.bottom}px ${target.left}px round 28px)`;
          await animate(root, { clipPath: ["inset(0px 0px 0px 0px round 0px)", inset] }, { duration: 1.1, ease: EASE_IN_OUT });
          await animate(root, { opacity: 0 }, { duration: 0.4 });
        } else {
          await animate(root, { clipPath: ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 100% 0% round 0px)"] }, { duration: 0.9, ease: EASE_IN_OUT });
        }
      }
      html.classList.remove("intro-lock");
      setPhase("gone");
    };

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("intro-lock", "intro-hold");
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
      className="fixed inset-0 z-[100] overflow-hidden bg-accent-fill text-white"
    >
      {/* soft light drifting across the screen while loading */}
      <motion.div
        aria-hidden
        initial={{ x: "-30%", opacity: 0 }}
        animate={{ x: "30%", opacity: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-1/3 left-1/4 size-[80vmax] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.16),transparent_60%)]"
      />

      <div ref={contentRef} className="relative flex h-full flex-col justify-between p-5 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between overflow-hidden text-sm">
          <Rise data-out delay={0.05} className="flex items-center gap-2 font-medium">
            <span className="grid size-8 place-items-center rounded-full bg-white text-[0.75rem] font-semibold text-accent-fill">HA</span>
            Hafidz Asmar Meisanda
          </Rise>
          <Rise data-out delay={0.12} className="opacity-85">
            Portfolio — 2026
          </Rise>
        </div>

        <div>
          <div className="overflow-hidden">
            <Rise data-out delay={0.2} className="block max-w-[26ch] font-display text-[clamp(1.5rem,3.4vw,2.75rem)] leading-tight">
              Full-stack developer, building for the web from Bandung.
            </Rise>
          </div>

          <div className="mt-6 flex items-end justify-between gap-6">
            <div className="overflow-hidden">
              <div data-out>
                <Odometer value={shown} />
              </div>
            </div>
            <div className="mb-[0.5em] overflow-hidden">
              <motion.p
                data-out
                key={status}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 0.9 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="text-right text-sm sm:text-base"
              >
                {status}
              </motion.p>
            </div>
          </div>

          <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/20" data-out>
            <motion.div style={{ width: bar }} className="h-full rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Text that slides up from behind its line as the loader opens. */
function Rise({
  children,
  delay = 0,
  className = "",
  ...rest
}: { children: React.ReactNode; delay?: number; className?: string } & Record<`data-${string}`, unknown>) {
  return (
    <motion.span
      {...rest}
      initial={{ y: "110%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}

/**
 * 000 → 100 like a mechanical counter: the ones wheel turns continuously,
 * and each wheel to its left only turns while the one beside it passes 9 → 0.
 */
function Odometer({ value }: { value: MotionValue<number> }) {
  // Continuous count of how far each wheel has turned.
  const carry = (v: number, unit: number) => Math.floor(v / unit) + Math.max(0, (v % unit) - (unit - 1));
  const ones = useTransform(value, (v) => v);
  const tens = useTransform(value, (v) => carry(v, 10));
  const hundreds = useTransform(value, (v) => carry(v, 100));
  return (
    <span aria-hidden className="flex font-display text-[clamp(6rem,22vw,18rem)] leading-none tabular-nums">
      <Wheel turns={hundreds} />
      <Wheel turns={tens} />
      <Wheel turns={ones} />
    </span>
  );
}

/** Digits 0–9 plus a trailing 0, so 9 → 0 keeps rolling forward instead of spinning back. */
const WHEEL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

function Wheel({ turns }: { turns: MotionValue<number> }) {
  const y = useTransform(turns, (t) => `${(-(t % 10) * 100) / WHEEL.length}%`);
  return (
    <span className="relative inline-block h-[1em] overflow-hidden [mask-image:linear-gradient(transparent,#000_14%,#000_86%,transparent)]">
      <motion.span style={{ y }} className="flex flex-col">
        {WHEEL.map((n, i) => (
          <span key={i} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function load(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}
