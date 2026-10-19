import { AboutSection } from "@/components/about/about-section";
import { CertificatesSection } from "@/components/certificates/certificates-section";
import { ContactSection, Footer } from "@/components/contact/contact-section";
import { ExperienceSection } from "@/components/experience/experience-section";
import { Hero } from "@/components/hero/hero";
import { Nav } from "@/components/nav";
import { ScrollSection } from "@/components/reveal";
import { SkillsSection } from "@/components/skills/skills-section";
import { VelocityMarquee } from "@/components/velocity-marquee";
import { WorkSection } from "@/components/work/work-section";
import { ldJson, profileJsonLd } from "@/lib/structured-data";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(profileJsonLd) }} />
      <Nav />
        {/* clip, not hidden: entrance animations start off-screen, and sticky sections must keep working */}
        <main className="overflow-x-clip">
          <Hero />
          <VelocityMarquee
            className="mt-10"
            rows={[
              { items: ["Full-stack developer", "Founder of Webkeun.id", "Based in Bandung"], speed: -2.2 },
              { items: ["React", "Next.js", "TypeScript", "Express", "PostgreSQL", "MySQL"], speed: 1.6, tone: "faint" },
            ]}
          />
          <ScrollSection>
            <WorkSection />
          </ScrollSection>
          <ScrollSection>
            <AboutSection />
          </ScrollSection>
          <ScrollSection>
            <ExperienceSection />
          </ScrollSection>
          <ScrollSection>
            <CertificatesSection />
          </ScrollSection>
          <ScrollSection>
            <SkillsSection />
          </ScrollSection>
          {/* Availability is for visitors; data-nosnippet keeps it out of Google's result text */}
          <div data-nosnippet>
            <VelocityMarquee
              className="mt-20"
              rows={[{ items: ["Open to internships", "Available now", "Remote or on-site"], speed: -2, tone: "accent" }]}
            />
          </div>
          <ContactSection />
        </main>
        <Footer />
    </>
  );
}
