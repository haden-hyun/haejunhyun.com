import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/relatedNotes.scss"

/**
 * RelatedNotes. **"노트 하단"** — 즉 본문과
 * 같은 폭의 afterBody 영역(320px 우측 사이드바가 아니라)에 백링크 +
 * 아웃고잉 링크를 합쳐 최대 4개, 2열 카드 그리드로 표시한다. `1fr 1fr`
 * 그리드가 자연스러우려면 이 넓이가 필요하다 — 사이드바(고정 320px,
 * variables.scss `$sidePanelWidth`)에 넣으면 카드가 너무 좁아진다.
 *
 * 내장 `github:quartz-community/backlinks`(우측 사이드바)는 **그대로 둔다.**
 * 원안의 "수정 컴포넌트" 목록에도 Backlinks는 없었다 — 즉
 * RelatedNotes는 대체가 아니라 **추가**다. 우측 사이드바의 간결한 백링크
 * 목록과, 하단의 풍성한(카테고리+제목 카드) 발견용 섹션은 목적이 다르다고
 * 판단했다. 일부 정보가 겹칠 수 있지만(백링크가 양쪽에 다 뜰 수 있음),
 * 위치와 밀도가 달라 UX상 중복으로 느껴지지 않는다.
 *
 * [중요 정정] 이전 세션에서 "backlinks가 어느 노트에도 렌더되지 않는다"고
 * 기록했었는데 이는 오류였다. 실측 결과
 * `.quartz/plugins/backlinks/src/components/Backlinks.tsx`는 서버사이드
 * `allFiles`를 그대로 순회하는 `file.links?.includes(currentSlug)` 검사로
 * 정상 동작하며, 실제로 5개 노트(통계 3종 상호링크, 부동산 3종)에서
 * 정상 렌더됐다. `hideWhenEmpty: true`(기본값)가 링크 없는 대다수 노트에서
 * 섹션을 숨긴 것뿐이었다 — 그 페이지들만 우연히 먼저 확인해 잘못 결론지었다.
 *
 * 백링크 소스는 `Backlinks.tsx`의 `selectBacklinkSources`와 동일한 조건으로
 * 재구현(작은 순수 함수라 의존성 추가 없이 인라인).
 *
 * [발견한 별건] 콘텐츠의 위키링크 중 일부(예: `[[모기지론]]` 류)가 전체
 * 슬러그가 아니라 부분 문자열로 저장돼 있어(`real-estate/mortgage-loan`이
 * `finance-property/real-estate/mortgage-loan`과 안 맞음, `asyncio` 단독
 * 표기 등) 실제로는 다른 노트를 가리키는데도 allFiles에서 일치하는 슬러그를
 * 찾지 못해 죽은 링크가 된다. 이 컴포넌트는 그런 링크를 **조용히 건너뛴다**
 * (실제 존재하는 파일에 매칭될 때만 렌더 — 깨진 링크로 이어지는 카드를
 * 만들지 않는다). 콘텐츠 쪽 위키링크 표기를 vault에서 고치는 건 이 세션의
 * 범위 밖이라 별도 조치가 필요하면 알려야 한다.
 */

type FileData = QuartzPluginData & Record<string, unknown>

const CATEGORY_NAMES: Record<string, string> = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools",
}

function getCategoryName(slug: string): string {
  const key = slug.split("/")[0] ?? ""
  return CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function isRealNote(slug: string): boolean {
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  // Phase 6에서 추가된 가상 페이지(topics-page/archive-page)도 같은 이유로 제외.
  if (slug === "topics" || slug === "archive") return false
  return true
}

export default (() => {
  const RelatedNotes: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = fileData.slug as string
    if (currentSlug === "index") return <></>

    const files = allFiles as FileData[]

    // 백링크: 다른 노트의 links 배열에 이 페이지가 포함된 경우
    // (backlinks 플러그인의 selectBacklinkSources와 동일 조건).
    const backlinks = files.filter(
      (f) =>
        f.unlisted !== true &&
        (f.links as string[] | undefined)?.includes(currentSlug) &&
        isRealNote((f.slug as string) ?? ""),
    )

    // 아웃고잉: 이 페이지가 참조하는 링크 중, 실제로 존재하는 노트와 매칭되는 것만.
    const outgoingTargets = (fileData.links as string[] | undefined) ?? []
    const outgoing = outgoingTargets
      .map((target) => files.find((f) => f.slug === target))
      .filter((f): f is FileData => f !== undefined && isRealNote((f.slug as string) ?? ""))

    const seen = new Set<string>([currentSlug])
    const related: FileData[] = []
    for (const f of [...outgoing, ...backlinks]) {
      const slug = f.slug as string
      if (seen.has(slug)) continue
      seen.add(slug)
      related.push(f)
      if (related.length >= 4) break
    }

    if (related.length === 0) return <></>

    return (
      <div class={`${displayClass ?? ""} related-notes`}>
        <h3>연결된 노트</h3>
        <div class="related-notes-grid">
          {related.map((f) => (
            <a class="related-note-card" href={resolveRelative(currentSlug, f.slug as string)}>
              <span class="related-note-cat">{getCategoryName((f.slug as string) ?? "")}</span>
              <span class="related-note-title">
                {(f.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"}
              </span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  RelatedNotes.css = style
  return RelatedNotes
}) satisfies QuartzComponentConstructor
