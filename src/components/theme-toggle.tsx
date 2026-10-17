"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const getTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/**
 * Sun ↔ moon morph. The new theme spreads out from the button as a circle
 * (View Transitions API), and switches instantly where that isn't supported.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  const dark = theme === "dark";
  const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <mask id="moon-mask">
          <rect width="24" height="24" fill="white" />
          <motion.circle r="7" fill="black" initial={false} animate={{ cx: dark ? 17 : 30, cy: dark ? 7 : 0 }} transition={spring} />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask="url(#moon-mask)"
          initial={false}
          animate={{ r: dark ? 8 : 4.5 }}
          transition={spring}
        />
        <motion.g
          initial={false}
          animate={{ scale: dark ? 0 : 1, rotate: dark ? -45 : 0, opacity: dark ? 0 : 1 }}
          transition={spring}
          style={{ originX: "12px", originY: "12px" }}
          strokeLinecap="round"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </motion.g>
      </svg>
    </button>
  );
}
