import type { SiteSettings } from "./types";

export const siteSettings: SiteSettings = {
  name: "MakerJackie",
  description: "AI product notes, indie hacking logs, and practical guides from MakerJackie.",
  url: "https://makerjackie.com",
  authorName: "Jackie",
  authorBio: "独立开发者，前 AI 算法工程师，周周黑客松发起人。",
  avatarUrl: "/jackie-avatar.jpg",
  defaultOgImage: "/og-default.svg",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/makerjackie" },
    { label: "X", href: "https://x.com/makerjackie" },
    { label: "RSS", href: "/rss.xml" },
  ],
  navigation: [
    { label: "Articles", href: "/blog", i18n: { label: { zh: "文章" } } },
    { label: "Tags", href: "/tags", i18n: { label: { zh: "标签" } } },
    {
      label: "Projects",
      href: "https://makerjackie.com/projects",
      i18n: { label: { zh: "项目" } },
    },
    { label: "About", href: "/about", i18n: { label: { zh: "关于" } } },
  ],
  rssEnabled: true,
  commentsEnabled: true,
  commentsRequireApproval: true,
  commentAutoBlockEnabled: true,
  commentBlockedKeywords: ["博彩", "赌博", "色情", "诈骗", "辱骂", "violence", "scam", "spam"],
  aiCommentModerationEnabled: false,
  aiCommentModerationRules:
    "判断这条博客评论是否适合公开展示。拦截广告、诈骗、钓鱼、辱骂、仇恨、色情、暴力威胁、隐私泄露、无意义灌水和明显 SEO 外链。普通反对意见、批评、提问、纠错、补充信息应该允许。",
  emailVerificationEnabled: false,
  emailNotificationsEnabled: false,
  manualEmailBroadcastsEnabled: false,
  indexingEnabled: true,
  themePreset: "maker",
  layoutPreset: "shelf",
  locales: ["en", "zh"],
  primaryLanguage: "zh",
  i18n: {
    name: { zh: "MakerJackie" },
    description: { zh: "记录 AI 产品、独立开发、自媒体和长期思考。" },
    authorBio: { zh: "独立开发者，前 AI 算法工程师，周周黑客松发起人。" },
  },
};
