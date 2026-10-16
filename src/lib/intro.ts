"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the opening loader has handed over to the page. The hero holds its
 * entrance animations until this flips, so they play as the loader leaves.
 */
let done = false;
const listeners = new Set<() => void>();

export const intro = {
  finish() {
    if (done) return;
    done = true;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  isDone: () => done,
};

export function useIntroDone() {
  return useSyncExternalStore(intro.subscribe, intro.isDone, () => false);
}

/** sessionStorage key: the loader plays once per visit, not on every page. */
export const INTRO_KEY = "intro-seen";
