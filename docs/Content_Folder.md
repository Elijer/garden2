# The Content Folder
Look in `Goals.md` to see the content folder strategy. To set up a symlink, run something like:

```bash
ln -s /Users/<you>/<...path to content> content
```

Example:
```bash
ln -s /Users/jah/garden_content content
```

I added `content/` and `content` in gitigore to ignore the symlink file. Technically I don't think `content/` is needed too, but gets the point across.

I will deploy Quartz 4's normal deploy.yaml script to pull content from the private content repo during build time.