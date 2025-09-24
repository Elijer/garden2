---
title: "Short Permalinks"
publish: true
permalink: /short-permalinks
---

# Short Permalinks

This feature allows you to have short, clean URLs while maintaining your folder-based organization in Obsidian.

## How It Works

When enabled, the short permalinks feature:

1. Uses the first permalink in your frontmatter as the primary URL for the page
2. Maintains the original folder structure in breadcrumbs navigation
3. Falls back to the standard file path if no permalink is specified

## Usage

Add a `permalink` field to your frontmatter:

```yaml
---
title: "My Document"
publish: true
permalink: /short-name
---
```

This will make the page accessible at `thornberry.io/short-name` instead of the full path.

## Benefits

- **Clean URLs**: Share concise, memorable links
- **Organization**: Keep your Obsidian vault organized by topic/category
- **Navigation**: Maintain context with breadcrumbs showing the full path
- **Flexibility**: Only use short permalinks for pages where it makes sense

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

## Multiple Permalinks

You can specify multiple permalinks as an array:

```yaml
---
title: "My Document"
publish: true
permalink: 
  - /short-name
  - /alternate-name
---
```

The first permalink in the list will be used as the primary URL, while others will create redirects.

## Best Practices

1. Use short, descriptive permalinks
2. Be consistent with your permalink naming conventions
3. Consider using single words or hyphenated terms
4. Avoid changing permalinks once published to prevent broken links
