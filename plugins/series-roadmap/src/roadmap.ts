import type { Element } from "hast"
import { resolveRelative } from "../../_shared/path"
import { getSeriesEntries, type SeriesFile } from "../../_shared/series"
import { currentNoteOf, buildRoadmap as render, toPublished } from "./core/render"
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
  const published = toPublished(getSeriesEntries(spec.series, allFiles), (f) => f.slug!)
  const hrefFor = (id: string) => resolveRelative(slug, id)
  return render(spec, title, published, hrefFor, warn, currentNoteOf(page)) as Element | undefined
}
