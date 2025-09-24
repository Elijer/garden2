import { FullSlug, resolveRelative } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { VFile } from "vfile"

async function* processFile(ctx: BuildCtx, file: VFile) {
  // Only process files that have a permalink
  if (!file.data.frontmatter?.permalink) return

  const originalSlug = file.data.slug! as FullSlug
  
  // Skip index and tag pages
  if (originalSlug.endsWith("/index") || originalSlug.startsWith("tags/")) return

  // Get permalink (use first one if it's an array)
  const permalink = Array.isArray(file.data.frontmatter.permalink)
    ? file.data.frontmatter.permalink[0]
    : file.data.frontmatter.permalink

  // Convert permalink to slug (remove leading slash if present)
  const permalinkSlug = (permalink.startsWith('/')
    ? permalink.substring(1)
    : permalink) as FullSlug

  // Create redirect from original path to permalink
  const redirUrl = resolveRelative(originalSlug, permalinkSlug)
  yield write({
    ctx,
    content: `
      <!DOCTYPE html>
      <html lang="en-us">
      <head>
      <title>${originalSlug}</title>
      <link rel="canonical" href="${redirUrl}">
      <meta name="robots" content="noindex">
      <meta charset="utf-8">
      <meta http-equiv="refresh" content="0; url=${redirUrl}">
      </head>
      </html>
      `,
    slug: originalSlug,
    ext: ".html",
  })
}

export const ReverseAliases: QuartzEmitterPlugin = () => ({
  name: "ReverseAliases",
  async *emit(ctx, content) {
    for (const [_tree, file] of content) {
      yield* processFile(ctx, file)
    }
  },
  async *partialEmit(ctx, _content, _resources, changeEvents) {
    for (const changeEvent of changeEvents) {
      if (!changeEvent.file) continue
      if (changeEvent.type === "add" || changeEvent.type === "change") {
        yield* processFile(ctx, changeEvent.file)
      }
    }
  },
})
