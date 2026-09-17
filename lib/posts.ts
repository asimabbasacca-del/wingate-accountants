import type { Guide, GuideCategory } from "./types";
import { GUIDES } from "./guides";

export function getGuides(): Guide[] {
  return GUIDES;
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function getFeaturedGuide(): Guide {
  return GUIDES.find((guide) => guide.featured) ?? GUIDES[0];
}

export function getRelatedGuides(guide: Guide, limit = 3): Guide[] {
  const bySlug = guide.relatedSlugs
    .map((slug) => getGuide(slug))
    .filter((item): item is Guide => Boolean(item));
  if (bySlug.length >= limit) return bySlug.slice(0, limit);
  const extras = GUIDES.filter(
    (item) =>
      item.slug !== guide.slug &&
      item.category === guide.category &&
      !bySlug.some((related) => related.slug === item.slug),
  );
  return [...bySlug, ...extras].slice(0, limit);
}

export function getCategories(): GuideCategory[] {
  return [...new Set(GUIDES.map((guide) => guide.category))];
}
