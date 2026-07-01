import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const tokenPath = join(process.cwd(), ".tmp/makerjackie-blog-api-token.txt");
const defaultSiteUrl = "https://makerjackie.com";
const maxAttempts = Number(process.env.CMS_IMPORT_MAX_ATTEMPTS || 4);
const allowedStatuses = new Set(["draft", "published", "scheduled", "archived"]);

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printUsage();
  process.exit(0);
}

if (!options.files.length) {
  printUsage();
  process.exit(1);
}

const siteUrl = (options.siteUrl || process.env.CMS_PUBLIC_SITE_URL || defaultSiteUrl).replace(
  /\/$/,
  "",
);
const token = options.dryRun ? "" : readToken();
const postsBySlug = options.dryRun ? new Map() : await fetchExistingPosts();

for (const file of options.files) {
  const post = buildPostPayload(file, options);
  const postSlug = String(post.slug);
  const postTitle = String(post.title);
  const postStatus = String(post.status);
  const postMarkdown = String(post.contentMarkdown);

  if (options.dryRun) {
    console.log(`dry-run ${postSlug}: ${postTitle} (${postStatus}, ${postMarkdown.length} chars)`);
    continue;
  }

  const existing = postsBySlug.get(postSlug);
  const url = existing
    ? `${siteUrl}/api/posts/${encodeURIComponent(existing.id)}?lang=${options.locale}`
    : `${siteUrl}/api/posts?lang=${options.locale}`;
  const method = existing ? "PATCH" : "POST";

  const response = await fetchWithRetry(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${postSlug} failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  const savedPost = result.data;

  if (!savedPost?.slug || !savedPost?.id) {
    throw new Error(`${method} ${postSlug} returned no post data.`);
  }

  postsBySlug.set(savedPost.slug, savedPost);
  console.log(`${existing ? "updated" : "created"} ${savedPost.slug} ${savedPost.url ?? ""}`);
}

async function fetchExistingPosts() {
  const response = await fetchWithRetry(`${siteUrl}/api/posts?status=all&lang=${options.locale}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET existing posts failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  return new Map(
    (result.data ?? []).filter((post) => post?.slug && post?.id).map((post) => [post.slug, post]),
  );
}

function buildPostPayload(file, parsedOptions) {
  if (!existsSync(file)) {
    throw new Error(`Missing MDX file: ${file}`);
  }

  const raw = readFileSync(file, "utf8");
  const { metadata, content } = parseFrontmatter(raw);
  const title =
    stringValue(metadata, ["title"]) ?? firstMarkdownHeading(content) ?? titleFromFile(file);
  const slug = stringValue(metadata, ["slug"]) ?? slugify(titleFromFile(file));
  const excerpt = stringValue(metadata, ["excerpt", "description"]);
  const status = normalizeStatus(parsedOptions.status ?? stringValue(metadata, ["status"]));
  const publishedAt = stringValue(metadata, ["publishedAt", "published_at", "date"]);
  const tags = tagsValue(metadata, ["tags", "tag"]);

  return cleanObject({
    title,
    slug,
    excerpt,
    coverImage: stringValue(metadata, ["coverImage", "cover_image", "image", "ogImage"]),
    contentMarkdown: content.trim(),
    status,
    source: "cli",
    featured: booleanValue(metadata, ["featured"]),
    pinned: booleanValue(metadata, ["pinned"]),
    commentsEnabled: booleanValue(metadata, ["commentsEnabled", "comments_enabled"]),
    seoTitle: stringValue(metadata, ["seoTitle", "seo_title"]),
    seoDescription: stringValue(metadata, ["seoDescription", "seo_description"]) ?? excerpt,
    tags,
    seriesSlug: stringValue(metadata, ["seriesSlug", "series_slug"]),
    seriesName: stringValue(metadata, ["series", "collection"]),
    publishedAt,
    locale: parsedOptions.locale,
  });
}

function parseArgs(args) {
  const parsed = {
    dryRun: false,
    files: [],
    help: false,
    locale: "en",
    siteUrl: undefined,
    status: undefined,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--publish") {
      parsed.status = "published";
      continue;
    }

    if (arg === "--draft") {
      parsed.status = "draft";
      continue;
    }

    if (arg.startsWith("--status=")) {
      const status = arg.slice("--status=".length);

      if (!allowedStatuses.has(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      parsed.status = status;
      continue;
    }

    if (arg.startsWith("--site-url=")) {
      parsed.siteUrl = arg.slice("--site-url=".length);
      continue;
    }

    if (arg.startsWith("--lang=") || arg.startsWith("--locale=")) {
      const locale = arg.slice(arg.indexOf("=") + 1);

      if (locale !== "zh" && locale !== "en") {
        throw new Error(`Invalid locale: ${locale}`);
      }

      parsed.locale = locale;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    parsed.files.push(arg);
  }

  return parsed;
}

function readToken() {
  const envToken = process.env.CMS_API_TOKEN?.trim();

  if (envToken) {
    return envToken;
  }

  if (!existsSync(tokenPath)) {
    throw new Error(`Missing API token. Set CMS_API_TOKEN or create ${tokenPath}`);
  }

  return readFileSync(tokenPath, "utf8").trim();
}

function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return { metadata: {}, content: normalized };
  }

  const end = normalized.indexOf("\n---\n", 4);

  if (end === -1) {
    return { metadata: {}, content: normalized };
  }

  return {
    metadata: parseSimpleYaml(normalized.slice(4, end)),
    content: normalized.slice(end + 5).trimStart(),
  };
}

function parseSimpleYaml(input) {
  const metadata = {};
  let currentListKey = null;

  for (const rawLine of input.split("\n")) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const listItem = /^-\s+(.+)$/.exec(line);

    if (listItem && currentListKey) {
      metadata[currentListKey] = [
        ...(Array.isArray(metadata[currentListKey]) ? metadata[currentListKey] : []),
        cleanYamlValue(listItem[1]),
      ];
      continue;
    }

    const pair = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);

    if (!pair) {
      currentListKey = null;
      continue;
    }

    const [, key, value] = pair;

    if (!value) {
      metadata[key] = [];
      currentListKey = key;
      continue;
    }

    currentListKey = null;
    metadata[key] = parseYamlValue(value);
  }

  return metadata;
}

function parseYamlValue(value) {
  const trimmed = value.trim();

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === "true";
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => cleanYamlValue(item))
      .filter(Boolean);
  }

  return cleanYamlValue(trimmed);
}

function cleanYamlValue(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function stringValue(metadata, keys) {
  for (const key of keys) {
    const value = metadata[key];

    if (Array.isArray(value)) {
      const first = value.find(Boolean);
      return first ? String(first).trim() : undefined;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "boolean") {
      return String(value);
    }
  }

  return undefined;
}

function booleanValue(metadata, keys) {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string" && /^(true|false)$/i.test(value)) {
      return value.toLowerCase() === "true";
    }
  }

  return undefined;
}

function tagsValue(metadata, keys) {
  for (const key of keys) {
    const value = metadata[key];

    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return undefined;
}

function normalizeStatus(value) {
  return allowedStatuses.has(value) ? value : "draft";
}

function firstMarkdownHeading(markdown) {
  return markdown
    .split("\n")
    .find((line) => line.startsWith("# "))
    ?.replace(/^#\s+/, "")
    .trim();
}

function titleFromFile(file) {
  return basename(file)
    .replace(/\.(mdx?|markdown)$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "post";
}

function cleanObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) {
        return false;
      }

      if (Array.isArray(entry)) {
        return entry.length > 0;
      }

      return entry !== "";
    }),
  );
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

function printUsage() {
  console.error(`Usage:
  node scripts/publish-mdx-post.mjs <file.mdx> [more.mdx] [--publish|--draft|--status=scheduled] [--lang=en|zh] [--site-url=https://makerjackie.com]

Environment:
  CMS_API_TOKEN              Bearer token with posts:read and posts:write.
  CMS_PUBLIC_SITE_URL        Defaults to https://makerjackie.com.

Notes:
  The default --lang=en writes the public primary post fields used by /blog/:slug.
  Use --lang=zh only when updating the Chinese i18n translation slot.

Examples:
  node scripts/publish-mdx-post.mjs drafts/my-post.mdx --dry-run
  CMS_API_TOKEN=... node scripts/publish-mdx-post.mjs drafts/my-post.mdx --publish
`);
}
