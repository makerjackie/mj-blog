import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const defaultSourceRoot = "/Users/jackiexiao/code/makerjackie/makerjackie.com";
const sourceRoot = process.argv[2] || defaultSourceRoot;
const sourceBlogDir = join(sourceRoot, "content/blog");
const outputDir = join(process.cwd(), "output/makerjackie-blog-import");
const tmpDir = join(process.cwd(), ".tmp");
const generatedAt = new Date().toISOString();

if (!existsSync(sourceBlogDir)) {
  throw new Error(`Missing source blog directory: ${sourceBlogDir}`);
}

mkdirSync(outputDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const files = readdirSync(sourceBlogDir)
  .filter((file) => file.endsWith(".mdx") && file !== "index.mdx")
  .sort();

const posts = files.map((file) => {
  const sourcePath = `content/blog/${file}`;
  const raw = readFileSync(join(sourceBlogDir, file), "utf8");
  const parsed = parseFrontmatter(raw);
  const slug = slugify(basename(file, ".mdx"));
  const title = readString(parsed.frontmatter.title) || titleFromSlug(slug);
  const markdown = normalizeMarkdown(parsed.content, title);
  const contentHtml = renderMarkdownToHtml(markdown);
  const contentText = markdownToText(markdown);
  const excerpt =
    readString(parsed.frontmatter.description) || contentText.slice(0, 180).trim() || title;
  const publishedAt = normalizeDate(
    readString(parsed.frontmatter.date) || dateFromFilename(file) || generatedAt,
  );
  const tags = readStringList(parsed.frontmatter.tags);

  return {
    id: `post_${hash(slug).slice(0, 20)}`,
    title,
    slug,
    excerpt,
    coverImage: firstMarkdownImage(markdown),
    contentMarkdown: markdown,
    contentHtml,
    contentText,
    featured: readBoolean(parsed.frontmatter.featured),
    pinned: false,
    publishedAt,
    updatedAt: generatedAt,
    sourcePath,
    tags,
  };
});

const tagMap = new Map();
for (const post of posts) {
  for (const tagName of post.tags) {
    const slug = slugify(tagName);

    if (!slug || tagMap.has(slug)) {
      continue;
    }

    tagMap.set(slug, {
      id: `tag_${hash(slug).slice(0, 20)}`,
      name: tagName,
      slug,
    });
  }
}

const siteSettings = {
  name: "MakerJackie",
  description: "记录 AI 产品、独立开发、自媒体和长期思考。",
  url: "https://new.makerjackie.com",
  authorName: "Jackie",
  authorBio: "独立开发者，前 AI 算法工程师，周周黑客松发起人。",
  avatarUrl: "/jackie-avatar.jpg",
  defaultOgImage: "/og-default.svg",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/makerjackie" },
    { label: "X", href: "https://x.com/makerjackie" },
    { label: "RSS", href: "/rss.xml" },
  ],
  navigation: [
    { label: "Articles", href: "/blog", i18n: { label: { zh: "文章" } } },
    { label: "Tags", href: "/tags", i18n: { label: { zh: "标签" } } },
    {
      label: "Projects",
      href: "/projects",
      i18n: { label: { zh: "项目" } },
    },
    { label: "About", href: "/about", i18n: { label: { zh: "关于" } } },
  ],
  rssEnabled: true,
  commentsEnabled: true,
  commentsRequireApproval: true,
  commentAutoBlockEnabled: true,
  commentBlockedKeywords: ["博彩", "赌博", "色情", "诈骗", "辱骂", "violence", "scam", "spam"],
  aiCommentModerationEnabled: false,
  aiCommentModerationRules:
    "判断这条博客评论是否适合公开展示。拦截广告、诈骗、钓鱼、辱骂、仇恨、色情、暴力威胁、隐私泄露、无意义灌水和明显 SEO 外链。普通反对意见、批评、提问、纠错、补充信息应该允许。",
  emailVerificationEnabled: false,
  emailNotificationsEnabled: false,
  manualEmailBroadcastsEnabled: false,
  indexingEnabled: true,
  themePreset: "maker",
  layoutPreset: "shelf",
  locales: ["en", "zh"],
  primaryLanguage: "zh",
  i18n: {
    name: { zh: "MakerJackie" },
    description: { zh: "记录 AI 产品、独立开发、自媒体和长期思考。" },
    authorBio: { zh: "独立开发者，前 AI 算法工程师，周周黑客松发起人。" },
  },
};

const apiTokenSecret = `blogcms_${randomUUID().replaceAll("-", "")}`;
const apiTokenHash = hash(apiTokenSecret);
const apiTokenId = "token_makerjackie_import";
const apiTokenScopes = ["posts:read", "posts:write", "posts:publish", "site:read", "site:write"];
const setupSql = [
  "PRAGMA foreign_keys = ON;",
  "",
  "INSERT INTO site_settings (key, value, updated_at)",
  `VALUES ('site', ${sqlString(JSON.stringify(siteSettings))}, ${sqlString(generatedAt)})`,
  "ON CONFLICT(key) DO UPDATE SET",
  "  value = excluded.value,",
  "  updated_at = excluded.updated_at;",
  "",
  "INSERT INTO api_tokens (id, name, token_hash, scopes, expires_at, last_used_at, revoked_at, created_at)",
  `VALUES (${sqlString(apiTokenId)}, 'MakerJackie import', ${sqlString(apiTokenHash)}, ${sqlString(
    JSON.stringify(apiTokenScopes),
  )}, NULL, NULL, NULL, ${sqlString(generatedAt)})`,
  "ON CONFLICT(id) DO UPDATE SET",
  "  token_hash = excluded.token_hash,",
  "  scopes = excluded.scopes,",
  "  revoked_at = NULL,",
  "  created_at = excluded.created_at;",
  "",
].join("\n");

const apiPosts = posts.map((post) => ({
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  coverImage: post.coverImage,
  contentMarkdown: post.contentMarkdown,
  status: "published",
  featured: post.featured,
  pinned: post.pinned,
  commentsEnabled: true,
  seoTitle: post.title,
  seoDescription: post.excerpt,
  tags: post.tags,
  publishedAt: post.publishedAt,
  locale: "zh",
  sourcePath: post.sourcePath,
}));

const manifest = {
  generatedAt,
  sourceRoot,
  postCount: posts.length,
  tagCount: tagMap.size,
  posts: posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    sourcePath: post.sourcePath,
    tagCount: post.tags.length,
  })),
};

writeFileSync(join(outputDir, "site-settings.sql"), setupSql);
writeFileSync(join(outputDir, "api-posts.json"), `${JSON.stringify(apiPosts, null, 2)}\n`);
writeFileSync(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(join(tmpDir, "makerjackie-blog-api-token.txt"), `${apiTokenSecret}\n`, {
  mode: 0o600,
});

console.log(`Generated ${posts.length} posts and ${tagMap.size} tags.`);
console.log(join(outputDir, "site-settings.sql"));
console.log(join(outputDir, "api-posts.json"));
console.log(join(tmpDir, "makerjackie-blog-api-token.txt"));

function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return { frontmatter: {}, content: normalized };
  }

  const end = normalized.indexOf("\n---", 4);

  if (end === -1) {
    return { frontmatter: {}, content: normalized };
  }

  return {
    frontmatter: parseYamlLike(normalized.slice(4, end)),
    content: normalized.slice(end + 4).trim(),
  };
}

function parseYamlLike(value) {
  const output = {};

  for (const line of value.split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());

    if (!match) {
      continue;
    }

    output[match[1]] = match[2].trim();
  }

  return output;
}

function readString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return stripQuotes(String(value).trim());
}

function readStringList(value) {
  const raw = readString(value);

  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  return raw
    .split(",")
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean);
}

function readBoolean(value) {
  return readString(value).toLowerCase() === "true";
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value
      .slice(1, -1)
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'")
      .replaceAll("\\\\", "\\");
  }

  return value;
}

function normalizeMarkdown(markdown, title) {
  const lines = markdown.replace(/\r\n/g, "\n").trim().split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim());

  if (firstContentIndex >= 0) {
    const headingMatch = /^#\s+(.+)$/.exec(lines[firstContentIndex].trim());

    if (headingMatch && looseEqual(headingMatch[1], title)) {
      lines.splice(firstContentIndex, 1);
    }
  }

  return lines.join("\n").trim();
}

function looseEqual(left, right) {
  return (
    stripInlineMarkdown(left).replace(/\s+/g, "") === stripInlineMarkdown(right).replace(/\s+/g, "")
  );
}

function renderMarkdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listItems = [];
  let listTag = "";
  let codeLines = [];
  let inCodeBlock = false;

  const flushList = () => {
    if (!listItems.length || !listTag) {
      return;
    }

    html.push(`<${listTag}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listTag}>`);
    listItems = [];
    listTag = "";
  };

  const pushListItem = (tag, item) => {
    if (listTag && listTag !== tag) {
      flushList();
    }

    listTag = tag;
    listItems.push(item);
  };

  const flushCode = () => {
    if (!inCodeBlock) {
      return;
    }

    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
    inCodeBlock = false;
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushList();
      html.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      pushListItem("ul", inlineMarkdown(trimmed.replace(/^[-*]\s+/, "")));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      pushListItem("ol", inlineMarkdown(trimmed.replace(/^\d+\.\s+/, "")));
      continue;
    }

    flushList();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  flushList();
  flushCode();

  return html.join("");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(
      /(?<!!)\[([^\]]+)]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
      '<a href="$2" rel="noreferrer">$1</a>',
    );
}

function markdownToText(markdown) {
  return stripInlineMarkdown(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripInlineMarkdown(value) {
  return value.replace(/[#>*_`~-]+/g, " ").trim();
}

function firstMarkdownImage(markdown) {
  const match = /!\[[^\]]*]\((https?:\/\/[^)\s]+|\/[^)\s]+)(?:\s+"[^"]*")?\)/.exec(markdown);

  return match?.[1] ?? "";
}

function dateFromFilename(file) {
  return /^\d{4}-\d{2}-\d{2}/.exec(file)?.[0] ?? "";
}

function normalizeDate(value) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T09:00:00+08:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return generatedAt;
  }

  return date.toISOString();
}

function titleFromSlug(slug) {
  return slug.replace(/-/g, " ");
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
