---
title: AI 初始化建站
description: 让编程 Agent 配置并部署这个代码优先博客。
---

## 需要准备

- 仓库的本地 clone 或 fork
- Node.js 24 和 pnpm 11
- Cloudflare 账号
- 一个 AI 编程 Agent
- 可选的自定义域名

最小 Cloudflare 资源是 Worker、D1 数据库和 KV namespace，不需要 R2。

## 可复制 Prompt

> 把这个 01mvp-blog-starter 仓库配置成代码优先个人博客。所有文章只保存在 `content/posts/*.mdx`，不要创建文章 CMS 或文章数据库。创建并绑定 Cloudflare Worker、D1 和 KV，应用 migration，配置认证，完成构建、部署和上线验证。D1 只存评论、用户、会话、订阅、通知和分析等动态用户数据。只有账号登录、域名所有权、OAuth 创建或其他必须由账号所有者完成的操作再问我。

## Agent 应该验证

- 文章与文档集合可以编译
- D1 migration 没有外键错误
- 文章、标签、RSS、sitemap 和 robots 路由正常
- 读者登录和评论提交正常
- 评论与用户后台必须用管理员会话
- 没有文章写 API 或文章编辑器

Agent 也可以把第一篇文章作为普通 MDX 文件加入仓库。部署这次代码变更就是发布。
