import { ArrowUpRightIcon, PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";

import type { getCurrentLocale } from "#/lib/i18n";

type Locale = ReturnType<typeof getCurrentLocale>;

const videos = [
  {
    bvid: "BV1RANp6TEyX",
    title: { zh: "在一颗小星球上，遇见一个故事", en: "A small planet with a story to tell" },
    description: {
      zh: "《球的另一边》：一段可以走进去的 3D 网页故事。",
      en: "The Other Half: a short 3D story you can walk into.",
    },
    image: "/images/posts/the-other-half/01-intro.webp",
    article: "/blog/2026-07-11-the-other-half",
  },
  {
    bvid: "BV1qdNJ6NEGo",
    title: { zh: "三脚球，一个会记住你的门将", en: "Three shots. A keeper who remembers." },
    description: {
      zh: "Last Kick：我用 Codex 做的 3D 点球小游戏。",
      en: "Last Kick: a 3D penalty game I made with Codex.",
    },
    image: "/images/posts/last-kick/01-intro.webp",
    article: "/blog/2026-07-10-last-kick-gpt56",
  },
] as const;

const paths = [
  {
    name: "01MVP",
    href: "https://01mvp.com",
    zh: "我整理出来、值得购买的知识与工具。",
    en: "Knowledge and tools I’ve put together for purchase.",
  },
  {
    name: "MakerTea",
    href: "https://makertea.co",
    zh: "我和一群有趣的人探索世界的地方。",
    en: "A place to explore the world with curious people.",
  },
  {
    name: "OneApps",
    href: "https://oneapps.studio",
    zh: "我做出来的一系列 App。",
    en: "A collection of apps I’m building.",
  },
] as const;

export function HomeDiscover({ locale }: { readonly locale: Locale }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const zh = locale === "zh";

  return (
    <>
      <section id="discover" className="scroll-mt-24 border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            {zh ? "先看点有意思的" : "A few things to explore"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {zh
              ? "做一个小游戏，把世界变成互动作品，也把过程拍成视频。"
              : "Small games, interactive worlds, and videos of how they came to life."}
          </p>
          <a
            href="https://shapeof.world"
            target="_blank"
            rel="noreferrer"
            className="group mt-6 grid overflow-hidden border border-border transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-2"
          >
            <img
              src="/projects/shapeof-world.webp"
              alt={zh ? "世界的形状互动作品" : "Shape of the World"}
              width={800}
              height={500}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="flex flex-col justify-center p-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                shapeof.world
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                {zh ? "世界的形状" : "Shape of the World"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {zh
                  ? "关于自然、科学与世界的互动探索。打开一个主题，亲手玩一玩。"
                  : "Interactive explorations of nature, science, and the world. Open a theme and play."}
              </p>
              <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
                {zh ? "进去玩一会儿" : "Take a look inside"}
                <ArrowUpRightIcon className="size-4" />
              </span>
            </div>
          </a>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <article key={video.bvid} className="min-w-0">
                <div className="aspect-video overflow-hidden border border-border bg-muted">
                  {activeVideo === video.bvid ? (
                    <iframe
                      src={`https://player.bilibili.com/player.html?bvid=${video.bvid}&autoplay=0&danmaku=0&poster=1`}
                      title={video.title[locale]}
                      className="h-full w-full border-0"
                      allow="fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video.bvid)}
                      className="group relative flex h-full w-full items-center justify-center focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-ring"
                      aria-label={`${zh ? "加载视频：" : "Load video: "}${video.title[locale]}`}
                    >
                      <img
                        src={video.image}
                        alt=""
                        width={800}
                        height={450}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span className="relative inline-flex min-h-12 items-center gap-2 rounded-full bg-background px-5 text-sm font-semibold shadow-lg group-hover:bg-secondary">
                        <PlayIcon className="size-4" />
                        {zh ? "观看视频" : "Watch video"}
                      </span>
                    </button>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{video.title[locale]}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {video.description[locale]}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 text-sm font-semibold">
                  <a
                    href={video.article}
                    className="inline-flex min-h-11 items-center hover:underline"
                  >
                    {zh ? "读创作过程" : "Read the story"}
                  </a>
                  <a
                    href={`https://www.bilibili.com/video/${video.bvid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-link hover:underline"
                  >
                    {zh ? "去 B 站看" : "Watch on Bilibili"}
                    <ArrowUpRightIcon className="size-4" />
                  </a>
                  {activeVideo === video.bvid ? (
                    <button
                      type="button"
                      onClick={() => setActiveVideo(null)}
                      className="inline-flex min-h-11 items-center gap-1 hover:underline"
                    >
                      <XIcon className="size-4" />
                      {zh ? "收起" : "Close"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            {zh ? "我正在做的事" : "What I’m working on"}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {paths.map((path) => (
              <a
                key={path.name}
                href={path.href}
                target="_blank"
                rel="noreferrer"
                className="border border-border bg-background p-5 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <h3 className="flex items-center justify-between gap-3 text-xl font-semibold">
                  {path.name}
                  <ArrowUpRightIcon className="size-4 shrink-0" />
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{path[locale]}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
