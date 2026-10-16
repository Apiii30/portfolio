"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CurtainLink } from "@/components/curtain";
import { LiquidGlass } from "@/components/liquid-glass";
import { ThemeToggle } from "@/components/theme-toggle";
import { nav } from "@/lib/site";
import { useActiveSection } from "@/lib/use-active-section";

const ids = nav.map((n) => n.id);
const noIds: string[] = [];
const pill = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

/**
 * Glass pill nav that follows the page: a highlight slides to the section
 * you're in, the label beside the monogram turns into that section's name,
 * a hairline tracks scroll progress, and over the cobalt contact card the
 * whole bar takes on the cobalt tint.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const active = useActiveSection(onHome ? ids : noIds);
  const current = nav.find((n) => n.id === active);
  const onAccent = active === "contact";
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = onHome ? (current?.label ?? "Hafidz") : "Case study";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <div className="pointer-events-auto w-full max-w-215">
        <LiquidGlass
          radius={28}
          className={`relative flex h-14 items-center justify-between overflow-hidden pl-2 pr-2 transition-colors duration-500 ${onAccent ? "bg-accent/35 text-white" : ""}`}
        >
          <CurtainLink
            href="/"
            label="Hafidz Asmar Meisanda"
            className="flex items-center gap-2.5 pr-3"
            aria-label="Hafidz Asmar Meisanda — home"
          >
            <span
              className={`grid size-10 place-items-center rounded-full text-[0.8rem] font-semibold transition-colors duration-500 ${onAccent ? "bg-white text-accent" : "bg-ink text-bg"}`}
            >
              HA
            </span>
            <span className="relative hidden h-5 w-28 overflow-hidden text-[0.95rem] font-semibold sm:block">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={label}
                  initial={{ y: "110%", opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-110%", opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0"
                >
                  {label}
                </motion.span>
              </AnimatePresence>
            </span>
          </CurtainLink>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center text-[0.88rem]">
              {nav.map((item) => {
                const on = item.id === active;
                return (
                  <li key={item.id} className={"wideOnly" in item ? "hidden lg:block" : ""}>
                    <CurtainLink
                      href={item.href}
                      color="var(--accent)"
                      label={item.label}
                      aria-current={on ? "true" : undefined}
                      className={`relative block rounded-full px-3.5 py-2 transition-colors duration-300 ${
                        on
                          ? onAccent
                            ? "text-accent"
                            : "text-bg"
                          : onAccent
                            ? "text-white/80 hover:text-white"
                            : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="nav-pill"
                          transition={pill}
                          className={`absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_16px_-6px_rgb(0_0_0/0.35)] ${onAccent ? "bg-white" : "bg-ink"}`}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                    </CurtainLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className={`grid size-10 place-items-center rounded-full md:hidden ${onAccent ? "bg-white text-accent" : "bg-ink text-bg"}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" className="size-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <motion.line x1="5" x2="19" initial={false} animate={open ? { y1: 5, y2: 19 } : { y1: 9, y2: 9 }} />
                <motion.line x1="5" x2="19" initial={false} animate={open ? { y1: 19, y2: 5 } : { y1: 15, y2: 15 }} />
              </svg>
            </button>
          </div>

          {/* Scroll progress along the bottom edge of the glass */}
          <motion.span
            aria-hidden
            style={{ scaleX: progress }}
            className={`absolute inset-x-6 bottom-0 h-0.5 origin-left rounded-full ${onAccent ? "bg-white" : "bg-accent"}`}
          />
        </LiquidGlass>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="mt-2 origin-top md:hidden"
            >
              <LiquidGlass radius={24} className="p-2">
                <ul>
                  {nav.map((item, i) => {
                    const on = item.id === active;
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i + 0.05 }}
                      >
                        <CurtainLink
                          href={item.href}
                          color="var(--accent)"
                          label={item.label}
                          onClick={() => setOpen(false)}
                          className={`flex items-baseline justify-between rounded-2xl px-4 py-3 font-display text-3xl ${on ? "bg-ink text-bg" : "hover:bg-ink/5"}`}
                        >
                          {item.label}
                          <span className={`text-xs ${on ? "text-bg/60" : "text-ink-faint"}`}>0{i + 1}</span>
                        </CurtainLink>
                      </motion.li>
                    );
                  })}
                </ul>
              </LiquidGlass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
