import { localizePost, localizeSiteSettings } from "@repo/core";
import { createFileRoute } from "@tanstack/react-router";

import { PersonalHome } from "#/components/home/personal-home";
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
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);
  const copy = getHomeCopy(locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <PersonalHome locale={locale} posts={posts} bio={copy.heroBody} />
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
