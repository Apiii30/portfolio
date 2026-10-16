"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import { LocalTime } from "@/components/local-time";
import { Magnetic } from "@/components/magnetic";
import { ScrollZoom, SplitHeading } from "@/components/reveal";
import { site } from "@/lib/site";

const links = [
  { label: "WhatsApp", href: site.whatsapp, note: "Fastest reply" },
  { label: "LinkedIn", href: site.linkedin, note: "hafidz-asmar-meisanda" },
  { label: "GitHub", href: site.github, note: "Apiii30" },
  { label: "CV", href: site.cv, note: "PDF, 1 page", download: true },
] as const;

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-310 px-3 pt-24 sm:px-6 sm:pt-32">
      <ScrollZoom className="relative bg-accent p-6 text-white sm:p-12 lg:p-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[12%] -top-[30%] aspect-square w-[60%] rounded-full bg-white/10 ring-1 ring-white/15"
        />
        <p className="relative inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-[0.8rem] font-medium">
          <span className="mr-2 grid size-5 place-items-center rounded-full bg-white text-[0.65rem] font-semibold text-accent">06</span>
          Contact
        </p>
        <SplitHeading
          id="contact-title"
          text={"Hiring a web developer intern? Let\u2019s talk."}
          className="relative mt-6 max-w-[15ch] font-display text-[clamp(2.4rem,5.6vw,5.5rem)] leading-[0.92]"
        />

        <div className="relative mt-10 flex flex-wrap items-center gap-3">
          <Magnetic strength={0.2}>
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-center gap-4 rounded-full bg-white py-2.5 pl-6 pr-2.5 font-medium text-accent sm:text-lg"
            >
              {site.email}
              <span className="grid size-10 place-items-center rounded-full bg-accent text-white transition-transform duration-500 ease-out-expo group-hover:-rotate-45">
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 8h12M9 3l5 5-5 5" />
                </svg>
              </span>
            </a>
          </Magnetic>
          <button type="button" onClick={copy} aria-live="polite" className="relative">
            <LiquidGlass radius={26} className="grid h-13 min-w-32 place-items-center overflow-hidden bg-white/10 px-6 text-sm font-medium text-white">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? "done" : "copy"}
                  initial={{ y: 16, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -16, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {copied ? "Copied ✓" : "Copy email"}
                </motion.span>
              </AnimatePresence>
            </LiquidGlass>
          </button>
        </div>

        <ul className="relative mt-14 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...("download" in l ? { download: true } : { target: "_blank", rel: "noreferrer" })}
                className="group flex items-end justify-between gap-4 rounded-[20px] bg-white/10 p-5 ring-1 ring-white/15 transition-colors hover:bg-white/20"
              >
                <span>
                  <span className="block font-display text-2xl">{l.label}</span>
                  <span className="mt-1 block text-[0.8rem] text-white/70">{l.note}</span>
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-white/15 text-sm transition-transform duration-500 ease-out-expo group-hover:-rotate-45">
                  {"download" in l ? "↓" : "→"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </ScrollZoom>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-6 max-w-310 px-4 pb-8 sm:px-8">
      <div className="flex flex-col gap-3 text-[0.8rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>Designed & built by {site.shortName} in Bandung</p>
        <p>
          Local time <LocalTime />
        </p>
        <a href="#top" className="hover:text-accent">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
