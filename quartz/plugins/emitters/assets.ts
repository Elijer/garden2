import { FilePath, joinSegments, slugifyFilePath } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import path from "path"
import fs from "fs"
import { glob } from "../../util/glob"
import { Argv } from "../../util/ctx"
import { QuartzConfig } from "../../cfg"

const filesToCopy = async (argv: Argv, cfg: QuartzConfig) => {
  // glob all non MD files in content folder and copy it over
  return await glob("**", argv.directory, ["**/*.md", ...cfg.configuration.ignorePatterns])
}

const copyFile = async (argv: Argv, fp: FilePath): Promise<FilePath | null> => {
  const src = joinSegments(argv.directory, fp) as FilePath

  const name = slugifyFilePath(fp)
  const dest = joinSegments(argv.output, name) as FilePath

  // ensure dir exists
  const dir = path.dirname(dest) as FilePath
  await fs.promises.mkdir(dir, { recursive: true })

  try {
    await fs.promises.copyFile(src, dest)
    return dest
  } catch (err: any) {
    // Handle file not found errors gracefully (can occur when files are moved/deleted)
    if (err.code === 'ENOENT') {
      if (argv.verbose) {
        console.log(`[skip] ${fp} (source file not found, likely moved or deleted)`)
      }
      return null
    }
    throw err
  }
}

export const Assets: QuartzEmitterPlugin = () => {
  return {
    name: "Assets",
    async *emit({ argv, cfg }) {
      const fps = await filesToCopy(argv, cfg)
      for (const fp of fps) {
        const result = await copyFile(argv, fp)
        if (result) {
          yield result
        }
      }
    },
    async *partialEmit(ctx, _content, _resources, changeEvents) {
      for (const changeEvent of changeEvents) {
        const ext = path.extname(changeEvent.path)
        if (ext === ".md") continue

        if (changeEvent.type === "add" || changeEvent.type === "change") {
          const result = await copyFile(ctx.argv, changeEvent.path)
          if (result) {
            yield result
          }
        } else if (changeEvent.type === "delete") {
          const name = slugifyFilePath(changeEvent.path)
          const dest = joinSegments(ctx.argv.output, name) as FilePath
          try {
            await fs.promises.unlink(dest)
          } catch (err: any) {
            // File might not exist, which is fine
            if (err.code !== 'ENOENT') {
              console.error(`Failed to delete ${dest}:`, err.message)
            }
          }
        }
      }
    },
  }
}
