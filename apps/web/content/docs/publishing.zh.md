---
title: 发布文章
description: 写 MDX、审查变更，然后部署代码。
---

# 发布文章

`content/posts/*.mdx` 是文章唯一源头。生产构建会直接读取这些文件，不需要上传或同步 CMS。

## 创建文章

新增一个带 frontmatter 的文件：

```mdx
---
title: "我的文章"
slug: "my-article"
excerpt: "一句简短摘要。"
status: "draft"
publishedAt: "2026-07-29T09:00:00.000Z"
authorName: "Jackie"
featured: false
pinned: false
commentsEnabled: true
tags:
  - "随笔"
---

# 我的文章

这里可以写 Markdown，也可以使用项目支持的 MDX 组件。
```

准备阶段用 `draft`，需要公开时改为 `published`。定时文章会在 `publishedAt` 到达后公开。

## 验证并发布

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
pnpm deploy:web
```

部署本身就是发布动作。文章公开后保持 `slug` 稳定，已有评论才会继续正确关联。

## 图片

优先使用仓库内的公开资源，或版权与稳定性已经确认的外部图片，并在 MDX 中直接引用最终 URL。博客不维护 R2 上传库或浏览器媒体后台。
