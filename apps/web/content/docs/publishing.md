---
title: Publishing
description: Choose the publishing method that matches your skill level.
---

# Publishing

This blog system offers multiple publishing methods for people with different technical backgrounds. Pick the one that fits you best.

## Quick Comparison

| Method            | Best for               | Analogy                                                  | Difficulty |
| ----------------- | ---------------------- | -------------------------------------------------------- | ---------- |
| Dashboard writing | No coding experience   | Like using WordPress or Medium                           | ⭐         |
| Obsidian + Git    | Some basic tech skills | Like writing in Word then uploading                      | ⭐⭐       |
| API automation    | Developers             | Like building an automated pipeline                      | ⭐⭐⭐     |
| Local MDX + API   | Git-based writers      | Like writing a file, then publishing it with one command | ⭐⭐⭐     |

---

## Path 1: Dashboard Writing (Zero Code)

**Write articles in your browser, just like any blogging platform.**

Log into your blog's admin panel, write your post with a visual editor, add images, and hit publish. What you see is what you get. No technical knowledge required.

**Choose this if:**

- You just want to focus on writing content
- You're comfortable working in a browser
- You don't want to touch any code or command line

> This is the simplest way to get started. You can be publishing within minutes.

---

## Path 2: Obsidian + Git (For Note-Taking Enthusiasts)

**Write on your own computer, then sync to your website.**

Use [Obsidian](https://obsidian.md) (a popular local note-taking app) to write articles on your computer, then sync them to your website using Git (a version control tool — think of it as a "time machine for files").

**Choose this if:**

- You prefer writing locally, without needing internet
- You already use Obsidian for your knowledge base
- You want your articles saved as files on your own computer

> There's a small learning curve, but the benefit is that your content always stays in your hands. See the [Obsidian workflow guide](./obsidian) for details.

---

## Path 3: API Automation (For Developers)

**Build an automated pipeline that publishes content for you.**

Use the API (Application Programming Interface) to automate your publishing workflow. For example: auto-sync from Notion, bulk import from other systems, or set up scheduled publishing with a script.

**Choose this if:**

- You can code, or your team has a developer
- You want to connect your publishing workflow with other tools
- You need bulk operations or scheduled publishing

> This is the most flexible method, but requires programming knowledge. Great for handing off to a technical teammate.

---

## Path 4: Local MDX + API (Files as Source, CMS as Runtime)

**Maintain articles like code.**

If you prefer writing long-form posts in local Markdown or MDX files, keep those files in `content/posts/` and publish them to the live CMS through the API. The CMS still handles rendering, comments, RSS, search, export, and backups; your local MDX files remain the long-term source.

Create an API token in the admin dashboard with at least `posts:read` and `posts:write`. Add `posts:publish` when the script should publish directly.

```sh
CMS_API_TOKEN=... pnpm publish:mdx content/posts/my-post.mdx --draft
CMS_API_TOKEN=... pnpm publish:mdx content/posts/my-post.mdx --publish
```

By default, the script writes the primary post fields used by `makerjackie.com/blog/:slug`. Even if the article text is Chinese, do not add `--lang=zh` for normal publishing; use `--lang=zh` only when maintaining a Chinese i18n translation slot.

The script uses the post `slug` to find an existing CMS post. If it exists, the script updates it; otherwise, it creates a new post. Keep stable fields in frontmatter:

```mdx
---
title: Post title
slug: article-slug
status: draft
date: 2026-06-30
tags:
  - AI
  - Indie Dev
---
```

Use the dashboard for quick edits, image management, comment moderation, and site settings. For durable long-form edits, update the local MDX file in `content/posts/` and sync it again.

---

## Not Sure Which to Pick?

**Start with dashboard writing.** Once you're familiar with the blog system, you can upgrade to other methods as needed. All three methods can be mixed and matched — they don't conflict.
