import { localizePost, localizeSeries, localizeSiteSettings, localizeTag } from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PostCard } from "#/components/post-card";
import { SiteShell } from "#/components/site-shell";
import { $getBlogIndexPage, type BlogIndexPageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";
import { m } from "#/paraglide/messages.js";

const BLOG_PAGE_SIZE = 6;

export const Route = createFileRoute("/blog/")({
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : "",
    tag: typeof search.tag === "string" ? search.tag : "",
    series: typeof search.series === "string" ? search.series : "",
    page: Math.max(1, Number(search.page) || 1),
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    q: search.q,
    tag: search.tag,
    series: search.series,
  }),
  loader: ({ deps }): Promise<BlogIndexPageData> =>
    $getBlogIndexPage({
      data: {
        query: deps.q,
        tagSlug: deps.tag || undefined,
        seriesSlug: deps.series || undefined,
        page: deps.page,
        pageSize: BLOG_PAGE_SIZE,
      },
    }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const locale = getCurrentLocale();
  const search = Route.useSearch();
  const data: BlogIndexPageData = Route.useLoaderData();
  const requestKey = JSON.stringify([
    search.q,
    search.tag,
    search.series,
    data.page,
    data.pageSize,
  ]);
  const tags = dedupeBySlug(data.tags.map((tag) => localizeTag(tag, locale)));
  const series = dedupeBySlug(data.series.map((item) => localizeSeries(item, locale)));
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-link uppercase">{m.blog_eyebrow()}</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{m.blog_title()}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{m.blog_description()}</p>
        </div>
        <form className="mt-8 grid gap-4 border-y border-border py-4 md:grid-cols-[minmax(0,1fr)_auto]">
          {search.tag ? <input type="hidden" name="tag" value={search.tag} /> : null}
          {search.series ? <input type="hidden" name="series" value={search.series} /> : null}
          <label className="relative block">
            <span className="sr-only">{m.blog_search_placeholder()}</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={search.q}
              placeholder={m.blog_search_placeholder()}
              className="pl-9"
            />
          </label>
          <Button type="submit">{m.blog_search_submit()}</Button>
          <details className="border-t border-border pt-3 md:col-span-2 md:hidden">
            <summary className="cursor-pointer text-sm font-semibold">
              {locale === "zh" ? "筛选文章" : "Filter articles"}
            </summary>
            <div className="mt-3 grid gap-3">
              <FilterGroups search={search} tags={tags} series={series} />
            </div>
          </details>
          <div className="hidden gap-3 md:col-span-2 md:grid">
            <FilterGroups search={search} tags={tags} series={series} />
          </div>
        </form>
        <InfinitePostList key={requestKey} data={data} locale={locale} search={search} />
      </section>
    </SiteShell>
  );
}

function InfinitePostList({
  data,
  locale,
  search,
}: {
  readonly data: BlogIndexPageData;
  readonly locale: ReturnType<typeof getCurrentLocale>;
  readonly search: ReturnType<typeof Route.useSearch>;
}) {
  const [postState, setPostState] = useState(() => ({
    loadedPage: data.page,
    pageSize: data.pageSize,
    posts: data.posts,
    totalPosts: data.totalPosts,
  }));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const posts = postState.posts
    .map((post) => localizePost(post, locale))
    .filter(isReaderFacingPost);
  const loadedPage = postState.loadedPage;
  const pageCount = Math.max(1, Math.ceil(postState.totalPosts / postState.pageSize));
  const hasMorePages = loadedPage < pageCount;

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    if (!hasMorePages || loadMoreError) {
      return;
    }

    const node = loadMoreRef.current;

    if (!node) {
      return;
    }

    const loadMorePosts = async () => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setIsLoadingMore(true);

      try {
        const nextData = await $getBlogIndexPage({
          data: {
            query: search.q,
            tagSlug: search.tag || undefined,
            seriesSlug: search.series || undefined,
            page: loadedPage + 1,
            pageSize: BLOG_PAGE_SIZE,
          },
        });

        if (!mountedRef.current) {
          return;
        }

        setPostState((current) => {
          const existingIds = new Set(current.posts.map((post) => post.id));
          const nextPosts = nextData.posts.filter((post) => !existingIds.has(post.id));

          return {
            loadedPage: Math.max(current.loadedPage, nextData.page),
            pageSize: nextData.pageSize,
            posts: [...current.posts, ...nextPosts],
            totalPosts: nextData.totalPosts,
          };
        });
      } catch {
        if (mountedRef.current) {
          setLoadMoreError(true);
        }
      } finally {
        loadingRef.current = false;

        if (mountedRef.current) {
          setIsLoadingMore(false);
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMorePosts();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMorePages, loadMoreError, loadedPage, search.q, search.series, search.tag]);

  return (
    <>
      <div className="mt-8">
        {posts.length ? (
          posts.map((post, index) => (
            <PostCard key={post.id} post={post} priority={index === 0} locale={locale} />
          ))
        ) : (
          <p className="border-y border-border py-6 text-sm text-muted-foreground">
            {m.blog_no_results()}
          </p>
        )}
      </div>
      <div
        ref={loadMoreRef}
        className="mt-8 flex min-h-12 items-center justify-center border-t border-border/50 pt-6"
        aria-live="polite"
      >
        {isLoadingMore ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            {locale === "zh" ? "加载更多文章..." : "Loading more posts..."}
          </p>
        ) : loadMoreError ? (
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "加载失败，刷新后再试。" : "Could not load more posts."}
          </p>
        ) : !hasMorePages && posts.length ? (
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "全部文章已显示" : "All posts loaded"}
          </p>
        ) : null}
      </div>
    </>
  );
}

function FilterGroups({
  search,
  series,
  tags,
}: {
  readonly search: ReturnType<typeof Route.useSearch>;
  readonly series: Array<{ slug: string; name: string }>;
  readonly tags: Array<{ slug: string; name: string }>;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label={m.blog_filter_label()}>
        <a
          href={blogHref({ q: search.q })}
          aria-label={m.blog_filter_all()}
          aria-current={search.tag ? undefined : "true"}
          className={filterLinkClassName(!search.tag)}
        >
          {m.blog_filter_all()}
        </a>
        {tags.slice(0, 8).map((tag) => (
          <a
            key={tag.slug}
            href={blogHref({ q: search.q, tag: tag.slug, series: search.series })}
            aria-label={tag.name}
            aria-current={search.tag === tag.slug ? "true" : undefined}
            className={filterLinkClassName(search.tag === tag.slug)}
          >
            {tag.name}
          </a>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label={m.blog_series_filter_label()}>
        <a
          href={blogHref({ q: search.q, tag: search.tag })}
          aria-label={m.blog_series_all()}
          aria-current={search.series ? undefined : "true"}
          className={filterLinkClassName(!search.series)}
        >
          {m.blog_series_all()}
        </a>
        {series.slice(0, 6).map((item) => (
          <a
            key={item.slug}
            href={blogHref({ q: search.q, tag: search.tag, series: item.slug })}
            aria-label={item.name}
            aria-current={search.series === item.slug ? "true" : undefined}
            className={filterLinkClassName(search.series === item.slug)}
          >
            {item.name}
          </a>
        ))}
      </div>
    </>
  );
}

function filterLinkClassName(active: boolean) {
  return cn(
    "inline-flex min-h-8 items-center border-b-2 px-0.5 text-sm font-semibold underline-offset-4 transition hover:text-link",
    active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground",
  );
}

function blogHref({
  q,
  series,
  tag,
}: {
  readonly q?: string;
  readonly series?: string;
  readonly tag?: string;
}) {
  const search = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(tag ? { tag } : {}),
    ...(series ? { series } : {}),
  });
  const value = search.toString();

  return value ? `/blog?${value}` : "/blog";
}

function dedupeBySlug<TItem extends { slug: string; name: string }>(items: TItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.slug}:${item.name}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isReaderFacingPost(post: { title: string; slug: string }) {
  const normalized = `${post.title} ${post.slug}`.toLowerCase();

  return !["e2e comment flow", "smoke post", "e2e edit smoke"].some((marker) =>
    normalized.includes(marker),
  );
}
