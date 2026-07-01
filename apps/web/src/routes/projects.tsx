import { SiGithub } from "@icons-pack/react-simple-icons";
import { localizeSiteSettings } from "@repo/core";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLinkIcon, FileTextIcon, Globe2Icon, LayoutGridIcon, ListIcon } from "lucide-react";
import { useMemo, useState } from "react";

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
              ? "一些已经公开的产品、网站和开源项目。"
              : "Public products, websites, tools, and open source projects by MakerJackie.",
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
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="border-b-2 border-border pb-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {copy.description}
          </p>
        </section>

        <ProjectsIndex copy={copy} projects={projects} />
      </main>
    </SiteShell>
  );
}

function ProjectsIndex({
  copy,
  projects,
}: {
  readonly copy: ReturnType<typeof getProjectsCopy>;
  readonly projects: readonly ProjectItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const availableCategories = useMemo(
    () => new Set(projects.map((project) => project.category)),
    [projects],
  );
  const visibleFilters = copy.filters.filter(
    (filter) => filter.category === "all" || availableCategories.has(filter.category),
  );
  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {visibleFilters.map((filter) => {
            const isActive = selectedCategory === filter.category;

            return (
              <button
                key={filter.category}
                type="button"
                onClick={() => setSelectedCategory(filter.category)}
                className={cn(
                  "h-8 border border-border/30 px-3 font-mono text-[11px] font-bold transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-secondary",
                )}
              >
                {filter.label}
              </button>
            );
          })}
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
          {filteredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredProjects.map((project) => (
            <ProjectListRow key={project.title} project={project} />
          ))}
        </div>
      )}
    </section>
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
      description: "一些已经公开的产品、网站和开源项目。",
      gridViewLabel: "网格视图",
      listViewLabel: "列表视图",
      filters: [
        { category: "all", label: "全部" },
        { category: "product", label: "产品" },
        { category: "tool", label: "工具" },
        { category: "game", label: "小游戏" },
        { category: "ios", label: "iOS" },
        { category: "template", label: "模板" },
        { category: "community", label: "社区" },
        { category: "website", label: "网站" },
        { category: "experiment", label: "实验" },
      ] as const satisfies readonly { category: ProjectCategory; label: string }[],
    };
  }

  return {
    title: "Projects",
    description: "Public products, websites, tools, and open source projects.",
    gridViewLabel: "Grid view",
    listViewLabel: "List view",
    filters: [
      { category: "all", label: "All" },
      { category: "product", label: "Products" },
      { category: "tool", label: "Tools" },
      { category: "game", label: "Games" },
      { category: "ios", label: "iOS" },
      { category: "template", label: "Templates" },
      { category: "community", label: "Community" },
      { category: "website", label: "Websites" },
      { category: "experiment", label: "Experiments" },
    ] as const satisfies readonly { category: ProjectCategory; label: string }[],
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
    title: "一念 OneZen",
    description: "一个免费、无账号、全离线的 iPhone 冥想应用，用 SwiftUI 独立开发。",
    category: "ios",
    categoryLabel: "iOS",
    status: "已上线",
    year: "2026",
    image: "/projects/onezen.webp",
    tags: ["SwiftUI", "iOS", "冥想"],
    links: [{ label: "站点", href: "https://onezen.01mvp.com", kind: "site" }],
  },
  {
    title: "删图 PhotoDelete",
    description: "一个用手势快速整理相册的 iPhone 应用，左滑删除、右滑保留，支持批量确认。",
    category: "ios",
    categoryLabel: "iOS",
    status: "已上线",
    year: "2026",
    image: "/projects/photodelete.webp",
    tags: ["SwiftUI", "iOS", "照片管理"],
    links: [{ label: "站点", href: "https://photodelete.01mvp.com", kind: "site" }],
  },
  {
    title: "一愿 OneWish",
    description: "一个用 AI 生成「未来自己」愿景图的 iPhone 应用，每日视觉提醒帮你靠近目标。",
    category: "ios",
    categoryLabel: "iOS",
    status: "待上架",
    year: "2026",
    image: "/projects/onewish.webp",
    tags: ["SwiftUI", "iOS", "AI"],
    links: [{ label: "站点", href: "https://onewish.01mvp.com", kind: "site" }],
  },
  {
    title: "01MVP AI 实战教程",
    description:
      "一个面向 AI 产品实践者的教程与案例站，把工具上手、MVP 案例和工作流沉淀成结构化内容。",
    category: "website",
    categoryLabel: "网站",
    status: "已上线",
    year: "2026",
    image: "/projects/01mvp-website-design.webp",
    tags: ["AI 教程", "Fumadocs", "01MVP"],
    links: [{ label: "站点", href: "https://01mvp.com", kind: "site" }],
  },
  {
    title: "01MVP Blog",
    description: "面向独立开发者和 AI 产品实践者的内容站，涵盖工具指南、实战案例和一人公司方法论。",
    category: "website",
    categoryLabel: "网站",
    status: "历史版本",
    year: "2026",
    image: "/projects/01mvp-blog.webp",
    tags: ["VitePress", "AI 教程", "01MVP"],
    links: [{ label: "站点", href: "https://blog.01mvp.com", kind: "site" }],
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
    title: "MakerJackie.com 旧版博客",
    description:
      "从仓库结构、内容工作流到 GitHub Actions + Cloudflare Workers 部署，记录旧版个人博客的开发过程。",
    category: "website",
    categoryLabel: "网站",
    status: "已归档",
    year: "2026",
    image: "/projects/how-i-built-and-deployed-this-blog.webp",
    tags: ["建站", "Next.js", "Cloudflare"],
    links: [
      { label: "归档站", href: "https://old.makerjackie.com", kind: "site" },
      { label: "代码", href: "https://github.com/makerjackie/makerjackie.com", kind: "github" },
    ],
  },
  {
    title: "世界的形状",
    description: "用有趣的 tree map 帮助读者从面积、人口、经济等维度重新探索世界。",
    category: "product",
    categoryLabel: "产品",
    status: "已上线",
    year: "2026",
    image: "/projects/shapeof-world.webp",
    tags: ["Data Viz", "Tree Map", "World Explorer"],
    links: [{ label: "站点", href: "https://shapeof.world", kind: "site" }],
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
    title: "01MVP Starter Kit",
    description: "面向独立开发者的全栈代码模板，内置登录、支付、AI、后台和部署路径。",
    category: "template",
    categoryLabel: "模板",
    status: "持续更新",
    year: "2026",
    image: "/projects/01mvp-template-docs.webp",
    tags: ["代码模板", "Starter Kit", "Next.js"],
    links: [{ label: "在线文档", href: "https://01mvp.com/template", kind: "article" }],
  },
  {
    title: "Skills 手册",
    description: "01MVP 工作流与 AI 技能库的使用手册，涵盖写作、设计、开发和发布流程。",
    category: "template",
    categoryLabel: "模板",
    status: "持续更新",
    year: "2026",
    image: "/projects/01mvp-skills-docs.webp",
    tags: ["知识库", "AI Skills", "手册"],
    links: [
      { label: "在线阅读", href: "https://www.01mvp.com/docs/skills", kind: "live" },
      { label: "代码", href: "https://github.com/makerjackie/skills", kind: "github" },
    ],
  },
  {
    title: "源问 RootQuestion",
    description: "基于第一性原理的个人世界模型系统，帮你找到问题背后的问题。",
    category: "experiment",
    categoryLabel: "实验",
    status: "已上线",
    year: "2026",
    image: "/projects/rootquestion.webp",
    tags: ["AI", "First Principles", "Thinking Tool"],
    links: [{ label: "体验源问", href: "http://rootquestion.01mvp.com/", kind: "live" }],
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
    title: "OneZen",
    description: "A free, offline-first iPhone meditation app built independently with SwiftUI.",
    category: "ios",
    categoryLabel: "iOS",
    status: "Live",
    year: "2026",
    image: "/projects/onezen.webp",
    tags: ["SwiftUI", "iOS", "Meditation"],
    links: [{ label: "Website", href: "https://onezen.01mvp.com", kind: "site" }],
  },
  {
    title: "PhotoDelete",
    description:
      "An iPhone photo-cleaning app for sorting albums with swipe gestures and batch confirmation.",
    category: "ios",
    categoryLabel: "iOS",
    status: "Live",
    year: "2026",
    image: "/projects/photodelete.webp",
    tags: ["SwiftUI", "iOS", "Photos"],
    links: [{ label: "Website", href: "https://photodelete.01mvp.com", kind: "site" }],
  },
  {
    title: "OneWish",
    description: "An iPhone app that turns goals into AI-generated future-self vision images.",
    category: "ios",
    categoryLabel: "iOS",
    status: "Pre-release",
    year: "2026",
    image: "/projects/onewish.webp",
    tags: ["SwiftUI", "iOS", "AI"],
    links: [{ label: "Website", href: "https://onewish.01mvp.com", kind: "site" }],
  },
  {
    title: "01MVP",
    description:
      "A practical AI product handbook that turns tools, workflows, and MVP cases into structured guides.",
    category: "website",
    categoryLabel: "Website",
    status: "Live",
    year: "2026",
    image: "/projects/01mvp-website-design.webp",
    tags: ["AI Tutorials", "Fumadocs", "01MVP"],
    links: [{ label: "Website", href: "https://01mvp.com", kind: "site" }],
  },
  {
    title: "01MVP Blog",
    description:
      "A historical content hub for AI product practice, tool guides, and indie maker notes.",
    category: "website",
    categoryLabel: "Website",
    status: "Archived",
    year: "2026",
    image: "/projects/01mvp-blog.webp",
    tags: ["VitePress", "AI Tutorials", "01MVP"],
    links: [{ label: "Website", href: "https://blog.01mvp.com", kind: "site" }],
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
    title: "MakerJackie.com Legacy Blog",
    description:
      "The archived MDX-first personal blog built with Next.js, Fumadocs, GitHub Actions, and Cloudflare Workers.",
    category: "website",
    categoryLabel: "Website",
    status: "Archived",
    year: "2026",
    image: "/projects/how-i-built-and-deployed-this-blog.webp",
    tags: ["Website", "Next.js", "Cloudflare"],
    links: [
      { label: "Archive", href: "https://old.makerjackie.com", kind: "site" },
      { label: "Code", href: "https://github.com/makerjackie/makerjackie.com", kind: "github" },
    ],
  },
  {
    title: "Shape of World",
    description:
      "A tree-map interface for exploring the world by area, population, economy, and more.",
    category: "product",
    categoryLabel: "Product",
    status: "Live",
    year: "2026",
    image: "/projects/shapeof-world.webp",
    tags: ["Data Viz", "Tree Map", "World Explorer"],
    links: [{ label: "Website", href: "https://shapeof.world", kind: "site" }],
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
    title: "01MVP Starter Kit",
    description:
      "A full-stack starter kit for indie builders with auth, payments, AI, admin, and deployment paths.",
    category: "template",
    categoryLabel: "Template",
    status: "Updating",
    year: "2026",
    image: "/projects/01mvp-template-docs.webp",
    tags: ["Starter Kit", "Next.js", "Full Stack"],
    links: [{ label: "Docs", href: "https://01mvp.com/template", kind: "article" }],
  },
  {
    title: "Skills Handbook",
    description:
      "A practical handbook for MakerJackie and 01MVP skills across writing, design, development, and publishing.",
    category: "template",
    categoryLabel: "Template",
    status: "Updating",
    year: "2026",
    image: "/projects/01mvp-skills-docs.webp",
    tags: ["Knowledge Base", "AI Skills", "Handbook"],
    links: [
      { label: "Read", href: "https://www.01mvp.com/docs/skills", kind: "live" },
      { label: "Code", href: "https://github.com/makerjackie/skills", kind: "github" },
    ],
  },
  {
    title: "RootQuestion",
    description:
      "A first-principles thinking tool that helps find the question behind the question.",
    category: "experiment",
    categoryLabel: "Experiment",
    status: "Live",
    year: "2026",
    image: "/projects/rootquestion.webp",
    tags: ["AI", "First Principles", "Thinking Tool"],
    links: [{ label: "Try", href: "http://rootquestion.01mvp.com/", kind: "live" }],
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
