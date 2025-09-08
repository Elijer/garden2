import { FullSlug } from "../util/path"

export interface QuartzPluginData {
  slug: FullSlug
  // Original slug for breadcrumbs when using short permalinks
  originalSlug?: FullSlug
  filePath: string
  frontmatter: { [key: string]: any }
  content: string
  date?: Date
  lastmod?: Date
  description?: string
  tags: string[]
  // Outgoing links to other notes
  links: Array<{
    slug: FullSlug
    relativePath: string
    cleanText: string
  }>
  // Incoming links from other notes
  backlinks: Array<{
    slug: FullSlug
    relativePath: string
    cleanText: string
  }>
  // Outgoing links to external URLs
  externalLinks: Array<{
    href: string
    text: string
  }>
  // Outgoing links to static resources
  staticLinks: Array<{
    href: string
    text: string
  }>
  // Hashtags in the document
  hashTags: string[]
  // Estimated reading time in minutes
  readingTime?: number
  // Heading tree
  headings: Array<{
    level: number
    text: string
    slug: string
  }>
}