PRAGMA defer_foreign_keys = ON;

CREATE TABLE "comments_next" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "post_slug" TEXT NOT NULL,
  "parent_id" TEXT,
  "author_user_id" TEXT,
  "author_name" TEXT NOT NULL,
  "author_email_hash" TEXT NOT NULL,
  "author_website" TEXT,
  "body" TEXT NOT NULL,
  "i18n" TEXT,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "ai_moderation_status" TEXT DEFAULT 'not_requested' NOT NULL,
  "ai_moderation_decision" TEXT,
  "ai_moderation_reason" TEXT,
  "ai_moderation_error" TEXT,
  "ai_moderation_reviewed_at" TEXT,
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  FOREIGN KEY ("author_user_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO "comments_next" (
  "id",
  "post_slug",
  "parent_id",
  "author_user_id",
  "author_name",
  "author_email_hash",
  "author_website",
  "body",
  "i18n",
  "status",
  "ai_moderation_status",
  "ai_moderation_decision",
  "ai_moderation_reason",
  "ai_moderation_error",
  "ai_moderation_reviewed_at",
  "ip_hash",
  "user_agent",
  "created_at",
  "updated_at"
)
SELECT
  comments.id,
  posts.slug,
  comments.parent_id,
  comments.author_user_id,
  comments.author_name,
  comments.author_email_hash,
  comments.author_website,
  comments.body,
  comments.i18n,
  comments.status,
  comments.ai_moderation_status,
  comments.ai_moderation_decision,
  comments.ai_moderation_reason,
  comments.ai_moderation_error,
  comments.ai_moderation_reviewed_at,
  comments.ip_hash,
  comments.user_agent,
  comments.created_at,
  comments.updated_at
FROM "comments"
INNER JOIN "posts" ON posts.id = comments.post_id;
--> statement-breakpoint
CREATE TABLE "email_notification_deliveries_backup" AS
SELECT
  "id",
  "user_id",
  "comment_id",
  "notification_type",
  "subject",
  "status",
  "message_id",
  "error",
  "created_at",
  "sent_at"
FROM "email_notification_deliveries";
--> statement-breakpoint
DROP TABLE "email_notification_deliveries";
--> statement-breakpoint
DROP TABLE "comments";
--> statement-breakpoint
ALTER TABLE "comments_next" RENAME TO "comments";
--> statement-breakpoint
CREATE INDEX "comments_post_status_idx" ON "comments" ("post_slug", "status");
--> statement-breakpoint
CREATE INDEX "comments_status_created_idx" ON "comments" ("status", "created_at");
--> statement-breakpoint
CREATE INDEX "comments_author_user_idx" ON "comments" ("author_user_id");
--> statement-breakpoint
CREATE INDEX "comments_ai_moderation_status_idx" ON "comments" ("ai_moderation_status", "created_at");
--> statement-breakpoint
CREATE TABLE "email_notification_deliveries" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL,
  "comment_id" TEXT,
  "notification_type" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "message_id" TEXT,
  "error" TEXT,
  "created_at" TEXT NOT NULL,
  "sent_at" TEXT,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO "email_notification_deliveries" (
  "id",
  "user_id",
  "comment_id",
  "notification_type",
  "subject",
  "status",
  "message_id",
  "error",
  "created_at",
  "sent_at"
)
SELECT
  "id",
  "user_id",
  "comment_id",
  "notification_type",
  "subject",
  "status",
  "message_id",
  "error",
  "created_at",
  "sent_at"
FROM "email_notification_deliveries_backup";
--> statement-breakpoint
DROP TABLE "email_notification_deliveries_backup";
--> statement-breakpoint
CREATE UNIQUE INDEX "email_delivery_comment_user_type_idx" ON "email_notification_deliveries" ("user_id", "comment_id", "notification_type");
--> statement-breakpoint
CREATE INDEX "email_delivery_user_idx" ON "email_notification_deliveries" ("user_id", "created_at");
--> statement-breakpoint
CREATE INDEX "email_delivery_status_idx" ON "email_notification_deliveries" ("status", "created_at");
--> statement-breakpoint
DROP TABLE IF EXISTS "post_tags";
--> statement-breakpoint
DROP TABLE IF EXISTS "post_sources";
--> statement-breakpoint
DROP TABLE IF EXISTS "assets";
--> statement-breakpoint
DROP TABLE IF EXISTS "posts";
--> statement-breakpoint
DROP TABLE IF EXISTS "tags";
--> statement-breakpoint
DROP TABLE IF EXISTS "series";
--> statement-breakpoint
DROP TABLE IF EXISTS "site_settings";
--> statement-breakpoint
DROP TABLE IF EXISTS "server_settings";
--> statement-breakpoint
DROP TABLE IF EXISTS "api_tokens";
