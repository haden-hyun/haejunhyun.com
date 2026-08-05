import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/relatedNotes.scss"

/**
 * RelatedNotes — 노트 하단(afterBody)의 백링크 + 아웃고잉 링크, 최대 4개.
 * ※ 현재 quartz.config.yaml에서 **비활성**.
 *
 * · 사이드바가 아니라 본문 폭에 두는 이유: 2열 카드 그리드가 성립하려면
 *   본문 폭이 필요하다(사이드바는 320px 고정)
 * · 우측 사이드바의 backlinks 플러그인은 대체하지 않고 **공존**한다 —
 *   간결한 목록과 발견용 카드 섹션은 목적이 다르다
 * · 백링크 판정은 backlinks 플러그인의 selectBacklinkSources와 동일 조건을
 *   인라인 재구현(작은 순수 함수라 의존성을 추가하지 않았다)
 *
 * ⚠️ 콘텐츠의 위키링크 일부가 전체 슬러그가 아닌 부분 문자열로 저장돼 있어
 *    (`real-estate/...` vs `finance-property/real-estate/...`) 대상 노트를
 *    못 찾는다. 이 컴포넌트는 그런 링크를 **조용히 건너뛴다** — 깨진 링크
 *    카드를 만들지 않는다. 근본 수정은 vault 쪽 표기 정리가 필요.
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

    // 백링크: 다른 노트의 links 배열에 이 페이지가 포함된 경우.
    const backlinks = files.filter(
      (f) =>
        f.unlisted !== true &&
        (f.links as string[] | undefined)?.includes(currentSlug) &&
        isRealNote((f.slug as string) ?? ""),
    )

    // 아웃고잉: 실제로 존재하는 노트에 매칭되는 링크만(깨진 링크는 버린다).
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
