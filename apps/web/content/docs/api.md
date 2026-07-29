---
title: API
description: Runtime APIs for comments, accounts, subscriptions, and operations.
---

## What The API Is For

The API manages dynamic reader data. It does not publish or edit articles.

Main capabilities:

- reader signup, login, and sessions
- comment submission and admin moderation
- email and subscription preferences
- admin user management
- notification and analytics operations
- read-only compiled article metadata for signed-in admins

The current machine-readable contract is at `/openapi.json`.

## Article Automation

An AI or script should edit `content/posts/*.mdx`, validate the repository, and create a normal code change. It should not call a remote article write endpoint because that endpoint does not exist.

## Security

Reader and admin operations use Better Auth browser sessions. Admin routes require an administrator session. Article publishing tokens and cross-origin bearer publishing are intentionally unsupported.
