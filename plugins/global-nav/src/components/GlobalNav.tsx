import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/globalNav.scss"

/**
 * 글로벌 내비 — `Home | Notes | Topics | Archive`. 현재는 topbar 배치.
 *
 * · `condition`을 걸지 않는다 — 홈 포함 전 페이지에 항상 보여야 한다
 * · ⚠️ `position: "header"`는 쓸 수 없다. YAML 스키마 enum에 없고,
 *   config-loader의 positions 레코드도 left/right/beforeBody/afterBody 4개뿐이라
 *   등록해도 **에러 없이 조용히 버려진다**(사실상 죽은 슬롯)
 * · **Notes**는 `slug: null` — 전용 /notes 페이지가 아직 없어서, "Home/Topics/
 *   Archive 중 무엇도 아닌 페이지"(개별 노트·폴더·태그)에서 active가 되고
 *   링크는 /archive로 보낸다. 전용 페이지가 생기면 slug만 채우면 된다
 * · About은 자기소개 콘텐츠가 있어야 추가 가능. NAV_ITEMS에 항목만 넣으면 된다
 */

const NAV_ITEMS: { label: string; slug: string | null }[] = [
  { label: "Home", slug: "index" },
  { label: "Notes", slug: null },
  { label: "Topics", slug: "topics" },
  { label: "Archive", slug: "archive" },
]

// "Notes"의 active 판정 기준 — 이 집합에 없는 슬러그면 Notes를 활성으로 본다.
const NAMED_SLUGS = new Set(
  NAV_ITEMS.filter((item) => item.slug !== null).map((item) => item.slug as string),
)

export default (() => {
  const GlobalNav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) || "index"

    return (
      <nav class={`${displayClass ?? ""} global-nav`}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.slug === null ? !NAMED_SLUGS.has(currentSlug) : currentSlug === item.slug
          const targetSlug = item.slug ?? "archive"
          return (
            <a
              class={`global-nav-link${isActive ? " active" : ""}`}
              href={resolveRelative(currentSlug, targetSlug)}
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
