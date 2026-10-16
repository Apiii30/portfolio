"use client";

import { useSyncExternalStore } from "react";

/** matchMedia as state. `false` during SSR so the server renders the mobile layout. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
