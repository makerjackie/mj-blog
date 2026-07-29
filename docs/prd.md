# 01mvp-blog-starter PRD

版本：2.0

状态：当前实现

更新时间：2026-07-29

## 1. 产品定义

一个代码优先的个人博客：

- 作者把文章写成仓库中的 MDX。
- 构建系统直接编译文章，不经过 CMS 或数据库同步。
- Cloudflare Workers 提供公开站点与运行 API。
- D1 只保存用户产生的动态数据。
- Git 是文章历史、协作、审查与回滚机制。

## 2. 核心原则

### 2.1 单一内容源

`content/posts/*.mdx` 是文章唯一源头。系统不提供：

- 后台文章编辑器
- D1 文章表
- 文章 CRUD API
- MDX 到 CMS 同步脚本
- 文章发布 API Token
- 文章导入、导出或 ZIP 备份链路

文章发布动作就是部署包含该 MDX 的代码版本。

### 2.2 动静分离

仓库管理：

- 文章与 frontmatter
- 产品文档
- 站点名称、导航、作者信息
- 评论审核规则与功能默认值

D1 管理：

- 评论及回复
- Better Auth 用户、账号、会话和验证记录
- 订阅与邮件偏好
- 通知投递与广播记录
- 轻量分析事件

KV 管理短期认证、密码重置和限流状态。

### 2.3 稳定标识

评论以 `post_slug` 关联文章。公开文章的 `slug` 是长期标识，发布后不应随意修改。确需修改时必须同时提供 D1 数据迁移。

## 3. 用户

### 作者

- 在代码仓库写和修改 MDX。
- 使用 Git diff 审查文章变更。
- 构建通过后部署。

### 读者

- 无需登录即可阅读。
- 登录后可以评论、回复和管理邮件偏好。

### 管理员

- 查看运行概览。
- 审核、通过、标记垃圾或删除评论。
- 查看用户并管理用户状态与订阅偏好。
- 不在后台编辑文章或站点配置。

## 4. 文章能力

每篇文章 frontmatter 支持：

- `title`
- `slug`
- `excerpt`
- `status`: `draft | published | scheduled | archived`
- `publishedAt`
- `updatedAt`
- `authorName`
- `tags`
- 可选 `series`
- `coverImage`
- `featured`
- `pinned`
- `commentsEnabled`
- `seoTitle`
- `seoDescription`

正文使用真实 MDX，支持标准 Markdown 与项目注册的 MDX 组件。构建产物提供正文、TOC 与元数据。

公开输出包括：

- 首页与文章列表
- 文章详情
- 标签与专栏
- RSS/feed
- sitemap 与 robots
- canonical、Open Graph、Twitter Card 与 JSON-LD

## 5. 评论与账号

- 评论前必须登录。
- 创建评论时校验 `postSlug` 存在且该文章允许评论。
- 支持顶级评论和一层回复。
- 支持限流、蜜罐、可选 Turnstile、关键词拦截和可选 AI 审核。
- 管理员可通过、标记垃圾或删除。
- 评论作者邮箱在评论记录中保存 hash；身份信息由 Better Auth 管理。

## 6. 订阅与邮件

- 用户可以选择或暂停周更订阅。
- 用户可以开关评论回复通知。
- Cloudflare Email Sending 或 Resend 是可选能力。
- 邮件关闭时不影响文章发布、登录、评论和偏好保存。
- 邮件密钥来自 Worker 环境，不存入 D1 设置表。

## 7. 管理后台

保留：

- `/admin`：文章文件数量、评论、用户/订阅与分析概览
- `/admin/comments`：评论审核
- `/admin/users`：用户和订阅管理

移除：

- 文章列表与编辑器
- 专栏管理
- 媒体库
- 站点设置
- API Token
- 导入、导出和备份 UI

## 8. API

保留评论、账号、订阅、通知、分析和管理员 API。`GET /api/posts` 只向登录管理员提供已编译文章元数据。

不提供文章写、导入、导出、媒体、站点设置、备份或发布 Token API。机器可读契约以 `/openapi.json` 为准。

## 9. Cloudflare 架构

- Workers：TanStack Start 应用
- D1：动态用户数据
- KV：短期状态
- Email Sending 或 Resend：可选邮件
- Git：文章和配置的耐久源

R2 不是当前必需资源。

## 10. 发布与迁移

标准发布：

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
pnpm deploy:web
```

`0017_mdx_content_source.sql` 负责：

1. 把旧评论关联转换为 `post_slug`。
2. 保留评论、用户、订阅、通知和分析数据。
3. 删除旧文章、标签、专栏、资源、站点设置和 API Token 表。

远程 migration 与生产部署属于独立的生产操作，不能由普通文章编辑隐含授权。

## 11. 验收

- 所有现有线上文章已回填为 MDX。
- MDX 生成、lint 和生产构建通过。
- 代表文章、标签、专栏、RSS 和 sitemap 正常。
- 评论在迁移后仍能按 slug 加载。
- 管理后台只保留概览、评论和用户。
- 已移除的 CMS 路由和 API 实际不存在，而不是只隐藏入口。
- 隔离的本地 D1 migration 通过 `PRAGMA foreign_key_check`。
- 未经明确授权不执行远程 migration 或生产部署。
