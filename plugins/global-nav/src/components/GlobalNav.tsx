import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/globalNav.scss"

/**
 * design-handoff.md §3.1 글로벌 네비게이션: `Home | Notes | Topics | Archive
 * | About`. `position: beforeBody`, priority 0(모든 beforeBody 컴포넌트 중
 * 최상단) — 홈의 Hero/TopicGrid보다도 위, 노트의 breadcrumbs(5)보다도 위에
 * 렌더된다. `condition`은 걸지 않는다 — 홈 포함 모든 페이지에서 항상 보여야
 * 하는 사이트 전역 네비게이션이라 not-index를 걸면 홈에서 사라진다.
 *
 * [중요] `position: "header"`(FullPageLayout.header, DefaultFrame.tsx의
 * `<Header>` 래퍼 슬롯)를 먼저 시도했으나, YAML 스키마의 `layout.position`
 * enum 자체가 `left/right/beforeBody/afterBody/body`만 허용하고 "header"가
 * 없다. 게다가 `config-loader.ts`의 `buildLayoutForEntries`가 만드는
 * `positions` 레코드도 `left/right/beforeBody/afterBody` 4개 키만 갖고
 * 있어(`header` 키 없음), `position: header`로 등록해도
 * `positions[layout.position]`이 `undefined`가 되어 **컴포넌트가 조용히
 * 버려진다**(에러 없이 그냥 렌더 안 됨) — `FullPageLayout.header`는 타입과
 * DefaultFrame 렌더 코드는 남아 있지만 이 YAML 기반 config 경로에서는 채울
 * 방법이 없는 사실상 죽은 슬롯이다. 그래서 beforeBody로 전환했다.
 *
 * **5개 항목 중 4개 구현. About만 의도적으로 뺐다** — 조용히 범위를 줄인 게
 * 아니라 아래 이유로 막혀 있어 명시적으로 표시한다:
 *
 *   - **About** — 실제 이력·자기소개 문구가 필요한 콘텐츠 저작 영역이다.
 *     본인 목소리로 쓸 내용을 대신 지어낼 수 없어 페이지 자체를 만들지
 *     않았다. 콘텐츠를 주면 라우트 추가는 간단하다(content-page 하나로 충분,
 *     별도 pageType 불필요).
 *
 * 나중에 추가되면 이 파일의 NAV_ITEMS 배열에 항목만 추가하면 된다.
 *
 * **Notes** — [2026-08-05] 사용자 피드백으로 추가. design-handoff.md §3.1이
 * 원래 그리던 "/notes 전체 노트 목록(페이지네이션)"은 여전히 별도 작업
 * (정렬·필터·페이지 분할 UX)이라 이번엔 만들지 않았다. 대신 slug가 없는
 * 항목(`slug: null`)으로 등록해 "Home/Topics/Archive 중 어느 것도 아닌
 * 페이지"(개별 노트, 폴더, 태그)에서 자동으로 active가 되도록 하고, 링크는
 * 이미 존재하는 전체 노트 목록인 /archive를 가리키게 했다 — 클릭했을 때
 * 아무 데도 안 가는 죽은 링크보다 낫다. 전용 /notes 페이지가 생기면 그때
 * href만 바꾸면 된다.
 */

const NAV_ITEMS: { label: string; slug: string | null }[] = [
  { label: "Home", slug: "index" },
  { label: "Notes", slug: null },
  { label: "Topics", slug: "topics" },
  { label: "Archive", slug: "archive" },
]

// slug를 가진 나머지 항목들 — "Notes"의 활성 상태를 "이 중 아무것도 아닐 때"로 판정하는 기준.
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
