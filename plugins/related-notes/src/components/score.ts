// Related 순위 계산. 컴포넌트와 분리해 빌드 산출물 없이도 표로 검증할 수 있게 둔다.

export interface RelatedCandidate {
  slug: string
  links: string[]
  tags: string[]
  series: string
  seriesIndex?: number
  title: string
}

export interface RelatedResult<N extends RelatedCandidate> {
  note: N
  score: number
}

const LINK = 100
const SERIES = 50
const SERIES_STEP = 10
const SERIES_FLOOR = 20
const TAG = 10
/** 이 점수 미만은 관련으로 보지 않는다 — 노트 절반 이상이 단 태그 하나(log2(2)·TAG)가 경계. */
export const MIN_SCORE = 10

const dirOf = (slug: string): string => slug.split("/").slice(0, -1).join("/")

/** 태그 경로가 노트의 폴더 경로와 같거나 그 접두면 폴더를 되풀이할 뿐이다(programming/python 노트의 programming/python). */
export function isFolderMirrorTag(slug: string, tag: string): boolean {
  const dir = dirOf(slug)
  return dir === tag || dir.startsWith(tag + "/")
}

function commonDepth(a: string, b: string): number {
  const pa = a.split("/")
  const pb = b.split("/")
  let i = 0
  while (i < pa.length - 1 && i < pb.length - 1 && pa[i] === pb[i]) i++
  return i
}

/**
 * 직접 링크(나가는·백링크) > 같은 시리즈(편 거리가 가까울수록) > 개념 태그 공유(희귀할수록 가중, idf).
 * 동점이면 같은 폴더를 뒤로 보낸다 — 형제는 CATALOG가 이미 보여 준다.
 */
export function scoreRelated<N extends RelatedCandidate>(
  self: RelatedCandidate,
  notes: N[],
  backlinkSlugs: Set<string>,
): RelatedResult<N>[] {
  const df = new Map<string, number>()
  for (const n of notes) for (const t of new Set(n.tags)) df.set(t, (df.get(t) ?? 0) + 1)
  const conceptTags = new Set(self.tags.filter((t) => !isFolderMirrorTag(self.slug, t)))
  const outgoing = new Set(self.links)
  const selfDir = dirOf(self.slug)
  // 편 거리는 번호 차가 아니라 순번 차 — 번호에 공백(2·4·6)이 있어도 바로 옆 편은 1이다.
  const seriesRank = new Map(
    notes
      .filter((n) => self.series && n.series === self.series && n.seriesIndex !== undefined)
      .sort((a, b) => a.seriesIndex! - b.seriesIndex!)
      .map((n, i) => [n.slug, i]),
  )

  const scored: RelatedResult<N>[] = []
  for (const n of notes) {
    if (n.slug === self.slug) continue
    let score = 0
    if (outgoing.has(n.slug) || backlinkSlugs.has(n.slug)) score += LINK
    if (self.series && n.series === self.series) {
      const a = seriesRank.get(self.slug)
      const b = seriesRank.get(n.slug)
      const dist = a !== undefined && b !== undefined ? Math.abs(a - b) : Number.POSITIVE_INFINITY
      score += Math.max(SERIES - SERIES_STEP * (dist - 1), SERIES_FLOOR)
    }
    for (const t of new Set(n.tags)) {
      if (conceptTags.has(t)) score += TAG * Math.log2(notes.length / (df.get(t) ?? 1))
    }
    if (score >= MIN_SCORE) scored.push({ note: n, score })
  }

  const sibling = (n: N) => (dirOf(n.slug) === selfDir ? 1 : 0)
  return scored.sort(
    (a, b) =>
      b.score - a.score ||
      sibling(a.note) - sibling(b.note) ||
      commonDepth(b.note.slug, self.slug) - commonDepth(a.note.slug, self.slug) ||
      a.note.title.localeCompare(b.note.title, "ko", { numeric: true }),
  )
}
