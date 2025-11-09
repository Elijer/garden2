import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.RecentNotes({
        // title: "Recent Posts",
        title: "",
        limit: 12,
        showTags: true,
      }),
      condition: (page) => page.fileData.slug === "recent",
    }),
  ],
  footer: Component.Footer({
    links: {
      "Code": "https://elijahkennedy.com/",
      "Video": "https://vimeo.com/215457799",
      "Illustration": "https://app.milanote.com/1R4bQg1yx7aY2T/portfolio?p=waxm3Jjmsfr",
      "Soundcloud": "https://soundcloud.com/eliahuu"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Flex({
      components: [
        // {
        //   Component: Component.Search(),
        //   grow: true,
        // },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    // Component.PageTitle(),
    // Component.MobileOnly(Component.Spacer()),
    // Component.Flex({
    //   components: [
    //     {
    //       Component: Component.Search(),
    //       grow: true,
    //     },
    //     { Component: Component.Darkmode() },
    //     { Component: Component.ReaderMode() },
    //   ],
    // }),
    // Component.Explorer(),
  ],
  right: [
    // Component.ConditionalRender({
    //   component: Component.RecentNotes({
    //     title: "Recent Posts",
    //     limit: 20,
    //     showTags: true,
    //   }),
    //   condition: (page) => page.fileData.slug === "index",
    // }),
    // Component.Graph(),
    // Component.DesktopOnly(Component.TableOfContents()),
    // Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
