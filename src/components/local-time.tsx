"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/lib/site";

const formatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: site.timeZone,
});

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/**
 * Current time in Bandung. Read on the client only: the page is prerendered,
 * so a server timestamp would be frozen at build time.
 */
export function LocalTime() {
  const now = useSyncExternalStore(
    subscribe,
    () => formatter.format(Date.now()),
    () => null,
  );

  return (
    <time className="tabular-nums">
      {now ?? "--:--"} <span className="text-ink-faint">WIB</span>
    </time>
  );
}
