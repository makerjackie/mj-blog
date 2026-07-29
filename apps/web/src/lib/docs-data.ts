import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { resolveDocsLocale, type DocsLocale } from "#/lib/docs-i18n";

interface DocsLoaderInput {
  locale: DocsLocale;
  slugs: string[];
}

export const docsServerLoader = createServerFn({ method: "GET" })
  .inputValidator((data: DocsLoaderInput) => data)
  .handler(async ({ data }) => {
    const locale = resolveDocsLocale(data.locale);

    if (!locale) {
      throw notFound();
    }

    const [{ source }, { getSiteSettings }] = await Promise.all([
      import("#/lib/source"),
      import("./site-config"),
    ]);
    const page = source.getPage(data.slugs, locale);

    if (!page) {
      throw notFound();
    }

    return {
      locale,
      path: page.path,
      slugs: page.slugs,
      pageTree: await source.serializePageTree(source.getPageTree(locale)),
      siteSettings: getSiteSettings(locale),
    };
  });
