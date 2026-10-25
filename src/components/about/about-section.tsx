import { Suspense } from "react";
import { ContributionGraph } from "@/components/about/contribution-graph";
import { PhotoTile } from "@/components/about/photo-tile";
import { Parallax, Reveal, SplitHeading } from "@/components/reveal";
import { certificates } from "@/lib/content";
import { getContributions } from "@/lib/github";
import { site } from "@/lib/site";

const tile = "rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-8";

const facts = [
  { label: "Based in", value: "Bandung, ID" },
  { label: "Studying", value: "D3 Informatics Mgmt." },
  { label: "Running", value: "Webkeun.id" },
  // Shown to visitors, kept out of search snippets (data-nosnippet).
  { label: "Looking for", value: "Full-stack internship", private: true },
] as const;

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto max-w-310 px-4 pt-24 sm:px-8 sm:pt-32">
      <Reveal>
        <p className="text-[0.85rem] font-medium text-ink-faint">
          <span className="mr-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold tabular-nums text-on-accent">02</span>About
        </p>
      </Reveal>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <Parallax speed={-0.12} className="h-full lg:col-span-5">
        <Reveal>
          <PhotoTile />
        </Reveal>
        </Parallax>

        <Parallax speed={0.06} className="h-full lg:col-span-7">
        <Reveal delay={0.08} className={`${tile} h-full flex flex-col justify-between gap-8`}>
          <div>
            <SplitHeading
              as="h2"
              id="about-title"
              text="I'm Hafidz. I learn by shipping things people use."
              className="font-display text-[clamp(2rem,3.4vw,3.3rem)] leading-[0.98] tracking-[-0.045em]"
            />
            <div className="mt-7 grid gap-5 leading-relaxed text-ink-soft md:grid-cols-2">
              <p>
                I study Informatics Management at Politeknik Praktisi Bandung (D3, graduating 2027) and hold a 3.84 GPA.
                At Ocean Young Guards I built a volunteer platform end to end: the API, the database, the admin screens.
              </p>
              <p>
                <a href={site.webkeun} className="text-ink underline decoration-accent underline-offset-4">
                  Webkeun.id
                </a>{" "}
                came next: a small studio where I design, build and launch sites for real clients, and answer their
                WhatsApps.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} data-nosnippet={"private" in f || undefined} className="rounded-2xl bg-surface-2 p-4">
                <dt className="text-[0.75rem] text-ink-faint">{f.label}</dt>
                <dd className="mt-1 font-display text-lg leading-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        </Parallax>

        <Parallax speed={0.12} className="h-full lg:col-span-7">
        <Reveal delay={0.12} className={`${tile} h-full min-w-0`}>
          <Suspense fallback={<GraphFallback />}>
            <GitHubTile />
          </Suspense>
        </Reveal>
        </Parallax>

        <Parallax speed={0.2} className="h-full lg:col-span-5">
        <Reveal delay={0.16} className={`${tile} h-full flex flex-col justify-between gap-8`}>
          <p className="text-[0.8rem] font-medium text-ink-faint">Before code</p>
          <div>
            <p className="font-display text-6xl leading-none">
              3<span className="ml-1 text-3xl text-ink-faint">yrs</span>
            </p>
            <p className="mt-3 leading-snug text-ink-soft">
              as a student martial-arts athlete in West Java. Show up, repeat, get slightly better each round. Same
              habit, different arena.
            </p>
          </div>
          <p className="border-t border-line pt-4 text-sm text-ink-soft">Former student council president.</p>
        </Reveal>
        </Parallax>

        <Parallax speed={0.08} className="h-full lg:col-span-12">
        <Reveal delay={0.1} className={`${tile} h-full grid gap-6 sm:grid-cols-2`}>
          <div className="flex items-baseline gap-4">
            <p className="w-24 shrink-0 text-[0.8rem] font-medium text-accent">Now</p>
            <p className="text-lg leading-snug">
              Learning Python and backend architecture.{" "}
              <a
                href={certificates.dicodingPython.verifyUrl}
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap text-ink-soft underline underline-offset-4 hover:text-accent"
              >
                Dicoding certificate ↗
              </a>
            </p>
          </div>
          <div className="flex items-baseline gap-4">
            <p className="w-24 shrink-0 text-[0.8rem] font-medium text-accent">Off-screen</p>
            <p className="text-lg leading-snug">Traveling, and finding new places to get slightly lost in.</p>
          </div>
        </Reveal>
        </Parallax>
      </div>
    </section>
  );
}

async function GitHubTile() {
  const data = await getContributions();
  if (!data) return <GraphFallback />;

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.8rem] font-medium text-ink-faint">Shipping lately</p>
          <p className="mt-2 font-display text-4xl leading-none">
            {data.total}
            <span className="ml-2 font-sans text-base font-normal tracking-normal text-ink-soft">contributions in the last year</span>
          </p>
        </div>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-mono text-xs text-ink-soft underline underline-offset-4 hover:text-accent"
        >
          GitHub ↗
        </a>
      </div>
      <ContributionGraph days={data.days} />
      <p className="font-mono text-[0.68rem] text-ink-faint">
        {data.last30} in the last 30 days · longest streak {data.longestStreak} day{data.longestStreak === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function GraphFallback() {
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <p className="text-[0.8rem] font-medium text-ink-faint">Shipping lately</p>
      <p className="text-lg text-ink-soft">
        Commit history lives on{" "}
        <a href={site.github} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4">
          GitHub ↗
        </a>
      </p>
    </div>
  );
}
