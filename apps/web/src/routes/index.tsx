import { localizePost, localizeSiteSettings, localizeTag } from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

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

            <aside className="flex justify-center border-t border-border pt-6 lg:border-t-0 lg:pt-0">
              <img
                src="/images/makerjackie-wind.jpg"
                alt={copy.imageAlt}
                width={1086}
                height={1448}
                className="aspect-[3/4] w-full max-w-[320px] border-2 border-border object-cover shadow-[6px_6px_0_0_var(--border)] lg:max-w-[380px] xl:max-w-[400px]"
              />
            </aside>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            {tags.length ? (
              <div className="mb-8 flex flex-wrap gap-2">
                <Link
                  to="/blog"
                  search={{ q: "", tag: "", series: "", page: 1 }}
                  className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:bg-foreground/85"
                >
                  {copy.allArticles}
                </Link>
                {tags.slice(0, 12).map((tag) => (
                  <Link
                    key={tag.slug}
                    to="/tags/$slug"
                    params={{ slug: tag.slug }}
                    className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary/80"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="border-t border-border/50">
              {posts.slice(0, 8).map((post, index) => (
                <PostCard key={post.id} post={post} priority={index === 0} locale={locale} />
              ))}
            </div>

            <div className="pt-8">
              <Button
                render={
                  <Link
                    to="/blog"
                    search={{ q: "", tag: "", series: "", page: 1 }}
                    aria-label={copy.allArticles}
                  />
                }
                nativeButton={false}
                variant="outline"
              >
                {copy.allArticles}
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
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
      eyebrow: "创造 / 行动 / 自由",
      heroBody:
        "你好，我是 MakerJackie。喜欢探索世界和旅行，也用 AI 开发一些有趣的小产品。现在是一名独立开发者 / OPC / 数字游民，也是周周黑客松社区发起人；之前做过几年 AI 算法工程师，96 年生，中山大学计算机。",
      imageAlt: "MakerJackie 在风机前的旅行照片",
      primaryAction: "阅读文章",
      secondaryAction: "查看项目",
      allArticles: "查看全部文章",
    };
  }

  return {
    eyebrow: "Create / Move / Freedom",
    heroBody:
      "Hi, I am MakerJackie. I love exploring the world and building small AI products. I am an independent developer, OPC builder, and digital nomad; I founded Hackathon Weekly, worked as an AI algorithm engineer, and studied computer science at Sun Yat-sen University.",
    imageAlt: "MakerJackie traveling in front of a wind turbine",
    primaryAction: "Read articles",
    secondaryAction: "View projects",
    allArticles: "View all articles",
  };
}
