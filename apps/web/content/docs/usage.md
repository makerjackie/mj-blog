---
title: Usage Guide
description: The everyday workflow for authors, readers, and administrators.
---

## Authors

Write articles in `content/posts/*.mdx`, preview or build locally, review the diff, and deploy. Git is the editorial history and rollback mechanism.

## Readers

Readers can browse articles without an account. An account is required to comment or manage email preferences.

## Administrators

Open `/admin` to:

- review, approve, mark spam, or delete comments
- inspect users and subscription preferences
- review lightweight activity metrics

Article content and site configuration are not editable in the admin area.

## Backups

Article and documentation backups are ordinary Git clones. D1 backups should cover only the dynamic user data. Keep code backups and D1 operational backups as separate concerns.
