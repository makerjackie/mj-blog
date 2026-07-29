# API

Machine-readable OpenAPI is available at `/openapi.json`. Article creation and editing are intentionally absent: articles are files in `content/posts/` and ship with a deployment.

## Public Metadata

- `GET /rss.xml`
- `GET /feed.xml`
- `GET /sitemap.xml`
- `GET /sitemap-posts.xml`
- `GET /robots.txt`
- `GET /openapi.json`

## Comments And Accounts

- `GET /api/comments`
- `POST /api/comments`
- `POST /api/comments/:id/approve`
- `POST /api/comments/:id/spam`
- `POST /api/comments/:id/delete`
- Better Auth account/session routes under `/api/auth/*` and the account/comment-auth wrappers
- `GET` and `PUT /api/account/email-preferences`

`POST /api/comments` requires a signed-in reader, accepts a stable article `postSlug`, verifies the slug against the compiled MDX collection, and applies rate limiting and moderation. Public readers receive only approved comments. Moderation endpoints require an admin browser session.

## Admin And Operations

- `GET /api/posts`: read-only compiled article metadata; admin session required
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/email-status`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `PATCH /api/admin/password`
- `POST /api/admin/password-reset`
- subscription broadcast and analytics routes described in `/openapi.json`

There are no article write, series write, site-settings write, asset upload, import, export, backup, or API-token endpoints.

## Authentication

Reader and admin identities use Better Auth sessions stored in D1. Admin routes require an administrator session. Cross-origin bearer-token publishing is not supported.
