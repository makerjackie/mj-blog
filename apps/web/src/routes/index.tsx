import { SiGithub } from "@icons-pack/react-simple-icons";
import {
  formatDate,
  localizePost,
  localizeSiteSettings,
  localizeTag,
  type Post,
  type SupportedLocale,
} from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BookOpenIcon,
  Code2Icon,
  LightbulbIcon,
  RssIcon,
  SparklesIcon,
} from "lucide-react";

import { PostCard } from "#/components/post-card";
import { SiteShell } from "#/components/site-shell";
import { $getHomePageData, type HomePageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";

export const Route = createFileRoute("/")({
  loader: (): Promise<HomePageData> => $getHomePageData(),
  component: HomePage,
});

function HomePage() {
  const data: HomePageData = Route.useLoaderData();
  const locale = getCurrentLocale();
  const posts = data.posts.map((post) => localizePost(post, locale)).filter(isReaderFacingPost);
  const featuredPosts = data.featuredPosts
    .map((post) => localizePost(post, locale))
    .filter(isReaderFacingPost);
  const tags = data.tags.map((tag) => localizeTag(tag, locale));
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);
  const copy = getHomeCopy(locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <div className="bg-background">
        <section className="border-b-2 border-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(300px,0.38fr)] lg:px-8 lg:py-16">
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-sm font-semibold tracking-wide text-link uppercase">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl leading-[0.96] font-semibold text-balance sm:text-7xl">
                MakerJackie
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.heroBody}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  render={
                    <Link
                      to="/blog"
                      search={{ q: "", tag: "", series: "", page: 1 }}
                      aria-label={copy.primaryAction}
                    />
                  }
                  nativeButton={false}
                  size="lg"
                >
                  {copy.primaryAction}
                  <ArrowRightIcon />
                </Button>
                <Button
                  render={<Link to="/projects" aria-label={copy.secondaryAction} />}
                  nativeButton={false}
                  size="lg"
                  variant="outline"
                >
                  {copy.secondaryAction}
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>

            <aside className="flex items-start gap-5 border-t border-border pt-6 lg:block lg:border-t-0 lg:pt-0">
              <img
                src="/jackie-avatar.jpg"
                alt="MakerJackie"
                className="size-24 shrink-0 border-2 border-border object-cover shadow-[5px_5px_0_0_var(--border)] sm:size-32 lg:size-36"
              />
              <div className="grid gap-3 lg:mt-5">
                {copy.profileItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 border-t border-border pt-3"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-link" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.28fr_minmax(0,1fr)] lg:px-8 lg:py-14">
            <div>
              <p className="text-sm font-semibold text-link uppercase">{copy.latestEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold">{copy.latestTitle}</h2>
            </div>
            <div>
              {posts.slice(0, 4).map((post, index) => (
                <PostCard key={post.id} post={post} priority={index === 0} locale={locale} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] lg:px-8 lg:py-14">
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-link uppercase">
                    {copy.featuredEyebrow}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">{copy.featuredTitle}</h2>
                </div>
              </div>
              <div className="mt-6 border-t border-border">
                {(featuredPosts.length ? featuredPosts : posts.slice(0, 2))
                  .slice(0, 2)
                  .map((post) => (
                    <FeaturedPostLink key={post.id} post={post} locale={locale} />
                  ))}
              </div>
            </div>

            <aside className="border-t border-border pt-6 lg:border-t-0 lg:pt-0">
              <p className="text-sm font-semibold text-link uppercase">{copy.tagsEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold">{copy.tagsTitle}</h2>
              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                {tags.slice(0, 18).map((tag) => (
                  <Link
                    key={tag.slug}
                    to="/tags/$slug"
                    params={{ slug: tag.slug }}
                    className="text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-link hover:underline"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                <a
                  href="https://github.com/makerjackie"
                  className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-link hover:underline"
                >
                  <SiGithub className="size-4" />
                  GitHub
                </a>
                <a
                  href="/rss.xml"
                  className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-link hover:underline"
                >
                  <RssIcon className="size-4" />
                  RSS
                </a>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function FeaturedPostLink({
  locale,
  post,
}: {
  readonly locale: SupportedLocale;
  readonly post: Post;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block border-b border-border py-5 transition hover:bg-muted/35 sm:px-5"
    >
      <time dateTime={post.publishedAt} className="text-xs font-medium text-muted-foreground">
        {formatDate(post.publishedAt, locale)}
      </time>
      <h3 className="mt-4 text-xl font-semibold text-balance group-hover:text-link">
        {post.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
    </Link>
  );
}

function isReaderFacingPost(post: { title: string; slug: string }) {
  const normalized = `${post.title} ${post.slug}`.toLowerCase();

  return !["e2e comment flow", "smoke post", "e2e edit smoke"].some((marker) =>
    normalized.includes(marker),
  );
}

function getHomeCopy(locale: ReturnType<typeof getCurrentLocale>) {
  if (locale === "zh") {
    return {
      eyebrow: "AI 产品 · 独立开发 · 长期写作",
      heroBody:
        "我是 Jackie。这里记录 AI 产品实践、独立开发项目、自媒体复盘和一些生活思考。新的博客由 01mvp-blog-starter 生成，也会作为这个模板的第一个真实用户持续迭代。",
      primaryAction: "阅读文章",
      secondaryAction: "查看项目",
      latestEyebrow: "博客",
      latestTitle: "最新文章",
      featuredEyebrow: "精选",
      featuredTitle: "值得先读",
      tagsEyebrow: "主题",
      tagsTitle: "按标签浏览",
      profileItems: [
        {
          label: "独立开发者",
          body: "做 AI 产品、工具模板和内容系统，也记录真实的交付过程。",
          icon: Code2Icon,
        },
        {
          label: "周周黑客松",
          body: "发起并运营一个用 AI 做东西的创作者社区。",
          icon: SparklesIcon,
        },
        {
          label: "01MVP",
          body: "把想法做成能上线的小产品，再从真实反馈里继续迭代。",
          icon: LightbulbIcon,
        },
      ],
    };
  }

  return {
    eyebrow: "AI products · Indie hacking · Long-form writing",
    heroBody:
      "I am Jackie. This site collects my AI product practice, indie projects, creator notes, and life reflections. It is powered by 01mvp-blog-starter and will keep dogfooding the template in public.",
    primaryAction: "Read articles",
    secondaryAction: "View projects",
    latestEyebrow: "Blog",
    latestTitle: "Latest posts",
    featuredEyebrow: "Featured",
    featuredTitle: "Start here",
    tagsEyebrow: "Topics",
    tagsTitle: "Browse by tag",
    profileItems: [
      {
        label: "Independent developer",
        body: "Building AI products, tooling templates, and publishing systems.",
        icon: Code2Icon,
      },
      {
        label: "Hackathon Weekly",
        body: "Running a creator community around building with AI.",
        icon: SparklesIcon,
      },
      {
        label: "01MVP",
        body: "Turning ideas into small products, then iterating from real feedback.",
        icon: BookOpenIcon,
      },
    ],
  };
}
