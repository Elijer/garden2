import { FullSlug, isRelativeURL, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write, deleteFile } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { VFile } from "vfile"
import path from "path"

async function* processFile(ctx: BuildCtx, file: VFile) {
  const ogSlug = simplifySlug(file.data.slug!)

  for (const aliasTarget of file.data.aliases ?? []) {
    const aliasTargetSlug = (
      isRelativeURL(aliasTarget)
        ? path.normalize(path.join(ogSlug, "..", aliasTarget))
        : aliasTarget
    ) as FullSlug

    const redirUrl = resolveRelative(aliasTargetSlug, ogSlug)
    yield write({
      ctx,
      content: `
        <!DOCTYPE html>
        <html lang="en-us">
        <head>
        <title>${ogSlug}</title>
        <link rel="canonical" href="${redirUrl}">
        <meta name="robots" content="noindex">
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="0; url=${redirUrl}">
        </head>
        </html>
        `,
      slug: aliasTargetSlug,
      ext: ".html",
    })
  }
}

export const AliasRedirects: QuartzEmitterPlugin = () => ({
  name: "AliasRedirects",
  async *emit(ctx, content) {
    for (const [_tree, file] of content) {
      yield* processFile(ctx, file)
    }
  },
  async *partialEmit(ctx, content, _resources, changeEvents) {
    // create a set of all slugs in the filtered content
    const publishedSlugs = new Set(content.map(([_tree, file]) => file.data.slug!))

    for (const changeEvent of changeEvents) {
      if (!changeEvent.file) continue
      
      const slug = changeEvent.file.data.slug!
      const isPublished = publishedSlugs.has(slug)
      
      if ((changeEvent.type === "add" || changeEvent.type === "change") && isPublished) {
        // add new ones if this file still exists and is published
        yield* processFile(ctx, changeEvent.file)
      } else if (changeEvent.type === "delete" || !isPublished) {
        // delete all alias redirect files for deleted content or unpublished content
        const aliases = changeEvent.file.data.aliases ?? []
        for (const aliasTarget of aliases) {
          const ogSlug = simplifySlug(slug)
          const aliasTargetSlug = (
            isRelativeURL(aliasTarget)
              ? path.normalize(path.join(ogSlug, "..", aliasTarget))
              : aliasTarget
          ) as FullSlug
          
          const deleted = await deleteFile({ ctx, slug: aliasTargetSlug, ext: ".html" })
          if (deleted && ctx.argv.verbose) {
            console.log(`[delete:AliasRedirects] ${deleted}`)
          }
        }
      }
    }
  },
})
