# Content Publishing

Use this guide when creating, editing, or publishing MakerJackie articles.

## Source Of Truth

- `content/posts/*.mdx` is the only article source.
- The build compiles that collection directly for public article pages, lists, tags, series, feeds, sitemap, and read-only article metadata.
- Do not add article tables, article write APIs, an article editor, a database sync step, or a second article source.
- D1 is only for dynamic user data: comments, Better Auth identities and sessions, email preferences/subscriptions, notification delivery logs, broadcasts, and analytics.
- Site-wide editorial settings are code in `packages/core/src/demo-data.ts`.

## Publishing Flow

1. Create or edit a file in `content/posts/`.
2. Keep its `slug` stable after publication so D1 comments remain attached.
3. Run focused validation:

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
```

4. Commit and deploy the code. A production deployment is the publishing action; no CMS sync is involved.

## Article Contract

Every post must provide frontmatter accepted by `apps/web/source.config.ts`, including:

- `title`, `slug`, `excerpt`, `status`, and `publishedAt`
- optional `updatedAt`, `tags`, `series`, `coverImage`, SEO metadata, and display flags
- `commentsEnabled`, which defaults to `true`

Use one file per reader-facing language version. Link translations explicitly when useful.

## Compatibility

- Posts are real MDX and may use supported MDX components.
- Prefer durable Markdown for ordinary article content.
- Images should be repository-owned files or stable external URLs with verified usage rights.
- Do not restore R2 upload/import/export machinery solely for article media; add a repository-native asset path when the need is concrete.

## Drift Checks

The repository is authoritative. Check for duplicate slugs, invalid frontmatter, broken compilation, and D1 comments whose `post_slug` no longer exists in the content collection. Do not compare against or restore the retired D1 article tables.
