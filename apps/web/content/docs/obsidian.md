---
title: Obsidian
description: Use Obsidian as an editor without creating another publishing source.
---

Obsidian can edit the repository's MDX files, but the canonical location remains `content/posts/`.

Recommended workflow:

1. Open the repository—or only `content/posts`—as an Obsidian vault.
2. Create and edit `.mdx` files with the required frontmatter.
3. Review the Git diff.
4. Run source generation, lint, and the production build.
5. Commit and deploy.

Do not maintain a separate vault-to-CMS synchronization. If you keep private notes in another vault, copy only the finished article into this repository and review links and assets before publishing.
