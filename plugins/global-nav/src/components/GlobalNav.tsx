import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/globalNav.scss"

/**
 * 글로벌 내비 — `Home | Topics | Archive`. 현재는 topbar 배치.
 *
 * - `condition`을 걸지 않는다 — 홈 포함 전 페이지에 항상 보여야 한다
 * - 주의: `position: "header"`는 쓸 수 없다. YAML 스키마 enum에 없고,
 *   config-loader의 positions 레코드도 left/right/beforeBody/afterBody 4개뿐이라
 *   등록해도 에러 없이 조용히 버려진다(사실상 죽은 슬롯)
 * - 탭은 목적지 페이지만. 노트·폴더·태그 페이지는 소속 갈래인 Topics를 조상으로 켠다
 * - About은 자기소개 콘텐츠가 있어야 추가 가능. NAV_ITEMS에 항목만 넣으면 된다
 */

interface NavItem {
  label: string
  slug: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", slug: "index" },
  { label: "Topics", slug: "topics" },
  { label: "Archive", slug: "archive" },
]

/** 현재 페이지가 아니라 그 아래에 있는 탭 — 노트·폴더·태그 페이지는 모두 Topics 갈래다. */
function ancestorSlug(slug: string): string | undefined {
  if (slug === "index" || slug === "404" || slug === "topics" || slug === "archive") return undefined
  return "topics"
}

export default (() => {
  const GlobalNav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) || "index"
    const ancestor = ancestorSlug(currentSlug)

    return (
      <nav class={`${displayClass ?? ""} global-nav`}>
        {NAV_ITEMS.map((item) => {
          const current = currentSlug === item.slug
          const isAncestor = !current && ancestor === item.slug
          return (
            <a
              class={`global-nav-link${current ? " active" : ""}${isAncestor ? " is-ancestor" : ""}`}
              href={resolveRelative(currentSlug, item.slug)}
              aria-current={current ? "page" : isAncestor ? "true" : undefined}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    )
  }

  GlobalNav.css = style
  return GlobalNav
}) satisfies QuartzComponentConstructor
