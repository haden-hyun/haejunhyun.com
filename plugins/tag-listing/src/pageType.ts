import type { QuartzPageTypePlugin } from "@quartz-community/types"
import { TagPage, type TagPageOptions } from "@quartz-community/tag-page"
import TagListing from "./components/TagListing"

/**
 * tag-page를 대체한다 — 가상 태그 페이지 생성·매칭·레이아웃("tag")은 업스트림 그대로, 본문 목록만 folder-listing 행으로.
 * 주의: 가상 페이지는 그것을 만든 pageType의 body로 렌더되므로 tag-page는 꺼 둬야 한다.
 */
export const TagListingPage: QuartzPageTypePlugin<Partial<TagPageOptions>> = (opts) => ({
  ...TagPage(opts),
  name: "TagListingPage",
  body: () => TagListing(),
})
