import { escapeHtml } from "./utils";

const blockTags = new Set(["blockquote", "h1", "h2", "h3", "li", "ol", "p", "pre", "ul"]);

export function renderMarkdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listItems: string[] = [];
  let listTag: "ol" | "ul" | null = null;
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushList = () => {
    if (listItems.length === 0 || !listTag) {
      return;
    }

    html.push(`<${listTag}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listTag}>`);
    listItems = [];
    listTag = null;
  };

  const pushListItem = (tag: "ol" | "ul", item: string) => {
    if (listTag && listTag !== tag) {
      flushList();
    }

    listTag = tag;
    listItems.push(item);
  };

  const flushCode = () => {
    if (!inCodeBlock) {
      return;
    }

    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
    inCodeBlock = false;
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const imageHtml = standaloneImageTagToHtml(trimmed);

    if (imageHtml) {
      flushList();
      html.push(imageHtml);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushList();
      html.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      pushListItem("ul", inlineMarkdown(trimmed.replace(/^[-*]\s+/, "")));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      pushListItem("ol", inlineMarkdown(trimmed.replace(/^\d+\.\s+/, "")));
      continue;
    }

    flushList();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  flushList();
  flushCode();

  return html.join("");
}

export function markdownToText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=[^\s>]*/gi, "")
    .replace(/\ssrcdoc="[^"]*"/gi, "")
    .replace(/\ssrcdoc='[^']*'/gi, "")
    .replace(/\ssrcdoc=[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(
      /(?<!!)\[([^\]]+)]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
      '<a href="$2" rel="noreferrer">$1</a>',
    );
}

function standaloneImageTagToHtml(value: string) {
  if (!/^<img\b[\s\S]*\/?>$/i.test(value)) {
    return "";
  }

  const src = readAttribute(value, "src");

  if (!src || !/^(https?:\/\/|\/)/i.test(src)) {
    return "";
  }

  const alt = readAttribute(value, "alt") ?? "";
  const width = readNumericAttribute(value, "width");
  const height = readNumericAttribute(value, "height");

  return [
    "<p><img",
    ` src="${escapeHtml(src)}"`,
    ` alt="${escapeHtml(alt)}"`,
    width ? ` width="${width}"` : "",
    height ? ` height="${height}"` : "",
    " /></p>",
  ].join("");
}

function readAttribute(value: string, name: string) {
  const match = new RegExp(`\\s${name}=(["'])([\\s\\S]*?)\\1`, "i").exec(value);

  return match?.[2];
}

function readNumericAttribute(value: string, name: string) {
  const match = new RegExp(`\\s${name}=(?:\\{(\\d+)\\}|["'](\\d+)["']|(\\d+))`, "i").exec(value);

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

export function htmlToText(html: string) {
  return html
    .replace(new RegExp(`</?(${Array.from(blockTags).join("|")})[^>]*>`, "gi"), " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
