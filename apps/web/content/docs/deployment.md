---
title: Deployment
description: Build the MDX content and deploy the blog to Cloudflare.
---

## Cloudflare Resources

The application needs:

- one Worker
- one D1 database for dynamic user data
- one KV namespace for short-lived state
- `BETTER_AUTH_SECRET`

OAuth and outbound email are optional. R2 is not required by the current architecture.

## Deploy

Configure `apps/web/wrangler.jsonc`, then run:

```sh
pnpm deploy:web
```

The command:

1. compiles articles and product documentation
2. builds the TanStack Start Worker bundle
3. applies remote D1 migrations
4. deploys the Worker

Remote migration changes production data, so review pending migrations before deploying.

## Publishing An Article

Every production deployment includes the current `content/posts/*.mdx` collection. There is no separate article publish command or remote CMS sync.

## Local Checks

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
```

After deployment, verify a representative article, comments, login, `/admin/comments`, `/admin/users`, RSS, sitemap, robots, and `/openapi.json`.
