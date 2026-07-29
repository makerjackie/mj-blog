---
title: AI Setup
description: Ask a coding agent to configure and deploy the code-first blog.
---

## What You Need

- a local clone or fork of the repository
- Node.js 24 and pnpm 11
- a Cloudflare account
- an AI coding agent
- an optional custom domain

The minimum Cloudflare resources are a Worker, D1 database, and KV namespace. R2 is not required.

## Copyable Prompt

> Configure this 01mvp-blog-starter repository as a code-first personal blog. Keep all articles in `content/posts/*.mdx`; do not create an article CMS or article database. Provision and bind Cloudflare Worker, D1, and KV resources, apply migrations, configure authentication, build, deploy, and verify the public site. D1 must store only dynamic user data such as comments, users, sessions, subscriptions, notifications, and analytics. Ask me only when account login, domain ownership, OAuth creation, or another account-owner action is required.

## What The Agent Should Verify

- article and documentation collections compile
- D1 migrations apply without foreign-key errors
- public article, tag, RSS, sitemap, and robots routes work
- reader login and comment submission work
- admin comment and user pages require an admin session
- no article write API or editor is exposed

The agent can also create the first MDX article as a normal repository file. Publication occurs when the resulting code is deployed.
