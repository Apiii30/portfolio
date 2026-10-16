# Hafidz Asmar — portfolio

Personal site: hero, selected work with three case studies, about, experience, tools and contact.
Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Motion, Lenis, and one hand-written WebGL shader.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Copy `.env.example` to `.env.local` if you want to set anything (both values are optional).

## Where things live

| What | File |
| --- | --- |
| Name, links, email, status line | `src/lib/site.ts` |
| Projects and case-study text | `src/lib/projects.ts` |
| Experience, education, certificates | `src/lib/content.ts` |
| Tools and where each was used | `src/lib/skills.ts` |
| Colours (light + dark), glass, stitch line | `src/app/globals.css` |
| Screenshots | `public/work/<project>/` |
| CV download | `public/files/Hafidz-Asmar-CV.pdf` (replace the file, keep the name) |

After adding or replacing an image in `public/`, add its size to `src/lib/image-sizes.ts`.
`next/image` uses those sizes so nothing jumps while loading.

## Notable pieces

- **Hero portrait** (`src/components/hero/liquid-portrait.tsx`): WebGL. The denim photo turns into the suit photo
  through a noisy liquid seam as you scroll, and the cursor makes a ripple. Falls back to a crossfade without WebGL or
  with reduced motion.
- **Liquid glass** (`src/components/liquid-glass.tsx`): every browser gets frosted glass; Chromium also gets edge
  refraction from a displacement map generated for each element's exact size.
- **Card → case study morph**: React `<ViewTransition>` with a shared `cover-<slug>` name, plus directional slides
  (`nav-forward` / `nav-back`) defined at the bottom of `globals.css`.
- **GitHub graph** (`src/lib/github.ts`): cached for hours. Uses the GraphQL API when `GITHUB_TOKEN` is set,
  otherwise reads the public calendar on the GitHub profile.

## Deploy (Vercel)

1. Push the repo to GitHub, then import it at vercel.com/new. No build settings to change.
2. Optional environment variables:
   - `GITHUB_TOKEN`: fine-grained token, no permissions needed.
   - `NEXT_PUBLIC_SITE_URL`: your domain once it's attached (used for canonical URLs, sitemap and OG images).
3. To make the GitHub graph count private work, turn on **Include private contributions** in your
   GitHub profile's contribution settings.
