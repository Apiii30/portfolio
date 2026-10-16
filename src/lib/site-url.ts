/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL once a domain is attached;
 * on Vercel it falls back to the production deployment URL.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);
