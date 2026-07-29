import { type CmsUser, type Comment, type Post } from "@repo/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EyeIcon, FileCode2Icon, MessageSquareIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminPageHeader, AdminPanel } from "#/components/admin/admin-ui";
import type { AnalyticsOverview } from "#/lib/analytics-types";
import { getCurrentLocale } from "#/lib/i18n";

export const Route = createFileRoute("/_auth/admin/")({
  component: AdminOverviewPage,
});

type OverviewData = {
  analytics: AnalyticsOverview | null;
  comments: Comment[];
  posts: Post[];
  users: CmsUser[];
};

const emptyData: OverviewData = {
  analytics: null,
  comments: [],
  posts: [],
  users: [],
};

function AdminOverviewPage() {
  const locale = getCurrentLocale();
  const [data, setData] = useState<OverviewData>(emptyData);

  useEffect(() => {
    let ignore = false;

    void Promise.all([
      fetch(`/api/posts?status=all&lang=${locale}`).then((response) =>
        response.ok ? response.json() : undefined,
      ),
      fetch(`/api/comments?lang=${locale}`).then((response) =>
        response.ok ? response.json() : undefined,
      ),
      fetch("/api/admin/users").then((response) => (response.ok ? response.json() : undefined)),
      fetch("/api/analytics/overview?days=7").then((response) =>
        response.ok ? response.json() : undefined,
      ),
    ]).then(([postsPayload, commentsPayload, usersPayload, analyticsPayload]) => {
      if (ignore) {
        return;
      }

      setData({
        posts: (postsPayload as { data?: Post[] } | undefined)?.data ?? [],
        comments: (commentsPayload as { data?: Comment[] } | undefined)?.data ?? [],
        users: (usersPayload as { data?: CmsUser[] } | undefined)?.data ?? [],
        analytics: (analyticsPayload as { data?: AnalyticsOverview } | undefined)?.data ?? null,
      });
    });

    return () => {
      ignore = true;
    };
  }, [locale]);

  const copy = getOverviewCopy(locale);
  const pendingComments = data.comments.filter((comment) => comment.status === "pending").length;
  const subscribers = data.users.filter(
    (user) => user.emailPreference === "weekly_blog_updates" && !user.marketingOptOut,
  ).length;
  const cards = [
    {
      icon: FileCode2Icon,
      label: copy.posts,
      value: data.posts.length,
      detail: copy.postsDetail,
    },
    {
      icon: MessageSquareIcon,
      label: copy.comments,
      value: data.comments.length,
      detail: copy.commentsDetail(pendingComments),
    },
    {
      icon: UsersIcon,
      label: copy.users,
      value: data.users.length,
      detail: copy.usersDetail(subscribers),
    },
    {
      icon: EyeIcon,
      label: copy.views,
      value: data.analytics?.totals.views ?? 0,
      detail: copy.viewsDetail,
    },
  ];

  return (
    <div className="grid gap-5">
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <AdminPanel key={card.label} className="min-h-32">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold">{formatNumber(card.value, locale)}</p>
                </div>
                <Icon className="size-5 text-link" />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.detail}</p>
            </AdminPanel>
          );
        })}
      </div>

      <AdminPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {copy.readerData}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.topPosts}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {copy.visitors}: {formatNumber(data.analytics?.totals.visitors ?? 0, locale)}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {data.analytics?.topPosts.length ? (
            data.analytics.topPosts.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3 text-sm underline-offset-4 hover:text-link hover:underline"
              >
                <span className="font-medium">{post.title}</span>
                <span className="text-muted-foreground">
                  {formatNumber(post.views, locale)} {copy.viewsUnit}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{copy.noData}</p>
          )}
        </div>
      </AdminPanel>
    </div>
  );
}

function formatNumber(value: number, locale: ReturnType<typeof getCurrentLocale>) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en").format(value);
}

function getOverviewCopy(locale: ReturnType<typeof getCurrentLocale>) {
  if (locale === "zh") {
    return {
      comments: "评论",
      commentsDetail: (pending: number) => `${pending} 条待审核`,
      description: "文章来自代码仓库；这里只管理评论、用户、订阅和读者数据。",
      eyebrow: "运营数据",
      noData: "还没有足够的访问数据。",
      posts: "MDX 文章",
      postsDetail: "唯一来源：content/posts/*.mdx",
      readerData: "最近 7 天",
      title: "后台概览",
      topPosts: "热门文章",
      users: "用户",
      usersDetail: (subscribers: number) => `${subscribers} 位周报订阅者`,
      views: "浏览量",
      viewsDetail: "最近 7 天的页面访问",
      viewsUnit: "次浏览",
      visitors: "访客",
    };
  }

  return {
    comments: "Comments",
    commentsDetail: (pending: number) => `${pending} awaiting review`,
    description:
      "Posts come from the repository; this area only manages comments, users, subscriptions, and reader data.",
    eyebrow: "Operations",
    noData: "Not enough reader data yet.",
    posts: "MDX posts",
    postsDetail: "Only source: content/posts/*.mdx",
    readerData: "Last 7 days",
    title: "Admin overview",
    topPosts: "Top posts",
    users: "Users",
    usersDetail: (subscribers: number) => `${subscribers} weekly subscribers`,
    views: "Views",
    viewsDetail: "Page views over the last 7 days",
    viewsUnit: "views",
    visitors: "Visitors",
  };
}
