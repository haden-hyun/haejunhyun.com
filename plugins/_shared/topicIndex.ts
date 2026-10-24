// 토픽별 집계(노트 수·1단 폴더·하위 폴더·시리즈)의 단일 구현. topic-grid·topics-page가 함께 쓴다.
import { getListDate } from "./noteMeta"
import { byListDateDesc, folderTitle, isListedNote } from "./notes"
import { getSeriesEntries, seriesOf, type SeriesEntry, type SeriesFile } from "./series"
import { TOPICS } from "./topics"

/** ctx.trie에서 쓰는 부분만 — folder-listing이 generate에서 표시명을 심어 둔다. */
interface TrieLike {
  findNode(path: string[]): { isFolder: boolean; displayName: string } | undefined
}

/** 폴더 표시명 — 공유 trie(폴더 노트 title·folderTitles 반영) → folderTitle. */
export function folderNameResolver(trie: unknown): (path: string) => string {
  const t = trie as TrieLike | undefined
  return (path) => {
    const node = typeof t?.findNode === "function" ? t.findNode(path.split("/")) : undefined
    return node?.isFolder && node.displayName ? node.displayName : folderTitle(path)
  }
}

export interface SubFolder {
  title: string
  count: number
}

export interface TopicFolder {
  path: string
  title: string
  count: number
  latest?: Date
  /** 하위 폴더(노트 없이 폴더 하나뿐인 사슬은 `A / B`로 접는다), 노트 수 내림차순. */
  subs: SubFolder[]
  /** 목록 날짜 최신순. */
  notes: SeriesFile[]
}

export interface TopicSeries {
  key: string
  entries: SeriesEntry[]
}

export interface TopicSummary {
  key: string
  label: string
  count: number
  /** 토픽 바로 아래(폴더 없이) 놓인 노트. */
  direct: SeriesFile[]
  folders: TopicFolder[]
  series: TopicSeries[]
}

const latestOf = (notes: SeriesFile[]): Date | undefined =>
  notes.reduce<Date | undefined>((acc, f) => {
    const d = getListDate(f)
    return d && (!acc || d > acc) ? d : acc
  }, undefined)

function subFolders(base: string, notes: SeriesFile[], nameOf: (path: string) => string): SubFolder[] {
  const depth = base.split("/").length
  const byChild = new Map<string, SeriesFile[]>()
  for (const f of notes) {
    const parts = (f.slug as string).split("/")
    if (parts.length <= depth + 1) continue
    const child = parts.slice(0, depth + 1).join("/")
    byChild.set(child, [...(byChild.get(child) ?? []), f])
  }
  return [...byChild.entries()]
    .map(([path, members]) => {
      let cur = path
      const names = [nameOf(cur)]
      // 직속 노트 없이 하위 폴더 하나뿐이면 한 이름으로 접는다(folder-listing과 같은 규칙).
      for (;;) {
        const d = cur.split("/").length
        const direct = members.some((f) => (f.slug as string).split("/").length === d + 1)
        const next = new Set(members.map((f) => (f.slug as string).split("/").slice(0, d + 1).join("/")))
        if (direct || next.size !== 1) break
        cur = [...next][0]!
        names.push(nameOf(cur))
      }
      return { title: names.join(" / "), count: members.length }
    })
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "ko"))
}

/** 토픽 표 순서가 아니라 노트 수 내림차순. 노트가 없는 토픽도 count 0으로 남긴다. */
export function buildTopicIndex(allFiles: SeriesFile[], nameOf: (path: string) => string): TopicSummary[] {
  const listed = allFiles.filter((f) => isListedNote(f)).sort(byListDateDesc)
  return TOPICS.map(({ key, label }) => {
    const notes = listed.filter((f) => (f.slug as string).split("/")[0] === key)
    const direct = notes.filter((f) => (f.slug as string).split("/").length === 2)
    const byFolder = new Map<string, SeriesFile[]>()
    for (const f of notes) {
      const parts = (f.slug as string).split("/")
      if (parts.length < 3) continue
      const path = parts.slice(0, 2).join("/")
      byFolder.set(path, [...(byFolder.get(path) ?? []), f])
    }
    const folders = [...byFolder.entries()]
      .map(([path, members]) => ({
        path,
        title: nameOf(path),
        count: members.length,
        latest: latestOf(members),
        subs: subFolders(path, members, nameOf),
        notes: members,
      }))
      .sort((a, b) => b.count - a.count || (b.latest?.getTime() ?? 0) - (a.latest?.getTime() ?? 0))
    const seriesKeys = [...new Set(notes.map(seriesOf).filter(Boolean))]
    const series = seriesKeys
      .map((s) => ({ key: s, entries: getSeriesEntries(s, allFiles) }))
      .filter((s) => s.entries.length > 0)
    return { key, label, count: notes.length, direct, folders, series }
  }).sort((a, b) => b.count - a.count)
}
