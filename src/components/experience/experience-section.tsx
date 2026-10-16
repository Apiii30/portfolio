"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Reveal, SplitHeading } from "@/components/reveal";
import { education, experience } from "@/lib/content";

export function ExperienceSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="mx-auto grid max-w-310 gap-12 px-4 pt-24 sm:px-8 sm:pt-32 lg:grid-cols-12"
    >
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <Reveal>
            <p className="text-[0.85rem] font-medium text-ink-faint">
              <span className="mr-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold tabular-nums text-on-accent">03</span>Experience
            </p>
          </Reveal>
          <SplitHeading
            id="experience-title"
            text="Where the work happened."
            className="mt-4 font-display text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[0.95] tracking-[-0.045em]"
          />

          <Reveal delay={0.1} className="mt-10 rounded-[28px] bg-surface p-6 ring-1 ring-line">
            <p className="text-[0.8rem] font-medium text-ink-faint">Education</p>
            <p className="mt-3 text-lg">{education.school}</p>
            <p className="text-ink-soft">{education.degree}</p>
            <p className="mt-1 font-mono text-xs text-ink-faint">{education.period}</p>
          </Reveal>

        </div>
      </div>

      <ol ref={listRef} className="relative lg:col-span-8">
        {/* The accent: faint full seam, plus the copper stitch drawn as you read */}
        <svg aria-hidden className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-1 overflow-visible">
          <line x1="1" y1="0" x2="1" y2="100%" className="rule opacity-25" />
        </svg>
        <motion.div
          aria-hidden
          style={{ scaleY: reduce ? 1 : draw }}
          className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-1 origin-top"
        >
          <svg className="h-full w-1 overflow-visible">
            <line x1="1" y1="0" x2="1" y2="100%" className="rule" />
          </svg>
        </motion.div>

        {experience.map((item, i) => (
          <li key={item.org} className="relative pb-4 pl-10 last:pb-0 sm:pl-14">
            <span aria-hidden className="absolute left-0 top-9 grid size-4 place-items-center rounded-full bg-bg ring-2 ring-accent">
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
            <Reveal delay={i * 0.06} x={60} y={20} className="rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-8">
              <p className="text-[0.85rem] font-medium text-ink-faint">
                {item.period} <span className="mx-2">·</span> {item.type}
              </p>
              <h3 className="mt-3 font-display text-[1.7rem] leading-tight sm:text-[1.8rem]">{item.role}</h3>
              <p className="text-lg text-ink-soft">{item.org}</p>
              <ul className="mt-5 max-w-[62ch] space-y-3 leading-relaxed text-ink-soft">
                {item.points.map((pt) => (
                  <li key={pt} className="relative pl-5">
                    <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-accent" />
                    {pt}
                  </li>
                ))}
              </ul>
              {item.stack && (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {item.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] text-ink-soft">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {item.certificate && (
                <a
                  href="#certificates"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-on-accent"
                >
                  Certificate of Appreciation ↓
                </a>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
