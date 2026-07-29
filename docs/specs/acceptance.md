# Acceptance

## Architecture

- Every public article has exactly one source file under `content/posts/`.
- No article editor or article CRUD route is reachable.
- D1 has no article, taxonomy, asset, site-setting, or publishing-token tables after migration `0017_mdx_content_source.sql`.
- Existing comments retain their article relationship through `comments.post_slug`.
- Admin navigation contains only overview, comments, and users.

## Verification

- Generate the Fumadocs sources and confirm all article frontmatter compiles.
- Run `pnpm lint`.
- Run `pnpm build:web` because MDX compilation is a production build boundary.
- Apply migrations to an isolated local D1 and run `PRAGMA foreign_key_check`.
- Verify representative article, tag, series, RSS, sitemap, comments, login, admin comments, and admin users routes.
- Confirm anonymous article writes and retired CMS routes are absent, not merely hidden in the UI.
- Run `git diff --check`.

Production deployment and remote D1 migration are separate authorized actions; local acceptance does not imply either occurred.
