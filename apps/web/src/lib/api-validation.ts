import type { EmailPreference } from "@repo/core";
import { z } from "zod";

import { isEmailPreference } from "./email-preferences";

const EmailPreferenceSchema = z.custom<EmailPreference>(isEmailPreference);
const TrimmedRequiredStringSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string(),
);
const OptionalTrimmedStringSchema = z.preprocess((value) => {
  if (value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}, z.string().optional());
const OptionalNullableTrimmedStringSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed || null;
}, z.string().nullable().optional());
/**
 * Schema for POST /api/comments — comment creation body.
 *
 * Fields read from the request body in the comments route:
 *   postSlug, body, parentId, honeypot, turnstileToken
 *
 * `authorName` and `authorEmail` are resolved server-side from the
 * authenticated session, so they are not part of this input schema.
 */
export const CreateCommentSchema = z.object({
  postSlug: TrimmedRequiredStringSchema.pipe(z.string().min(1).max(200)),
  body: z
    .string()
    .min(2)
    .max(4000)
    .refine((value) => value.trim().length >= 2, {
      message: "Comment body must contain at least 2 non-whitespace characters",
    }),
  parentId: OptionalNullableTrimmedStringSchema,
  honeypot: z.string().optional().default(""),
  turnstileToken: OptionalTrimmedStringSchema,
});

export const AccountEmailPreferencesPatchSchema = z
  .object({
    emailPreference: EmailPreferenceSchema.optional(),
    marketingOptOut: z.boolean().optional(),
    commentReplyNotificationsEnabled: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one email preference field.",
  });

/**
 * Run a zod parse and return either the validated data or a 400 Response.
 * Returns `[data, null]` on success or `[null, errorResponse]` on failure.
 */
export function validateBody<T extends z.ZodType>(
  schema: T,
  data: unknown,
): [z.infer<T>, null] | [null, Response] {
  const result = schema.safeParse(data);

  if (result.success) {
    return [result.data, null];
  }

  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return [null, Response.json({ error: "Validation failed", details: errors }, { status: 400 })];
}
