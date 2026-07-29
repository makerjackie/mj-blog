# Architecture

01mvp-blog-starter is a code-first TanStack Start application deployed to Cloudflare Workers.

## Content Boundary

- `content/posts/*.mdx` is the only article source.
- Fumadocs MDX compiles post frontmatter, the renderable body, and table-of-contents metadata at build time.
- Public pages, tags, series, RSS, sitemap, search, and the read-only article API all consume that compiled collection.
- Site-wide editorial configuration is code in `packages/core/src/demo-data.ts`.
- Publishing means deploying a commit. There is no article table, editor, import/export pipeline, article token, or article write API.

## Runtime Boundary

- `apps/web`: TanStack Start public site, user-data admin, feeds, and server routes.
- `packages/core`: shared domain types, static site configuration, localization, and moderation helpers.
- `packages/db`: Drizzle schema and D1 migrations for dynamic data.
- `packages/ui`: shared UI primitives.
- `skills/01mvp-blog`: code-first setup and maintenance workflow.

Cloudflare responsibilities:

- Workers serve the application.
- D1 stores comments, Better Auth identities and sessions, subscription preferences, broadcasts, delivery logs, and analytics.
- KV stores short-lived records such as rate limits and password reset state.
- Email Sending or Resend is optional for password reset, comment reply, and subscription mail.

## Referential Model

Comments store `post_slug`, not a foreign key to an article row. Public comment creation verifies that the slug exists in the compiled content collection and that comments are enabled. A published slug therefore forms a durable external identifier and should not be changed casually.

## Public And Admin Surfaces

- Public: home, blog, post detail, tags, series, about, docs, RSS/feed, sitemap, robots, and OpenAPI.
- Admin: overview, comment moderation, and user/subscription management.
- Better Auth browser sessions protect admin operations.
- `/api/posts` is read-only metadata and requires an admin session; article bodies are served through the public pages.

## Internationalization

Paraglide handles UI messages. Article language is represented by the article itself: keep separate MDX files/slugs for distinct reader-facing language versions and link them explicitly where useful.
