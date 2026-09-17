import livePages from "@/content/live-pages.json";
import livePosts from "@/content/live-posts.json";
import extraPosts from "@/content/extra-posts.json";
import { GUIDES } from "@/lib/guides";
import type { Guide } from "@/lib/types";

export type CmsCategory = { slug: string; name: string };

export type CmsRecord = {
  slug: string;
  path: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  html: string;
  kind: "page" | "post";
  date?: string;
  categories?: CmsCategory[];
  source?: "live" | "extra";
};

function rewriteExtraLinks(html: string): string {
  return html
    .replaceAll("/contact-us/", "/contact-us/")
    .replaceAll('href="/contact"', 'href="/contact-us/"')
    .replaceAll("](/contact)", "](/contact-us/)")
    .replaceAll("/services/self-assessment", "/self-assessment-tax-returns/")
    .replaceAll("/services/tax-disclosure", "/hmrc-tax-disclosure-london/")
    .replaceAll("/services/capital-gains", "/capital-gains-tax/")
    .replaceAll("/services/companies", "/annual-accounts-services/")
    .replaceAll("](/blog/", "](/")
    .replaceAll('href="/blog/', 'href="/');
}

function extraHtml(guide: Guide): string {
  const parts: string[] = [];
  for (const section of guide.sections) {
    parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    for (const paragraph of section.paragraphs) {
      parts.push(`<p>${inlineMarkdown(paragraph)}</p>`);
    }
    if (section.bullets?.length) {
      parts.push("<ul>");
      for (const bullet of section.bullets) parts.push(`<li>${inlineMarkdown(bullet)}</li>`);
      parts.push("</ul>");
    }
  }
  if (guide.faqs.length) {
    parts.push("<h2>Questions we are asked</h2>");
    for (const faq of guide.faqs) {
      parts.push(`<h3>${escapeHtml(faq.question)}</h3>`);
      parts.push(`<p>${inlineMarkdown(faq.answer)}</p>`);
    }
  }
  return rewriteExtraLinks(parts.join(""));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value: string): string {
  const escaped = escapeHtml(value);
  return escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function extras(): CmsRecord[] {
  return GUIDES.map((guide) => ({
    slug: guide.slug,
    path: `/${guide.slug}/`,
    title: guide.title,
    seoTitle: guide.seoTitle,
    description: guide.description,
    excerpt: guide.excerpt,
    html: extraHtml(guide),
    kind: "post" as const,
    date: guide.date,
    categories: [{ slug: guide.category.toLowerCase().replaceAll(" ", "-"), name: guide.category }],
    source: "extra" as const,
  }));
}

const PAGES = livePages as CmsRecord[];
const LIVE_POSTS = livePosts as CmsRecord[];
const IMPORTED_EXTRAS = extraPosts as CmsRecord[];
const WRITTEN_EXTRAS = extras();
const EXTRA_POSTS = [
  ...WRITTEN_EXTRAS,
  ...IMPORTED_EXTRAS.filter((item) => !WRITTEN_EXTRAS.some((guide) => guide.slug === item.slug)),
];
const POSTS = [...LIVE_POSTS, ...EXTRA_POSTS].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

export function getPages(): CmsRecord[] {
  return PAGES;
}

export function getPosts(): CmsRecord[] {
  return POSTS;
}

export function getLivePosts(): CmsRecord[] {
  return LIVE_POSTS;
}

export function getPage(slug: string): CmsRecord | undefined {
  return PAGES.find((item) => item.slug === slug);
}

export function getPost(slug: string): CmsRecord | undefined {
  return POSTS.find((item) => item.slug === slug);
}

export function getRecord(slug: string): CmsRecord | undefined {
  return getPage(slug) ?? getPost(slug);
}

export function getPostsByCategory(slug: string): CmsRecord[] {
  return POSTS.filter((post) => post.categories?.some((cat) => cat.slug === slug));
}

export function getCategoryMap(): { slug: string; name: string; count: number }[] {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const post of LIVE_POSTS) {
    for (const cat of post.categories ?? []) {
      const current = map.get(cat.slug) ?? { slug: cat.slug, name: cat.name, count: 0 };
      current.count += 1;
      map.set(cat.slug, current);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function relatedPosts(post: CmsRecord, limit = 3): CmsRecord[] {
  const cat = new Set((post.categories ?? []).map((item) => item.slug));
  return POSTS.filter((item) => item.slug !== post.slug)
    .sort((a, b) => {
      const aHit = a.categories?.some((item) => cat.has(item.slug)) ? 1 : 0;
      const bHit = b.categories?.some((item) => cat.has(item.slug)) ? 1 : 0;
      return bHit - aHit;
    })
    .slice(0, limit);
}
