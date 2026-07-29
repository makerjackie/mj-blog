---
title: Content Systems
description: How blog articles, documentation, and reader data stay separate.
---

## Three Clear Boundaries

| Area           | Source                       | Changes become live     |
| -------------- | ---------------------------- | ----------------------- |
| Blog (`/blog`) | `content/posts/*.mdx`        | after a code deployment |
| Docs (`/docs`) | `apps/web/content/docs/*.md` | after a code deployment |
| Reader data    | Cloudflare D1                | at runtime              |

Articles and docs are both repository content, but they use separate collections because they have different navigation and presentation. D1 is not a content system; it stores only state created by readers or operations.

## Why This Model

- one durable copy of every article
- normal code review and rollback
- no MDX-to-CMS synchronization
- no stale database article after a file changes
- comments survive deployments because they reference a stable article slug

If an article slug must change, plan a comment-slug data migration in the same release.
