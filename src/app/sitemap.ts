import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL("/", siteUrl).href, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: new URL(`/work/${p.slug}`, siteUrl).href,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
