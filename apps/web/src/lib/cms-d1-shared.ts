import "@tanstack/react-start/server-only";
import {
  type Comment,
  type CommentAiModerationDecision,
  type CommentAiModerationStatus,
  type CommentStatus,
  type SupportedLocale,
} from "@repo/core";
import * as schema from "@repo/db/schema/cms";

export const MIN_COMMENT_LENGTH = 2;
export const MAX_COMMENT_LENGTH = 4000;
export const MAX_COMMENT_LINKS = 3;

export type CommentInput = {
  postSlug: string;
  parentId?: string | null;
  authorUserId?: string | null;
  authorName?: string;
  authorEmail?: string;
  authorWebsite?: string | null;
  body?: string;
  locale?: SupportedLocale;
};

export type D1Result<TValue> = { data: TValue } | { error: string };

export function drizzleRowToComment(row: typeof schema.comments.$inferSelect): Comment {
  return {
    id: row.id,
    postSlug: row.postSlug,
    parentId: row.parentId,
    authorUserId: row.authorUserId,
    authorName: row.authorName,
    authorEmailHash: row.authorEmailHash,
    authorWebsite: row.authorWebsite,
    body: row.body,
    status: row.status as CommentStatus,
    aiModeration: {
      status: normalizeAiModerationStatus(row.aiModerationStatus),
      decision: normalizeAiModerationDecision(row.aiModerationDecision),
      reason: row.aiModerationReason,
      error: row.aiModerationError,
      reviewedAt: row.aiModerationReviewedAt,
    },
    createdAt: row.createdAt,
    i18n: row.i18n as Comment["i18n"],
  };
}

function normalizeAiModerationStatus(value: unknown): CommentAiModerationStatus {
  return value === "pending" || value === "completed" || value === "failed"
    ? value
    : "not_requested";
}

function normalizeAiModerationDecision(value: unknown): CommentAiModerationDecision | null {
  return value === "approve" || value === "review" || value === "spam" ? value : null;
}
