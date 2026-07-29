---
title: 进阶配置
description: 可选的邮件、OAuth、Turnstile 和 AI 评论审核。
---

这里的配置都只影响动态读者功能，不影响文章发布。

## OAuth

把 GitHub 或 Google 客户端凭据设置为 Worker secrets。回调路径是：

```txt
/api/auth/callback/github
/api/auth/callback/google
```

## 邮件发送

Cloudflare Email Sending 或 Resend 可以发送密码重置、评论回复和订阅邮件。配置 `CMS_EMAIL_*` 变量与 binding，或设置 `RESEND_API_KEY` 和 `RESEND_FROM_EMAIL`。

## Turnstile

设置 `VITE_TURNSTILE_SITE_KEY` 和 `CMS_TURNSTILE_SECRET_KEY`，为评论提交增加机器人防护。

## AI 评论审核

可选的 OpenAI-compatible 审核使用：

```txt
CMS_AI_BASE_URL
CMS_AI_API_KEY
CMS_AI_MODEL
```

这些是 Worker 环境变量，网站不会把 AI 密钥存入 D1。

修改 binding、变量或 secret 后需要重新部署 Worker。
