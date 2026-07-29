---
title: Publishing
description: Write an MDX file, review it, and deploy the code.
---

# Publishing

`content/posts/*.mdx` is the only article source. The production build reads it directly; there is no upload or CMS sync step.

## Create A Post

Add a file with frontmatter:

```mdx
---
title: "My article"
slug: "my-article"
excerpt: "A short description."
status: "draft"
publishedAt: "2026-07-29T09:00:00.000Z"
authorName: "Jackie"
featured: false
pinned: false
commentsEnabled: true
tags:
  - "Notes"
---

# My article

Write with Markdown or supported MDX components.
```

Use `draft` while preparing the article and `published` when it should appear publicly. Scheduled posts become visible after `publishedAt`.

## Validate And Publish

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
pnpm deploy:web
```

The deployment is the publish action. Keep `slug` stable after publication so existing comments remain associated.

## Images

Prefer repository-owned public assets or stable external images with verified usage rights. Reference the final URL from MDX. The blog does not maintain an R2 upload library or browser media manager.
