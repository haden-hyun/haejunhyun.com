import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../../../_shared/path"
import { formatYmd, getNoteDates } from "../../../_shared/noteMeta"
import { isListedNote, topicName } from "../../../_shared/notes"
import style from "./styles/archiveContent.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import popularScript from "./scripts/popular.inline.ts"

/**
 * 내비의 "Archive" 라우트 — 전체 노트를 작성일(created) 연도별로 묶어 최신부터 나열.
 */

type FileData = QuartzPluginData & Record<string, unknown>
type Entry = { f: FileData; created: Date; revised?: Date }

export default (() => {
  const ArchiveContent: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) ?? "archive"
    const entries = (allFiles as FileData[])
      .filter((f) => isListedNote(f))
      .map((f) => ({ f, ...getNoteDates(f) }))
      .filter((e): e is Entry => e.created !== undefined)
      .sort((a, b) => b.created.getTime() - a.created.getTime())

    const byYear = new Map<number, Entry[]>()
    for (const e of entries) {
      const year = Number(formatYmd(e.created).slice(0, 4))
      const list = byYear.get(year) ?? []
      list.push(e)
      byYear.set(year, list)
    }
    const years = [...byYear.keys()].sort((a, b) => b - a)

    // 인기 글 후보: 목록 노트의 슬러그 → 제목·링크. 클라이언트가 /api/stats 상위 목록을 이 맵으로 거른다.
    const notes: Record<string, { t: string; h: string }> = {}
    for (const { f } of entries) {
      const slug = f.slug as string
      notes[slug] = {
        t: (f.frontmatter as { title?: string } | undefined)?.title ?? "Untitled",
        h: resolveRelative(currentSlug, slug),
      }
    }

    return (
      // 주의: <h1>은 article-title이 렌더한다 — 여기서 중복 렌더 금지.
      <article class={`${displayClass ?? ""} archive-page-content popover-hint`}>
        <p class="archive-page-sub">
          {entries.length} notes · {years.length} years
        </p>
        <section class="archive-page-year archive-page-popular" data-notes={JSON.stringify(notes)} hidden>
          <h2>
            인기 글 <span class="archive-page-h2-sub">최근 30일</span>
          </h2>
          <div class="archive-page-rows" />
        </section>
        {years.map((year) => (
          <section class="archive-page-year">
            <h2>{year}</h2>
            <div class="archive-page-rows">
              {byYear.get(year)!.map(({ f, created, revised }) => {
                return (
                  <a class="archive-page-row" href={resolveRelative(currentSlug, f.slug as string)}>
                    <time class="archive-page-date" datetime={created.toISOString()}>
                      {formatYmd(created)}
                    </time>
                    <span class="archive-page-title">
                      {(f.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"}
                      {revised && (
                        <span class="archive-page-rev">
                          Revised <time datetime={revised.toISOString()}>{formatYmd(revised)}</time>
                        </span>
                      )}
                    </span>
                    <span class="archive-page-cat">
                      {topicName((f.slug as string) ?? "")}
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
  ArchiveContent.afterDOMLoaded = popularScript
  return ArchiveContent
}) satisfies QuartzComponentConstructor
