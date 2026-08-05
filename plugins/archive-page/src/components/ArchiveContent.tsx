import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/archiveContent.scss"

/**
 * 글로벌 네비게이션의 "Archive" 라우트
 * ("연도별 타임라인"). 모든 실제 노트를 연도별로 묶어 최신 연도부터
 * 내림차순으로 나열한다.
 *
 * "topics"/"archive" 자체도 이제 allFiles에 가상 페이지로 섞여 들어오므로
 * (다른 페이지의 home-hero/topic-grid/featured-notes/recent-notes-index/
 * related-notes와 동일하게) isRealNote에서 명시적으로 제외한다 — 두 라우트
 * 모두 frontmatter.title이 채워진 채로 생성되기 때문에 title 유무만으로는
 * 걸러지지 않는다.
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

function getTime(f: FileData): number {
  const dates = f.dates as { modified?: Date; created?: Date } | undefined
  return dates?.modified?.getTime() ?? dates?.created?.getTime() ?? 0
}

function getDisplayDate(f: FileData): Date | undefined {
  const dates = f.dates as { modified?: Date; created?: Date; published?: Date } | undefined
  return dates?.modified ?? dates?.created ?? dates?.published
}

export default (() => {
  const ArchiveContent: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) ?? "archive"
    const files = (allFiles as FileData[])
      .filter((f) => isRealNote((f.slug as string) ?? ""))
      .filter((f) => getTime(f) > 0)
      .sort((a, b) => getTime(b) - getTime(a))

    const byYear = new Map<number, FileData[]>()
    for (const f of files) {
      const d = getDisplayDate(f)
      if (!d) continue
      const year = d.getFullYear()
      const list = byYear.get(year) ?? []
      list.push(f)
      byYear.set(year, list)
    }
    const years = [...byYear.keys()].sort((a, b) => b - a)

    return (
      // <h1>은 article-title 플러그인이 frontmatter.title("Archive")로 렌더 —
      // topics-page와 동일한 이유로 여기서 중복 렌더하지 않는다.
      <article class={`${displayClass ?? ""} archive-page-content popover-hint`}>
        <p class="archive-page-sub">
          전체 {files.length}개 노트 · {years.length}개 연도
        </p>
        {years.map((year) => (
          <section class="archive-page-year">
            <h2>{year}</h2>
            <div class="archive-page-rows">
              {byYear.get(year)!.map((f) => {
                const d = getDisplayDate(f)
                return (
                  <a class="archive-page-row" href={resolveRelative(currentSlug, f.slug as string)}>
                    <span class="archive-page-date">
                      {d?.toLocaleDateString("ko-KR", { month: "short", day: "2-digit" })}
                    </span>
                    <span class="archive-page-title">
                      {(f.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"}
                    </span>
                    <span class="archive-page-cat">
                      {getCategoryName((f.slug as string) ?? "")}
                    </span>
                  </a>
                )
              })}
            </div>
          </section>
        ))}
      </article>
    )
  }

  ArchiveContent.css = style
  return ArchiveContent
}) satisfies QuartzComponentConstructor
