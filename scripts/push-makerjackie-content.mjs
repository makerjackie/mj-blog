import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "output/makerjackie-blog-import");
const postsPath = join(outputDir, "api-posts.json");
const tokenPath = join(process.cwd(), ".tmp/makerjackie-blog-api-token.txt");
const siteUrl = (process.env.CMS_PUBLIC_SITE_URL || "https://new.makerjackie.com").replace(
  /\/$/,
  "",
);
const maxAttempts = Number(process.env.CMS_IMPORT_MAX_ATTEMPTS || 4);

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

const existingPosts = await fetchJson(`${siteUrl}/api/posts?status=all&lang=zh`);
const postsBySlug = new Map(
  (existingPosts.data ?? [])
    .filter((post) => post?.slug && post?.id)
    .map((post) => [post.slug, post]),
);

let created = 0;
let updated = 0;

for (const post of posts) {
  const existing = postsBySlug.get(post.slug);
  const payload = { ...post };
  delete payload.sourcePath;
  const url = existing
    ? `${siteUrl}/api/posts/${encodeURIComponent(existing.id)}?lang=zh`
    : `${siteUrl}/api/posts?lang=zh`;
  const method = existing ? "PATCH" : "POST";
  const response = await fetchWithRetry(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

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

  if (existing) {
    updated += 1;
  } else {
    created += 1;
  }

  console.log(`${existing ? "updated" : "created"} ${importedPost.slug}`);
}

console.log(`Imported ${posts.length} posts: ${created} created, ${updated} updated.`);

async function fetchJson(url) {
  const response = await fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET ${url} failed: ${response.status} ${text}`);
  }

  return response.json();
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
