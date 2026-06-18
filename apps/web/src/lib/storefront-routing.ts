import {
  authors,
  campaignPages,
  circularCategories,
  directoryEntries,
  productSections,
  products,
  publishers,
  rankedLists,
  subjectCategories,
} from "@/data/storefront";
import type { Product } from "@/types/storefront";

export function normalizeRoutePart(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

export function titleToSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function titleFromSlug(slug: string) {
  return normalizeRoutePart(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function repeatProducts(seed: Product[], count = 20) {
  if (!seed.length) return [];
  return Array.from({ length: count }, (_, index) => seed[index % seed.length]);
}

export function productsForKey(key: string, count = 20) {
  const normalized = normalizeRoutePart(key);
  const start = Math.abs(Array.from(normalized).reduce((sum, char) => sum + char.charCodeAt(0), 0)) % products.length;
  return Array.from({ length: count }, (_, index) => products[(start + index) % products.length]);
}

export function findAuthorEntry(id: string) {
  const normalized = normalizeRoutePart(id);
  return (
    directoryEntries.authors.find((entry) => normalizeRoutePart(entry.id) === normalized || entry.href.endsWith(`/${normalized}`)) ??
    authors.find((author) => normalizeRoutePart(author.id) === normalized || author.href.endsWith(`/${normalized}`))
  );
}

export function findPublisherEntry(id: string) {
  const normalized = normalizeRoutePart(id);
  return (
    directoryEntries.publishers.find((entry) => normalizeRoutePart(entry.id) === normalized || entry.href.endsWith(`/${normalized}`)) ??
    publishers.find((publisher) => normalizeRoutePart(publisher.id) === normalized || publisher.href.endsWith(`/${normalized}`))
  );
}

export function findCategoryTitle(slug: string) {
  const normalized = normalizeRoutePart(slug);
  const categories = [...subjectCategories, ...circularCategories];
  return categories.find((category) => category.href.endsWith(`/${normalized}`) || normalizeRoutePart(category.id) === normalized)?.title;
}

export function findProductSection(slug: string) {
  const normalized = normalizeRoutePart(slug);
  return productSections.find((section) => section.href.endsWith(`/${normalized}`) || normalizeRoutePart(section.id) === normalized);
}

export function findRankedList(slug: string) {
  const normalized = normalizeRoutePart(slug);
  return rankedLists.find((list) => list.href.endsWith(`/${normalized}`) || normalizeRoutePart(list.id) === normalized);
}

export function findCampaign(slug: string) {
  const normalized = normalizeRoutePart(slug);
  return Object.values(campaignPages).find((page) => page.href.endsWith(`/${normalized}`) || normalizeRoutePart(page.id) === normalized);
}
