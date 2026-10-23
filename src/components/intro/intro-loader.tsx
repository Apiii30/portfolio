"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { LOGO_AXES, LOGO_PIECES, LOGO_VIEWBOX, type LogoPiece } from "@/components/logo";
import { INTRO_KEY, intro } from "@/lib/intro";

type Phase = "loading" | "locked" | "leaving" | "gone";

const MIN_MS = 2200;
const MIN_MS_MOBILE = 1200;
const MAX_MS = 6000;
const MAX_MS_MOBILE = 4500;
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const EASE_IN = [0.7, 0, 0.84, 0] as const;

/** Brand navy from public/logo: the loader's stage, in either theme. */
const NAVY = "#0b1736";

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
 * First-visit loader: the HA mark assembling itself, and nothing else.
 *
 * Loading: the mark's four pieces float apart on a navy stage, each one
 *   tracing its outline as the real loading progress climbs, and drifting
 *   closer the further along it is.
 * Lock: at 100% they snap together, fill with the brand gradient, and a
 *   highlight sweeps across the finished mark.
 * Out: a cobalt circle opens from the mark's centre while the pieces fly back
 *   out the way they came, then the cobalt screen shrinks into the hero's
 *   portrait card as the page settles in behind it.
 *
 * Plays once per tab session (add ?intro to the URL to see it again);
 * reduced motion gets a short fade.
 */
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [status, setStatus] = useState("Loading fonts");
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  /** Loading progress shown, 0–100. */
  const shown = useMotionValue(0);
  /** How assembled the mark is: 0 = scattered, 1 = whole, below 0 = flying back out. */
  const assembly = useMotionValue(0);
  /** Fills replacing outlines, 0–1. */
  const fill = useMotionValue(0);
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
    if (reduce) {
      html.classList.remove("intro-hold");
      assembly.set(1);
      fill.set(1);
    } else html.classList.add("intro-hold");

    let total = 0;
    let completed = 0;
    const track = (task: Promise<unknown>) => {
      total++;
      task
        .catch(() => {})
        .then(() => {
          completed++;
          setStatus(completed === total ? "Ready" : `Loading assets ${completed} of ${total}`);
        });
    };
    track(document.fonts.ready);
    // The hero shader reads these by URL, not through an <img>.
    track(load("/images/hafidz-casual-cutout.webp"));
    track(load("/images/hafidz-formal-cutout.webp"));

    // Every image the page shows, fetched while the loader plays. Each <img>
    // is copied (same srcset and sizes) rather than fetched by URL, so the
    // browser picks the size it will show and the real lazy image later loads
    // from cache. The page's own <img>s are never touched: React hydrates some
    // sections after this runs, and a changed attribute is a hydration error.
    // Watched rather than listed once, for sections that render their <img>s
    // after hydration (desktop vs phone layouts).
    const tracked = new WeakSet<HTMLImageElement>();
    const scan = () => {
      main?.querySelectorAll("img").forEach((img) => {
        if (tracked.has(img)) return;
        tracked.add(img);
        track(prefetch(img));
      });
    };
    scan();
    const watcher = new MutationObserver(scan);
    if (main) watcher.observe(main, { childList: true, subtree: true });

    const start = performance.now();
    const maxMs = small ? MAX_MS_MOBILE : MAX_MS;
    let raf = 0;
    let done = false;
    const tick = () => {
      const elapsed = performance.now() - start;
      // Past the cap the page opens anyway; whatever's left keeps loading behind it.
      const real = elapsed > maxMs ? 100 : (completed / total) * 100;
      const pace = Math.min(100, (elapsed / minMs) * 100);
      const target = Math.min(real, pace);
      const next = shown.get() + (target - shown.get()) * 0.1;
      shown.set(target - next < 0.4 ? target : next);
      // The pieces close most of the gap while loading; the lock does the rest.
      if (!reduce) assembly.set((shown.get() / 100) * 0.72);
      if (shown.get() >= 100 && !done) {
        done = true;
        watcher.disconnect();
        if (reduce) leaveReduced();
        else lock().then(leave);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const markSeen = () => {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
    };

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

    const leaveReduced = async () => {
      setPhase("leaving");
      markSeen();
      intro.finish();
      if (rootRef.current) await animate(rootRef.current, { opacity: 0 }, { duration: 0.3, delay: 0.3 });
      html.classList.remove("intro-lock");
      setPhase("gone");
    };

    // The pieces snap home, the outlines give way to the gradient, the sheen runs.
    const lock = async () => {
      setPhase("locked");
      await Promise.all([
        animate(assembly, 1, { type: "spring", stiffness: 260, damping: 20, mass: 0.9 }),
        animate(fill, 1, { duration: 0.6, ease: [0.33, 1, 0.68, 1] }),
      ]);
      await wait(small ? 260 : 480);
    };

    const leave = async () => {
      setPhase("leaving");
      markSeen();
      const root = rootRef.current;
      const flood = floodRef.current;
      if (!root || !flood) return;

      // 1. Cobalt opens from the mark while its pieces fly back out.
      const m = markRef.current?.getBoundingClientRect();
      const cx = m ? m.left + m.width / 2 : innerWidth / 2;
      const cy = m ? m.top + m.height / 2 : innerHeight / 2;
      const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      animate(assembly, -2.4, { duration: 0.75, ease: EASE_IN });
      if (markRef.current) animate(markRef.current, { opacity: 0, filter: "blur(6px)" }, { duration: 0.45, delay: 0.3, ease: EASE_IN });
      await animate(
        flood,
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${reach}px at ${cx}px ${cy}px)`] },
        { duration: 0.8, delay: 0.12, ease: EASE_IN_OUT },
      );

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
      html.classList.remove("intro-lock");
      setPhase("gone");
    };

    return () => {
      cancelAnimationFrame(raf);
      watcher.disconnect();
      html.classList.remove("intro-lock", "intro-hold");
    };
  }, [shown, assembly, fill, seen]);

  if (seen || phase === "gone") return null;

  return (
    <div
      ref={rootRef}
      id="intro-loader"
      role="status"
      aria-live="polite"
      aria-label={status}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: NAVY }}
    >
      <Streaks />
      <Glow progress={shown} locked={phase !== "loading"} />

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-[min(58vw,40svh,340px)]">
          <div ref={markRef}>
            <Mark progress={shown} assembly={assembly} fill={fill} sweep={phase !== "loading"} />
          </div>
          {/* Hangs below the mark so the mark itself stays dead centre */}
          <div className="absolute inset-x-0 top-full mt-[clamp(2.75rem,8svh,4.5rem)]">
            <Progress value={shown} done={phase !== "loading"} />
          </div>
        </div>
      </div>

      {/* Opens on exit, then shrinks into the hero card */}
      <div ref={floodRef} className="absolute inset-0 bg-accent-fill" style={{ clipPath: "circle(0px at 50% 50%)" }} />
    </div>
  );
}

/* ─────────────────────────── The mark ─────────────────────────── */

/**
 * Where each piece waits while loading, in viewBox units: pushed out along
 * its own slash, so assembling reads as the letterforms sliding into place.
 */
const SCATTER: Record<LogoPiece, { x: number; y: number; rotate: number; order: number }> = {
  stem: { x: -150, y: 30, rotate: -8, order: 0 },
  ribbon: { x: 120, y: -140, rotate: 6, order: 1 },
  wedge: { x: -130, y: 150, rotate: -10, order: 2 },
  leg: { x: 150, y: 120, rotate: 9, order: 3 },
};

/** Light-on-navy palette, the "gradient for dark" logo. */
const STOPS = {
  ribbon: ["#f4f7ff", "#4e96ff", "#b2d2ff"],
  leg: ["#ebf2ff", "#a8caff", "#3670ff"],
} as const;
const SOLID = "#f4f7ff";
const OUTLINE = "#8fb4ff";

function Mark({
  progress,
  assembly,
  fill,
  sweep,
}: {
  progress: MotionValue<number>;
  assembly: MotionValue<number>;
  fill: MotionValue<number>;
  sweep: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const pieces = Object.keys(LOGO_PIECES) as LogoPiece[];

  return (
    <motion.svg
      viewBox={LOGO_VIEWBOX}
      className="w-full overflow-visible"
      aria-hidden
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <defs>
        {(["ribbon", "leg"] as const).map((g) => (
          <linearGradient key={g} id={`${id}-${g}`} gradientUnits="userSpaceOnUse" {...LOGO_AXES[g]}>
            <stop offset="0" stopColor={STOPS[g][0]} />
            <stop offset="0.45" stopColor={STOPS[g][1]} />
            <stop offset="1" stopColor={STOPS[g][2]} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          {pieces.map((p) => (
            <path key={p} d={LOGO_PIECES[p]} />
          ))}
        </clipPath>
      </defs>

      {pieces.map((p) => (
        <Piece
          key={p}
          piece={p}
          progress={progress}
          assembly={assembly}
          fill={fill}
          paint={p === "ribbon" || p === "leg" ? `url(#${id}-${p})` : SOLID}
        />
      ))}

      {/* A highlight that runs across the finished mark, slanted like its slashes */}
      <g clipPath={`url(#${id}-clip)`}>
        {/* skew on a wrapper: motion's x would replace a transform attribute on the rect */}
        <g transform="skewX(-40)">
          <motion.rect
            y="200"
            width="240"
            height="640"
            fill={`url(#${id}-sheen)`}
            initial={{ x: -120 }}
            animate={sweep ? { x: 1700 } : undefined}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.45, 0, 0.2, 1] }}
          />
        </g>
      </g>
    </motion.svg>
  );
}

function Piece({
  piece,
  progress,
  assembly,
  fill,
  paint,
}: {
  piece: LogoPiece;
  progress: MotionValue<number>;
  assembly: MotionValue<number>;
  fill: MotionValue<number>;
  paint: string;
}) {
  const s = SCATTER[piece];
  const x = useTransform(assembly, (a) => (1 - a) * s.x);
  const y = useTransform(assembly, (a) => (1 - a) * s.y);
  const rotate = useTransform(assembly, (a) => (1 - a) * s.rotate);
  // Outlines trace one after another as loading climbs.
  const draw = useTransform(progress, (v) => clamp((v / 100 - s.order * 0.1) / 0.7));
  // Fills land in the same order, overlapping.
  const solid = useTransform(fill, (f) => clamp(f * 1.6 - s.order * 0.2));
  const outline = useTransform(solid, (o) => 1 - o);

  return (
    <motion.g style={{ x, y, rotate }}>
      <motion.path d={LOGO_PIECES[piece]} fill={paint} style={{ opacity: solid }} />
      <motion.path
        d={LOGO_PIECES[piece]}
        fill="none"
        stroke={OUTLINE}
        strokeWidth={5}
        strokeLinejoin="round"
        style={{ pathLength: draw, opacity: outline }}
      />
    </motion.g>
  );
}

/* ─────────────────────────── Progress ─────────────────────────── */

/**
 * A hairline bar with a glowing head, and the percentage riding along on top
 * of the head as a rolling counter. Once loading is done it holds on 100 for
 * a beat, then steps aside so the mark finishes alone.
 */
function Progress({ value, done }: { value: MotionValue<number>; done: boolean }) {
  const scaleX = useTransform(value, (v) => v / 100);
  const head = useTransform(value, (v) => `${v}%`);
  // Left-aligned at 0, right-aligned at 100: the label never hangs off the bar.
  const shift = useTransform(value, (v) => `${-v}%`);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      animate={done ? { opacity: 0, y: 10, filter: "blur(4px)" } : { opacity: 1, y: 0 }}
      transition={done ? { duration: 0.4, delay: 0.45, ease: EASE_IN } : { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <motion.div style={{ left: head, x: shift }} className="absolute bottom-full mb-3 flex items-start text-[#dce8ff]">
        <Odometer value={value} />
        <span className="ml-0.5 mt-[0.1em] font-mono text-[0.7rem] leading-none text-[#8fb4ff]">%</span>
      </motion.div>

      <div className="relative h-0.5 rounded-full bg-white/12">
        <motion.div
          style={{ scaleX, background: "linear-gradient(90deg, rgb(143 180 255 / 0.15), #8fb4ff 60%, #ffffff)" }}
          className="absolute inset-0 origin-left rounded-full"
        />
        <motion.span
          style={{ left: head }}
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgb(111_160_255/0.9),0_0_28px_6px_rgb(31_91_255/0.6)]"
        />
      </div>

      {/* quarter ticks, like a gauge */}
      <div className="mt-2 flex justify-between px-px">
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} className="h-1 w-px bg-white/20" />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * 000 → 100 like a mechanical counter: the ones wheel turns continuously,
 * and each wheel to its left only turns while the one beside it passes 9 → 0.
 */
function Odometer({ value }: { value: MotionValue<number> }) {
  const carry = (v: number, unit: number) => Math.floor(v / unit) + Math.max(0, (v % unit) - (unit - 1));
  const ones = useTransform(value, (v) => v);
  const tens = useTransform(value, (v) => carry(v, 10));
  const hundreds = useTransform(value, (v) => carry(v, 100));
  return (
    <span className="flex font-mono text-[clamp(1.1rem,2.6vw,1.4rem)] font-medium leading-none tabular-nums">
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
    <span className="relative inline-block h-[1em] overflow-hidden [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)]">
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

/* ─────────────────────────── Atmosphere ─────────────────────────── */

/** A soft blue light behind the mark that grows with progress and pulses on lock. */
function Glow({ progress, locked }: { progress: MotionValue<number>; locked: boolean }) {
  const opacity = useTransform(progress, [0, 100], [0.25, 0.7]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div
        style={{ opacity, background: "radial-gradient(circle closest-side, rgb(31 91 255 / 0.9) 0%, rgb(31 91 255 / 0.35) 45%, transparent 100%)" }}
        animate={locked ? { scale: [1, 1.35, 1.15] } : { scale: [1, 1.08, 1] }}
        transition={locked ? { duration: 1.1, ease: [0.16, 1, 0.3, 1] } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="aspect-square w-[min(120vw,110svh)] rounded-full"
      />
    </div>
  );
}

/** Thin light streaks running along the mark's slash angle. */
const STREAKS = [
  { top: "18%", delay: 0.2, duration: 2.6 },
  { top: "46%", delay: 0.9, duration: 3.2 },
  { top: "71%", delay: 0.5, duration: 2.9 },
];

function Streaks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
      <div className="absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 rotate-[-49deg]">
        {STREAKS.map((s) => (
          <motion.span
            key={s.top}
            className="absolute left-0 h-px w-[30%]"
            style={{ top: s.top, background: "linear-gradient(90deg, transparent, rgb(143 180 255 / 0.55), transparent)" }}
            initial={{ x: "-100%" }}
            animate={{ x: "440%" }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: 0.4, ease: [0.45, 0, 0.55, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Downloads and decodes what a page <img> will show, through a detached copy
 * with the same srcset and sizes. Resolves on load or failure.
 */
function prefetch(img: HTMLImageElement) {
  const copy = new Image();
  copy.decoding = "async";
  // sizes and srcset before src, so the first request is already the right candidate.
  if (img.sizes) copy.sizes = img.sizes;
  if (img.srcset) copy.srcset = img.srcset;
  copy.src = img.src;
  return copy.decode().catch(() => {});
}

function load(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}
