# Content Publishing

Use this guide when creating, editing, importing, or publishing MakerJackie blog content.

## Source Of Truth

- Durable long-form posts live in `content/posts/*.mdx`.
- The CMS/D1 database is the production runtime layer for rendering, comments, RSS, search, exports, backups, and emergency edits.
- Do not treat the CMS editor as the durable source for article content. If a formal article needs a lasting edit, update the matching MDX file first, then sync it to the CMS.
- CMS admin edits are acceptable for small typo fixes, image management, comments, site settings, user/admin work, and urgent hotfixes. Backfill meaningful CMS-only content changes to `content/posts/*.mdx` afterwards.

## Publishing Flow

Run from the repository root:

```sh
cd /Users/jackiexiao/code/makerjackie/mj-blog
pnpm publish:mdx content/posts/my-post.mdx --draft
pnpm publish:mdx content/posts/my-post.mdx --publish
```

- The script upserts by `slug`: existing CMS posts are updated, missing CMS posts are created.
- The local API token is expected at `.tmp/makerjackie-blog-api-token.txt`, or pass `CMS_API_TOKEN` in the environment.
- Keep `.tmp` untracked; never commit API tokens, OAuth secrets, Cloudflare tokens, or generated credential material.

## Locale Rule

- The default `pnpm publish:mdx` path writes `--lang=en`, which means the CMS primary post fields used by `/blog/:slug`.
- This is still the correct default for Chinese MakerJackie posts because the public route reads primary fields.
- Use `--lang=zh` only when intentionally updating the Chinese i18n translation slot, not for normal Chinese-language publishing.

## MDX Compatibility

- The blog CMS stores Markdown/MDX-like content, but it is not a full React MDX runtime.
- Safe Markdown and supported raw image tags are fine.
- Complex React components, interactive docs, or reusable tutorial assets belong in the 01MVP docs/Fumadocs side, not inside MakerJackie blog posts.

## Drift Checks

For sync audits:

- Compare `content/posts/*.mdx` frontmatter slugs with production posts from `https://makerjackie.com/api/posts?status=all&lang=en` using the local CMS API token.
- Flag local MDX posts missing from CMS.
- Flag CMS posts without a matching MDX source file when they are durable MakerJackie articles.
- Flag CMS posts whose `contentMarkdown`, title, status, tags, or publish date diverge from the MDX frontmatter/body.
- Report drift first. Do not auto-publish, overwrite CMS content, or delete CMS posts unless the user explicitly asks for that action.
