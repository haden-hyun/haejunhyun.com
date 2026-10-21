import type { Element } from "hast"
import { resolveRelative } from "../../_shared/path"
import { getSeriesEntries, seriesIndexOf, seriesOf, type SeriesFile } from "../../_shared/series"
import { buildRoadmap as render } from "./core/render"
import type { RoadmapSpec } from "./parse"

/** 블로그 쪽 감싸개: allFiles의 발행본을 공용 렌더에 넘기고 링크는 현재 페이지 기준 상대 경로로 만든다. */
export function buildRoadmap(
  spec: RoadmapSpec,
  title: string,
  allFiles: SeriesFile[],
  slug: string,
  warn: (msg: string) => void,
  page: SeriesFile,
): Element | undefined {
  const published = getSeriesEntries(spec.series, allFiles).map((e) => ({
    index: e.index,
    title: e.title,
    question: e.question,
    part: e.file.frontmatter?.series_part,
    requires: e.file.frontmatter?.series_requires,
    id: e.file.slug!,
  }))
  const index = seriesIndexOf(page)
  const current = index === undefined ? undefined : { series: seriesOf(page), index }
  return render(spec, title, published, (id) => resolveRelative(slug, id), warn, current) as Element | undefined
}
