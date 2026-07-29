---
title: 01mvp-blog-starter
description: 一个代码优先、支持评论与订阅的 Cloudflare 个人博客。
---

## 一句话说明

文章就是 Git 仓库里的 MDX 文件。Cloudflare 负责运行网站，D1 只保存读者产生的数据：评论、账号、订阅和分析记录。

内容源头只有一个：

- 在 `content/posts/*.mdx` 写文章
- 审查代码变更
- 部署网站
- `/admin` 只管理评论和用户

这里没有文章 CMS、浏览器文章编辑器，也没有 D1 文章副本。

## 你会得到什么

- 文章、标签、专栏、RSS、sitemap 和 SEO 页面
- 真正的 MDX 渲染与可复用组件
- 每次文章修改都有 Git 历史
- 读者登录和评论审核
- 邮件偏好与可选订阅通知
- 只面向评论和用户的小型后台
- 中英文 UI

## 数据放在哪里

| 数据                         | 唯一源头                     |
| ---------------------------- | ---------------------------- |
| 文章                         | `content/posts/*.mdx`        |
| 产品文档                     | `apps/web/content/docs/*.md` |
| 站点名称、导航、审核默认值   | 仓库配置                     |
| 评论、用户、会话、订阅、分析 | Cloudflare D1                |
| 短期认证和限流状态           | Cloudflare KV                |

先看 [发布文章](./publishing)，准备上线时再看 [部署](./deployment)。
