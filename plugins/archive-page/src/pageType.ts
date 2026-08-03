import type {
  FullSlug,
  PageMatcher,
  QuartzPageTypePlugin,
  VirtualPage,
} from "@quartz-community/types"
import ArchiveContentComponent from "./components/ArchiveContent"

const neverMatch: PageMatcher = () => false

export const ArchivePage: QuartzPageTypePlugin = () => ({
  name: "ArchivePage",
  priority: 5,
  match: neverMatch,
  generate() {
    const virtualPages: VirtualPage[] = [
      {
        slug: "archive" as unknown as FullSlug,
        title: "Archive",
        data: {},
      },
    ]
    return virtualPages
  },
  layout: "archive",
  body: ArchiveContentComponent,
})
