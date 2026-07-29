import { type Comment, type Post, type Series, type SiteSettings, type Tag } from "@repo/core";
import { createServerFn } from "@tanstack/react-start";

export type BlogPostPageData = {
  post: Post;
  contentPath: string;
  tocItems: Array<{
    id: string;
    level: 2 | 3;
    text: string;
  }>;
  comments: Comment[];
  relatedPosts: Post[];
  siteSettings: SiteSettings;
  turnstileSiteKey: string | null;
};

export type HomePageData = {
  posts: Post[];
  featuredPosts: Post[];
  siteSettings: SiteSettings;
  tags: Tag[];
  series: Series[];
};

export type BlogIndexPageData = {
  page: number;
  pageSize: number;
  posts: Post[];
  siteSettings: SiteSettings;
  tags: Tag[];
  series: Series[];
  totalPosts: number;
};

export type TagPageData = {
  siteSettings: SiteSettings;
  tag: Tag;
  posts: Post[];
};

export type TagsPageData = {
  siteSettings: SiteSettings;
  tags: Tag[];
  posts: Post[];
};

export type SeriesPageData = {
  siteSettings: SiteSettings;
  series: Series[];
  posts: Post[];
};

export type SeriesDetailPageData = {
  siteSettings: SiteSettings;
  currentSeries: Series;
  posts: Post[];
};

export type SiteSettingsPageData = {
  siteSettings: SiteSettings;
};

export type AboutPageData = {
  siteSettings: SiteSettings;
};

export const $getBlogPostPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<BlogPostPageData | null> => {
    const [{ env }, { listD1ApprovedComments }, content, { getSiteSettings }] = await Promise.all([
      import("cloudflare:workers"),
      import("./cms-d1"),
      import("./content-posts"),
      import("./site-config"),
    ]);
    const siteSettings = getSiteSettings();
    const post = content.getContentPostBySlug(data.slug);

    if (!post) {
      return null;
    }

    return {
      post,
      contentPath: content.getContentPostPath(post.slug) ?? `${post.slug}.mdx`,
      tocItems: content.getContentPostToc(post.slug),
      comments: await listD1ApprovedComments(post.slug),
      relatedPosts: content
        .listContentPosts()
        .filter(
          (candidate) =>
            candidate.id !== post.id &&
            candidate.tags.some((tag) => post.tags.some((postTag) => postTag.slug === tag.slug)),
        )
        .slice(0, 3),
      siteSettings,
      turnstileSiteKey: env.VITE_TURNSTILE_SITE_KEY?.trim() || null,
    };
  });

export const $getHomePageData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomePageData> => {
    const [{ getSiteSettings }, content] = await Promise.all([
      import("./site-config"),
      import("./content-posts"),
    ]);
    const siteSettings = getSiteSettings();
    const posts = content.listContentPosts({ limit: 12 });
    const featuredPosts = content.listContentPosts({ featured: true, limit: 3 });
    const tags = content.listContentTags();
    const series = content.listContentSeries();

    return {
      posts,
      featuredPosts,
      siteSettings,
      tags,
      series,
    };
  },
);

export const $getBlogIndexPage = createServerFn({ method: "GET" })
  .inputValidator(
    (data: {
      page?: number;
      pageSize?: number;
      query?: string;
      tagSlug?: string;
      seriesSlug?: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<BlogIndexPageData> => {
    const [{ getSiteSettings }, content] = await Promise.all([
      import("./site-config"),
      import("./content-posts"),
    ]);
    const pageSize = Math.min(Math.max(1, Math.floor(data.pageSize ?? 6)), 24);
    const requestedPage = Math.max(1, Math.floor(data.page ?? 1));
    const filters = {
      query: data.query,
      tagSlug: data.tagSlug,
      seriesSlug: data.seriesSlug,
    };
    const siteSettings = getSiteSettings();
    const tags = content.listContentTags();
    const series = content.listContentSeries();
    const totalPosts = content.countContentPosts(filters);
    const pageCount = Math.max(1, Math.ceil(totalPosts / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const posts = content.listContentPosts({
      ...filters,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      page,
      pageSize,
      posts,
      siteSettings,
      tags,
      series,
      totalPosts,
    };
  });

export const $getTagPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<TagPageData | null> => {
    const [{ getSiteSettings }, content] = await Promise.all([
      import("./site-config"),
      import("./content-posts"),
    ]);
    const posts = content.listContentPosts({ tagSlug: data.slug });
    const siteSettings = getSiteSettings();
    const tags = content.listContentTags();
    const tag = tags.find((candidate) => candidate.slug === data.slug);

    if (!tag) {
      return null;
    }

    return {
      siteSettings,
      tag,
      posts,
    };
  });

export const $getTagsPage = createServerFn({ method: "GET" }).handler(
  async (): Promise<TagsPageData> => {
    const [{ getSiteSettings }, content] = await Promise.all([
      import("./site-config"),
      import("./content-posts"),
    ]);
    const posts = content.listContentPosts();
    const siteSettings = getSiteSettings();
    const tags = content.listContentTags();

    return {
      siteSettings,
      posts,
      tags,
    };
  },
);

export const $getSeriesPage = createServerFn({ method: "GET" }).handler(
  async (): Promise<SeriesPageData> => {
    const [{ getSiteSettings }, content] = await Promise.all([
      import("./site-config"),
      import("./content-posts"),
    ]);
    const posts = content.listContentPosts();
    const siteSettings = getSiteSettings();
    const series = content.listContentSeries();

    return {
      siteSettings,
      posts,
      series,
    };
  },
);

export const $getSeriesDetailPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<SeriesDetailPageData | null> => {
    const [{ getSiteSettings }, content] = await Promise.all([
      import("./site-config"),
      import("./content-posts"),
    ]);
    const posts = content.listContentPosts({ seriesSlug: data.slug });
    const siteSettings = getSiteSettings();
    const allSeries = content.listContentSeries();
    const series = allSeries.find((candidate) => candidate.slug === data.slug);

    if (!series) {
      return null;
    }

    return {
      siteSettings,
      currentSeries: series,
      posts,
    };
  });

export const $getSiteSettingsPageData = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettingsPageData> => {
    const { getSiteSettings } = await import("./site-config");

    return {
      siteSettings: getSiteSettings(),
    };
  },
);

export const $getAboutPageData = createServerFn({ method: "GET" }).handler(
  async (): Promise<AboutPageData> => {
    const { getSiteSettings } = await import("./site-config");

    return {
      siteSettings: getSiteSettings(),
    };
  },
);
