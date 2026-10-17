import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Backdrop } from "@/components/backdrop";
import { Curtain } from "@/components/curtain";
import { IntroLoader } from "@/components/intro/intro-loader";
import { SmoothScroll } from "@/components/smooth-scroll";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `${site.shortName} — ${site.role}`,
  description: site.description,
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.shortName} — ${site.role}`,
    description: site.description,
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.shortName,
  jobTitle: "Full-stack Developer",
  email: `mailto:${site.email}`,
  url: siteUrl.href,
  image: new URL("/images/hafidz-formal.jpg", siteUrl).href,
  address: { "@type": "PostalAddress", addressLocality: "Bandung", addressCountry: "ID" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Politeknik Praktisi Bandung" },
  worksFor: { "@type": "Organization", name: "Webkeun.id", url: site.webkeun },
  sameAs: [site.github, site.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Express", "PostgreSQL", "MySQL", "Supabase"],
};

// Runs before first paint so the saved / system theme never flashes, and so a
// loader that already played this session never shows for a frame.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t)}catch(e){}try{if(sessionStorage.getItem("intro-seen")==="1")d.classList.add("intro-seen")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <noscript>
          <style>{`#intro-loader{display:none}`}</style>
        </noscript>
        <SmoothScroll>
          <Backdrop />
          <IntroLoader />
          <Curtain />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
