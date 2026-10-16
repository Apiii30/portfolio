"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { ContributionDay } from "@/lib/github";

const OPACITY = [0, 0.3, 0.55, 0.8, 1];
// Fixed names: Intl month abbreviations differ between Node and browsers ("Sept" vs "Sep"),
// which breaks hydration.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/**
 * The most recent weeks of the calendar, one column per week (Sun → Sat),
 * stronger cobalt for busier days.
 */
export function ContributionGraph({ days: allDays, weeks = 22 }: { days: ContributionDay[]; weeks?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<ContributionDay | null>(null);

  const days = useMemo(() => allDays.slice(-weeks * 7), [allDays, weeks]);

  const columns = useMemo(() => {
    // Pad the front so the first column starts on Sunday, like GitHub.
    const firstDow = new Date(days[0].date + "T00:00:00Z").getUTCDay();
    const padded: (ContributionDay | null)[] = [...Array(firstDow).fill(null), ...days];
    const cols: (ContributionDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));
    return cols;
  }, [days]);

  const months = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let last = "";
    columns.forEach((col, i) => {
      const d = col.find(Boolean);
      if (!d) return;
      const m = MONTHS[Number(d.date.slice(5, 7)) - 1];
      // Skip a label squeezed into the first column(s) of a partial month.
      if (m !== last && !(i === 0 && col.filter(Boolean).length < 7 && Number(d.date.slice(8)) > 24)) {
        labels.push({ col: i, label: m });
      }
      last = m;
    });
    return labels;
  }, [columns]);

  const cell = 14;
  const width = columns.length * cell;
  const height = 7 * cell;
  const n = columns.length;

  return (
    <div ref={ref} className="relative">
        <svg
          viewBox={`0 -16 ${width} ${height + 16}`}
          className="w-full overflow-visible"
          role="img"
          aria-label={`GitHub contributions over the last ${weeks} weeks`}
          onPointerLeave={() => setHover(null)}
        >
          {months.map((m) => (
            <text key={m.col} x={m.col * cell} y={-6} className="fill-ink-faint text-[8px]">
              {m.label}
            </text>
          ))}
          {columns.map((col, ci) =>
            col.map((d, ri) =>
              d ? (
                <motion.rect
                  key={d.date}
                  x={ci * cell + 1.5}
                  y={ri * cell + 1.5}
                  width={cell - 3}
                  height={cell - 3}
                  rx={2.5}
                  onPointerEnter={() => setHover(d)}
                  className={d.level ? "fill-accent" : "fill-ink/[0.07]"}
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  animate={inView ? { opacity: d.level ? OPACITY[d.level] : 1, scale: 1 } : undefined}
                  // Sweep in from the most recent week backwards.
                  transition={{ duration: 0.4, delay: reduce ? 0 : (n - ci) * 0.012 + ri * 0.01 }}
                  style={{ originX: "50%", originY: "50%" }}
                />
              ) : null,
            ),
          )}
        </svg>

      <p className="mt-3 h-4 text-[0.72rem] text-ink-faint" aria-live="polite">
        {hover
          ? `${hover.count === 0 ? "No" : hover.count} contribution${hover.count === 1 ? "" : "s"} · ${dayLabel(hover.date)}`
          : "Hover a day for details"}
      </p>
    </div>
  );
}
