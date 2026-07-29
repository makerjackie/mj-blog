# Deployment

MakerJackie production target:

- Site: `https://makerjackie.com`
- Worker: `makerjackie-blog`
- D1: `makerjackie-blog-cms`
- Wrangler config: `apps/web/wrangler.jsonc`

## Prerequisites

- Node.js 24+
- pnpm 11+
- Vite+ `vp`
- Wrangler authenticated to the intended Cloudflare account

Required resources are one Worker, one D1 database, and the configured KV namespace. R2 is not part of the article architecture.

## Build And Deploy

```sh
pnpm deploy:web
```

This builds the MDX article collection, applies remote D1 migrations for dynamic data, and deploys the Worker with the generated config.

Targeted commands:

```sh
pnpm build:web
pnpm db:migrate:remote
pnpm --filter @repo/web exec wrangler deploy --config dist/server/wrangler.json
```

The D1 migration is a production mutation. Review the generated bundle and migration before running the deploy command. Pushing Git does not deploy production.

## Authentication

Set `BETTER_AUTH_SECRET`. GitHub and Google OAuth values are optional:

```sh
pnpm --filter @repo/web exec wrangler secret put BETTER_AUTH_SECRET --config wrangler.jsonc
pnpm --filter @repo/web exec wrangler secret put GITHUB_CLIENT_ID --config wrangler.jsonc
pnpm --filter @repo/web exec wrangler secret put GITHUB_CLIENT_SECRET --config wrangler.jsonc
pnpm --filter @repo/web exec wrangler secret put GOOGLE_CLIENT_ID --config wrangler.jsonc
pnpm --filter @repo/web exec wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler.jsonc
```

OAuth callback URLs are `/api/auth/callback/github` and `/api/auth/callback/google` on each environment.

## Optional Email

Cloudflare Email Sending or Resend can provide password reset, comment reply, and subscription messages. Configure the existing `CMS_EMAIL_*` values and binding, or `RESEND_API_KEY` plus `RESEND_FROM_EMAIL`. Article publishing never depends on outbound email.
