import type { QuartzPluginData } from "@quartz-community/types"
import { isListedNote } from "../../../_shared/notes"

export type SeriesFile = QuartzPluginData & Record<string, unknown>

export interface SeriesNavOptions {
  seriesTitles: Record<string, string>
}

export const defaultOptions: SeriesNavOptions = {
  seriesTitles: {},
}

export interface SeriesEntry {
  file: SeriesFile
  index: number
  title: string
  question?: string
}

export interface SeriesContext {
  title: string
  entries: SeriesEntry[]
  current: number
  prev?: SeriesEntry
  next?: SeriesEntry
}

function seriesOf(file: SeriesFile): string {
  const raw = file.frontmatter?.series
  return raw == null ? "" : String(raw).trim()
}

function toEntry(file: SeriesFile): SeriesEntry | undefined {
  const index = Number(file.frontmatter?.series_index)
  if (!Number.isFinite(index) || !isListedNote(file)) return undefined
  const question = file.frontmatter?.series_question
  return {
    file,
    index,
    title: String(file.frontmatter?.title ?? file.slug),
    question: question == null || String(question).trim() === "" ? undefined : String(question).trim(),
  }
}

/** series_index 오름차순(번호 공백은 그대로 건너뜀). 현재 노트가 시리즈 항목이 아니면 undefined. */
export function getSeriesContext(
  fileData: SeriesFile,
  allFiles: SeriesFile[],
  opts: SeriesNavOptions,
): SeriesContext | undefined {
  const series = seriesOf(fileData)
  if (!series || !fileData.slug) return undefined

  const entries = allFiles
    .filter((f) => seriesOf(f) === series)
    .map(toEntry)
    .filter((e): e is SeriesEntry => e !== undefined)
    .sort(
      (a, b) =>
        a.index - b.index || a.title.localeCompare(b.title, "ko", { numeric: true }),
    )

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
