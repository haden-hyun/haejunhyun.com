import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import { defaultOptions, getSeriesContext, type SeriesFile, type SeriesNavOptions } from "./series"
import style from "./styles/seriesBox.scss"

/** 제목 아래 시리즈 상자 — 현재 위치·이전/다음·접히는 전체 목록(네이티브 details라 클라이언트 JS 없음). */
export default ((userOpts?: Partial<SeriesNavOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const SeriesBox: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const ctx = getSeriesContext(fileData as SeriesFile, allFiles as SeriesFile[], opts)
    if (!ctx) return <></>

    const slug = fileData.slug!
    const { title, entries, current, prev, next } = ctx

    return (
      <nav class="series-box" aria-label={title}>
        <div class="series-box-header">
          <span class="series-box-title">{title}</span>
          <span class="series-box-position">{entries[current]!.index}편</span>
        </div>
        {(prev || next) && (
          <div class="series-box-adjacent">
            {prev ? (
              <a class="series-box-link prev" href={resolveRelative(slug, prev.file.slug!)}>
                ← {prev.index}. {prev.title}
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a class="series-box-link next" href={resolveRelative(slug, next.file.slug!)}>
                {next.index}. {next.title} →
              </a>
            ) : (
              <span />
            )}
          </div>
        )}
        <details class="series-box-details">
          <summary>목록 보기</summary>
          <ol class="series-box-list">
            {entries.map((e, i) => (
              <li class={i === current ? "current" : undefined}>
                {i === current ? (
                  <strong class="series-box-entry" aria-current="page">
                    {e.index}. {e.title}
                  </strong>
                ) : (
                  <a class="series-box-entry" href={resolveRelative(slug, e.file.slug!)}>
                    {e.index}. {e.title}
                  </a>
                )}
                {e.question && <span class="series-box-question">{e.question}</span>}
              </li>
            ))}
          </ol>
        </details>
      </nav>
    )
  }

  SeriesBox.css = style
  return SeriesBox
}) satisfies QuartzComponentConstructor
