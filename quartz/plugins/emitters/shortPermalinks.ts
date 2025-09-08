import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import { FullPageLayout } from "../../cfg"
import { defaultContentPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { Content } from "../../components"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { Node } from "unist"
import { StaticResources } from "../../util/resources"
import { QuartzPluginData } from "../vfile"
import { FullSlug, pathToRoot } from "../../util/path"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"

// Process content with standard ContentPage processing
async function processContent(
  ctx: BuildCtx,
  tree: Node,
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
  targetSlug?: FullSlug
) {
  const slug = targetSlug || fileData.slug!
  const cfg = ctx.cfg.configuration
  const externalResources = pageResources(pathToRoot(slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const content = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({
    ctx,
    content,
    slug,
    ext: ".html",
  })
}

// Get permalink slug if available
function getPermalinkSlug(fileData: QuartzPluginData): FullSlug | undefined {
  if (!fileData.frontmatter?.permalink) return undefined

  // Get permalink (use first one if it's an array)
  const permalink = Array.isArray(fileData.frontmatter.permalink)
    ? fileData.frontmatter.permalink[0]
    : fileData.frontmatter.permalink

  // Convert permalink to slug (remove leading slash if present)
  return (permalink.startsWith('/')
    ? permalink.substring(1)
    : permalink) as FullSlug
}

export const ShortPermalinkContentPage: QuartzEmitterPlugin<Partial<FullPageLayout>> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: Content(),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "ShortPermalinkContentPage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map(([_, file]) => file.data)

      for (const [tree, file] of content) {
        const fileData = file.data
        const originalSlug = fileData.slug!
        
        // Skip index and tag pages
        if (originalSlug.endsWith("/index") || originalSlug.startsWith("tags/")) continue

        // Get permalink if available
        const permalinkSlug = getPermalinkSlug(fileData)
        
        if (permalinkSlug) {
          // Store original slug for breadcrumbs
          fileData.originalSlug = originalSlug
          
          // Generate content at the permalink URL
          yield processContent(ctx, tree, fileData, allFiles, opts, resources, permalinkSlug)
        } else {
          // No permalink, just process normally
          yield processContent(ctx, tree, fileData, allFiles, opts, resources)
        }
      }
    },
    async *partialEmit(ctx, content, resources, changeEvents) {
      const allFiles = content.map(([_, file]) => file.data)

      // Find all slugs that changed or were added
      const changedSlugs = new Set<string>()
      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        if (changeEvent.type === "add" || changeEvent.type === "change") {
          changedSlugs.add(changeEvent.file.data.slug!)
        }
      }

      for (const [tree, file] of content) {
        const fileData = file.data
        const originalSlug = fileData.slug!
        
        if (!changedSlugs.has(originalSlug)) continue
        if (originalSlug.endsWith("/index") || originalSlug.startsWith("tags/")) continue

        // Get permalink if available
        const permalinkSlug = getPermalinkSlug(fileData)
        
        if (permalinkSlug) {
          // Store original slug for breadcrumbs
          fileData.originalSlug = originalSlug
          
          // Generate content at the permalink URL
          yield processContent(ctx, tree, fileData, allFiles, opts, resources, permalinkSlug)
        } else {
          // No permalink, just process normally
          yield processContent(ctx, tree, fileData, allFiles, opts, resources)
        }
      }
    },
  }
}