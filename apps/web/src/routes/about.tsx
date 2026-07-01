import { localizeSiteSettings } from "@repo/core";
import { Button } from "@repo/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, ExternalLinkIcon, MailIcon, SparklesIcon } from "lucide-react";

import { SiteShell } from "#/components/site-shell";
import { $getAboutPageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";

export const Route = createFileRoute("/about")({
  loader: () => $getAboutPageData(),
  head: () => {
    const locale = getCurrentLocale();

    return {
      meta: [
        {
          title: locale === "zh" ? "关于 MakerJackie" : "About MakerJackie",
        },
        {
          name: "description",
          content:
            locale === "zh"
              ? "了解 MakerJackie 的 AI 产品实践、独立开发项目和长期写作。"
              : "Learn about MakerJackie's AI product practice, indie projects, and writing.",
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const data = Route.useLoaderData();
  const locale = getCurrentLocale();
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);
  const copy = getAboutCopy(locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <div className="bg-background">
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] lg:px-8 lg:py-16">
            <div>
              <p className="text-sm font-semibold tracking-wide text-link uppercase">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] font-semibold text-balance sm:text-6xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.description}
              </p>
              <div className="mt-6 max-w-3xl border-t border-border pt-4">
                <p className="text-base font-semibold">{copy.profileTitle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.profileBody}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  render={<a href="/blog" aria-label={copy.primaryAction} />}
                  nativeButton={false}
                >
                  {copy.primaryAction}
                  <ArrowRightIcon />
                </Button>
                <Button
                  render={<a href="/projects" aria-label={copy.secondaryAction} />}
                  variant="outline"
                  nativeButton={false}
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
                className="aspect-[3/4] w-full max-w-[320px] border-2 border-border object-cover shadow-[6px_6px_0_0_var(--border)] lg:max-w-[360px] xl:max-w-[380px]"
              />
            </aside>
          </div>
        </section>

        <section className="border-b border-border bg-muted/35">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.36fr_0.64fr] lg:px-8 lg:py-16">
            <div>
              <p className="text-sm font-semibold text-link uppercase">{copy.whyEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold text-balance">{copy.whyTitle}</h2>
            </div>
            <div className="grid gap-4">
              {copy.principles.map((principle) => (
                <article key={principle.title} className="border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="mt-1 size-4 shrink-0 text-link" />
                    <div>
                      <h3 className="text-xl font-semibold">{principle.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-px border border-border bg-border md:grid-cols-3">
              {copy.paths.map((path) => (
                <a
                  key={path.href}
                  href={path.href}
                  className="bg-background p-5 transition hover:bg-muted/45"
                >
                  <p className="text-xs font-semibold tracking-wide text-link uppercase">
                    {path.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">{path.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{path.description}</p>
                </a>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <a
                href="mailto:hi@makerjackie.com"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-link hover:underline"
              >
                <MailIcon className="size-4" />
                hi@makerjackie.com
              </a>
              <a
                href="https://x.com/makerjackie"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-link hover:underline"
              >
                X / Twitter
                <ExternalLinkIcon className="size-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function getAboutCopy(locale: ReturnType<typeof getCurrentLocale>) {
  if (locale === "zh") {
    return {
      eyebrow: "关于 MakerJackie",
      title: "探索世界，也把想法做成看得见的作品。",
      description:
        "你好，我是 MakerJackie。喜欢探索世界和旅行，用 AI 开发一些有趣的小产品。这里会记录我的 AI 产品实践、独立开发项目、自媒体复盘和一些长期思考。",
      imageAlt: "MakerJackie 在风机前的旅行照片",
      primaryAction: "阅读文章",
      secondaryAction: "查看项目",
      profileTitle: "独立开发者 / OPC / 数字游民",
      profileBody:
        "周周黑客松社区发起人，前 AI 算法工程师，96 年生，中山大学计算机。博客和作品集在 makerjackie.com，AI 产品创作教程在 01mvp.com，社交媒体全网同名 MakerJackie。",
      whyEyebrow: "写作边界",
      whyTitle: "这里主要写什么",
      principles: [
        {
          title: "AI 产品实战",
          description: "从一个想法开始，记录选型、实现、上线、反馈和继续迭代的过程。",
        },
        {
          title: "工具和教程",
          description: "分享我自己真正在用的 AI 工具、开发工具和部署方案，尽量写到新手能照着做。",
        },
        {
          title: "个人复盘",
          description: "记录自媒体、社区、产品和生活里的思考，保留当时真实的判断。",
        },
      ],
      paths: [
        {
          eyebrow: "Blog",
          title: "读文章",
          description: "AI、产品、工具、生活和长期思考都会沉淀在这里。",
          href: "/blog",
        },
        {
          eyebrow: "Work",
          title: "看公开项目",
          description: "查看 Jackie 做过的产品、公开实验和长期项目。",
          href: "/projects",
        },
        {
          eyebrow: "01MVP",
          title: "系统化教程",
          description: "AI 产品实战教程、工具工作流和案例手册会沉淀在 01MVP。",
          href: "https://01mvp.com",
        },
      ],
    };
  }

  return {
    eyebrow: "About MakerJackie",
    title: "Exploring the world and turning ideas into visible products.",
    description:
      "Hi, I am MakerJackie. I love exploring the world, traveling, and building small AI products. This site collects my AI product practice, indie projects, creator notes, and long-term thinking.",
    imageAlt: "MakerJackie traveling in front of a wind turbine",
    primaryAction: "Read articles",
    secondaryAction: "View projects",
    profileTitle: "Independent developer / OPC builder / digital nomad",
    profileBody:
      "Founder of Hackathon Weekly, former AI algorithm engineer, and computer science graduate from Sun Yat-sen University. My blog and portfolio are at makerjackie.com, AI product tutorials live at 01mvp.com, and I use MakerJackie across social platforms.",
    whyEyebrow: "Writing",
    whyTitle: "What I write about",
    principles: [
      {
        title: "AI product practice",
        description:
          "Idea selection, stack choices, implementation, launch, feedback, and iteration.",
      },
      {
        title: "Tools and guides",
        description:
          "AI tools, developer tools, and deployment paths written clearly enough for new builders.",
      },
      {
        title: "Personal notes",
        description:
          "Creator work, community building, product reflections, and life notes kept in one place.",
      },
    ],
    paths: [
      {
        eyebrow: "Blog",
        title: "Read articles",
        description: "AI, products, tools, life, and long-term notes live here.",
        href: "/blog",
      },
      {
        eyebrow: "Work",
        title: "View public projects",
        description:
          "Browse products, public experiments, and long-running projects Jackie has built.",
        href: "/projects",
      },
      {
        eyebrow: "01MVP",
        title: "Structured tutorials",
        description: "AI product guides, workflows, and practical cases live in 01MVP.",
        href: "https://01mvp.com",
      },
    ],
  };
}
