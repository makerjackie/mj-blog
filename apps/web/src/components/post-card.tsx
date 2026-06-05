import type { Post, SupportedLocale } from "@repo/core";
import { formatDate } from "@repo/core";
import { Link } from "@tanstack/react-router";
import { CalendarDaysIcon, LibraryIcon } from "lucide-react";

import { getCurrentLocale } from "#/lib/i18n";
import { m } from "#/paraglide/messages.js";

type PostCardProps = {
  readonly post: Post;
  readonly priority?: boolean;
  readonly locale?: SupportedLocale;
};

export function PostCard({ post, locale = getCurrentLocale() }: PostCardProps) {
  return (
    <article className="border-b border-border/70 py-6 last:border-b-0 sm:py-7">
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="group grid gap-3 no-underline transition hover:no-underline sm:grid-cols-[9rem_minmax(0,1fr)]"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground sm:block sm:pt-1">
          <span className="inline-flex items-center gap-1.5 sm:flex">
            <CalendarDaysIcon className="size-3.5" />
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
          </span>
          <span className="sm:mt-2 sm:block">
            {[post.pinned ? m.pinned() : "", post.featured ? m.featured() : ""]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-2xl leading-snug font-semibold text-balance group-hover:text-link">
            {post.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 sm:ml-36">
        {post.series ? (
          <Link
            to="/series/$slug"
            params={{ slug: post.series.slug }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline-offset-4 transition hover:text-link hover:underline"
          >
            <LibraryIcon className="size-3.5" />
            {post.series.name}
          </Link>
        ) : null}
        {post.tags.map((tag) => (
          <span key={tag.slug} className="inline-flex items-center gap-3">
            <Link
              to="/tags/$slug"
              params={{ slug: tag.slug }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition hover:text-link hover:underline"
            >
              #{tag.name}
            </Link>
          </span>
        ))}
      </div>
    </article>
  );
}
