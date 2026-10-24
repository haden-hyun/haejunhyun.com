// 선반 선정·배치 — 빌드 시 한 번 계산하는 순수 함수(같은 원고면 같은 선반).
// - 토픽을 편수 순으로 돌며 각 토픽의 최신 글부터 24편을 고른다(라운드로빈)
// - 토픽 묶음(편수 순) 안에서 오래된 글 → 최신 글 순으로 늘어놓고 12편씩 두 단으로 자른다
// - 가장 최근 3편은 강조(is-new), 책등 높이는 슬러그 해시로 고정된 편차를 준다

export interface ShelfNote {
  slug: string
  topic: string
  date: string
}

export type ShelfSpine<T extends ShelfNote> = T & { k: number; gap: boolean; isNew: boolean; hp: number }

export const SHELF_SIZE = 24
export const PER_ROW = 12
const NEW_COUNT = 3

const newer = (a: ShelfNote, b: ShelfNote) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
const older = (a: ShelfNote, b: ShelfNote) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)

/** 슬러그 해시 → 책등 높이 비율(단 높이의 82~100%). */
export function spineHeight(slug: string): number {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return 82 + (h % 19)
}

export function pickShelf<T extends ShelfNote>(notes: T[], size = SHELF_SIZE, perRow = PER_ROW): ShelfSpine<T>[][] {
  const byTopic = new Map<string, T[]>()
  for (const n of notes) byTopic.set(n.topic, [...(byTopic.get(n.topic) ?? []), n])
  const topics = [...byTopic.keys()].sort((a, b) => byTopic.get(b)!.length - byTopic.get(a)!.length || a.localeCompare(b))
  const lists = topics.map((t) => byTopic.get(t)!.sort(newer))

  const picked: T[] = []
  for (let i = 0; picked.length < size; i++) {
    let any = false
    for (const list of lists) {
      if (list[i] && picked.length < size) {
        picked.push(list[i]!)
        any = true
      }
    }
    if (!any) break
  }

  const fresh = new Set([...picked].sort(newer).slice(0, NEW_COUNT).map((n) => n.slug))
  const ordered = topics.flatMap((t) => picked.filter((n) => n.topic === t).sort(older))
  const rows: ShelfSpine<T>[][] = []
  ordered.forEach((n, k) => {
    const r = Math.floor(k / perRow)
    const row = (rows[r] ??= [])
    const prev = row[row.length - 1]
    row.push({ ...n, k, gap: !!prev && prev.topic !== n.topic, isNew: fresh.has(n.slug), hp: spineHeight(n.slug) })
  })
  return rows
}
