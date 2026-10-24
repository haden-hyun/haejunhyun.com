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

/** 편 번호 표기의 단일 구현 — 사이트의 모든 편 번호는 `N편`(실제 series_index, 분수·`N.` 없음), 0편만 `서문`. */
export function episodeLabel(index: number): string {
  return index === 0 ? "서문" : `${index}편`
}

/** 파일의 편 번호 표기. 시리즈가 아니거나 번호가 없으면 undefined. */
export function seriesLabel(file: SeriesFile): string | undefined {
  const index = seriesIndexOf(file)
  return seriesOf(file) && index !== undefined ? episodeLabel(index) : undefined
}

export interface SeriesGroup<T> {
  /** 시리즈가 아닌 노트는 "" — 그 노트 1편짜리 묶음. */
  series: string
  items: T[]
}

/**
 * 이미 정렬된 목록에서 같은 시리즈 편을 그 시리즈가 처음 나오는 자리로 모아 series_index 순으로 놓는다.
 * 나머지 항목의 상대 순서는 그대로다(번호 없는 편은 묶음 끝, 정렬은 안정적).
 */
export function groupBySeries<T extends SeriesFile>(sorted: T[]): SeriesGroup<T>[] {
  const groups: SeriesGroup<T>[] = []
  const bySeries = new Map<string, SeriesGroup<T>>()
  for (const file of sorted) {
    const series = seriesOf(file)
    if (!series) {
      groups.push({ series: "", items: [file] })
      continue
    }
    let group = bySeries.get(series)
    if (!group) {
      group = { series, items: [] }
      bySeries.set(series, group)
      groups.push(group)
    }
    group.items.push(file)
  }
  const rank = (f: SeriesFile) => seriesIndexOf(f) ?? Number.POSITIVE_INFINITY
  for (const group of bySeries.values()) {
    group.items.sort((a, b) => (rank(a) === rank(b) ? 0 : rank(a) < rank(b) ? -1 : 1))
  }
  return groups
}
