import type { Post, SupportedLocale } from "@repo/core";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  MailIcon,
} from "lucide-react";
import { useState } from "react";

import "./personal-home.css";

const projectLinks = [
  {
    name: "OneApps Studio",
    href: "https://oneapps.studio",
    number: "01",
    kind: "apps",
    zh: "把日常的小想法，做成真的 App。",
    en: "Everyday ideas, made into real apps.",
    detailZh: "我持续开发的一系列 Apple 平台应用。",
    detailEn: "The Apple apps I’m building and updating.",
  },
  {
    name: "01MVP",
    href: "https://01mvp.com",
    number: "02",
    kind: "knowledge",
    zh: "把做产品的方法，也分享给你。",
    en: "Sharing what goes into making a product.",
    detailZh: "我整理出来的知识、工具和 AI 产品实践。",
    detailEn: "Knowledge, tools, and lessons from building with AI.",
  },
  {
    name: "世界的形状",
    href: "https://shapeof.world",
    number: "03",
    kind: "world",
    zh: "因为好奇，做了一个可以玩的世界。",
    en: "A world to play with, made out of curiosity.",
    detailZh: "关于自然、科学与世界的互动探索。",
    detailEn: "Interactive explorations of nature, science, and the world.",
  },
] as const;

const appIcons = ["onesay", "onewish", "onehabit", "oneframe", "onemarkup", "oneround"];

export function PersonalHome({
  locale,
  posts,
  bio,
}: {
  readonly locale: SupportedLocale;
  readonly posts: Post[];
  readonly bio: string;
}) {
  const zh = locale === "zh";
  const t = (chinese: string, english: string) => (zh ? chinese : english);
  const [contactState, setContactState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText("makerjackie");
      setContactState("copied");
    } catch {
      setContactState("failed");
    }
  }

  return (
    <div className="personal-home">
      <div className="personal-wrap">
        <section className="personal-hero" aria-labelledby="personal-title">
          <div className="personal-intro">
            <p className="personal-kicker">
              <span className="personal-dot" />
              {t("创造 / 行动 / 自由", "CREATE / MOVE / FREEDOM")}
            </p>
            <h1 id="personal-title">
              {t("你好，我是", "Hello, I’m")}
              <br />
              <span className="personal-name">
                Jackie<span className="personal-period">.</span>
              </span>
            </h1>
            <p className="personal-tagline">
              {t("在路上，也在创造。", "On the road. Making things along the way.")}
            </p>
            <p className="personal-intro-body">
              {t(
                "独立开发者，喜欢探索世界和旅行，也用 AI 做一些有趣的小产品。这里放着我的作品、写作，还有生活的片段。",
                "I’m an independent developer who loves traveling, exploring, and making small products with AI. This is where my work, writing, and bits of life come together.",
              )}
            </p>
            <div className="personal-actions">
              <a href="#current-work" className="personal-button">
                {t("看看我在做什么", "See what I’m making")}
                <ArrowDownIcon size={16} />
              </a>
              <a href="#collaborate" className="personal-text-link">
                {t("与我合作", "Work with me")}
                <ArrowUpRightIcon size={16} />
              </a>
            </div>
          </div>
          <figure className="personal-photo personal-hero-photo">
            <img
              src="/images/personal/jackie-wind-original.jpg"
              alt={t(
                "Jackie 在蓝天和风机前笑着自拍",
                "Jackie smiling in front of a wind turbine under a blue sky",
              )}
              width={722}
              height={722}
              fetchPriority="high"
            />
            <figcaption>
              <span>{t("在路上的一刻", "A moment on the road")}</span>
              <span>↗</span>
            </figcaption>
          </figure>
        </section>

        <section id="current-work" className="personal-section" aria-labelledby="work-title">
          <div className="personal-section-heading">
            <div>
              <p className="personal-kicker">CURRENTLY MAKING</p>
              <h2 id="work-title">
                {t("把好奇心，做成作品。", "Following curiosity. Making things.")}
              </h2>
            </div>
            <Link to="/projects" className="personal-text-link">
              {t("全部作品", "All projects")}
              <ArrowUpRightIcon size={16} />
            </Link>
          </div>
          <div className="personal-projects">
            {projectLinks.map((project) => (
              <a
                key={project.kind}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className={`personal-project personal-project-${project.kind}`}
              >
                <div className="personal-project-visual" aria-hidden="true">
                  {project.kind === "apps" ? (
                    <div className="personal-app-icons">
                      {appIcons.map((icon) => (
                        <img
                          key={icon}
                          src={`/images/personal/${icon}-icon.png`}
                          alt=""
                          width={88}
                          height={88}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : null}
                  {project.kind === "knowledge" ? (
                    <div className="personal-book">
                      <span>01MVP</span>
                      <strong>
                        MAKE
                        <br />
                        IT REAL<span>.</span>
                      </strong>
                      <small>{t("知识 · 工具 · 实践", "KNOWLEDGE / TOOLS / PRACTICE")}</small>
                    </div>
                  ) : null}
                  {project.kind === "world" ? (
                    <img
                      src="/images/personal/shape-black-hole.webp"
                      alt=""
                      width={3200}
                      height={2000}
                      loading="lazy"
                      className="personal-world-photo"
                    />
                  ) : null}
                  <span className="personal-project-number">{project.number}</span>
                  <span className="personal-project-arrow">
                    <ArrowUpRightIcon size={21} />
                  </span>
                </div>
                <div className="personal-project-copy">
                  <h3>{project.kind === "world" && !zh ? "Shape of the World" : project.name}</h3>
                  <p>{zh ? project.zh : project.en}</p>
                  <small>{zh ? project.detailZh : project.detailEn}</small>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="personal-life personal-section" aria-labelledby="life-title">
          <figure className="personal-photo personal-music-photo">
            <img
              src="/images/personal/jackie-music-adjusted.jpg"
              alt={t(
                "Jackie 坐着弹琴，笑着看向镜头",
                "Jackie playing a small string instrument and smiling at the camera",
              )}
              width={640}
              height={800}
              loading="lazy"
            />
            <figcaption>
              <span>{t("代码之外", "Away from the keyboard")}</span>
              <span>♪</span>
            </figcaption>
          </figure>
          <div className="personal-life-copy">
            <p className="personal-kicker">A LITTLE MORE HUMAN</p>
            <h2 id="life-title">
              {t("生活，也值得", "There’s more")}
              <br />
              {t("留一点位置。", "to life, too.")}
            </h2>
            <p>
              {t(
                "做产品、写文章，也旅行、和人相遇。项目会变，这里会继续记录我在做什么、经历什么。",
                "Making products and writing, traveling and meeting people. Projects change; this place keeps a record of what I make and experience.",
              )}
            </p>
            <Link
              to="/blog/$slug"
              params={{ slug: "2026-08-19-i-just-want-to-have-fun" }}
              className="personal-featured-note"
            >
              <span>{t("从这段聊天认识我", "Get to know me through a conversation")}</span>
              <strong>
                {t("「我玩得爽就好了」", "“I just want to have fun.”")}
                <ArrowUpRightIcon size={18} />
              </strong>
            </Link>
            <details className="personal-bio">
              <summary>{t("再多了解我一点", "A little more about me")}</summary>
              <p>{bio}</p>
              <Link to="/about" className="personal-text-link">
                {t("关于我的完整介绍", "More about me")}
                <ArrowRightIcon size={16} />
              </Link>
            </details>
          </div>
        </section>

        <section className="personal-section personal-writing" aria-labelledby="writing-title">
          <div className="personal-section-heading">
            <div>
              <p className="personal-kicker">NOTES ALONG THE WAY</p>
              <h2 id="writing-title">{t("最近，写下这些。", "Notes from along the way.")}</h2>
            </div>
            <Link
              to="/blog"
              search={{ q: "", tag: "", series: "", page: 1 }}
              className="personal-text-link"
            >
              {t("所有文章", "All writing")}
              <ArrowUpRightIcon size={16} />
            </Link>
          </div>
          <div className="personal-posts">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="personal-post"
              >
                <time dateTime={post.publishedAt}>
                  {new Intl.DateTimeFormat(zh ? "zh-CN" : "en", {
                    month: "short",
                    day: "numeric",
                    timeZone: "Asia/Shanghai",
                  }).format(new Date(post.publishedAt))}
                </time>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <ArrowUpRightIcon size={19} />
              </Link>
            ))}
          </div>
        </section>

        <section
          id="collaborate"
          className="personal-section personal-collaborate"
          aria-labelledby="collaborate-title"
        >
          <div className="personal-section-heading">
            <div>
              <p className="personal-kicker">LET’S MAKE SOMETHING</p>
              <h2 id="collaborate-title">
                {t("有个想法？聊聊。", "Something on your mind? Let’s talk.")}
              </h2>
            </div>
            <p className="personal-collaborate-intro">
              {t(
                "带着具体的问题或项目来，\n我们先聊聊是否合适。",
                "Bring a question or a project.\nLet’s see if it’s a fit.",
              )}
            </p>
          </div>
          <div className="personal-services">
            <article>
              <span className="personal-service-index">
                01 / {t("聊清一个问题", "A CONVERSATION")}
              </span>
              <h3>{t("一对一咨询", "1:1 consultation")}</h3>
              <p>
                {t(
                  "先告诉我你想讨论的问题，沟通后确认咨询安排。",
                  "Tell me what you’d like to discuss, and we’ll agree on the arrangements.",
                )}
              </p>
              <strong className="personal-price">¥299</strong>
            </article>
            <article>
              <span className="personal-service-index">
                02 / {t("一起向前推进", "WORK THROUGH IT")}
              </span>
              <h3>{t("陪跑", "Guided support")}</h3>
              <p>
                {t(
                  "围绕你的项目讨论推进方式，开始前确认范围与安排。",
                  "Support around your project, with scope and arrangements agreed before we begin.",
                )}
              </p>
              <strong className="personal-price">¥2999</strong>
            </article>
            <article>
              <span className="personal-service-index">
                03 / {t("选择性承接", "SELECTED PROJECTS")}
              </span>
              <h3>{t("软件开发合作", "Software projects")}</h3>
              <p>
                {t(
                  "选择性承接感兴趣或有相关经验的项目。可以先看看我的作品，再聊需求。",
                  "I take on projects that interest me or relate to work I’ve done before. Browse my work and share your brief.",
                )}
              </p>
              <strong className="personal-price personal-price-text">
                {t("按项目沟通", "Let’s discuss")}
              </strong>
            </article>
          </div>
          <div className="personal-contact">
            <div>
              <p>
                {t("微信", "WeChat")} <strong>makerjackie</strong>
              </p>
              <span role="status" aria-live="polite">
                {contactState === "copied"
                  ? t("已复制微信号", "WeChat ID copied")
                  : contactState === "failed"
                    ? t("请手动复制上方微信号", "Please copy the WeChat ID above manually")
                    : t("全网同名 MakerJackie", "Find me as MakerJackie")}
              </span>
            </div>
            <div className="personal-actions">
              <button type="button" className="personal-button" onClick={() => void copyWechat()}>
                {contactState === "copied" ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                {contactState === "copied"
                  ? t("已复制", "Copied")
                  : t("复制微信号", "Copy WeChat ID")}
              </button>
              <a href="mailto:hi@makerjackie.com" className="personal-text-link">
                <MailIcon size={16} />
                {t("写封邮件", "Send an email")}
              </a>
            </div>
          </div>
        </section>
        <p className="personal-signoff">
          {t("保持好奇，下次见。", "Stay curious. See you around.")}
          <span>Jackie ↗</span>
        </p>
      </div>
    </div>
  );
}
