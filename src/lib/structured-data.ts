import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";

/**
 * schema.org data for Google. WebSite gives results the site name "Hafidz
 * Asmar Meisanda" instead of the vercel.app host; ProfilePage + Person tell
 * Google the home page is about a person, with the profiles that are also
 * him (sameAs). Only facts that are on the page belong here — no job-seeking
 * status, which stays visible on the site but out of search results.
 */
const home = siteUrl.href;
const websiteId = `${home}#website`;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId,
  url: home,
  name: site.name,
  alternateName: ["Hafidz Asmar", "Hafidz"],
  inLanguage: "en",
};

export const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${home}#profile`,
  url: home,
  name: `${site.name} — Full-stack Developer`,
  inLanguage: "en",
  isPartOf: { "@id": websiteId },
  mainEntity: {
    "@type": "Person",
    "@id": `${home}#person`,
    name: site.name,
    // The ways people search for him: full name, first + middle, first name.
    alternateName: ["Hafidz Asmar", "Hafidz"],
    givenName: "Hafidz",
    familyName: "Meisanda",
    jobTitle: "Full-stack Developer",
    description: site.description,
    url: home,
    image: new URL("/images/hafidz-formal.jpg", siteUrl).href,
    email: `mailto:${site.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Bandung", addressCountry: "ID" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Politeknik Praktisi Bandung" },
    worksFor: { "@type": "Organization", name: "Webkeun.id", url: site.webkeun },
    sameAs: [site.github, site.linkedin],
    knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Express", "PostgreSQL", "MySQL", "Supabase"],
  },
};

/** For a <script type="application/ld+json">: escapes "<" so the JSON can't close the tag. */
export const ldJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
