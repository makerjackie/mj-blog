import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user as authUser } from "./auth.schema";

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    postSlug: text("post_slug").notNull(),
    parentId: text("parent_id"),
    authorUserId: text("author_user_id").references(() => authUser.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name").notNull(),
    authorEmailHash: text("author_email_hash").notNull(),
    authorWebsite: text("author_website"),
    body: text("body").notNull(),
    i18n: text("i18n", { mode: "json" }),
    status: text("status", { enum: ["pending", "approved", "spam", "deleted"] })
      .notNull()
      .default("pending"),
    aiModerationStatus: text("ai_moderation_status", {
      enum: ["not_requested", "pending", "completed", "failed"],
    })
      .notNull()
      .default("not_requested"),
    aiModerationDecision: text("ai_moderation_decision", {
      enum: ["approve", "review", "spam"],
    }),
    aiModerationReason: text("ai_moderation_reason"),
    aiModerationError: text("ai_moderation_error"),
    aiModerationReviewedAt: text("ai_moderation_reviewed_at"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("comments_post_status_idx").on(table.postSlug, table.status),
    index("comments_status_created_idx").on(table.status, table.createdAt),
    index("comments_author_user_idx").on(table.authorUserId),
    index("comments_ai_moderation_status_idx").on(table.aiModerationStatus, table.createdAt),
  ],
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type", { enum: ["page_view"] })
      .notNull()
      .default("page_view"),
    path: text("path").notNull(),
    postSlug: text("post_slug"),
    referrerHost: text("referrer_host"),
    visitorHash: text("visitor_hash").notNull(),
    occurredDate: text("occurred_date").notNull(),
    occurredAt: text("occurred_at").notNull(),
  },
  (table) => [
    index("analytics_events_date_idx").on(table.occurredDate),
    index("analytics_events_path_date_idx").on(table.path, table.occurredDate),
    index("analytics_events_post_date_idx").on(table.postSlug, table.occurredDate),
    index("analytics_events_visitor_date_idx").on(table.visitorHash, table.occurredDate),
  ],
);

export const emailNotificationDeliveries = sqliteTable(
  "email_notification_deliveries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
    notificationType: text("notification_type", {
      enum: ["weekly_blog_updates", "manual_broadcast", "comment_reply"],
    }).notNull(),
    subject: text("subject").notNull(),
    status: text("status", { enum: ["pending", "sent", "failed"] })
      .notNull()
      .default("pending"),
    messageId: text("message_id"),
    error: text("error"),
    createdAt: text("created_at").notNull(),
    sentAt: text("sent_at"),
  },
  (table) => [
    uniqueIndex("email_delivery_comment_user_type_idx").on(
      table.userId,
      table.commentId,
      table.notificationType,
    ),
    index("email_delivery_user_idx").on(table.userId, table.createdAt),
    index("email_delivery_status_idx").on(table.status, table.createdAt),
  ],
);

export const weeklyBlogUpdateRuns = sqliteTable(
  "weekly_blog_update_runs",
  {
    id: text("id").primaryKey(),
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    status: text("status", { enum: ["sent", "failed", "skipped"] }).notNull(),
    postCount: integer("post_count").notNull().default(0),
    recipientCount: integer("recipient_count").notNull().default(0),
    error: text("error"),
    createdAt: text("created_at").notNull(),
    completedAt: text("completed_at"),
  },
  (table) => [index("weekly_blog_update_period_idx").on(table.periodEnd)],
);

export const emailBroadcasts = sqliteTable(
  "email_broadcasts",
  {
    id: text("id").primaryKey(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["sent", "failed"] }).notNull(),
    recipientCount: integer("recipient_count").notNull().default(0),
    error: text("error"),
    createdByUserId: text("created_by_user_id").references(() => authUser.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
    sentAt: text("sent_at"),
  },
  (table) => [index("email_broadcast_created_idx").on(table.createdAt)],
);
