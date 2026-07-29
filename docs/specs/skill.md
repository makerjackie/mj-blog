# 01mvp-blog Skill Specification

The repository Skill at `skills/01mvp-blog/SKILL.md` creates and maintains code-first personal blogs.

## Contract

- Articles exist only as `content/posts/*.mdx`.
- The Skill must never add article CMS tables, an article editor, article write APIs, article tokens, or MDX-to-database synchronization.
- Site-wide editorial configuration is repository code.
- D1 is limited to comments, Better Auth identities/sessions, subscriptions, notification records, broadcasts, and analytics.
- KV is limited to short-lived state.
- R2 is not required.

## Create Flow

1. Check Node, pnpm, Vite+, and Wrangler.
2. Create or clone the repository.
3. Update static site configuration.
4. Provision Worker, D1, and KV.
5. Configure secrets and optional OAuth/email.
6. Apply D1 migrations.
7. Create a first article from `examples/first-post.md`.
8. Generate sources, lint, and build.
9. Deploy when authorized.
10. Create an administrator and verify comments when enabled.
11. Complete `checklists/acceptance.md`.
12. Save an execution log.

## Maintenance Flow

- Article changes are normal repository edits and deployments.
- Runtime user-data operations use authenticated APIs from `/openapi.json`.
- Schema changes require forward D1 migrations and local foreign-key verification.
- Production deployment and remote migration require explicit authorization.

## Acceptance

The Skill must verify article compilation, public rendering, feeds/sitemap, authentication, comments, subscriptions, admin authorization, and the absence of retired CMS surfaces.
