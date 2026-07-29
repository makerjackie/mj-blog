import {
  formatDate,
  localizeComment,
  localizePost,
  localizeSiteSettings,
  type Comment,
} from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageSquareIcon, RssIcon } from "lucide-react";
import { useState } from "react";

import { CommentForm } from "#/components/comment-form";
import { PostContent } from "#/components/post-content";
import { SiteShell } from "#/components/site-shell";
import { $getBlogPostPage, type BlogPostPageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";
import { resolvePostCoverImage } from "#/lib/post-cover-image";
import { m } from "#/paraglide/messages.js";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }): Promise<BlogPostPageData> => {
    const data = await $getBlogPostPage({ data: { slug: params.slug } });

    if (!data) {
      throw notFound();
    }

    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [] };
    }

    const locale = getCurrentLocale();
    const post = localizePost(loaderData.post, locale);
    const siteSettings = localizeSiteSettings(loaderData.siteSettings, locale);
    const siteUrl = siteSettings.url.replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
    const socialImage =
      resolvePostCoverImage(post.coverImage) || siteSettings.defaultOgImage.trim();
    const imageUrl = absoluteUrl(socialImage, siteUrl);
    const avatarUrl = absoluteUrl(siteSettings.avatarUrl, siteUrl);
    const robots = siteSettings.indexingEnabled ? "index,follow" : "noindex,nofollow";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription,
      image: imageUrl ? [imageUrl] : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Person",
        name: post.authorName || siteSettings.authorName,
      },
      publisher: {
        "@type": "Organization",
        name: siteSettings.name,
        logo: avatarUrl
          ? {
              "@type": "ImageObject",
              url: avatarUrl,
            }
          : undefined,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      inLanguage: locale === "zh" ? "zh-CN" : "en",
    };

    return {
      meta: [
        { title: post.seoTitle },
        { name: "description", content: post.seoDescription },
        { name: "robots", content: robots },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonicalUrl },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.seoDescription },
        ...(imageUrl
          ? [
              { property: "og:image", content: imageUrl },
              { name: "twitter:image", content: imageUrl },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const {
    comments,
    contentPath,
    post,
    relatedPosts,
    siteSettings,
    tocItems,
    turnstileSiteKey,
  }: BlogPostPageData = Route.useLoaderData();
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [submittedComments, setSubmittedComments] = useState<Comment[]>([]);
  const locale = getCurrentLocale();
  const localizedPost = localizePost(post, locale);
  const localizedSiteSettings = localizeSiteSettings(siteSettings, locale);
  const localizedComments = comments.map((comment) => localizeComment(comment, locale));
  const visibleComments = mergeCommentLists(
    localizedComments,
    submittedComments.map((comment) => localizeComment(comment, locale)),
  );
  const localizedRelatedPosts = relatedPosts.map((relatedPost) =>
    localizePost(relatedPost, locale),
  );
  const commentsEnabled = localizedSiteSettings.commentsEnabled && localizedPost.commentsEnabled;
  const commentsDescription = localizedSiteSettings.commentsRequireApproval
    ? m.comments_description()
    : null;
  const coverImage = resolvePostCoverImage(localizedPost.coverImage);

  return (
    <SiteShell siteSettings={localizedSiteSettings}>
      <article>
        <header className="border-b border-border bg-background">
          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div
              className={cn(
                "grid gap-6",
                coverImage && "lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end",
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {localizedPost.series ? (
                    <Link
                      to="/series/$slug"
                      params={{ slug: localizedPost.series.slug }}
                      className="text-xs font-semibold tracking-[0.18em] text-link uppercase underline-offset-4 hover:underline"
                    >
                      {localizedPost.series.name}
                    </Link>
                  ) : null}
                  {localizedPost.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      to="/tags/$slug"
                      params={{ slug: tag.slug }}
                      className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase underline-offset-4 hover:text-link hover:underline"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold text-balance sm:text-5xl">
                  {localizedPost.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {localizedPost.excerpt}
                </p>
                <p className="mt-5 text-sm font-medium tracking-wide text-muted-foreground">
                  {formatDate(localizedPost.publishedAt, locale)} · {m.updated()}{" "}
                  {formatDate(localizedPost.updatedAt, locale)} · {localizedPost.authorName}
                </p>
              </div>

              {coverImage ? (
                <div className="overflow-hidden border border-border bg-muted">
                  <img
                    src={coverImage}
                    alt=""
                    loading="eager"
                    className="aspect-[16/7] w-full object-cover lg:aspect-[4/3]"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[12rem_minmax(0,48rem)] lg:px-8 xl:grid-cols-[12rem_minmax(0,48rem)_12rem]">
          <aside className="hidden lg:block">
            <nav aria-label={m.contents()} className="sticky top-24 text-sm">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {m.contents()}
              </p>
              {tocItems.length ? (
                <ol className="mt-4 grid gap-3">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`block leading-5 text-muted-foreground underline-offset-4 hover:text-link hover:underline ${
                          item.level === 3 ? "pl-4 text-xs" : ""
                        }`}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : null}
              <div className="mt-7 grid gap-3 border-t border-border/70 pt-4">
                {commentsEnabled || localizedComments.length ? (
                  <a
                    href="#comments"
                    className="flex items-center gap-2 text-muted-foreground underline-offset-4 hover:text-link hover:underline"
                  >
                    <MessageSquareIcon className="size-4" />
                    {m.comments()}
                  </a>
                ) : null}
                <a
                  href="/rss.xml"
                  className="flex items-center gap-2 text-muted-foreground underline-offset-4 hover:text-link hover:underline"
                >
                  <RssIcon className="size-4" />
                  {m.rss_feed()}
                </a>
              </div>
            </nav>
          </aside>

          <div className="min-w-0">
            {tocItems.length ? (
              <nav
                aria-label={m.contents()}
                className="mb-10 border-b border-border/70 pb-6 lg:hidden"
              >
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  {m.contents()}
                </p>
                <ol className="mt-4 grid gap-3">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`block leading-5 text-muted-foreground underline-offset-4 hover:text-link hover:underline ${
                          item.level === 3 ? "pl-4 text-xs" : ""
                        }`}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className="prose prose-neutral prose-a:text-link prose-headings:scroll-mt-24 prose-headings:font-semibold dark:prose-invert max-w-none leading-8 [&>h1:first-child]:hidden">
              <PostContent path={contentPath} />
            </div>

            {commentsEnabled || localizedComments.length ? (
              <section id="comments" className="mt-16 border-t border-border/70 pt-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{m.comments()}</h2>
                    {commentsDescription ? (
                      <p className="mt-2 text-sm text-muted-foreground">{commentsDescription}</p>
                    ) : null}
                  </div>
                </div>
                {commentsEnabled ? (
                  <CommentForm
                    postSlug={localizedPost.slug}
                    turnstileSiteKey={turnstileSiteKey}
                    parentId={replyTarget?.id ?? null}
                    replyingTo={replyTarget?.authorName ?? null}
                    onCancelReply={() => setReplyTarget(null)}
                    onCommentCreated={(comment) =>
                      setSubmittedComments((current) => upsertComment(current, comment))
                    }
                  />
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">{m.comments_disabled()}</p>
                )}
                <div className="mt-6 grid gap-4">
                  <CommentList comments={visibleComments} onReply={setReplyTarget} />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="hidden min-w-0 xl:block">
            {localizedRelatedPosts.length ? (
              <div className="sticky top-24 text-sm">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  {m.related()}
                </p>
                <div className="mt-3 grid gap-3">
                  {localizedRelatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to="/blog/$slug"
                      params={{ slug: relatedPost.slug }}
                      className="leading-5 font-medium text-muted-foreground underline-offset-4 transition hover:text-link hover:underline"
                    >
                      {relatedPost.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    </SiteShell>
  );
}

type CommentListProps = {
  readonly comments: Comment[];
  readonly depth?: number;
  readonly onReply: (comment: Comment) => void;
  readonly parentId?: string | null;
};

function CommentList({ comments, depth = 0, onReply, parentId = null }: CommentListProps) {
  const visibleIds = new Set(comments.map((comment) => comment.id));
  const children = comments.filter((comment) => {
    if (parentId) {
      return comment.parentId === parentId;
    }

    return !comment.parentId || !visibleIds.has(comment.parentId);
  });

  return (
    <>
      {children.map((comment) => (
        <div key={comment.id} className="grid gap-3">
          <div
            className={cn(
              "border-l py-1 pl-4",
              comment.status === "pending"
                ? "border-success/60 bg-success/5 py-3 pr-4"
                : "border-border/80",
            )}
            style={{ marginLeft: depth ? Math.min(depth, 3) * 16 : 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{comment.authorName}</p>
                {comment.status === "pending" ? (
                  <span className="rounded-full border border-success/35 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    {m.comment_pending_badge()}
                  </span>
                ) : null}
              </div>
              {depth < 1 && comment.status === "approved" ? (
                <Button type="button" size="sm" variant="outline" onClick={() => onReply(comment)}>
                  {m.comment_reply()}
                </Button>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.body}</p>
            {comment.status === "pending" ? (
              <p className="mt-2 text-xs leading-5 text-success">
                {m.comment_pending_visible_note()}
              </p>
            ) : null}
          </div>
          {depth < 1 ? (
            <CommentList
              comments={comments}
              depth={depth + 1}
              onReply={onReply}
              parentId={comment.id}
            />
          ) : null}
        </div>
      ))}
    </>
  );
}

function mergeCommentLists(comments: Comment[], submittedComments: Comment[]) {
  const byId = new Map(comments.map((comment) => [comment.id, comment]));

  for (const comment of submittedComments) {
    byId.set(comment.id, comment);
  }

  return Array.from(byId.values()).sort((first, second) =>
    first.createdAt.localeCompare(second.createdAt),
  );
}

function upsertComment(comments: Comment[], comment: Comment) {
  const existingIndex = comments.findIndex((current) => current.id === comment.id);

  if (existingIndex === -1) {
    return [...comments, comment];
  }

  return comments.map((current, index) => (index === existingIndex ? comment : current));
}

function absoluteUrl(value: string, siteUrl: string) {
  if (!value) {
    return "";
  }

  return new URL(value, siteUrl).toString();
}
