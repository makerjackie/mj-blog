import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "output/makerjackie-blog-import");
const postsPath = join(outputDir, "api-posts.json");
const tokenPath = join(process.cwd(), ".tmp/makerjackie-blog-api-token.txt");
const siteUrl = (process.env.CMS_PUBLIC_SITE_URL || "https://makerjackie.com").replace(/\/$/, "");
const maxAttempts = Number(process.env.CMS_IMPORT_MAX_ATTEMPTS || 4);
const readLang = process.env.CMS_IMPORT_READ_LANG || "zh";
const writeLang = process.env.CMS_IMPORT_WRITE_LANG || "en";

if (!existsSync(postsPath)) {
  throw new Error(`Missing generated posts file: ${postsPath}`);
}

if (!existsSync(tokenPath) && !process.env.CMS_API_TOKEN) {
  throw new Error(`Missing API token file: ${tokenPath}`);
}

const token = (process.env.CMS_API_TOKEN || readFileSync(tokenPath, "utf8")).trim();
const posts = JSON.parse(readFileSync(postsPath, "utf8"));

if (!Array.isArray(posts)) {
  throw new Error("api-posts.json must contain an array.");
}

const { postsBySlug, canReadPosts } = await fetchExistingPostsBySlug();

let created = 0;
let updated = 0;

for (const post of posts) {
  const existing = postsBySlug.get(post.slug);
  const payload = { ...post };
  delete payload.sourcePath;
  delete payload.locale;
  const { method, response } =
    existing || canReadPosts
      ? await writePost({
          method: existing ? "PATCH" : "POST",
          payload,
          slug: post.slug,
          target: existing?.id,
        })
      : await upsertPostWithoutReadScope(post.slug, payload);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${post.slug} failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  const importedPost = result.data;

  if (!importedPost?.slug) {
    throw new Error(`${method} ${post.slug} returned no post data.`);
  }

  postsBySlug.set(importedPost.slug, importedPost);

  if (method === "PATCH") {
    updated += 1;
  } else {
    created += 1;
  }

  console.log(`${method === "PATCH" ? "updated" : "created"} ${importedPost.slug}`);
}

console.log(`Imported ${posts.length} posts: ${created} created, ${updated} updated.`);

async function fetchExistingPostsBySlug() {
  const url = `${siteUrl}/api/posts?status=all&lang=${encodeURIComponent(readLang)}`;
  const response = await fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();

    if (response.status === 403 && text.includes("posts:read")) {
      console.warn("Token lacks posts:read; falling back to PATCH-by-slug upsert.");
      return { postsBySlug: new Map(), canReadPosts: false };
    }

    throw new Error(`GET ${url} failed: ${response.status} ${text}`);
  }

  const existingPosts = await response.json();

  return {
    postsBySlug: new Map(
      (existingPosts.data ?? [])
        .filter((post) => post?.slug && post?.id)
        .map((post) => [post.slug, post]),
    ),
    canReadPosts: true,
  };
}

async function upsertPostWithoutReadScope(slug, payload) {
  const patchResult = await writePost({
    method: "PATCH",
    payload,
    slug,
    target: slug,
  });

  if (patchResult.response.status !== 404) {
    return patchResult;
  }

  return writePost({
    method: "POST",
    payload,
    slug,
  });
}

async function writePost({ method, payload, slug, target }) {
  const url =
    method === "PATCH" && target
      ? `${siteUrl}/api/posts/${encodeURIComponent(target)}?lang=${encodeURIComponent(writeLang)}`
      : `${siteUrl}/api/posts?lang=${encodeURIComponent(writeLang)}`;
  const response = await fetchWithRetry(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return { method, response, slug };
}

async function fetchWithRetry(url, init = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, init);

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < maxAttempts) {
      await sleep(1000 * attempt);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
