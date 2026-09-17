import type { MetadataRoute } from "next";
import { getCategoryMap, getPages, getPosts } from "@/lib/content";
import { getInvestigationTopics, investigationPath } from "@/lib/investigations/catalog";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-12");
  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/blog/", priority: 0.8 },
    { path: "/accountancy-packages/", priority: 0.9 },
    { path: "/online-tax-return-preparation-service/", priority: 0.95 },
    { path: "/tax-returns/", priority: 0.4 },
    { path: "/tax-investigations/", priority: 0.9 },
    { path: "/sign-in/", priority: 0.5 },
    { path: "/sign-up/", priority: 0.5 },
    { path: "/tax-returns/aml-policy/", priority: 0.3 },
    { path: "/tax-returns/engagement-terms/", priority: 0.3 },
  ];
  const investigationPages = getInvestigationTopics().map((topic) => ({
    url: `${SITE.url}${investigationPath(topic.slug)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));
  const pages = getPages()
    .filter((page) => page.slug !== "tax-investigations")
    .map((page) => ({
      url: `${SITE.url}${page.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  const posts = getPosts().map((post) => ({
    url: `${SITE.url}${post.path}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly" as const,
    priority: post.source === "live" ? 0.8 : 0.6,
  }));
  const categories = getCategoryMap().map((cat) => ({
    url: `${SITE.url}/category/${cat.slug}/`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));
  return [
    ...staticRoutes.map((item) => ({
      url: `${SITE.url}${item.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: item.priority,
    })),
    ...pages,
    ...investigationPages,
    ...posts,
    ...categories,
  ];
}
