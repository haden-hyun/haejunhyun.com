import type {
  FullSlug,
  PageMatcher,
  QuartzPageTypePlugin,
  VirtualPage,
} from "@quartz-community/types"
import TopicsContentComponent from "./components/TopicsContent"

/**
 * VirtualPage 패턴 — folder-page / tag-page의 pageType.ts와 동일 구조.
 *
 * `match`는 항상 false. 이 페이지타입이 소유하는 라우트는 generate()가
 * 만드는 "topics" 하나뿐이고, 같은 슬러그의 실제 파일이 생겨도 가로채지
 * 않도록 둔다. 가상 페이지 렌더는 match와 무관하게 실행되므로 문제없다.
 */
const neverMatch: PageMatcher = () => false

export const TopicsPage: QuartzPageTypePlugin = () => ({
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
  body: TopicsContentComponent,
})
