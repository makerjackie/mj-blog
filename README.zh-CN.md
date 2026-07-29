# 01mvp-blog-starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/01MVP/blog-starter)

[English README](./README.md)

这是一个部署在 Cloudflare 上的代码优先个人博客：文章和产品文档都保存在 Git，D1 只存动态用户数据。

## 内容模型

- `content/posts/*.mdx` 是博客文章的唯一源头。
- `apps/web/content/docs/*.md` 是产品文档源头。
- 构建时，两套内容都会直接编译进 TanStack Start 应用。
- D1 只存评论、用户、会话、订阅偏好、通知记录、广播记录和分析事件。
- 管理后台只管理评论和用户，不提供文章编辑器。

发布文章就是修改 MDX、提交代码并部署：

```sh
pnpm --filter @repo/web docs:source
pnpm lint
pnpm build:web
pnpm deploy:web
```

文章发布后应保持 `slug` 稳定，因为评论通过它关联文章。

## 技术栈

- TanStack Start + TanStack Router
- React 19 + React Compiler
- Tailwind CSS + shadcn/ui
- Fumadocs MDX 文章与文档集合
- Paraglide.js 中英文 UI 文案
- Cloudflare Workers
- Cloudflare D1 动态用户数据
- Cloudflare KV 短期认证和限流记录

## 本地开发

```sh
pnpm install
pnpm dev:web
```

应用默认运行在 `http://localhost:3000`。

写入本地管理员账号：

```sh
pnpm db:seed:local-admin
```

默认本地账号：

```txt
email: a@a.test
password: 1
```

## 部署

第一次部署前，在 `apps/web/wrangler.jsonc` 配好 D1 与 KV，并设置 `BETTER_AUTH_SECRET`。GitHub 和 Google OAuth 是可选项。

```sh
pnpm deploy:web
```

部署脚本会构建代码中的文章、应用动态数据的 D1 migration，并部署 Worker。只 push GitHub 不会自动发布生产环境。

## 工作区

```txt
apps/web                 TanStack Start 应用、公开站点、用户数据后台、文档和 API
content/posts            唯一的 MDX 文章源
packages/core            共享类型、静态站点配置和 helper
packages/db              动态数据 Drizzle schema 与 D1 migrations
packages/ui              共享 UI primitives
skills/01mvp-blog        代码优先的初始化与维护 Skill
apps/web/content/docs    公开产品文档源
docs/specs               架构与运维规格
```

文章规范见 [Content publishing](./.agents/content-publishing.md)，公开文档从 [AI 初始化](./apps/web/content/docs/ai-setup.zh.md) 开始。

## License

MIT. See [LICENSE](./LICENSE).
