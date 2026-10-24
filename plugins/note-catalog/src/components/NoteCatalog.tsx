// 좌측 CATALOG — 전체 파일 트리 대신 현재 노트의 형제 노트만, 현재 노트 앞뒤 radius편 창으로.
// - 형제는 제목 자연 정렬(번호 접두사 순서), 시리즈 편만 편 순으로 모은다
// - 창 밖은 폴더 페이지 링크, 맨 아래는 Topics의 현재 토픽 섹션으로
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../../../_shared/path"
import style from "./styles/noteCatalog.scss"
import { isListedNote, isRealNote } from "../../../_shared/notes"
import { groupBySeries, seriesLabel } from "../../../_shared/series"
import { topicAnchor } from "../../../_shared/topics"

type CatalogPluginData = QuartzPluginData & Record<string, unknown>

export interface NoteCatalogOptions {
  title: string
  /** Topics 페이지면 현재 토픽 섹션 앵커(`#topic-<key>`)를 붙인다. */
  moreHref: string
  moreLabel: string
  /** 현재 노트 앞뒤로 보일 편 수. 폴더 처음·끝에선 반대쪽을 더 보여 2·radius+1행을 채운다. */
  radius: number
}

const defaultOptions: NoteCatalogOptions = {
  title: "CATALOG",
  moreHref: "topics",
  moreLabel: "← All topics",
  radius: 2,
}

export default ((userOpts?: Partial<NoteCatalogOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const NoteCatalog: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const currentSlug = fileData.slug
    if (!currentSlug || !isRealNote(currentSlug)) return <></>

    const parentDir = currentSlug.split("/").slice(0, -1).join("/")

    const sorted = (allFiles as CatalogPluginData[])
      .filter((f) => {
        if (!f.slug || !isListedNote(f)) return false
        return f.slug.split("/").slice(0, -1).join("/") === parentDir
      })
      .sort((a, b) =>
        (a.frontmatter?.title ?? a.slug!).localeCompare(b.frontmatter?.title ?? b.slug!, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      )
    const siblings = groupBySeries(sorted).flatMap((g) => g.items)

    if (siblings.length === 0) return <></>

    const at = siblings.findIndex((f) => f.slug === currentSlug)
    const size = Math.min(siblings.length, 2 * opts.radius + 1)
    const start = Math.max(0, Math.min(siblings.length - size, at - opts.radius))
    const shown = siblings.slice(start, start + size)
    const folderHref = parentDir ? resolveRelative(currentSlug, `${parentDir}/index`) : undefined

    return (
      <nav class="note-catalog" aria-label={opts.title}>
        <h2 class="note-catalog-title">{opts.title}</h2>
        {folderHref && (
          <a class="note-catalog-path" href={folderHref}>
            {parentDir.split("/").join(" / ")}
          </a>
        )}
        <ul class="note-catalog-list">
          {shown.map((f) => {
            const isCurrent = f.slug === currentSlug
            const label = seriesLabel(f)
            return (
              <li key={f.slug}>
                <a
                  class={isCurrent ? "note-catalog-link active" : "note-catalog-link"}
                  href={resolveRelative(currentSlug, f.slug!)}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {label && <span class="note-catalog-index">{label}</span>}
                  {f.frontmatter?.title ?? f.slug!.split("/").pop()}
                </a>
              </li>
            )
          })}
        </ul>
        {folderHref && shown.length < siblings.length && (
          <a class="note-catalog-all" href={folderHref}>
            All {siblings.length} notes →
          </a>
        )}
        <a
          class="note-catalog-more"
          href={`${resolveRelative(currentSlug, opts.moreHref)}${
            opts.moreHref === "topics" ? `#${topicAnchor(currentSlug.split("/")[0]!)}` : ""
          }`}
        >
          {opts.moreLabel}
        </a>
      </nav>
    )
  }

  NoteCatalog.css = style
  return NoteCatalog
}) satisfies QuartzComponentConstructor<Partial<NoteCatalogOptions>>
