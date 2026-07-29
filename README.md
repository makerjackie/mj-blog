# 01mvp-blog-starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/01MVP/blog-starter)

[中文 README](./README.zh-CN.md)

A code-first personal blog for Cloudflare. Articles and product documentation live in Git; D1 stores only dynamic user data.

## Content Model

- `content/posts/*.mdx` is the only source for blog articles.
- `apps/web/content/docs/*.md` is the source for product documentation.
- The build compiles both collections directly into the TanStack Start application.
- D1 stores comments, users, sessions, subscriptions, notification records, broadcasts, and analytics.
- The admin area manages comments and users. It does not contain an article editor.

To publish an article, add or edit an MDX file, commit it, and deploy:

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
pnpm deploy:web
```

Keep a published article's `slug` stable because comments reference that slug.

## Stack

- TanStack Start + TanStack Router
- React 19 + React Compiler
- Tailwind CSS + shadcn/ui
- Fumadocs MDX collections for posts and docs
- Paraglide.js for English and Chinese UI messages
- Cloudflare Workers
- Cloudflare D1 for dynamic user data
- Cloudflare KV for short-lived auth and rate-limit records

## Local Development

```sh
pnpm install
pnpm dev:web
```

The app runs at `http://localhost:3000`.

Seed a local admin account:

```sh
pnpm db:seed:local-admin
```

Default local credentials:

```txt
email: a@a.test
password: 1
```

## Deployment

Before the first deploy, configure the D1 database and KV namespace in `apps/web/wrangler.jsonc`, then set `BETTER_AUTH_SECRET`. GitHub and Google OAuth credentials are optional.

```sh
pnpm deploy:web
```

The deploy script builds the code-managed articles, applies remote D1 migrations for dynamic data, and deploys the Worker. Pushing to GitHub alone does not deploy production.

## Workspace

```txt
apps/web                 TanStack Start app, public site, user-data admin, docs, APIs
content/posts            canonical MDX article source
packages/core            shared types, static site configuration, and helpers
packages/db              dynamic-data Drizzle schema and D1 migrations
packages/ui              shared UI primitives
skills/01mvp-blog        code-first initialization and maintenance Skill
apps/web/content/docs    public product documentation source
docs/specs               architecture and operational specifications
```

For article conventions, see [Content publishing](./.agents/content-publishing.md). Public documentation starts at [AI Setup](./apps/web/content/docs/ai-setup.md).

## License

MIT. See [LICENSE](./LICENSE).
