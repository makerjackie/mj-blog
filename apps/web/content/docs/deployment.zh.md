---
title: 部署
description: 构建 MDX 内容并把博客部署到 Cloudflare。
---

## Cloudflare 资源

应用需要：

- 一个 Worker
- 一个存动态用户数据的 D1 数据库
- 一个存短期状态的 KV namespace
- `BETTER_AUTH_SECRET`

OAuth 和邮件发送都是可选项。当前架构不需要 R2。

## 部署

配置 `apps/web/wrangler.jsonc` 后运行：

```sh
pnpm deploy:web
```

命令会：

1. 编译文章和产品文档
2. 构建 TanStack Start Worker bundle
3. 应用远程 D1 migration
4. 部署 Worker

远程 migration 会修改生产数据，部署前要审查待应用 migration。

## 发布文章

每次生产部署都会包含当前 `content/posts/*.mdx` 集合，没有单独的文章发布命令，也不需要同步远程 CMS。

## 本地检查

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
```

部署后验证一篇代表文章、评论、登录、`/admin/comments`、`/admin/users`、RSS、sitemap、robots 和 `/openapi.json`。
