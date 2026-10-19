import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Backdrop } from "@/components/backdrop";
import { Curtain } from "@/components/curtain";
import { IntroLoader } from "@/components/intro/intro-loader";
import { SmoothScroll } from "@/components/smooth-scroll";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import { ldJson, websiteJsonLd } from "@/lib/structured-data";
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
  title: `${site.name} — Full-stack Developer`,
  description: site.description,
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} — Full-stack Developer`,
    description: site.description,
    url: "/",
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Google Search Console's "HTML tag" method: set GOOGLE_SITE_VERIFICATION in
  // Vercel (Project → Settings → Environment Variables) to the content="…" value.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

// Runs before first paint so the saved / system theme never flashes, and so a
// loader that already played this session never shows for a frame.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t)}catch(e){}try{if(sessionStorage.getItem("intro-seen")==="1"&&!/[?&]intro\b/.test(location.search))d.classList.add("intro-seen");else if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("intro-hold")}catch(e){}})()`;

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
          dangerouslySetInnerHTML={{ __html: ldJson(websiteJsonLd) }}
        />
      </head>
      <body>
        <noscript>
          <style>{`#intro-loader{display:none}html.intro-hold main,html.intro-hold header{transform:none!important;filter:none!important;opacity:1!important}`}</style>
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
