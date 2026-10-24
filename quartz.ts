// quartz.ts — YAML(quartz.config.yaml)로 표현 못 하는 오버라이드.
// - og-image 템플릿 주입(og-image.overrides.tsx)
// - 모바일 Backlinks를 content 페이지 afterBody(시리즈 페이저 뒤)에 한 번 더 배치
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import MobileOnly from "./quartz/components/MobileOnly"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"
import type { QuartzComponent, QuartzComponentConstructor } from "./quartz/components/types"
import { CustomOgImages } from "./.quartz/plugins"
import { customOgImage } from "./og-image.overrides"

// og-image의 `imageStructure`는 함수라 YAML에 못 쓴다 — 플러그인의 TS 오버라이드 훅으로 넘긴다.
CustomOgImages({ imageStructure: customOgImage })

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()

// Backlinks는 YAML에서 한 자리(데스크톱 좌측)만 가질 수 있다 — 모바일(사이드바가 숨는 폭)용으로 노트 본문 뒤에 한 번 더 둔다.
// 주의: loadQuartzConfig가 만든 디스패처는 자기 layout 사본을 쥐고 있어, 바꾼 layout으로 디스패처를 갈아 끼워야 반영된다.
const backlinks = componentRegistry.get("backlinks")
if (backlinks) {
  const instance =
    typeof backlinks.component === "function" && !("displayName" in backlinks.component)
      ? componentRegistry.instantiate(backlinks.component as QuartzComponentConstructor, undefined)
      : (backlinks.component as QuartzComponent)
  const mobile = MobileOnly(instance)
  const content = layout.byPageType.content
  if (content) {
    // 시리즈 페이저 바로 뒤, 댓글(giscus) 앞.
    const after = content.afterBody ?? []
    const at = after.findIndex((c) => (c.displayName ?? c.name) === "SeriesPager")
    content.afterBody = at >= 0 ? [...after.slice(0, at + 1), mobile, ...after.slice(at + 1)] : [...after, mobile]
  }
}
const dispatcher = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
if (dispatcher >= 0)
  config.plugins.emitters[dispatcher] = PageTypeDispatcher({ defaults: layout.defaults, byPageType: layout.byPageType })
