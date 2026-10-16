"use client";

import Link from "next/link";
import { animate } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Page transition: a coloured panel grows out of whatever was clicked until it
 * covers the screen, the route changes underneath it, then it wipes away
 * upward. Only clip-path and opacity animate, so it stays smooth even while
 * the next page is heavy to render.
 */

const ease = [0.76, 0, 0.24, 1] as const;
let panel: HTMLDivElement | null = null;
let label: HTMLSpanElement | null = null;
let covering = false;

async function cover(from: DOMRect | null, color: string, text: string) {
  if (!panel) return;
  covering = true;
  panel.style.background = color;
  panel.style.display = "grid";
  if (label) {
    label.textContent = text;
    label.style.opacity = "0";
  }
  const start = from
    ? `inset(${from.top}px ${innerWidth - from.right}px ${innerHeight - from.bottom}px ${from.left}px round 28px)`
    : "inset(100% 0px 0px 0px round 0px)";
  await animate(panel, { clipPath: [start, "inset(0px 0px 0px 0px round 0px)"] }, { duration: 0.7, ease });
  if (label) animate(label, { opacity: [0, 1], y: [16, 0] }, { duration: 0.35 });
}

async function reveal() {
  if (!panel || !covering) return;
  covering = false;
  if (label) await animate(label, { opacity: 0, y: -12 }, { duration: 0.2 });
  await animate(panel, { clipPath: ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 100% 0% round 0px)"] }, { duration: 0.75, ease });
  panel.style.display = "none";
}

/** Mounted once in the layout. Reveals the new page whenever the path changes. */
export function Curtain() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    panel = ref.current;
    label = labelRef.current;
    return () => {
      panel = null;
      label = null;
    };
  }, []);

  useEffect(() => {
    // Two frames: let the new page paint under the panel before lifting it.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => void reveal());
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden place-items-center text-white">
      <span ref={labelRef} className="px-6 text-center font-display text-[clamp(2rem,6vw,5rem)] leading-none" />
    </div>
  );
}

/**
 * A Link that plays the curtain when it leaves the current page. Same-page
 * links (e.g. "/#about" while on "/") behave like normal anchors.
 */
export function CurtainLink({
  href,
  color = "var(--ink)",
  label = "",
  fromSelector,
  children,
  onClick,
  ...rest
}: Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  color?: string;
  label?: string;
  /** Selector inside the link whose box the panel grows from (defaults to the link itself). */
  fromSelector?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handle = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const target = new URL(href, location.href);
    const samePage = target.pathname === pathname;
    if (e.defaultPrevented || samePage || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const el = (fromSelector && e.currentTarget.querySelector(fromSelector)) || e.currentTarget;
      await cover(el.getBoundingClientRect(), color, label);
    }
    router.push(href);
  };

  return (
    <Link href={href} prefetch onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
