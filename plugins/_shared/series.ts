// 시리즈 편 목록(series·series_index 프론트매터)의 단일 구현. series-nav·series-roadmap이 함께 쓴다.
import type { QuartzPluginData } from "@quartz-community/types"
import { isListedNote } from "./notes"

export type SeriesFile = QuartzPluginData & Record<string, unknown>

export interface SeriesEntry {
  file: SeriesFile
  index: number
  title: string
  question?: string
}

export function seriesOf(file: SeriesFile): string {
  const raw = file.frontmatter?.series
  return raw == null ? "" : String(raw).trim()
}

/** 숫자 또는 숫자 문자열만 받는다. 빈 값(null·"")은 Number()가 0으로 바꿔 서문 자리에 끼어들므로 건너뛴다. */
export function seriesIndexOf(file: SeriesFile): number | undefined {
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

/** 한 시리즈의 목록 노트를 series_index 오름차순으로(번호 공백은 그대로 건너뜀). */
export function getSeriesEntries(series: string, allFiles: SeriesFile[]): SeriesEntry[] {
  return allFiles
    .filter((f) => seriesOf(f) === series)
    .map(toEntry)
    .filter((e): e is SeriesEntry => e !== undefined)
    .sort(
      (a, b) =>
        a.index - b.index || a.title.localeCompare(b.title, "ko", { numeric: true }),
    )
}
