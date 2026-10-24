import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../../../_shared/path"
import { episodeLabel } from "../../../_shared/series"
import { defaultOptions, getSeriesContext, type SeriesFile, type SeriesNavOptions } from "./series"
import style from "./styles/seriesPager.scss"

/** 본문 하단 시리즈 이전·다음 편 링크. 시리즈 노트가 아니면 렌더하지 않는다. */
export default ((userOpts?: Partial<SeriesNavOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const SeriesPager: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const ctx = getSeriesContext(fileData as SeriesFile, allFiles as SeriesFile[], opts)
    if (!ctx || (!ctx.prev && !ctx.next)) return <></>

    const slug = fileData.slug!
    const { title, prev, next } = ctx

    return (
      <nav class="series-pager" aria-label={`${title} 이전·다음 편`}>
        <div class="series-pager-inner">
          {prev ? (
            <a class="series-pager-link prev" href={resolveRelative(slug, prev.file.slug!)}>
              <span class="direction">← 이전 편</span>
              <span class="ptitle">
                <span class="pno">{episodeLabel(prev.index)}</span> {prev.title}
              </span>
            </a>
          ) : (
            <div />
          )}
          {next ? (
            <a class="series-pager-link next" href={resolveRelative(slug, next.file.slug!)}>
              <span class="direction">다음 편 →</span>
              <span class="ptitle">
                <span class="pno">{episodeLabel(next.index)}</span> {next.title}
              </span>
            </a>
          ) : (
            <div />
          )}
        </div>
      </nav>
    )
  }

  SeriesPager.css = style
  return SeriesPager
}) satisfies QuartzComponentConstructor
