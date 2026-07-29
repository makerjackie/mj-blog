---
title: Advanced Configuration
description: Optional email, OAuth, Turnstile, and AI comment moderation.
---

All options on this page affect dynamic reader features, not article publishing.

## OAuth

Set GitHub or Google client credentials as Worker secrets. Callback paths are:

```txt
/api/auth/callback/github
/api/auth/callback/google
```

## Outbound Email

Cloudflare Email Sending or Resend can send password-reset, comment-reply, and subscription messages. Configure the `CMS_EMAIL_*` variables and binding, or `RESEND_API_KEY` plus `RESEND_FROM_EMAIL`.

## Turnstile

Set `VITE_TURNSTILE_SITE_KEY` and `CMS_TURNSTILE_SECRET_KEY` to add bot protection to comment submission.

## AI Comment Moderation

Optional OpenAI-compatible moderation uses:

```txt
CMS_AI_BASE_URL
CMS_AI_API_KEY
CMS_AI_MODEL
```

These are Worker environment values. The site does not store AI keys in D1.

After changing bindings, variables, or secrets, redeploy the Worker.
