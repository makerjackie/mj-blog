import { localizeSiteSettings } from "@repo/core";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

import { SiteShell } from "#/components/site-shell";
import { $getAboutPageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";

type ProjectLink = {
  readonly href: string;
  readonly label: string;
};

type ProjectItem = {
  readonly category: string;
  readonly description: string;
  readonly links: readonly ProjectLink[];
  readonly status: string;
  readonly tags: readonly string[];
  readonly title: string;
  readonly year: string;
};

export const Route = createFileRoute("/projects")({
  loader: () => $getAboutPageData(),
  head: () => {
    const locale = getCurrentLocale();

    return {
      meta: [
        {
          title: locale === "zh" ? "项目 - MakerJackie" : "Projects - MakerJackie",
        },
        {
          name: "description",
          content:
            locale === "zh"
              ? "MakerJackie 做过的产品、网站、工具和公开实验。"
              : "Products, websites, tools, and public experiments by MakerJackie.",
        },
      ],
    };
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const data = Route.useLoaderData();
  const locale = getCurrentLocale();
  const siteSettings = localizeSiteSettings(data.siteSettings, locale);
  const copy = getProjectsCopy(locale);
  const projects = getProjects(locale);

  return (
    <SiteShell siteSettings={siteSettings}>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-link uppercase">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold text-balance sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.description}</p>
        </div>

        <div className="mt-10 border-t border-border">
          {projects.map((project) => (
            <article
              key={project.title}
              className="grid gap-4 border-b border-border py-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:py-7"
            >
              <div className="text-xs font-medium text-muted-foreground">
                <p>{project.year}</p>
                <p className="mt-2 text-foreground">{project.status}</p>
                <p className="mt-2">{project.category}</p>
              </div>

              <div>
                <h2 className="text-2xl leading-snug font-semibold text-balance">
                  {project.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-link underline-offset-4 hover:underline"
                    >
                      {link.label}
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function getProjectsCopy(locale: ReturnType<typeof getCurrentLocale>) {
  if (locale === "zh") {
    return {
      eyebrow: "Projects",
      title: "公开项目",
      description: "一些已经上线、开源或持续迭代的产品、网站、工具和实验。",
    };
  }

  return {
    eyebrow: "Projects",
    title: "Public projects",
    description: "Products, websites, tools, and experiments that are live, open, or evolving.",
  };
}

function getProjects(locale: ReturnType<typeof getCurrentLocale>): readonly ProjectItem[] {
  if (locale === "zh") {
    return zhProjects;
  }

  return enProjects;
}

const zhProjects = [
  {
    title: "Pinmark",
    description: "一个轻量但强大的 Chrome 书签管理器，支持网格视图、深色模式、拖拽整理和实时搜索。",
    category: "产品",
    status: "已发布",
    year: "2026",
    tags: ["Chrome 扩展", "书签管理", "WXT"],
    links: [
      { label: "产品页", href: "https://pinmark.01mvp.com" },
      {
        label: "Chrome 商店",
        href: "https://chromewebstore.google.com/detail/pinmark/jlifmlipjbbllnfpdbmkbbcdomkeanid",
      },
      { label: "代码", href: "https://github.com/makerjackie/pinmark" },
    ],
  },
  {
    title: "MacVimSwitch",
    description: "一个从个人痛点出发，用 AI 辅助开发并拿到 100+ 用户的 Mac 输入法切换工具。",
    category: "工具",
    status: "100+ 用户",
    year: "2023-",
    tags: ["Mac 工具", "Vim", "AI 编程"],
    links: [{ label: "代码", href: "https://github.com/makerjackie/macvimswitch" }],
  },
  {
    title: "BlockWar 方块战争",
    description: "多人实时联机的方块策略游戏，围绕房间、同步、重连和高速对局持续打磨。",
    category: "游戏",
    status: "持续迭代",
    year: "2026",
    tags: ["小游戏", "多人联机", "Web Game"],
    links: [
      { label: "试玩", href: "https://blockwar.01mvp.com" },
      { label: "代码", href: "https://github.com/makerjackie/BlockWar" },
    ],
  },
  {
    title: "01Kit Chrome",
    description: "本地优先的浏览器工作台，管理专注、网站屏蔽、浏览时间记录和常用工具入口。",
    category: "工具",
    status: "已上线",
    year: "2026",
    tags: ["Chrome 插件", "效率工具", "本地优先"],
    links: [
      { label: "官网", href: "https://01kit-chrome.01mvp.com" },
      { label: "代码", href: "https://github.com/makerjackie/01kit-chrome" },
    ],
  },
  {
    title: "世界的形状",
    description: "用有趣的 tree map 帮助读者从面积、人口、经济等维度重新探索世界。",
    category: "产品",
    status: "已上线",
    year: "2026",
    tags: ["Data Viz", "Tree Map", "World Explorer"],
    links: [{ label: "站点", href: "https://shapeof.world" }],
  },
  {
    title: "Paperboat",
    description: "一个 AI 心理漂流瓶小产品，让用户把当下的情绪写下来，再收到一段温和回应。",
    category: "产品",
    status: "已上线",
    year: "2026",
    tags: ["AI", "心理陪伴", "漂流瓶"],
    links: [{ label: "站点", href: "https://paperboat.01mvp.com" }],
  },
  {
    title: "01MVP Starter Kit",
    description: "面向独立开发者的全栈代码模板，内置登录、支付、AI、后台和部署路径。",
    category: "模板",
    status: "持续更新",
    year: "2026",
    tags: ["代码模板", "Starter Kit", "Next.js"],
    links: [{ label: "在线文档", href: "https://01mvp.com/template" }],
  },
  {
    title: "Hackathon Weekly 社区网站",
    description: "周周黑客松的开源社区网站，承载活动、项目和创造者社区的公开入口。",
    category: "社区",
    status: "运行中",
    year: "2024-",
    tags: ["社区", "开源网站", "Hackathon"],
    links: [
      { label: "站点", href: "https://hackathonweekly.com" },
      { label: "代码", href: "https://github.com/hackathonweekly/community" },
    ],
  },
] as const satisfies readonly ProjectItem[];

const enProjects = [
  {
    title: "Pinmark",
    description:
      "A lightweight Chrome bookmark manager with grid view, dark mode, drag sorting, and live search.",
    category: "Product",
    status: "Published",
    year: "2026",
    tags: ["Chrome Extension", "Bookmarks", "WXT"],
    links: [
      { label: "Product", href: "https://pinmark.01mvp.com" },
      {
        label: "Chrome Web Store",
        href: "https://chromewebstore.google.com/detail/pinmark/jlifmlipjbbllnfpdbmkbbcdomkeanid",
      },
      { label: "Code", href: "https://github.com/makerjackie/pinmark" },
    ],
  },
  {
    title: "MacVimSwitch",
    description: "A Mac input-source switcher built from a personal Vim workflow pain point.",
    category: "Tool",
    status: "100+ users",
    year: "2023-",
    tags: ["Mac Tool", "Vim", "AI Coding"],
    links: [{ label: "Code", href: "https://github.com/makerjackie/macvimswitch" }],
  },
  {
    title: "BlockWar",
    description:
      "A real-time multiplayer block strategy game focused on rooms, sync, reconnects, and fast matches.",
    category: "Game",
    status: "Iterating",
    year: "2026",
    tags: ["Web Game", "Multiplayer", "Realtime"],
    links: [
      { label: "Play", href: "https://blockwar.01mvp.com" },
      { label: "Code", href: "https://github.com/makerjackie/BlockWar" },
    ],
  },
  {
    title: "01Kit Chrome",
    description:
      "A local-first browser workspace for focus, site blocking, browsing records, and tool shortcuts.",
    category: "Tool",
    status: "Live",
    year: "2026",
    tags: ["Chrome Extension", "Productivity", "Local First"],
    links: [
      { label: "Website", href: "https://01kit-chrome.01mvp.com" },
      { label: "Code", href: "https://github.com/makerjackie/01kit-chrome" },
    ],
  },
  {
    title: "Shape of World",
    description:
      "A tree-map interface for exploring the world by area, population, economy, and more.",
    category: "Product",
    status: "Live",
    year: "2026",
    tags: ["Data Viz", "Tree Map", "World Explorer"],
    links: [{ label: "Website", href: "https://shapeof.world" }],
  },
  {
    title: "Paperboat",
    description:
      "An AI emotional bottle product for writing feelings down and receiving a gentle reply.",
    category: "Product",
    status: "Live",
    year: "2026",
    tags: ["AI", "Mental Health", "Bottle"],
    links: [{ label: "Website", href: "https://paperboat.01mvp.com" }],
  },
  {
    title: "01MVP Starter Kit",
    description:
      "A full-stack starter kit for indie builders with auth, payments, AI, admin, and deployment paths.",
    category: "Template",
    status: "Updating",
    year: "2026",
    tags: ["Starter Kit", "Next.js", "Full Stack"],
    links: [{ label: "Docs", href: "https://01mvp.com/template" }],
  },
  {
    title: "Hackathon Weekly Community",
    description: "The open community website for Hackathon Weekly events, projects, and creators.",
    category: "Community",
    status: "Running",
    year: "2024-",
    tags: ["Community", "Open Source", "Hackathon"],
    links: [
      { label: "Website", href: "https://hackathonweekly.com" },
      { label: "Code", href: "https://github.com/hackathonweekly/community" },
    ],
  },
] as const satisfies readonly ProjectItem[];
