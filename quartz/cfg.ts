import { QuartzComponent } from "./components/types"
import { PluginTypes } from "./plugins/types"
import { Theme } from "./util/theme"

export type Analytics =
  | {
      provider: "plausible"
      host?: string
    }
  | {
      provider: "google"
      tagId: string
    }
  | {
      provider: "umami"
      websiteId: string
      host?: string
    }
  | {
      provider: "goatcounter"
      websiteId: string
      host?: string
      scriptSrc?: string
    }
  | {
      provider: "cloudflare"
      token: string
    }
  | {
      provider: "simple"
    }
  | {
      provider: "matomo"
      matomoUrl: string
      siteId: string
    }
  | {
      provider: "vercel"
    }

// Interface for short permalinks configuration
export interface ShortPermalinksOptions {
  /**
   * Whether to prioritize permalinks over file paths for URLs.
   * - When true: URLs will be based on the first permalink if available
   * - When false: Standard file paths will be used
   * @default false
   */
  enabled: boolean
}

export interface GlobalConfiguration {
  pageTitle: string
  /** Whether to show the last modified date at the end of pages */
  enableFrontmatterTime: boolean
  /** Whether to show the reading time at the end of pages */
  enableReadingTime: boolean
  /** Whether to enable single-page app style rendering */
  enableSPA: boolean
  /** Whether to minify output HTML */
  enableMinification: boolean
  /** Whether to use pretty URLs */
  enablePrettyLinks: boolean
  /** Whether to render link previews on hover */
  enablePopovers: boolean
  /** Whether to use tabs to indent code blocks */
  enableCodeBlockTabIndents: boolean
  /** Whether to use site-wide dark mode */
  enableDarkMode: boolean
  /** Whether to use site-wide customizable theme colors */
  enableCustomTheme: boolean
  /** Whether to display the footer */
  enableFooter: boolean
  /** Whether to display the table of contents on desktop */
  enableToc: boolean
  /** Whether to display the breadcrumbs in the header */
  enableBreadcrumbs: boolean
  /** Whether to display the anchor links to the left of headings */
  enableAnchorLinks: boolean
  /** Whether to display the link preview tooltip */
  enableLinkPreview: boolean
  /** Whether to display the last modified time */
  enableLastModified: boolean
  /** Whether to display the reading time */
  enableReadingTimeDisplay: boolean
  /** Whether to enable the giscus comment system */
  enableGiscus: boolean
  /** Whether to display the tags at the end of pages */
  enableTags: boolean
  /** Whether to display the "edit this page" link */
  enableEditThisPage: boolean
  /** Whether to display the "created" date at the end of pages */
  enableCreatedTime: boolean
  /** Whether to display the "updated" date at the end of pages */
  enableUpdatedTime: boolean
  /** Whether to display the RSS feed link */
  enableRSS: boolean
  /** Whether to display the search button */
  enableSearch: boolean
  /** Whether to display the graph visualization */
  enableGraph: boolean
  /** Whether to display the explorer */
  enableExplorer: boolean
  /** Whether to display the "toggle dark mode" button */
  enableDarkModeToggle: boolean
  /** Whether to display the "toggle reader mode" button */
  enableReaderMode: boolean
  /** Whether to display the "jump to top" button */
  enableJumpToTop: boolean
  /** Whether to display the "next/previous" page buttons */
  enableNavLinks: boolean
  /** Whether to display the "random note" button */
  enableRandomNotes: boolean
  /** Whether to display the "recently updated" section */
  enableRecentNotes: boolean
  /** Whether to display the backlinks section */
  enableBacklinks: boolean
  /** Whether to prioritize permalinks over file paths for URLs */
  shortPermalinks?: ShortPermalinksOptions
  /** Analytics mode */
  analytics?: Analytics
  /** Base URL to use for CNAME files, sitemaps, and RSS feeds that require an absolute URL.
   * If you're deploying to GitHub pages, this should be:
   * "https://[username].github.io/[repo name]"
   */
  baseUrl?: string
  /** Folder where the site will be built to */
  outputPath?: string
  /** Folders to ignore when building the site */
  ignorePatterns?: string[]
  /** Default page information */
  defaultDateType?: "created" | "modified"
  /** Theme configuration */
  theme?: Theme
  /** i18n configuration */
  locale?: string
}

export type ComponentConfiguration = {
  /** Component to use as the base layout for the site */
  layout: QuartzComponent
  /** Components to use in the head of the page */
  head: QuartzComponent[]
  /** Components to use in the header of the page */
  header: QuartzComponent[]
  /** Components to use in the footer of the page */
  footer: QuartzComponent[]
}

export interface FullPageLayout {
  /** Components to use before the page content */
  beforeBody: QuartzComponent[]
  /** Components to use after the page content */
  afterBody: QuartzComponent[]
  /** Components to use in the left sidebar */
  left: QuartzComponent[]
  /** Components to use in the right sidebar */
  right: QuartzComponent[]
}

export type PageLayout = Partial<FullPageLayout>
export type SharedLayout = Pick<ComponentConfiguration, "head" | "header" | "footer">

export interface QuartzConfig {
  configuration: GlobalConfiguration
  plugins: PluginTypes
}

// vite won't let us import outside of the root directory, even with ..
// so instead of importing from `content/config.ts`, we'll use this default config
// and let the user override it
export const defaultConfig: QuartzConfig = {
  configuration: {
    pageTitle: "Quartz",
    enableFrontmatterTime: true,
    enableReadingTime: true,
    enableSPA: true,
    enablePopovers: true,
    enableCodeBlockTabIndents: false,
    enableMinification: true,
    enablePrettyLinks: true,
    enableDarkMode: true,
    enableCustomTheme: true,
    enableFooter: true,
    enableToc: true,
    enableBreadcrumbs: true,
    enableAnchorLinks: true,
    enableLinkPreview: true,
    enableLastModified: true,
    enableReadingTimeDisplay: true,
    enableGiscus: false,
    enableTags: true,
    enableEditThisPage: false,
    enableCreatedTime: false,
    enableUpdatedTime: true,
    enableRSS: true,
    enableSearch: true,
    enableGraph: true,
    enableExplorer: true,
    enableDarkModeToggle: true,
    enableReaderMode: true,
    enableJumpToTop: true,
    enableNavLinks: true,
    enableRandomNotes: true,
    enableRecentNotes: true,
    enableBacklinks: true,
    shortPermalinks: {
      enabled: false,
    },
    locale: "en-US",
    baseUrl: "quartz.jzhao.xyz",
  },
  plugins: {
    transformers: [],
    filters: [],
    emitters: [],
  },
}