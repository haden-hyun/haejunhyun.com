import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../../../_shared/path"
import style from "./styles/globalNav.scss"

/**
 * 글로벌 내비 — topbar의 `Home | Topics | Archive` 탭(전 페이지, `condition` 없음).
 * - 현재 페이지는 `aria-current="page"`, 노트·폴더·태그 페이지는 소속 갈래 Topics를 조상(`aria-current="true"`)으로 켠다
 * - 탭은 NAV_ITEMS에 항목만 넣으면 는다
 * 주의: `position: "header"`는 YAML 스키마·config-loader에 없는 슬롯이라 에러 없이 버려진다.
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
