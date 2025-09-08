---
title: "Short Permalinks Example"
publish: true
permalink: /perm-example
---

# Short Permalinks Example

This is an example document that demonstrates how to use short permalinks in Quartz.

## How It Works

1. Add a `permalink` field to your frontmatter
2. The URL will be based on this permalink rather than the file path
3. Breadcrumbs will still show the full folder structure

## Benefits

- Clean, concise URLs that are easy to share
- Maintain folder organization in Obsidian
- Keep breadcrumb navigation for context

## Configuration

You can enable or disable this feature in `quartz.config.ts`:

```typescript
configuration: {
  // ...other settings
  shortPermalinks: {
    enabled: true, // Set to false to use standard file paths
  },
}
```

## Example URLs

- With short permalinks: `thornberry.io/perm-example`
- Without short permalinks: `thornberry.io/docs/ShortPermalinks_Example`
