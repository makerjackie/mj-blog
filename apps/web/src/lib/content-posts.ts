import "@tanstack/react-start/server-only";
import { slugify, type Post, type Series, type Tag } from "@repo/core";
import { posts as postEntries } from "collections/server";

export type ListContentPostsOptions = {
  featured?: boolean;
  includeUnpublished?: boolean;
  limit?: number;
  offset?: number;
  query?: string;
  seriesSlug?: string;
  tagSlug?: string;
};

const contentPosts = postEntries.map(toPost).sort(comparePosts);
const contentPathsBySlug = new Map(
  postEntries.map((entry) => [entry.slug, entry.info.path] as const),
);
const contentTocBySlug = new Map(
  postEntries.map((entry) => [
    entry.slug,
    entry.toc
      .filter((item) => item.depth === 2 || item.depth === 3)
      .map((item) => ({
        id: item.url.replace(/^#/, ""),
        level: item.depth === 3 ? (3 as const) : (2 as const),
        text: typeof item.title === "string" ? item.title : "",
      })),
  ]),
);

export function listContentPosts({
  featured,
  includeUnpublished = false,
  limit,
  offset = 0,
  query = "",
  seriesSlug,
  tagSlug,
}: ListContentPostsOptions = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const normalizedOffset = Math.max(0, Math.floor(offset));
  const normalizedLimit =
    limit === undefined ? undefined : Math.min(Math.max(1, Math.floor(limit)), 100);
  const filteredPosts = contentPosts.filter((post) => {
    if (!includeUnpublished && !isPublished(post)) {
      return false;
    }

    if (featured !== undefined && post.featured !== featured) {
      return false;
    }

    if (seriesSlug && post.series?.slug !== seriesSlug) {
      return false;
    }

    if (tagSlug && !post.tags.some((tag) => tag.slug === tagSlug)) {
      return false;
    }

    if (normalizedQuery && !searchablePostText(post).includes(normalizedQuery)) {
      return false;
    }

    return true;
  });

  return normalizedLimit === undefined
    ? filteredPosts.slice(normalizedOffset)
    : filteredPosts.slice(normalizedOffset, normalizedOffset + normalizedLimit);
}

export function countContentPosts(options: ListContentPostsOptions = {}) {
  return listContentPosts({ ...options, limit: undefined, offset: 0 }).length;
}

export function getContentPostBySlug(slug: string, includeUnpublished = false) {
  const post = contentPosts.find((candidate) => candidate.slug === slug);

  if (!post || (!includeUnpublished && !isPublished(post))) {
    return undefined;
  }

  return post;
}

export function getContentPostPath(slug: string) {
  return contentPathsBySlug.get(slug);
}

export function getContentPostToc(slug: string) {
  return contentTocBySlug.get(slug) ?? [];
}

export function listContentTags() {
  const tagsBySlug = new Map<string, Tag>();

  for (const post of listContentPosts()) {
    for (const tag of post.tags) {
      tagsBySlug.set(tag.slug, tag);
    }
  }

  return Array.from(tagsBySlug.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export function listContentSeries() {
  const seriesBySlug = new Map<string, Series>();

  for (const post of listContentPosts()) {
    if (post.series) {
      seriesBySlug.set(post.series.slug, post.series);
    }
  }

  return Array.from(seriesBySlug.values()).sort(
    (first, second) => first.sortOrder - second.sortOrder || first.name.localeCompare(second.name),
  );
}

function toPost(entry: (typeof postEntries)[number]): Post {
  const publishedAt = normalizeDate(entry.publishedAt);
  const updatedAt = normalizeDate(entry.updatedAt || entry.publishedAt);
  const tags = Array.from(new Set(entry.tags.map((tag) => tag.trim()).filter(Boolean))).map(
    (name) => {
      const slug = slugify(name);

      return {
        id: `tag:${slug}`,
        name,
        slug,
        description: "",
      };
    },
  );
  const series = entry.series
    ? {
        id: `series:${entry.series.slug || slugify(entry.series.name)}`,
        name: entry.series.name,
        slug: entry.series.slug || slugify(entry.series.name),
        description: entry.series.description || "",
        sortOrder: entry.series.sortOrder ?? 0,
      }
    : null;

  return {
    id: `post:${entry.slug}`,
    title: entry.title,
    slug: entry.slug,
    excerpt: entry.excerpt,
    coverImage: entry.coverImage || "",
    status: entry.status,
    featured: entry.featured,
    pinned: entry.pinned,
    commentsEnabled: entry.commentsEnabled,
    publishedAt,
    updatedAt,
    authorName: entry.authorName || "Jackie",
    series,
    tags,
    seoTitle: entry.seoTitle || entry.title,
    seoDescription: entry.seoDescription || entry.excerpt,
  };
}

function isPublished(post: Post) {
  return (
    post.status === "published" ||
    (post.status === "scheduled" && new Date(post.publishedAt).getTime() <= Date.now())
  );
}

function comparePosts(first: Post, second: Post) {
  return (
    Number(second.pinned) - Number(first.pinned) ||
    second.publishedAt.localeCompare(first.publishedAt) ||
    second.updatedAt.localeCompare(first.updatedAt)
  );
}

function searchablePostText(post: Post) {
  return [
    post.title,
    post.slug,
    post.excerpt,
    post.series?.name,
    ...post.tags.flatMap((tag) => [tag.name, tag.slug]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function normalizeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid post date: ${value}`);
  }

  return date.toISOString();
}
