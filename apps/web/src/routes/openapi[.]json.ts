import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/openapi.json")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          openapi: "3.1.0",
          info: {
            title: "MakerJackie reader API",
            version: "1.0.0",
            description:
              "Reader accounts, comments, subscriptions, and analytics. Blog posts are maintained in content/posts/*.mdx and have no write API.",
          },
          paths: {
            "/api/posts": {
              get: {
                summary: "List repository-backed post metadata for an authenticated admin",
                security: [{ sessionCookie: [] }],
                responses: {
                  "200": { description: "Post metadata sourced from content/posts/*.mdx" },
                  "401": { description: "Admin authentication required" },
                },
              },
            },
            "/api/comments": {
              get: {
                summary: "List comments for an authenticated admin",
                security: [{ sessionCookie: [] }],
                responses: {
                  "200": { description: "Comment list" },
                  "401": { description: "Admin authentication required" },
                },
              },
              post: {
                summary: "Create a comment for the signed-in reader",
                security: [{ sessionCookie: [] }],
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          postSlug: { type: "string" },
                          body: { type: "string", minLength: 2, maxLength: 4000 },
                          parentId: { type: ["string", "null"] },
                          turnstileToken: { type: "string" },
                          honeypot: { type: "string" },
                        },
                        required: ["postSlug", "body"],
                      },
                    },
                  },
                },
                responses: {
                  "201": { description: "Comment created" },
                  "400": { description: "Invalid comment or post" },
                  "401": { description: "Reader login required" },
                },
              },
            },
            "/api/comments/{id}/{action}": {
              post: {
                summary: "Approve, mark as spam, or delete a comment",
                security: [{ sessionCookie: [] }],
                parameters: [
                  { name: "id", in: "path", required: true, schema: { type: "string" } },
                  {
                    name: "action",
                    in: "path",
                    required: true,
                    schema: { enum: ["approve", "spam", "delete"] },
                  },
                ],
                responses: {
                  "200": { description: "Comment updated" },
                  "401": { description: "Admin authentication required" },
                },
              },
            },
            "/api/account/email-preferences": {
              get: {
                summary: "Read the signed-in user's subscription preferences",
                security: [{ sessionCookie: [] }],
                responses: { "200": { description: "Email preferences" } },
              },
              put: {
                summary: "Update the signed-in user's subscription preferences",
                security: [{ sessionCookie: [] }],
                responses: { "200": { description: "Email preferences updated" } },
              },
            },
            "/api/analytics/overview": {
              get: {
                summary: "Read the admin analytics overview",
                security: [{ sessionCookie: [] }],
                responses: { "200": { description: "Analytics overview" } },
              },
            },
          },
          components: {
            securitySchemes: {
              sessionCookie: {
                type: "apiKey",
                in: "cookie",
                name: "better-auth.session_token",
              },
            },
          },
        }),
    },
  },
});
