import type {
  FullSlug,
  PageMatcher,
  QuartzPageTypePlugin,
  VirtualPage,
} from "@quartz-community/types"
import TopicsContent, { type TopicsContentOptions } from "./components/TopicsContent"

// /topics 가상 페이지 하나를 만드는 pageType.
// 주의: match는 항상 false — 같은 슬러그의 실제 파일을 가로채지 않는다(가상 페이지 렌더는 match와 무관).
const neverMatch: PageMatcher = () => false

export const TopicsPage: QuartzPageTypePlugin<Partial<TopicsContentOptions>> = (opts) => ({
  name: "TopicsPage",
  priority: 5,
  match: neverMatch,
  generate() {
    const virtualPages: VirtualPage[] = [
      {
        slug: "topics" as unknown as FullSlug,
        title: "Topics",
        data: {},
      },
    ]
    return virtualPages
  },
  layout: "topics",
  body: () => TopicsContent(opts),
})
