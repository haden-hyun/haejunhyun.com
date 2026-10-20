import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import { formatYmd, getNoteDates } from "../../../_shared/noteMeta"
import { isRealNote, topicName } from "../../../_shared/notes"
import style from "./styles/archiveContent.scss"

/**
 * 내비의 "Archive" 라우트 — 전체 노트를 작성일(created) 연도별로 묶어 최신부터 나열.
 */

type FileData = QuartzPluginData & Record<string, unknown>

function getCreated(f: FileData): Date | undefined {
  return getNoteDates(f).created
}

export default (() => {
  const ArchiveContent: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) ?? "archive"
    const files = (allFiles as FileData[])
      .filter((f) => isRealNote(f.slug as string | undefined))
      .filter((f) => getCreated(f))
      .sort((a, b) => getCreated(b)!.getTime() - getCreated(a)!.getTime())

    const byYear = new Map<number, FileData[]>()
    for (const f of files) {
      const year = Number(formatYmd(getCreated(f)!).slice(0, 4))
      const list = byYear.get(year) ?? []
      list.push(f)
      byYear.set(year, list)
    }
    const years = [...byYear.keys()].sort((a, b) => b - a)

    return (
      // 주의: <h1>은 article-title이 렌더한다 — 여기서 중복 렌더 금지.
      <article class={`${displayClass ?? ""} archive-page-content popover-hint`}>
        <p class="archive-page-sub">
          {files.length} notes · {years.length} years
        </p>
        {years.map((year) => (
          <section class="archive-page-year">
            <h2>{year}</h2>
            <div class="archive-page-rows">
              {byYear.get(year)!.map((f) => {
                const { created, revised } = getNoteDates(f)
                return (
                  <a class="archive-page-row" href={resolveRelative(currentSlug, f.slug as string)}>
                    <time class="archive-page-date" datetime={created!.toISOString()}>
                      {formatYmd(created!)}
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
  return ArchiveContent
}) satisfies QuartzComponentConstructor
