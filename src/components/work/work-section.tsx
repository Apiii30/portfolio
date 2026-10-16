"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { Reveal, SplitHeading } from "@/components/reveal";
import { WorkCard } from "@/components/work/work-card";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { useMedia } from "@/lib/use-media";

export function WorkSection() {
  const wide = useMedia("(min-width: 1024px)");

  return (
    <section id="work" aria-labelledby="work-title" className="relative pt-24 sm:pt-32">
      <div className="mx-auto grid max-w-310 gap-6 px-4 sm:px-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="text-[0.85rem] font-medium text-ink-faint">
              <span className="mr-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold tabular-nums text-on-accent">01</span>Selected work
            </p>
          </Reveal>
          <SplitHeading
            id="work-title"
            text="Built end to end, and in use."
            className="mt-4 text-balance font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.045em]"
          />
        </div>
        <Reveal delay={0.15} className="lg:col-span-4 lg:pb-3">
          <p className="max-w-[38ch] text-lg leading-snug text-ink-soft">
            Two are live on webkeun.id. One is waiting for its launch day at a marine conservation NGO.
          </p>
        </Reveal>
      </div>

      {wide ? <HorizontalTrack /> : <VerticalList />}
    </section>
  );
}

/** Desktop: the section pins and the cards slide sideways as you scroll down. */
function HorizontalTrack() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });
  const x = useTransform(progress, (p) => -p * distance);
  const n = projects.length;

  return (
    <div ref={pinRef} className="relative mt-16" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-20">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-stretch gap-8 px-8">
          {projects.map((p, i) => (
            <CardInTrack key={p.slug} index={i} count={n} progress={progress}>
              {(drift) => <WorkCard project={p} drift={drift} className="h-[min(64svh,600px)] min-h-[470px] w-[min(78vw,1100px)]" />}
            </CardInTrack>
          ))}
          <EndCard />
        </motion.div>

        <Progress progress={progress} count={n} />
      </div>
    </div>
  );
}

function CardInTrack({
  index,
  count,
  progress,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  children: (drift: MotionValue<number>) => React.ReactNode;
}) {
  // Card i is centred at roughly progress = i / count; drift is its offset from there.
  const drift = useTransform(progress, (p) => Math.max(-1, Math.min(1, p * count - index)));
  return <>{children(drift)}</>;
}

function EndCard() {
  return (
    <a
      href={site.github}
      target="_blank"
      rel="noreferrer"
      className="group flex h-[min(64svh,600px)] min-h-[470px] w-[min(30vw,400px)] flex-col justify-between rounded-[28px] bg-ink p-10 text-bg transition-transform duration-500 ease-out-expo hover:-translate-y-1"
    >
      <p className="text-[0.85rem] font-medium opacity-60">More</p>
      <p className="font-display text-5xl leading-[0.95]">
        The rest lives on <span className="text-accent">GitHub</span>
      </p>
      <span className="flex items-center justify-between text-sm opacity-80">
        github.com/Apiii30
        <span className="grid size-10 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 ease-out-expo group-hover:-rotate-45">
          →
        </span>
      </span>
    </a>
  );
}

function Progress({ progress, count }: { progress: MotionValue<number>; count: number }) {
  const width = useTransform(progress, (p) => `${p * 100}%`);
  const current = useTransform(progress, (p) => `0${Math.min(count, Math.floor(p * count) + 1)}`);
  return (
    <div className="mx-auto mt-8 flex w-full max-w-310 items-center gap-5 px-8 font-mono text-xs text-ink-faint">
      <motion.span className="tabular-nums text-ink">{current}</motion.span>
      <span className="relative h-0.5 flex-1">
        <svg className="absolute inset-0 h-0.5 w-full overflow-visible opacity-30">
          <line x1="0" y1="1" x2="100%" y2="1" className="rule" />
        </svg>
        <motion.span style={{ width }} className="absolute inset-y-0 left-0 overflow-hidden">
          <svg className="h-0.5 w-screen overflow-visible">
            <line x1="0" y1="1" x2="100%" y2="1" className="rule" />
          </svg>
        </motion.span>
      </span>
      <span className="tabular-nums">0{count}</span>
    </div>
  );
}

/** Mobile / tablet: a plain vertical list; parallax comes from each card's own scroll position. */
function VerticalList() {
  return (
    <ul className="mx-auto mt-12 flex max-w-310 flex-col gap-6 px-4 sm:px-8">
      {projects.map((p) => (
        <VerticalItem key={p.slug} project={p} />
      ))}
    </ul>
  );
}

function VerticalItem({ project }: { project: (typeof projects)[number] }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [-0.6, 0.6]);
  return (
    <li ref={ref}>
      <Reveal>
        <WorkCard project={project} drift={drift} />
      </Reveal>
    </li>
  );
}
