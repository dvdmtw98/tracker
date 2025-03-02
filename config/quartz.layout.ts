import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { textTransformNode } from "./quartz/util/custom"

const contentMetaConfig = {
    repoLink: "https://github.com/dvdmtw98/tracker",
    branch: "main",
    rootDirectory: "tracker-vault"
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
    head: Component.Head(),
    header: [],
    afterBody: [
        Component.Backlinks(),
        Component.BackToTop()
    ],
    footer: Component.Footer({
        links: {
            GitHub: "https://github.com/dvdmtw98",
            Notes: "https://notes.davidvarghese.net",
            Blog: "https://blog.davidvarghese.net",
        },
    }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
    beforeBody: [
        Component.Breadcrumbs(),
        Component.ArticleTitle(),
        Component.ContentMeta(contentMetaConfig),
        Component.TagList(),
    ],
    left: [
        Component.PageTitle(),
        Component.MobileOnly(Component.Spacer()),
        Component.Search(),
        Component.Darkmode(),
        Component.Explorer({ mapFn: textTransformNode })
    ],
    right: [
        Component.TableOfContents(),
        Component.Graph({
            localGraph: {
                linkDistance: 80,
                fontSize: 0.7,
                showTags: false

            },
            globalGraph: {
                linkDistance: 250,
                repelForce: 1,
                centerForce: 0.6,
                fontSize: 0.3,
                showTags: false
            }
        })
    ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
    beforeBody: [
        Component.Breadcrumbs(),
        Component.ArticleTitle(),
        Component.ContentMeta(contentMetaConfig)
    ],
    left: [
        Component.PageTitle(),
        Component.MobileOnly(Component.Spacer()),
        Component.Search(),
        Component.Darkmode(),
        Component.Explorer({ mapFn: textTransformNode }),
    ],
    right: [],
}


