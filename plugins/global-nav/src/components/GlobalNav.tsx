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
 * **5개 항목 중 3개만 구현했다. Home/Topics/Archive만 링크가 있고, Notes와
 * About은 의도적으로 뺐다** — 조용히 범위를 줄인 게 아니라 아래 이유로 막혀
 * 있어 명시적으로 표시한다:
 *
 *   - **Notes** — design-handoff.md §3.1: "/notes 전체 노트 목록
 *     (페이지네이션)". 87개 노트 전체를 나열하는 페이지네이션 UI는 이번
 *     세션에서 만든 /topics, /archive보다 훨씬 큰 별도 작업(정렬·필터·페이지
 *     분할 UX 설계 필요)이라 범위에 넣지 않았다. 지금 wiring하면 링크가
 *     아무 데도 안 가는 죽은 네비게이션 항목이 된다.
 *   - **About** — 실제 이력·자기소개 문구가 필요한 콘텐츠 저작 영역이다.
 *     본인 목소리로 쓸 내용을 대신 지어낼 수 없어 페이지 자체를 만들지
 *     않았다. 콘텐츠를 주면 라우트 추가는 간단하다(content-page 하나로 충분,
 *     별도 pageType 불필요).
 *
 * 둘 다 나중에 추가되면 이 파일의 NAV_ITEMS 배열에 항목만 추가하면 된다.
 */

const NAV_ITEMS = [
  { label: "Home", slug: "index" },
  { label: "Topics", slug: "topics" },
  { label: "Archive", slug: "archive" },
]

export default (() => {
  const GlobalNav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) ?? "index"

    return (
      <nav class={`${displayClass ?? ""} global-nav`}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentSlug === item.slug || (item.slug === "index" && currentSlug === "")
          return (
            <a
              class={`global-nav-link${isActive ? " active" : ""}`}
              href={resolveRelative(currentSlug, item.slug)}
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
