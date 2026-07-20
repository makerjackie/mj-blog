import { SiGithub } from "@icons-pack/react-simple-icons";
import { localizeSiteSettings } from "@repo/core";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLinkIcon, FileTextIcon, Globe2Icon, LayoutGridIcon, ListIcon } from "lucide-react";
import { useState } from "react";

import { SiteShell } from "#/components/site-shell";
import { $getAboutPageData } from "#/lib/cms-server";
import { getCurrentLocale } from "#/lib/i18n";

type ProjectCategory =
  | "all"
  | "product"
  | "tool"
  | "game"
  | "template"
  | "community"
  | "website"
  | "ios"
  | "experiment";

type ProjectLink = {
  readonly href: string;
  readonly kind?: "article" | "github" | "live" | "site";
  readonly label: string;
};

type ProjectItem = {
  readonly category: Exclude<ProjectCategory, "all">;
  readonly categoryLabel: string;
  readonly description: string;
  readonly featured?: boolean;
  readonly image?: string;
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
          title: locale === "zh" ? "作品集 - MakerJackie" : "Projects - MakerJackie",
        },
        {
          name: "description",
          content:
            locale === "zh"
              ? "MakerJackie 持续投入的 One Apps、01MVP，以及过去做过的实验和作品。"
              : "MakerJackie's active work on One Apps and 01MVP, plus past experiments and projects.",
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
  const featuredProjects = projects.filter((project) => project.featured);
  const independentProjects = projects.filter(
    (project) => !project.featured && project.category !== "experiment",
  );
  const experimentProjects = projects.filter(
    (project) => !project.featured && project.category === "experiment",
  );

  return (
    <SiteShell siteSettings={siteSettings}>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="border-b-2 border-border pb-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {copy.description}
          </p>
        </section>

        <ProjectsIndex
          copy={copy}
          featuredProjects={featuredProjects}
          independentProjects={independentProjects}
          experimentProjects={experimentProjects}
        />
      </main>
    </SiteShell>
  );
}

function ProjectsIndex({
  copy,
  experimentProjects,
  featuredProjects,
  independentProjects,
}: {
  readonly copy: ReturnType<typeof getProjectsCopy>;
  readonly experimentProjects: readonly ProjectItem[];
  readonly featuredProjects: readonly ProjectItem[];
  readonly independentProjects: readonly ProjectItem[];
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="mt-10 space-y-14">
      <section>
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {copy.activeEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.activeTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {copy.activeDescription}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-3 border-t-2 border-border pt-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {copy.independentEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {copy.independentTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              {copy.independentDescription}
            </p>
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title={copy.gridViewLabel}
              className={viewButtonClassName(viewMode === "grid")}
            >
              <LayoutGridIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title={copy.listViewLabel}
              className={viewButtonClassName(viewMode === "list")}
            >
              <ListIcon className="size-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {independentProjects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {independentProjects.map((project) => (
              <ProjectListRow key={project.title} project={project} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="max-w-3xl border-t-2 border-border pt-8">
          <p className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {copy.experimentsEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.experimentsTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {copy.experimentsDescription}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {experimentProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { readonly project: ProjectItem }) {
  return (
    <article className="group flex min-h-64 flex-col border border-border/30 bg-background p-3.5 transition-colors hover:bg-secondary sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-bold text-muted-foreground">
          {project.status}
        </span>
        <span className="font-mono text-[11px] font-bold text-muted-foreground">
          {project.year}
        </span>
      </div>

      {project.image ? (
        <div className="relative mt-3 aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="size-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <h2 className="mt-3 text-xl leading-tight font-semibold tracking-tight text-balance group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
        {project.title}
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="bg-secondary px-2 py-1 text-[11px] leading-none font-bold text-muted-foreground group-hover:bg-background"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {project.links.map((link) => (
          <ProjectExternalLink key={`${project.title}-${link.href}`} link={link} />
        ))}
      </div>
    </article>
  );
}

function ProjectListRow({ project }: { readonly project: ProjectItem }) {
  return (
    <article className="group flex flex-col gap-3 border border-border/30 bg-background px-4 py-3 transition-colors hover:bg-secondary sm:flex-row sm:items-center sm:gap-4">
      {project.image ? (
        <div className="relative hidden h-14 w-24 shrink-0 overflow-hidden bg-muted sm:block">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-base font-semibold tracking-tight group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
            {project.title}
          </h2>
          <span className="font-mono text-[11px] font-bold text-muted-foreground">
            {project.status}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{project.description}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="hidden font-mono text-[11px] font-bold text-muted-foreground md:inline">
          {project.categoryLabel}
        </span>
        {project.links.map((link) => (
          <ProjectExternalLink key={`${project.title}-${link.href}`} link={link} />
        ))}
      </div>
    </article>
  );
}

function ProjectExternalLink({ link }: { readonly link: ProjectLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 items-center gap-1.5 border border-border/30 bg-background px-2.5 font-mono text-[11px] font-bold no-underline transition-colors hover:bg-foreground hover:text-background hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ProjectLinkIcon kind={link.kind} />
      {link.label}
      {link.kind === "github" ? null : <ExternalLinkIcon className="size-3" />}
    </a>
  );
}

function ProjectLinkIcon({ kind }: { readonly kind: ProjectLink["kind"] }) {
  if (kind === "github") {
    return <SiGithub className="size-3.5" />;
  }

  if (kind === "article") {
    return <FileTextIcon className="size-3.5" />;
  }

  return <Globe2Icon className="size-3.5" />;
}

function viewButtonClassName(active: boolean) {
  return cn(
    "flex size-8 items-center justify-center border border-border/30 transition-colors",
    active
      ? "bg-foreground text-background"
      : "bg-background text-muted-foreground hover:bg-secondary",
  );
}

function getProjectsCopy(locale: ReturnType<typeof getCurrentLocale>) {
  if (locale === "zh") {
    return {
      title: "作品集",
      description:
        "MakerJackie 的作品分成四条脉络：01MVP、One Apps、Independent Works 与 Experiments。长期产品持续维护，独立作品追求表达，实验则允许失败。",
      activeEyebrow: "长期主线",
      activeTitle: "01MVP 与 One Apps",
      activeDescription:
        "01MVP 沉淀教程、课程、模板、陪跑与开发案例；One Apps 是面向普通用户、小而美并长期维护的正式 App。",
      independentEyebrow: "Independent Works",
      independentTitle: "独立作品",
      independentDescription:
        "这里收录 shapeof.world、独立游戏、互动网站，以及我真正喜欢的叙事与艺术作品。",
      experimentsEyebrow: "Experiments",
      experimentsTitle: "实验与失败",
      experimentsDescription:
        "原型、周末作品、无用 App 和技术实验。它们不一定成功，也不承诺继续维护，但仍记录了真实的探索过程。",
      gridViewLabel: "网格视图",
      listViewLabel: "列表视图",
    };
  }

  return {
    title: "Projects",
    description:
      "MakerJackie's work follows four paths: 01MVP, One Apps, Independent Works, and Experiments. Products are maintained, independent works pursue expression, and experiments are allowed to fail.",
    activeEyebrow: "Long-term",
    activeTitle: "01MVP and One Apps",
    activeDescription:
      "01MVP collects tutorials, courses, templates, coaching, and development cases. One Apps is for small, polished, long-maintained apps made for everyday users.",
    independentEyebrow: "Independent Works",
    independentTitle: "Independent works",
    independentDescription:
      "shapeof.world, independent games, interactive websites, and narrative or artistic work I genuinely care about.",
    experimentsEyebrow: "Experiments",
    experimentsTitle: "Experiments and failures",
    experimentsDescription:
      "Prototypes, weekend builds, useless apps, and technical experiments. They may fail and may no longer be maintained, but they remain part of the record.",
    gridViewLabel: "Grid view",
    listViewLabel: "List view",
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
    title: "One Apps Studio",
    description:
      "我正在开发和更新的 Apple 平台 App 都集中在这里。具体产品、进度和最新状态以 One Apps 为准。",
    featured: true,
    category: "product",
    categoryLabel: "长期项目",
    status: "持续更新",
    year: "2026",
    tags: ["iPhone", "iPad", "Mac"],
    links: [{ label: "查看所有 App", href: "https://oneapps.studio/apps", kind: "site" }],
  },
  {
    title: "01MVP AI 实战教程",
    description: "AI 产品创作的长期项目，持续沉淀教程、课程、模板、陪跑服务和真实开发案例。",
    featured: true,
    category: "website",
    categoryLabel: "长期项目",
    status: "持续更新",
    year: "2026",
    tags: ["AI 产品", "实战教程", "工作流"],
    links: [{ label: "查看 01MVP", href: "https://01mvp.com", kind: "site" }],
  },
  {
    title: "shapeof.world",
    description:
      "一个关于世界形状、感知与表达的互动作品。它不是效率产品，而是我目前最喜欢、也最接近理想效果的独立创作之一。",
    category: "website",
    categoryLabel: "独立作品",
    status: "代表作",
    year: "2026",
    image: "/projects/shapeof-world.webp",
    tags: ["互动网站", "叙事", "艺术作品"],
    links: [{ label: "体验作品", href: "https://shapeof.world", kind: "live" }],
  },
  {
    title: "Hackathon Weekly 社区网站",
    description: "周周黑客松的开源社区网站，承载活动、项目和创造者社区的公开入口。",
    category: "community",
    categoryLabel: "社区",
    status: "运行中",
    year: "2024-",
    image: "/projects/hackathonweekly-community.webp",
    tags: ["社区", "开源网站", "Hackathon"],
    links: [
      { label: "站点", href: "https://hackathonweekly.com", kind: "site" },
      { label: "代码", href: "https://github.com/hackathonweekly/community", kind: "github" },
    ],
  },
  {
    title: "Paperboat",
    description:
      "一个和朋友共同开发的 AI 心理漂流瓶小产品，让用户把当下的情绪写下来，再收到一段温和回应。",
    category: "product",
    categoryLabel: "产品",
    status: "已上线",
    year: "2026",
    image: "/projects/paperboat.webp",
    tags: ["AI", "心理陪伴", "漂流瓶"],
    links: [{ label: "站点", href: "https://paperboat.01mvp.com", kind: "site" }],
  },
  {
    title: "BlockWar 方块战争",
    description: "多人实时联机的方块策略游戏，围绕房间、同步、重连和高速对局持续打磨。",
    category: "game",
    categoryLabel: "小游戏",
    status: "持续迭代",
    year: "2026",
    image: "/projects/blockwar.webp",
    tags: ["小游戏", "多人联机", "Web Game"],
    links: [
      { label: "试玩", href: "https://blockwar.01mvp.com", kind: "live" },
      { label: "代码", href: "https://github.com/makerjackie/BlockWar", kind: "github" },
    ],
  },
  {
    title: "MacVimSwitch",
    description: "一个从个人痛点出发，用 AI 辅助开发并拿到 100+ 用户的 Mac 输入法切换工具。",
    category: "tool",
    categoryLabel: "工具",
    status: "100+ 用户",
    year: "2023-",
    image: "/images/macvimswitch-ai-written-mac-app-100plus-users.002.webp",
    tags: ["Mac 工具", "Vim", "AI 编程"],
    links: [{ label: "代码", href: "https://github.com/makerjackie/macvimswitch", kind: "github" }],
  },
  {
    title: "狂扁笨笨",
    description:
      "用 Codex 复刻经典玩法的趣味小游戏，纯 AI 生成，主打一个 AI 能不能做出好玩的东西。",
    category: "game",
    categoryLabel: "小游戏",
    status: "已上线",
    year: "2026",
    image: "/projects/kuangbian-bunny.webp",
    tags: ["游戏", "AI 生成", "Codex"],
    links: [{ label: "站点", href: "https://kuangbian.01mvp.com", kind: "live" }],
  },
  {
    title: "Pinmark",
    description: "一个轻量但强大的 Chrome 书签管理器，支持网格视图、深色模式、拖拽整理和实时搜索。",
    category: "product",
    categoryLabel: "产品",
    status: "已发布",
    year: "2026",
    image: "/projects/pinmark.webp",
    tags: ["Chrome 扩展", "书签管理", "WXT"],
    links: [
      { label: "产品页", href: "https://pinmark.01mvp.com", kind: "site" },
      {
        label: "Chrome 商店",
        href: "https://chromewebstore.google.com/detail/pinmark/jlifmlipjbbllnfpdbmkbbcdomkeanid",
        kind: "live",
      },
      { label: "代码", href: "https://github.com/makerjackie/pinmark", kind: "github" },
    ],
  },
  {
    title: "01Kit Chrome",
    description: "本地优先的浏览器工作台，管理专注、网站屏蔽、浏览时间记录和常用工具入口。",
    category: "tool",
    categoryLabel: "工具",
    status: "已上线",
    year: "2026",
    image: "/projects/01kit-chrome.webp",
    tags: ["Chrome 插件", "效率工具", "本地优先"],
    links: [
      { label: "官网", href: "https://01kit-chrome.01mvp.com", kind: "site" },
      { label: "代码", href: "https://github.com/makerjackie/01kit-chrome", kind: "github" },
    ],
  },
  {
    title: "UnboundX 品牌视觉",
    description: "从 Logo 到动效，用 Claude Opus 和 Gemini 打造 UnboundX 品牌视觉系统。",
    category: "experiment",
    categoryLabel: "实验",
    status: "已完成",
    year: "2026",
    image: "/projects/2026-04-05.webp",
    tags: ["UnboundX", "Logo", "Remotion"],
    links: [{ label: "展示", href: "https://logo.unboundxai.com", kind: "site" }],
  },
  {
    title: "Tiny Planets",
    description:
      "一次带有叙事、探索与星球场景的网页游戏实验。场景模式始终没有达到我期待的可玩性，目前已经停止维护。",
    category: "experiment",
    categoryLabel: "失败实验",
    status: "停止维护",
    year: "2026",
    tags: ["独立游戏", "场景实验", "Three.js"],
    links: [{ label: "保留现场", href: "https://tinyplanets.oneapps.studio", kind: "live" }],
  },
  {
    title: "联机桌游",
    description: "支持多人联机的轻量桌游网站，打开浏览器就能和朋友一起玩。",
    category: "game",
    categoryLabel: "小游戏",
    status: "已上线",
    year: "2026",
    image: "/projects/online-board-game.webp",
    tags: ["游戏", "联机", "多人"],
    links: [{ label: "站点", href: "https://game.01mvp.com", kind: "live" }],
  },
  {
    title: "UnboundX 公司官网",
    description: "自由维度 UnboundX 的公司官网，用来承载一人公司、AI 产品实践和对外合作入口。",
    category: "website",
    categoryLabel: "网站",
    status: "已上线",
    year: "2026",
    image: "/projects/unboundx-company-site.webp",
    tags: ["UnboundX", "公司官网", "AI 产品"],
    links: [{ label: "站点", href: "https://unboundx.tech", kind: "site" }],
  },
] as const satisfies readonly ProjectItem[];

const enProjects = [
  {
    title: "One Apps Studio",
    description:
      "The home for the Apple-platform apps I am actively building and updating. See One Apps for the current lineup, progress, and release status.",
    featured: true,
    category: "product",
    categoryLabel: "Long-term project",
    status: "Actively updated",
    year: "2026",
    tags: ["iPhone", "iPad", "Mac"],
    links: [{ label: "Explore all apps", href: "https://oneapps.studio/apps", kind: "site" }],
  },
  {
    title: "01MVP",
    description:
      "A long-term AI product practice covering tutorials, courses, templates, coaching, and real development cases.",
    featured: true,
    category: "website",
    categoryLabel: "Long-term project",
    status: "Actively updated",
    year: "2026",
    tags: ["AI Products", "Tutorials", "Workflows"],
    links: [{ label: "Explore 01MVP", href: "https://01mvp.com", kind: "site" }],
  },
  {
    title: "shapeof.world",
    description:
      "An interactive work about the shape of the world, perception, and expression. It is one of the independent pieces whose result I genuinely like.",
    category: "website",
    categoryLabel: "Independent work",
    status: "Selected work",
    year: "2026",
    image: "/projects/shapeof-world.webp",
    tags: ["Interactive", "Narrative", "Art"],
    links: [{ label: "Experience", href: "https://shapeof.world", kind: "live" }],
  },
  {
    title: "Hackathon Weekly Community",
    description: "The open community website for Hackathon Weekly events, projects, and creators.",
    category: "community",
    categoryLabel: "Community",
    status: "Running",
    year: "2024-",
    image: "/projects/hackathonweekly-community.webp",
    tags: ["Community", "Open Source", "Hackathon"],
    links: [
      { label: "Website", href: "https://hackathonweekly.com", kind: "site" },
      { label: "Code", href: "https://github.com/hackathonweekly/community", kind: "github" },
    ],
  },
  {
    title: "Paperboat",
    description:
      "A collaborative AI emotional bottle product for writing feelings down and receiving a gentle reply.",
    category: "product",
    categoryLabel: "Product",
    status: "Live",
    year: "2026",
    image: "/projects/paperboat.webp",
    tags: ["AI", "Mental Health", "Bottle"],
    links: [{ label: "Website", href: "https://paperboat.01mvp.com", kind: "site" }],
  },
  {
    title: "BlockWar",
    description:
      "A real-time multiplayer block strategy game focused on rooms, sync, reconnects, and fast matches.",
    category: "game",
    categoryLabel: "Game",
    status: "Iterating",
    year: "2026",
    image: "/projects/blockwar.webp",
    tags: ["Web Game", "Multiplayer", "Realtime"],
    links: [
      { label: "Play", href: "https://blockwar.01mvp.com", kind: "live" },
      { label: "Code", href: "https://github.com/makerjackie/BlockWar", kind: "github" },
    ],
  },
  {
    title: "MacVimSwitch",
    description: "A Mac input-source switcher built from a personal Vim workflow pain point.",
    category: "tool",
    categoryLabel: "Tool",
    status: "100+ users",
    year: "2023-",
    image: "/images/macvimswitch-ai-written-mac-app-100plus-users.002.webp",
    tags: ["Mac Tool", "Vim", "AI Coding"],
    links: [{ label: "Code", href: "https://github.com/makerjackie/macvimswitch", kind: "github" }],
  },
  {
    title: "Kuangbian Bunny",
    description:
      "A small AI-generated browser game built with Codex as a playful game-making experiment.",
    category: "game",
    categoryLabel: "Game",
    status: "Live",
    year: "2026",
    image: "/projects/kuangbian-bunny.webp",
    tags: ["Game", "AI Generated", "Codex"],
    links: [{ label: "Play", href: "https://kuangbian.01mvp.com", kind: "live" }],
  },
  {
    title: "Pinmark",
    description:
      "A lightweight Chrome bookmark manager with grid view, dark mode, drag sorting, and live search.",
    category: "product",
    categoryLabel: "Product",
    status: "Published",
    year: "2026",
    image: "/projects/pinmark.webp",
    tags: ["Chrome Extension", "Bookmarks", "WXT"],
    links: [
      { label: "Product", href: "https://pinmark.01mvp.com", kind: "site" },
      {
        label: "Chrome Web Store",
        href: "https://chromewebstore.google.com/detail/pinmark/jlifmlipjbbllnfpdbmkbbcdomkeanid",
        kind: "live",
      },
      { label: "Code", href: "https://github.com/makerjackie/pinmark", kind: "github" },
    ],
  },
  {
    title: "01Kit Chrome",
    description:
      "A local-first browser workspace for focus, site blocking, browsing records, and tool shortcuts.",
    category: "tool",
    categoryLabel: "Tool",
    status: "Live",
    year: "2026",
    image: "/projects/01kit-chrome.webp",
    tags: ["Chrome Extension", "Productivity", "Local First"],
    links: [
      { label: "Website", href: "https://01kit-chrome.01mvp.com", kind: "site" },
      { label: "Code", href: "https://github.com/makerjackie/01kit-chrome", kind: "github" },
    ],
  },
  {
    title: "UnboundX Visual Identity",
    description:
      "An AI-assisted brand identity experiment for UnboundX, from logo direction to motion assets.",
    category: "experiment",
    categoryLabel: "Experiment",
    status: "Finished",
    year: "2026",
    image: "/projects/2026-04-05.webp",
    tags: ["UnboundX", "Logo", "Remotion"],
    links: [{ label: "Showcase", href: "https://logo.unboundxai.com", kind: "site" }],
  },
  {
    title: "Tiny Planets",
    description:
      "A browser-game experiment in narrative exploration and planetary scenes. The scene-based mode never became as fun as intended, so the project is no longer maintained.",
    category: "experiment",
    categoryLabel: "Failed experiment",
    status: "No longer maintained",
    year: "2026",
    tags: ["Indie Game", "Scene Study", "Three.js"],
    links: [{ label: "View archive", href: "https://tinyplanets.oneapps.studio", kind: "live" }],
  },
  {
    title: "Online Board Games",
    description: "A lightweight multiplayer board-game site that opens directly in the browser.",
    category: "game",
    categoryLabel: "Game",
    status: "Live",
    year: "2026",
    image: "/projects/online-board-game.webp",
    tags: ["Game", "Multiplayer", "Browser"],
    links: [{ label: "Play", href: "https://game.01mvp.com", kind: "live" }],
  },
  {
    title: "UnboundX Company Site",
    description:
      "The company website for UnboundX, separating company positioning from MakerJackie and 01MVP.",
    category: "website",
    categoryLabel: "Website",
    status: "Live",
    year: "2026",
    image: "/projects/unboundx-company-site.webp",
    tags: ["UnboundX", "Company", "AI Products"],
    links: [{ label: "Website", href: "https://unboundx.tech", kind: "site" }],
  },
] as const satisfies readonly ProjectItem[];
