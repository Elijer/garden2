import { QuartzEmitterPlugin } from "../types"
import { ContentPage } from "./contentPage"
import { FullSlug } from "../../util/path"

// Simple plugin that extends ContentPage to use permalinks as primary URLs
export const ShortPermalinkContentPage = (): QuartzEmitterPlugin => {
  // Get the standard content page emitter
  const contentPage = ContentPage()
  
  return {
    name: "ShortPermalinkContentPage",
    
    async *emit(ctx, content) {
      // Process content to use permalinks as slugs
      const processedContent = content.map(([tree, file]) => {
        // Only process if the file has a permalink
        if (file.data.frontmatter?.permalink) {
          // Create a copy of the file to avoid modifying the original
          const newFile = { ...file }
          newFile.data = { ...file.data }
          
          // Store original slug for breadcrumbs
          newFile.data.originalSlug = newFile.data.slug
          
          // Get permalink (use first one if it's an array)
          const permalink = Array.isArray(newFile.data.frontmatter.permalink)
            ? newFile.data.frontmatter.permalink[0]
            : newFile.data.frontmatter.permalink
          
          // Convert permalink to slug (remove leading slash if present)
          const permalinkSlug = permalink.startsWith('/')
            ? permalink.substring(1) as FullSlug
            : permalink as FullSlug
          
          // Set the new slug
          newFile.data.slug = permalinkSlug
          
          return [tree, newFile]
        }
        
        // If no permalink, return the original file
        return [tree, file]
      })
      
      // Pass processed content to the standard ContentPage emitter
      yield* contentPage.emit(ctx, processedContent)
    },
    
    async *partialEmit(ctx, content, resources, changeEvents) {
      // Process content for partial emits too
      const processedContent = content.map(([tree, file]) => {
        if (file.data.frontmatter?.permalink) {
          const newFile = { ...file }
          newFile.data = { ...file.data }
          
          newFile.data.originalSlug = newFile.data.slug
          
          const permalink = Array.isArray(newFile.data.frontmatter.permalink)
            ? newFile.data.frontmatter.permalink[0]
            : newFile.data.frontmatter.permalink
          
          const permalinkSlug = permalink.startsWith('/')
            ? permalink.substring(1) as FullSlug
            : permalink as FullSlug
          
          newFile.data.slug = permalinkSlug
          
          return [tree, newFile]
        }
        
        return [tree, file]
      })
      
      yield* contentPage.partialEmit(ctx, processedContent, resources, changeEvents)
    },
  }
}