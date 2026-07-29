---
name: 01mvp-blog
description: Create, deploy, verify, or maintain a code-first 01mvp-blog-starter site on Cloudflare. Use for repository setup, MDX article publishing, Cloudflare Worker/D1/KV provisioning, authentication, comments, subscriptions, and production verification.
---

# 01mvp-blog

Maintain one article source: `content/posts/*.mdx`. Never create an article CMS, article database table, browser article editor, article write API, sync pipeline, publishing token, or R2 dependency unless the user explicitly changes the product boundary.

## Dependencies

Use available Cloudflare and GitHub capabilities for account, resource, DNS, repository, and deployment work. Ask the user only for account-owner actions such as login, domain ownership, nameserver changes, OAuth app creation, or secret authorization.

## Inputs

Collect only missing values:

- project and blog name
- description and author
- primary UI language (`en` or `zh`)
- domain or `*.workers.dev`
- theme/layout choices
- comments and optional email preferences

For maintenance, inspect the repository and current deployment before requesting values already available there.

## Create Or Configure

1. Run `scripts/check-prereqs.sh`.
2. Create or clone the repository.
3. Update static site configuration in `packages/core/src/demo-data.ts`.
4. Keep English and Chinese Paraglide UI messages enabled.
5. Create or select:
   - one Cloudflare Worker
   - one D1 database for comments, Better Auth data, subscriptions, notifications, and analytics
   - one KV namespace for short-lived state
6. Configure Worker variables and secrets. Do not store secrets in D1 or the repository.
7. Apply D1 migrations.
8. Copy `examples/first-post.md` into `content/posts/`, personalize it, and keep its frontmatter valid.
9. Generate MDX sources, lint, and build.
10. Deploy the Worker and bind the requested domain.
11. Create the first administrator.
12. When comments are enabled, create a reader, submit a comment to the MDX post, and approve it from the admin flow.
13. Verify against `checklists/acceptance.md`.
14. Record material actions and evidence using `examples/execution-log.md`.

## Maintain

- Articles: edit `content/posts/*.mdx`, validate, commit, and deploy.
- Site copy/configuration: edit repository configuration and deploy.
- Comments/users/subscriptions: use authenticated runtime/admin APIs described by `/openapi.json`.
- Database changes: update the Drizzle schema and add a forward migration; verify locally before remote application.
- Backups: back up code through Git and dynamic D1 data through Cloudflare operational tooling. Keep them separate.

Never treat a production deployment or remote migration as implied by a content edit. Perform those actions only when authorized.

## Article Contract

- Use one MDX file per reader-facing language version.
- Keep a published `slug` stable because comments reference `post_slug`.
- Use `draft`, `published`, `scheduled`, or `archived` status.
- Verify image rights and use repository-owned assets or stable final URLs.
- Run:

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
```

## Verification

Verify representative public pages, article rendering, tags/series, RSS, sitemap, robots, OpenAPI, login, comment creation/moderation, subscription preferences, and admin authorization. Confirm retired article-management routes are absent rather than merely hidden.
