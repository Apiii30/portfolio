import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CurtainLink } from "@/components/curtain";
import { CaseCover, ParallaxShot } from "@/components/case/case-cover";
import { Footer } from "@/components/contact/contact-section";
import { Nav } from "@/components/nav";
import { Reveal, ScrollSection, SplitHeading } from "@/components/reveal";
import { getProject, projects, type Shot } from "@/lib/projects";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${site.shortName}`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article" },
  };
}

export default function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <>
      <Nav />
      {/* Links into this route prefetch it, so it is usually ready by the time the curtain has covered the screen */}
      <Suspense fallback={<div className="min-h-svh" />}>
        <CaseStudy params={params} />
      </Suspense>
    </>
  );
}

async function CaseStudy({ params }: { params: PageProps<"/work/[slug]">["params"] }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const i = projects.indexOf(project);
  const next = projects[(i + 1) % projects.length];

  return (
    <>
        <main id="top" className="mx-auto overflow-x-clip max-w-310 px-4 pt-28 sm:px-8 sm:pt-36">
          <CurtainLink
            href="/#work"
            label="All work"
            className="inline-flex items-center gap-2 text-[0.85rem] font-medium text-ink-soft hover:text-accent"
          >
            ← All work
          </CurtainLink>

          <header className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-[0.85rem] font-medium text-ink-faint">
                <span className="text-accent">{project.index}</span> — {project.client}
              </p>
              <SplitHeading
                as="h1"
                text={project.title}
                className="mt-4 font-display text-[clamp(2.6rem,6vw,5.75rem)] leading-[0.9] tracking-[-0.045em]"
              />
              <Reveal delay={0.15}>
                <p className="mt-8 max-w-[52ch] text-xl leading-snug text-ink-soft">{project.summary}</p>
              </Reveal>
            </div>
            <Reveal delay={0.2} className="lg:col-span-4 lg:self-end">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 text-sm lg:grid-cols-1">
                <Meta label="Role" value={project.role} />
                <Meta label="When" value={project.year} />
                <div className="col-span-2 lg:col-span-1">
                  <dt className="text-[0.8rem] font-medium text-ink-faint">Stack</dt>
                  <dd className="mt-1.5 text-ink">{project.stack.join(" · ")}</dd>
                </div>
                {project.live && (
                  <div className="col-span-2 lg:col-span-1">
                    <dt className="text-[0.8rem] font-medium text-ink-faint">Live</dt>
                    <dd className="mt-1.5">
                      <a
                        href={project.live.href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-accent underline-offset-4 hover:text-accent"
                      >
                        {project.live.label} ↗
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Reveal>
          </header>

          <div className="mt-14">
            <CaseCover project={project} />
            {project.status && (
              <p className="mt-4 font-mono text-xs text-ink-faint">
                <span className="text-accent">●</span> {project.status}
              </p>
            )}
          </div>

          <ul className="mt-20 grid gap-8 border-y border-line py-10 sm:grid-cols-3">
            {project.facts.map((f, k) => (
              <Reveal as="li" key={f.label} delay={k * 0.06}>
                <p className="font-display text-5xl leading-none sm:text-6xl">{f.value}</p>
                <p className="mt-3 max-w-[24ch] text-ink-soft">{f.label}</p>
              </Reveal>
            ))}
          </ul>

          {project.outcome && (
            <ScrollSection>
            <section className="mt-16 rounded-[28px] bg-accent-fill p-6 text-white sm:p-10">
              <Reveal>
                <p className="text-[0.85rem] font-medium text-white/85">{project.outcome.title}</p>
              </Reveal>
              <ul className="mt-6 grid gap-4 md:grid-cols-3">
                {project.outcome.points.map((pt, k) => (
                  <Reveal as="li" key={pt} delay={k * 0.06} className="rounded-2xl bg-white/12 p-5 leading-relaxed ring-1 ring-white/15">
                    {pt}
                  </Reveal>
                ))}
              </ul>
            </section>
            </ScrollSection>
          )}

          <section className="mt-24 grid gap-6 lg:grid-cols-12">
            <Reveal className="lg:col-span-3">
              <p className="text-[0.85rem] font-medium text-accent">The problem</p>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-9">
              <p className="font-display text-[clamp(1.35rem,2.2vw,2rem)] leading-[1.2]">{project.problem}</p>
            </Reveal>
          </section>

          {project.sections.map((s, k) => (
            <ScrollSection key={s.title}>
            <section className="mt-28 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <Reveal>
                  <p className="text-[0.85rem] font-medium text-ink-faint">
                    {project.index}.{k + 1}
                  </p>
                </Reveal>
              </div>
              <div className="lg:col-span-9">
                <SplitHeading text={s.title} as="h2" className="font-display text-[clamp(1.7rem,3vw,2.6rem)] leading-[1] tracking-[-0.045em]" />
                <Reveal delay={0.1}>
                  <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-soft">{s.body}</p>
                </Reveal>
              </div>
              {s.shots && <Gallery shots={s.shots} />}
            </section>
            </ScrollSection>
          ))}

          <section className="mt-32 border-t border-line pt-12">
            <Reveal>
              <p className="text-[0.85rem] font-medium text-accent">What I took away</p>
              <blockquote className="mt-6 max-w-[30ch] font-display text-[clamp(1.6rem,3vw,2.75rem)] leading-[1.05]">
                “{project.learned}”
              </blockquote>
            </Reveal>
          </section>

          <CurtainLink
            href={`/work/${next.slug}`}
            color={next.accent}
            label={next.title}
            className="group mt-32 block rounded-[28px] bg-surface p-8 ring-1 ring-line transition-colors hover:bg-bg sm:p-12"
          >
            <p className="text-[0.85rem] font-medium text-ink-faint">Next project — {next.index}</p>
            <p className="mt-4 flex items-end justify-between gap-6 font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.045em]">
              <span>{next.title}</span>
              <span className="mb-3 grid size-14 shrink-0 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 ease-out-expo group-hover:-rotate-45 sm:size-20">
                <svg viewBox="0 0 16 16" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 8h12M9 3l5 5-5 5" />
                </svg>
              </span>
            </p>
          </CurtainLink>
        </main>
        <Footer />
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.8rem] font-medium text-ink-faint">{label}</dt>
      <dd className="mt-1.5 text-ink">{value}</dd>
    </div>
  );
}

function Gallery({ shots }: { shots: readonly Shot[] }) {
  const phones = shots.filter((s) => s.kind === "mobile");
  const wide = shots.filter((s) => s.kind !== "mobile");

  return (
    <div className="mt-10 space-y-16 lg:col-span-12">
      {wide.length > 0 && (
        <div className={`grid items-start gap-6 sm:gap-10 ${wide.length > 1 ? "md:grid-cols-2" : ""}`}>
          {wide.map((s, k) => (
            <div key={s.src} className={s.kind === "panel" ? "mx-auto w-full max-w-md" : ""}>
              <ParallaxShot shot={s} depth={k % 2 ? 50 : 20} sizes={wide.length > 1 ? "(min-width: 768px) 45vw, 92vw" : "92vw"} />
            </div>
          ))}
        </div>
      )}
      {phones.length > 0 && (
        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-4">
          {phones.map((s, k) => (
            <div key={s.src} className={`w-[62vw] shrink-0 snap-center sm:w-auto ${phones.length < 4 ? "md:col-span-1" : ""}`}>
              <ParallaxShot shot={s} depth={k % 2 ? 60 : 25} sizes="(min-width: 768px) 22vw, 62vw" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
