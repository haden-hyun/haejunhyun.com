// 노트 판별·토픽 표시명·Recent 묶음 규칙의 단일 구현. 로컬 플러그인들이 상대 경로로 가져다 번들한다.
import { formatYmd, getListDate } from "./noteMeta"

type SlugFile = {
  slug?: string
  dates?: { created?: Date; modified?: Date; published?: Date }
  frontmatter?: Record<string, unknown>
}

/** 슬러그 패턴으로 거른다. 자동 생성 페이지(태그·폴더·404·topics·archive)도 title이 있어 title 유무로는 안 된다. */
export function isRealNote(slug: string | undefined): boolean {
  if (!slug) return false
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  if (slug === "topics" || slug === "archive") return false
  return true
}

/** 목록에 올릴 노트. `unlisted: true`는 URL로만 열리고 홈·아카이브·토픽·카탈로그 집계에서 빠진다. */
export function isListedNote(file: SlugFile & { unlisted?: unknown }): boolean {
  return isRealNote(file.slug) && file.unlisted !== true && file.frontmatter?.unlisted !== true
}

const TOPIC_NAMES: Record<string, string> = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools",
}

/** kebab-case → Title Case. */
export function titleCase(key: string): string {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** 슬러그 첫 세그먼트의 표시명. 표에 없으면 Title Case. */
export function topicName(slug: string): string {
  const key = slug.split("/")[0] ?? ""
  return TOPIC_NAMES[key] ?? titleCase(key)
}

/** 목록 날짜 최신순 비교자. */
export const byListDateDesc = (a: SlugFile, b: SlugFile): number =>
  (getListDate(b)?.getTime() ?? 0) - (getListDate(a)?.getTime() ?? 0)

const GROUP_MIN = 3

export type RecentRow<F> = { kind: "note"; file: F } | { kind: "group"; folder: string; files: F[] }

/** 같은 날짜·같은 폴더(토픽 아래 2단계 이상) 노트가 GROUP_MIN편 이상이면 한 행으로 묶는다. sorted는 정렬된 입력. */
export function buildRecentRows<F extends SlugFile>(sorted: F[], limit: number): RecentRow<F>[] {
  const keyOf = (f: F): string | undefined => {
    const parts = (f.slug ?? "").split("/")
    const d = getListDate(f)
    if (parts.length < 3 || !d) return undefined
    return `${formatYmd(d)}|${parts.slice(0, -1).join("/")}`
  }
  const members = new Map<string, F[]>()
  for (const f of sorted) {
    const key = keyOf(f)
    if (key) members.set(key, [...(members.get(key) ?? []), f])
  }

  const rows: RecentRow<F>[] = []
  const emitted = new Set<string>()
  for (const f of sorted) {
    if (rows.length >= limit) break
    const key = keyOf(f)
    const group = key ? members.get(key) : undefined
    if (key && group && group.length >= GROUP_MIN) {
      if (emitted.has(key)) continue
      emitted.add(key)
      rows.push({ kind: "group", folder: key.split("|")[1]!, files: group })
    } else {
      rows.push({ kind: "note", file: f })
    }
  }
  return rows
}
