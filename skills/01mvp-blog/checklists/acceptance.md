# Generated Site Acceptance Checklist

- `content/posts/*.mdx` is the only article source.
- MDX source generation, lint, and production build pass.
- Public homepage and `/blog` list published posts.
- A representative article renders MDX, SEO metadata, and its table of contents.
- Tags, series, RSS, sitemap, and robots output include current compiled content.
- English and Chinese UI copy render through Paraglide.
- D1 stores only comments, Better Auth data, subscriptions, notifications, broadcasts, and analytics.
- Comments reference an article `post_slug` and existing comments survive a deployment.
- Reader signup/login and email preferences work.
- Comment submission creates the configured moderation state.
- An administrator can approve, mark spam, and delete comments.
- `/admin` exposes overview, comments, and users, but no article editor.
- Article write, import/export, asset, site-settings, backup, and publishing-token routes are absent.
- Git backs up articles and documentation; D1 operational backup covers dynamic data separately.
- Optional email can remain disabled without blocking article publishing, login, or comments.
- The execution log separates automated actions, user actions, verification, and unperformed production mutations.
