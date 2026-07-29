# Database

The canonical dynamic-data schema is `packages/db/src/schema/cms.sqlite.ts`. D1 migrations live in `packages/db/migrations`.

## Current Tables

- `comments`: comment threads keyed by stable `post_slug`, moderation state, and optional Better Auth user linkage.
- `user`, `session`, `account`, `verification`: Better Auth identities, sessions, providers, and tokens.
- `notification_deliveries`: outbound delivery attempts and results.
- `email_broadcasts` and related recipient state: subscription communications.
- `weekly_notification_runs`: weekly delivery coordination.
- `analytics_events`: lightweight article/view events keyed by slug.

The user table also stores email preference, marketing opt-out, comment status, and comment reply notification settings.

## Retired Content Tables

Migration `0017_mdx_content_source.sql` copies each legacy comment's article slug into `comments.post_slug`, then removes the old article/configuration infrastructure:

- posts, series, tags, and post relationship/source tables
- site/server settings
- assets
- API tokens

Article content is not recreated in D1. It is compiled from `content/posts/*.mdx`.

## Security

- Better Auth owns password hashes and sessions.
- Comment author email addresses are stored as hashes in comment records.
- Admin mutations require browser sessions.
- Secrets remain Worker secrets or environment values, never D1 content settings.
