---
title: 01mvp-blog-starter
description: A code-first personal blog with comments and subscriptions on Cloudflare.
---

## The Short Version

Articles are ordinary MDX files in your Git repository. Cloudflare serves the site and keeps reader activity—comments, accounts, subscriptions, and analytics—in D1.

This gives the project one clear content source:

- write or edit `content/posts/*.mdx`
- review the code change
- deploy the site
- use `/admin` only for comments and users

There is no article CMS, browser editor, or database copy of an article.

## What You Get

- public article, tag, series, RSS, sitemap, and SEO pages
- real MDX rendering with reusable components
- Git history for every article change
- reader login and moderated comments
- email preferences and optional subscription delivery
- a small admin area for comments and users
- English and Chinese UI

## Where Data Lives

| Data                                                | Source                       |
| --------------------------------------------------- | ---------------------------- |
| Articles                                            | `content/posts/*.mdx`        |
| Documentation                                       | `apps/web/content/docs/*.md` |
| Site name, navigation, moderation defaults          | repository configuration     |
| Comments, users, sessions, subscriptions, analytics | Cloudflare D1                |
| Short-lived auth and rate-limit state               | Cloudflare KV                |

Start with [Publishing](./publishing), then use [Deployment](./deployment) when you are ready to put the site online.
