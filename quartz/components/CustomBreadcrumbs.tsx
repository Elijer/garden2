import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { FullSlug } from "../util/path"
import { h } from "preact"

// Add declaration for originalSlug
declare module "vfile" {
  interface DataMap {
    originalSlug?: FullSlug
  }
}

interface BreadcrumbsOptions {
  /**
   * Symbol to use as a separator between breadcrumb items
   * @default "/"
   */
  spacer?: string
}

export const CustomBreadcrumbs: QuartzComponentConstructor<BreadcrumbsOptions> = (options) => {
  const { spacer = "/" } = options
  
  function Breadcrumbs({ fileData, allFiles, displayClass }: QuartzComponentProps) {
    // Use originalSlug for breadcrumbs if available, otherwise use slug
    const slug = fileData.originalSlug || fileData.slug
    
    // Split slug into path segments
    const segments = slug.split("/")
    if (segments.length === 0) return null
    
    // Generate breadcrumb elements
    const breadcrumbs = segments.map((segment, idx) => {
      // Skip empty segments
      if (!segment) return null
      
      // Create partial path up to this segment
      const path = segments.slice(0, idx + 1).join("/") as FullSlug
      
      // Find matching file for this path
      const currentFile = allFiles.find((file) => file.slug === path)
      
      // Get display name (use title from frontmatter if available, otherwise use segment)
      const displayName = currentFile?.frontmatter?.title ?? segment
      
      // Create link for this segment
      return h("li", { 
        class: "breadcrumb-item",
      }, h("a", { 
        href: resolveRelative(fileData.slug, path),
      }, displayName))
    }).filter(Boolean)
    
    // If there are no valid segments, don't display breadcrumbs
    if (breadcrumbs.length === 0) return null
    
    // Create spacer elements between breadcrumbs
    const spacerElement = h("li", { class: "breadcrumb-spacer" }, spacer)
    
    // Interleave spacers between breadcrumb items
    const breadcrumbsWithSpacers = []
    breadcrumbs.forEach((breadcrumb, idx) => {
      if (idx > 0) {
        breadcrumbsWithSpacers.push(spacerElement)
      }
      breadcrumbsWithSpacers.push(breadcrumb)
    })
    
    return h("nav", { 
      class: `breadcrumb-container ${displayClass ?? ""}`,
      "aria-label": "breadcrumbs",
    }, h("ul", { 
      class: "breadcrumb",
    }, breadcrumbsWithSpacers))
  }
  
  // Add component CSS
  Breadcrumbs.css = `
    .breadcrumb-container {
      padding: 0.5rem 0;
      margin: 0;
      color: var(--darkgray);
    }
    
    .breadcrumb {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    
    .breadcrumb-item a {
      text-decoration: none;
      color: var(--darkgray);
      font-size: 0.875rem;
    }
    
    .breadcrumb-item a:hover {
      color: var(--secondary);
    }
    
    .breadcrumb-spacer {
      color: var(--gray);
      font-size: 0.875rem;
    }
  `
  
  return Breadcrumbs
}