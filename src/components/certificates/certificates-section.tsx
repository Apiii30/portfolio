"use client";

import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { Reveal, SplitHeading } from "@/components/reveal";
import { certificates, type Certificate } from "@/lib/content";
import { useMedia } from "@/lib/use-media";

const list: Certificate[] = [certificates.oygInternship, certificates.dicodingPython];

/**
 * Certificates shown big, as stacked cards: each one pins, and the one
 * underneath shrinks back as the next slides over it.
 */
export function CertificatesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Phones: cards are taller than the screen, so they flow normally instead of stacking.
  const stack = useMedia("(min-width: 1024px)");

  return (
    <section id="certificates" aria-labelledby="certificates-title" className="pt-24 sm:pt-32">
      <div className="mx-auto grid max-w-310 gap-6 px-4 sm:px-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[0.85rem] font-medium text-ink-faint">
              <span className="mr-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold tabular-nums text-on-accent">04</span>
              Certificates
            </p>
          </Reveal>
          <SplitHeading
            id="certificates-title"
            text="On paper, too."
            className="mt-4 font-display text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.95]"
          />
        </div>
        <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
          <p className="max-w-[40ch] leading-snug text-ink-soft">
            One from the internship, one from the course I&rsquo;m taking now. Both open as the original PDF, and the Dicoding one can be
            verified online.
          </p>
        </Reveal>
      </div>

      <div ref={ref} className="relative mt-8" style={stack ? { height: `${list.length * 100}svh` } : undefined}>
        {list.map((c, i) => (
          <StackedCard key={c.title} cert={c} index={i} count={list.length} progress={scrollYProgress} stack={stack} />
        ))}
      </div>
    </section>
  );
}

function StackedCard({
  cert,
  index,
  count,
  progress,
  stack,
}: {
  cert: Certificate;
  index: number;
  count: number;
  progress: MotionValue<number>;
  stack: boolean;
}) {
  const reduce = useReducedMotion() || !stack;
  const ref = useRef<HTMLDivElement>(null);
  // Entrance: tilt back and rise as the card comes up from below.
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const rotateX = useTransform(enter, [0, 1], reduce ? [0, 0] : [18, 0]);
  const y = useTransform(enter, [0, 1], reduce ? [0, 0] : [120, 0]);
  // Stack: shrink and dim once the next card starts covering this one.
  const start = index / count;
  const scale = useTransform(progress, [start, 1], reduce ? [1, 1] : [1, 1 - (count - 1 - index) * 0.07]);
  const dim = useTransform(progress, [start, 1], [0, stack ? (count - 1 - index) * 0.25 : 0]);

  return (
    <div
      ref={ref}
      className={stack ? "sticky top-0 flex h-svh items-center px-6" : "px-3 pb-4 sm:px-6"}
      style={stack ? { perspective: 1400, paddingTop: `calc(5.5rem + ${index * 1.25}rem)` } : undefined}
    >
      <motion.article
        style={{ scale, rotateX, y, transformOrigin: "50% 0%" }}
        className="relative mx-auto grid w-full max-w-310 overflow-hidden rounded-[32px] bg-surface ring-1 ring-line shadow-[0_40px_80px_-40px_rgb(10_20_60/0.35)] lg:grid-cols-12"
      >
        <TiltImage cert={cert} />

        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:col-span-5 lg:p-10">
          <div>
            <p className="flex items-center gap-2 text-[0.8rem] font-medium text-ink-faint">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{cert.kind}</span>
              {cert.issuer}
            </p>
            <h3 className="mt-5 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.02]">{cert.title}</h3>
            <p className="mt-4 leading-relaxed text-ink-soft">{cert.blurb}</p>
          </div>

          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-5">
              {cert.facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-[0.75rem] text-ink-faint">{f.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={cert.file}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                Open PDF ↗
              </a>
              {cert.verifyUrl && (
                <a
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium ring-1 ring-line transition-colors hover:bg-surface-2"
                >
                  Verify on Dicoding ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />
      </motion.article>
    </div>
  );
}

/** The certificate itself, tilting toward the cursor with a moving glare. */
function TiltImage({ cert }: { cert: Certificate }) {
  const reduce = useReducedMotion();
  const spring = { stiffness: 200, damping: 20, mass: 0.6 };
  const rx = useSpring(0, spring);
  const ry = useSpring(0, spring);
  const gx = useSpring(50, spring);
  const gy = useSpring(50, spring);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.45), transparent 55%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 14);
    rx.set((0.5 - py) * 10);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative grid place-items-center bg-surface-2 p-5 sm:p-8 lg:col-span-7 lg:p-12"
      style={{ perspective: 1000 }}
    >
      <motion.a
        href={cert.file}
        target="_blank"
        rel="noreferrer"
        style={{ rotateX: rx, rotateY: ry }}
        className="relative block w-full overflow-hidden rounded-[14px] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.45)]"
      >
        <Image
          src={cert.image}
          alt={`${cert.title}, ${cert.issuer}`}
          width={1600}
          height={1131}
          sizes="(min-width: 1024px) 55vw, 92vw"
          className="h-auto w-full"
        />
        <motion.span aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
      </motion.a>
    </div>
  );
}
