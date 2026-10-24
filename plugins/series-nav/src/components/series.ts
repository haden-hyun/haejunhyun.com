// 시리즈 상자·페이저 공용: 현재 노트의 시리즈 편 목록과 이전/다음 편을 구한다.
import {
  getSeriesEntries,
  seriesOf,
  type SeriesEntry,
  type SeriesFile,
} from "../../../_shared/series"

export type { SeriesFile }

export interface SeriesNavOptions {
  seriesTitles: Record<string, string>
}

export const defaultOptions: SeriesNavOptions = {
  seriesTitles: {},
}

export interface SeriesContext {
  title: string
  entries: SeriesEntry[]
  current: number
  prev?: SeriesEntry
  next?: SeriesEntry
}

/** 현재 노트가 시리즈 항목이 아니면 undefined. */
export function getSeriesContext(
  fileData: SeriesFile,
  allFiles: SeriesFile[],
  opts: SeriesNavOptions,
): SeriesContext | undefined {
  const series = seriesOf(fileData)
  if (!series || !fileData.slug) return undefined

  const entries = getSeriesEntries(series, allFiles)
  const current = entries.findIndex((e) => e.file.slug === fileData.slug)
  if (current === -1) return undefined

  return {
    title: opts.seriesTitles[series] ?? series,
    entries,
    current,
    prev: entries[current - 1],
    next: entries[current + 1],
  }
}
