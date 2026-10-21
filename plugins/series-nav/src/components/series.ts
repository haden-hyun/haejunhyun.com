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

/** 숫자 또는 숫자 문자열만 받는다. 빈 값(null·"")은 Number()가 0으로 바꿔 서문 자리에 끼어들므로 건너뛴다. */
function seriesIndexOf(file: SeriesFile): number | undefined {
  const raw = file.frontmatter?.series_index
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined
  if (typeof raw === "string" && raw.trim() !== "") {
    const index = Number(raw)
    return Number.isFinite(index) ? index : undefined
  }
  return undefined
}

function toEntry(file: SeriesFile): SeriesEntry | undefined {
  const index = seriesIndexOf(file)
  if (index === undefined || !isListedNote(file)) return undefined
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
