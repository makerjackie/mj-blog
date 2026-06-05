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

            <aside className="flex items-start gap-5 border-t border-border pt-6 lg:block lg:border-t lg:bg-muted/20 lg:p-5">
              <img
                src="/jackie-avatar.jpg"
                alt="MakerJackie"
                className="size-24 shrink-0 border-2 border-border object-cover shadow-[5px_5px_0_0_var(--border)] sm:size-32 lg:size-36"
              />
              <div className="lg:mt-5">
                <p className="text-sm font-semibold text-link uppercase">MakerJackie</p>
                <p className="mt-2 text-2xl font-semibold">{copy.profileTitle}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.profileBody}</p>
              </div>
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
      title: "用 AI 做产品，也记录一路上的弯路。",
      description:
        "这里会记录我的 AI 产品实践、独立开发项目、自媒体复盘和一些长期思考。很多文章不追求完美，但会尽量留下真实的路径、判断和踩坑。",
      primaryAction: "阅读文章",
      secondaryAction: "查看项目",
      profileTitle: "独立开发者，前 AI 算法工程师",
      profileBody: "Jackie 是周周黑客松社区发起人，也长期记录 AI 创作、产品实验和可复用模板。",
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
          title: "读最新文章",
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
          eyebrow: "Template",
          title: "博客模板",
          description: "这个站由 01mvp-blog-starter 生成，也会继续作为第一个真实用户使用。",
          href: "https://github.com/01mvp/blog-starter",
        },
      ],
    };
  }

  return {
    eyebrow: "About MakerJackie",
    title: "Building AI products and documenting the path.",
    description:
      "This site collects my AI product practice, indie projects, creator notes, and long-term thinking. The writing is practical, direct, and grounded in actual work.",
    primaryAction: "Read articles",
    secondaryAction: "View projects",
    profileTitle: "Independent developer and former AI algorithm engineer",
    profileBody:
      "Jackie founded Hackathon Weekly and keeps publishing AI creation notes, product experiments, and reusable templates.",
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
        title: "Read the latest posts",
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
        eyebrow: "Template",
        title: "Blog starter",
        description:
          "This site is powered by 01mvp-blog-starter and will keep dogfooding the template.",
        href: "https://github.com/01mvp/blog-starter",
      },
    ],
  };
}
