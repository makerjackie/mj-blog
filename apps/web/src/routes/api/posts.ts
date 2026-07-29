import { localizePost } from "@repo/core";
import { createFileRoute } from "@tanstack/react-router";

import { getApiLocale, jsonResponse } from "#/lib/cms-api";
import { requireAdminSession } from "#/lib/cms-authz";
import { listContentPosts } from "#/lib/content-posts";

export const Route = createFileRoute("/api/posts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const accessError = await requireAdminSession(request);

        if (accessError) {
          return accessError;
        }

        const url = new URL(request.url);
        const locale = getApiLocale(request);
        const posts = listContentPosts({
          includeUnpublished: true,
          query: url.searchParams.get("q") ?? "",
          seriesSlug: url.searchParams.get("series") || undefined,
          tagSlug: url.searchParams.get("tag") || undefined,
        });

        return jsonResponse({
          data: posts.map((post) => localizePost(post, locale)),
          locale,
          source: "content/posts/*.mdx",
        });
      },
    },
  },
});
