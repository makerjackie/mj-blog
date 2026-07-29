---
title: Obsidian
description: 把 Obsidian 当编辑器使用，但不创建第二个发布源头。
---

Obsidian 可以直接编辑仓库里的 MDX，但唯一正式位置仍然是 `content/posts/`。

推荐流程：

1. 把整个仓库或 `content/posts` 作为 Obsidian vault 打开。
2. 按要求的 frontmatter 创建和编辑 `.mdx`。
3. 审查 Git diff。
4. 运行内容源生成、lint 和生产构建。
5. 提交并部署。

不要维护单独的 vault-to-CMS 同步。如果私人笔记在另一个 vault，发布时只把完成后的文章复制到本仓库，并检查链接和图片。
