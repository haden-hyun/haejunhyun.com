import type {
  FullSlug,
  PageMatcher,
  QuartzPageTypePlugin,
  VirtualPage,
} from "@quartz-community/types"
import TopicsContentComponent from "./components/TopicsContent"

/**
 * VirtualPage 메커니즘 사용법은 `.quartz/plugins/folder-page/src/pageType.ts`,
 * `.quartz/plugins/tag-page/src/pageType.ts`를 참고해 구현(같은 패턴).
 *
 * `match`는 항상 false를 반환한다 — 이 페이지타입이 소유하는 라우트는
 * `generate()`가 만드는 가상 페이지("topics") 하나뿐이고, 실제 콘텐츠 파일
 * 중 이 슬러그를 가진 것은 없다(그런 파일이 생겨도 이 페이지타입이
 * 가로채지 않도록 항상 false로 둔다 — dispatcher.ts Phase 2는 real content
 * 파일에만 match()를 적용하고, Phase 3의 가상 페이지 렌더는 match와 무관하게
 * 항상 실행된다).
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
