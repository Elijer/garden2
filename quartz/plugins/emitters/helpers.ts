import path from "path"
import fs from "fs"
import { BuildCtx } from "../../util/ctx"
import { FilePath, FullSlug, joinSegments } from "../../util/path"
import { Readable } from "stream"

type WriteOptions = {
  ctx: BuildCtx
  slug: FullSlug
  ext: `.${string}` | ""
  content: string | Buffer | Readable
}

export const write = async ({ ctx, slug, ext, content }: WriteOptions): Promise<FilePath> => {
  const pathToPage = joinSegments(ctx.argv.output, slug + ext) as FilePath
  const dir = path.dirname(pathToPage)
  await fs.promises.mkdir(dir, { recursive: true })
  await fs.promises.writeFile(pathToPage, content)
  return pathToPage
}

type DeleteOptions = {
  ctx: BuildCtx
  slug: FullSlug
  ext: `.${string}` | ""
}

export const deleteFile = async ({ ctx, slug, ext }: DeleteOptions): Promise<FilePath | null> => {
  const pathToPage = joinSegments(ctx.argv.output, slug + ext) as FilePath
  try {
    await fs.promises.unlink(pathToPage)
    return pathToPage
  } catch (err: any) {
    // File might not exist, which is fine
    if (err.code !== 'ENOENT') {
      console.error(`Failed to delete ${pathToPage}:`, err.message)
    }
    return null
  }
}
