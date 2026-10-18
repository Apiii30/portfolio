"use client";

import { animate, motion, stagger, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { INTRO_KEY, intro } from "@/lib/intro";
import { projects } from "@/lib/projects";

type Phase = "loading" | "leaving" | "gone";

const MIN_MS = 2600;
const MIN_MS_MOBILE = 1300;
const MAX_MS = 4500;
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const noop = () => () => {};
/**
 * Played already this tab session, unless the URL asks for it again with ?intro.
 * Read once per page load: the loader marks itself as seen when it starts to
 * leave, and re-reading then would unmount it mid-exit.
 */
let seenAtLoad: boolean | undefined;
const readSeen = () => {
  if (seenAtLoad !== undefined) return seenAtLoad;
  try {
    seenAtLoad = !new URLSearchParams(location.search).has("intro") && sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    seenAtLoad = false;
  }
  return seenAtLoad;
};

/**
 * First-visit loader, as a short motion-graphic piece.
 *
 * In: blueprint lines draw across the screen, a liquid blob takes shape in the
 *     centre with the HA monogram, three orbit rings spin up (the middle one
 *     fills with the real loading progress), and stack chips drift in around it.
 * Out: the chips get pulled into the blob, the rings spin away, the blob pops
 *      with a shockwave, the text rolls up, and the cobalt screen shrinks into
 *      the hero's portrait card while the page settles in behind it.
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
    // Phones get a shorter hold: the content matters more than the show on a slow connection.
    const small = matchMedia("(max-width: 767px)").matches;
    const minMs = reduce ? 300 : small ? MIN_MS_MOBILE : MIN_MS;

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
        setTimeout(() => leave(reduce), reduce ? 0 : small ? 120 : 250);
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
        // 1. The graphic folds in on itself while the text rolls away.
        const stage = root.querySelector<HTMLElement>("[data-stage]");
        const c = stage?.getBoundingClientRect();
        const cx = c ? c.left + c.width / 2 : innerWidth / 2;
        const cy = c ? c.top + c.height / 2 : innerHeight / 2;
        const pulls = [...root.querySelectorAll<HTMLElement>("[data-pill]")].map((el, i) => {
          const r = el.getBoundingClientRect();
          return animate(
            el,
            { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2), scale: 0.2, opacity: 0 },
            { duration: 0.6, delay: i * 0.05, ease: [0.7, 0, 0.84, 0] },
          );
        });
        const q = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
        await Promise.all([
          ...pulls,
          animate(q("[data-rings]"), { rotate: 200, scale: 0.35, opacity: 0 }, { duration: 0.75, ease: [0.7, 0, 0.84, 0] }),
          animate(q("[data-lines]"), { opacity: 0 }, { duration: 0.5 }),
          content ? animate(content.querySelectorAll("[data-out]"), { y: "-110%", opacity: 0 }, { duration: 0.55, delay: stagger(0.05), ease: [0.7, 0, 0.84, 0] }) : null,
        ]);
        // The pop and the shrink overlap, so there's never a blank cobalt beat.
        animate(q("[data-blob]"), { scale: [1, 1.18, 0] }, { duration: 0.55, times: [0, 0.35, 1], ease: EASE_IN_OUT });
        animate(q("[data-burst]"), { scale: [0.3, 3.2], opacity: [0.9, 0] }, { duration: 0.75, delay: 0.25, ease: EASE_OUT });
        await new Promise((r) => setTimeout(r, 420));

        intro.finish();
        settlePage();

        // 2. The cobalt screen becomes the hero's portrait card.
        const target = document.querySelector<HTMLElement>("[data-intro-target]")?.getBoundingClientRect();
        const fits = target && target.width > 0 && target.bottom > 0 && target.top < innerHeight;
        if (fits) {
          const inset = `inset(${target.top}px ${innerWidth - target.right}px ${innerHeight - target.bottom}px ${target.left}px round 28px)`;
          await animate(root, { clipPath: ["inset(0px 0px 0px 0px round 0px)", inset] }, { duration: 1, ease: [0.65, 0, 0.25, 1] });
          await animate(root, { opacity: 0 }, { duration: 0.35 });
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
      <BlueprintLines />

      <div ref={contentRef} className="relative flex h-full flex-col p-5 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between overflow-hidden text-sm">
          <Rise data-out delay={0.05} className="flex items-center gap-2 font-medium">
            <span className="grid size-8 place-items-center rounded-full bg-white text-[0.75rem] font-semibold text-accent-fill">HA</span>
            Hafidz Asmar Meisanda
          </Rise>
          <Rise data-out delay={0.12} className="opacity-85">
            Portfolio — 2026
          </Rise>
        </div>

        <div className="grid min-h-0 flex-1 place-items-center py-4">
          <Stage progress={shown} />
        </div>

        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="overflow-hidden">
              <div data-out className="flex items-baseline gap-[0.3em] font-display text-[clamp(1.6rem,4vw,3rem)] leading-none">
                <span className="text-white/65">I</span>
                <WordCycle words={["design.", "build.", "ship."]} />
              </div>
            </div>
            <div className="mt-2 overflow-hidden">
              <motion.p
                data-out
                key={status}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 0.85 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="text-sm"
              >
                {status}
              </motion.p>
            </div>
          </div>
          <div className="overflow-hidden">
            <div data-out className="flex items-start">
              <Odometer value={shown} />
              <span className="mt-[0.4em] font-display text-[clamp(1rem,2.4vw,1.75rem)] leading-none">%</span>
            </div>
          </div>
        </div>

        <div className="mt-5 h-0.5 overflow-hidden rounded-full bg-white/20" data-out>
          <motion.div style={{ width: bar }} className="h-full rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Motion graphic ─────────────────────────── */

const CHIPS = [
  { label: "React", x: "4%", y: "16%", d: 0.55 },
  { label: "Next.js", x: "74%", y: "8%", d: 0.65 },
  { label: "Express", x: "82%", y: "66%", d: 0.75 },
  { label: "PostgreSQL", x: "-2%", y: "74%", d: 0.85 },
];

/** Blob + monogram in the middle, orbit rings around it, stack chips floating outside. */
function Stage({ progress }: { progress: MotionValue<number> }) {
  const p = useTransform(progress, (v) => v / 100);
  // A dot riding the head of the progress ring.
  const angle = useTransform(p, (t) => (t * 360 - 90) * (Math.PI / 180));
  const dotX = useTransform(angle, (a) => 50 + 40 * Math.cos(a));
  const dotY = useTransform(angle, (a) => 50 + 40 * Math.sin(a));

  return (
    <div data-stage className="relative aspect-square w-[min(78vw,52svh,480px)]">
      {/* shockwave used on exit */}
      <div data-burst className="pointer-events-none absolute inset-[30%] rounded-full border-2 border-white opacity-0" />

      {/* orbit rings — each spinning ring is its own HTML layer, so it rotates about its centre */}
      <div data-rings className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}
        >
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full overflow-visible"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="0.35" strokeDasharray="0.6 2.4" />
          </motion.svg>

          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth="0.8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ pathLength: p }}
            />
            <motion.circle cx={dotX} cy={dotY} r="1.6" fill="white" />
          </svg>

          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full overflow-visible"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="33" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.35" strokeDasharray="150 57" />
          </motion.svg>
        </motion.div>
      </div>

      {/* liquid blob with the monogram */}
      <div data-blob className="absolute inset-[27%]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.35 }}
          className="relative size-full"
        >
          <motion.div
            aria-hidden
            animate={{
              borderRadius: [
                "42% 58% 70% 30% / 45% 45% 55% 55%",
                "70% 30% 46% 54% / 30% 29% 71% 70%",
                "50% 50% 34% 66% / 56% 68% 32% 44%",
                "42% 58% 70% 30% / 45% 45% 55% 55%",
              ],
              rotate: [0, 120, 240, 360],
              scale: [1, 1.04, 0.97, 1],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#dfe6ff_45%,#b7c6ff_100%)] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45),inset_0_-12px_30px_rgb(49_80_240/0.25)]"
          />
          <div className="absolute inset-0 grid place-items-center overflow-hidden">
            <span className="flex font-display text-[clamp(2.5rem,9vmin,5.5rem)] leading-none text-accent-fill">
              {["H", "A"].map((ch, i) => (
                <motion.span
                  key={ch}
                  initial={{ y: "110%", rotate: 12, opacity: 0 }}
                  animate={{ y: "0%", rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.7 + i * 0.08, ease: EASE_OUT }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </div>
        </motion.div>
      </div>

      {/* stack chips orbiting outside the rings */}
      {CHIPS.map((c, i) => (
        <div key={c.label} data-pill className="absolute" style={{ left: c.x, top: c.y }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: c.d },
              scale: { type: "spring", stiffness: 200, damping: 15, delay: c.d },
              y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: c.d },
            }}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/12 px-3 py-1.5 text-[0.75rem] font-medium ring-1 ring-white/25 backdrop-blur-sm sm:text-sm"
          >
            <span className="size-1.5 rounded-full bg-white" />
            {c.label}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

/** Thin grid lines that draw across the screen, like a layout being set up. */
function BlueprintLines() {
  const v = [16.66, 50, 83.33];
  const h = [22, 78];
  return (
    <div data-lines aria-hidden className="pointer-events-none absolute inset-0">
      {v.map((x, i) => (
        <motion.span
          key={`v${x}`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.1, delay: 0.05 * i, ease: EASE_IN_OUT }}
          className="absolute inset-y-0 w-px origin-top bg-white/10"
          style={{ left: `${x}%` }}
        />
      ))}
      {h.map((y, i) => (
        <motion.span
          key={`h${y}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.15 + 0.05 * i, ease: EASE_IN_OUT }}
          className="absolute inset-x-0 h-px origin-left bg-white/10"
          style={{ top: `${y}%` }}
        />
      ))}
    </div>
  );
}

/** Words that roll vertically, holding on each one. */
function WordCycle({ words }: { words: string[] }) {
  const list = [...words, words[0]];
  const n = words.length;
  const y: string[] = [];
  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    y.push(`${(-i * 100) / list.length}%`, `${(-i * 100) / list.length}%`);
    times.push(i / n, i / n + 0.75 / n);
  }
  y.push(`${(-n * 100) / list.length}%`);
  times.push(1);
  return (
    <span className="relative inline-block h-[1.05em] overflow-hidden align-bottom">
      <motion.span
        animate={{ y }}
        transition={{ duration: n * 0.9, times, repeat: Infinity, ease: EASE_IN_OUT }}
        className="flex flex-col"
      >
        {list.map((w, i) => (
          <span key={i} className="block h-[1.05em] leading-[1.05]">
            {w}
          </span>
        ))}
      </motion.span>
    </span>
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
    <span aria-hidden className="flex font-display text-[clamp(3.5rem,11vw,8rem)] leading-none tabular-nums">
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
