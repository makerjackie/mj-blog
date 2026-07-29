// source.config.ts
import { defineCollections, defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    files: ["**/*.md", "**/*.mdx"]
  },
  meta: {
    files: ["**/meta.json", "**/meta.*.json"]
  }
});
var posts = defineCollections({
  type: "doc",
  dir: "../../content/posts",
  files: ["**/*.mdx"],
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    series: z.object({
      name: z.string(),
      slug: z.string().optional(),
      description: z.string().optional(),
      sortOrder: z.number().optional()
    }).optional(),
    coverImage: z.string().optional(),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    commentsEnabled: z.boolean().default(true),
    authorName: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypeCodeOptions: false
  }
});
export {
  source_config_default as default,
  docs,
  posts
};
