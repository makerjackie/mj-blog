import type { Post, SupportedLocale } from "@repo/core";
import { formatDate } from "@repo/core";
import { Link } from "@tanstack/react-router";

import { getCurrentLocale } from "#/lib/i18n";

type PostCardProps = {
  readonly post: Post;
  readonly priority?: boolean;
  readonly locale?: SupportedLocale;
};

export function PostCard({ post, locale = getCurrentLocale() }: PostCardProps) {
  return (
    <article className="border-b border-border/50 py-6 last:border-b-0 sm:py-7">
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="group block space-y-2 no-underline transition hover:no-underline"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h2 className="text-xl leading-snug font-semibold text-balance transition-colors group-hover:text-foreground/80 sm:text-2xl">
            {post.title}
          </h2>
          <time
            dateTime={post.publishedAt}
            className="shrink-0 text-sm whitespace-nowrap text-muted-foreground sm:mt-1"
          >
            {formatDate(post.publishedAt, locale)}
          </time>
        </div>

        <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        {post.series ? (
          <Link
            to="/series/$slug"
            params={{ slug: post.series.slug }}
            className="rounded bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            {post.series.name}
          </Link>
        ) : null}
        {post.tags.map((tag) => (
          <span key={tag.slug} className="inline-flex items-center gap-3">
            <Link
              to="/tags/$slug"
              params={{ slug: tag.slug }}
              className="rounded bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              {tag.name}
            </Link>
          </span>
        ))}
      </div>
    </article>
  );
}
