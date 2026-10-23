// 선반 배치 — 등·칸막이 순서를 지킨 채 단별 폭이 가장 고르게 되는 줄바꿈(선형 분할 DP) + 단별 양쪽 맞춤.
// 주의: toString()으로 인라인된다. 바깥 식별자·import를 참조하지 말 것(상수는 cfg로).

export interface ShelfNote {
  topic: string
  len: number
  posted: string
  created: string
  href: string
  series: string
  sidx: number
}

export interface ShelfItem {
  kind: "sp" | "dv" | "arc"
  topic?: string
  note?: number
  count?: number
  cont?: boolean
  joinPrev?: boolean
  x: number
  w: number
  row: number
}

export interface ShelfPlan {
  rows: { items: ShelfItem[]; end: number }[]
  R: number
  f: number
  cut: number
}

export const SHELF_CFG = { div: 5, gap: 1, dgap: 3, fmin: 0.62, fmax2: 3.0, fmax3: 2.2 }

export function planShelf(
  notes: ShelfNote[],
  topics: string[],
  W: number,
  rowsMax: number,
  cfg: typeof SHELF_CFG,
): ShelfPlan {
  const baseW = (n: ShelfNote) => 1.8 + Math.sqrt(n.len) / 20
  const fmaxFor = (R: number) => (R <= 2 ? cfg.fmax2 : cfg.fmax3)
  const key = (n: ShelfNote) => n.posted + "|" + n.created + "|" + n.href
  // 정렬: posted → created → href. 시리즈는 묶음의 가장 이른 자리에 series_index 순으로 붙인다.
  const order = notes.map((_, i) => i).sort((a, b) => key(notes[a]!).localeCompare(key(notes[b]!)))
  let keep = order
  let cut = 0
  const seq = (idx: number[]) => {
    const out: Omit<ShelfItem, "x" | "w" | "row">[] = []
    for (const t of topics) {
      const g = idx.filter((i) => notes[i]!.topic === t)
      if (!g.length) continue
      const first: Record<string, string> = {}
      for (const i of g) {
        const n = notes[i]!
        if (n.series && (!first[n.series] || first[n.series]! > key(n))) first[n.series] = key(n)
      }
      const gk = (i: number) => {
        const n = notes[i]!
        return n.series ? first[n.series] + "|" + n.series : key(n)
      }
      g.sort((a, b) => gk(a).localeCompare(gk(b)) || (notes[a]!.series && notes[a]!.series === notes[b]!.series ? notes[a]!.sidx - notes[b]!.sidx : 0))
      out.push({ kind: "dv", topic: t, count: g.length })
      g.forEach((i, j) => {
        const prev = j > 0 ? notes[g[j - 1]!]! : null
        out.push({ kind: "sp", topic: t, note: i, joinPrev: !!(prev && notes[i]!.series && prev.series === notes[i]!.series) })
      })
    }
    return out
  }
  const fFor = (idx: number[], R: number) => {
    const it = seq(idx)
    const sp = it.filter((i) => i.kind === "sp")
    const dv = it.length - sp.length + (R - 1) + (cut ? 1 : 0)
    return (R * W * 0.985 - dv * (cfg.div + cfg.dgap) - sp.length * cfg.gap) / sp.reduce((s, i) => s + baseW(notes[i.note!]!), 0)
  }
  let R = rowsMax
  while (R > 1 && fFor(keep, R) > fmaxFor(R) * 1.12) R--
  while (fFor(keep, R) < cfg.fmin && keep.length > 10) {
    keep = keep.slice(1)
    cut++
  }
  const f = Math.min(fmaxFor(R), fFor(keep, R))
  const items = seq(keep)
  if (cut) items.push({ kind: "arc" })
  const wOf = (i: (typeof items)[number]) => (i.kind === "sp" ? baseW(notes[i.note!]!) * f + (i.joinPrev ? 0 : cfg.gap) : cfg.div + cfg.dgap)
  const n = items.length
  const pre = [0]
  for (const i of items) pre.push(pre[pre.length - 1]! + wOf(i))
  const T = pre[n]! / R + ((R - 1) * (cfg.div + cfg.dgap)) / R
  const cost = (a: number, b: number) => {
    const cont = items[a]!.kind === "sp" ? cfg.div + cfg.dgap : 0
    const s = pre[b]! - pre[a]! + cont
    return (s - T) ** 2 + (cont ? (0.04 * T) ** 2 : 0) + (items[a]!.joinPrev ? (0.2 * T) ** 2 : 0) + (s > W ? 1e9 : 0)
  }
  const dp = Array.from({ length: R + 1 }, () => new Float64Array(n + 1).fill(Infinity))
  const back = Array.from({ length: R + 1 }, () => new Int32Array(n + 1))
  dp[0]![0] = 0
  for (let r = 1; r <= R; r++) {
    for (let b = 1; b <= n; b++) {
      for (let a = r - 1; a < b; a++) {
        const v = dp[r - 1]![a]! + cost(a, b)
        if (v < dp[r]![b]!) {
          dp[r]![b] = v
          back[r]![b] = a
        }
      }
    }
  }
  const cuts = [n]
  for (let r = R, b = n; r > 0; r--) {
    b = back[r]![b]!
    cuts.unshift(b)
  }
  const rows: ShelfPlan["rows"] = []
  for (let r = 0; r < R; r++) {
    let row = items.slice(cuts[r], cuts[r + 1]).map((i) => ({ ...i, x: 0, w: 0, row: r }) as ShelfItem)
    if (row.length && row[0]!.kind === "sp") {
      row[0]!.joinPrev = false
      row = [{ kind: "dv", topic: row[0]!.topic, cont: true, x: 0, w: 0, row: r }, ...row]
    }
    const gapAfter = (j: number) =>
      j >= row.length - 1 ? 0 : row[j]!.kind === "sp" && row[j + 1]!.kind === "sp" ? (row[j + 1]!.joinPrev ? 0 : cfg.gap) : cfg.dgap
    const sp = row.filter((i) => i.kind === "sp")
    const spSum = sp.reduce((s, i) => s + baseW(notes[i.note!]!) * f, 0)
    const spGaps = row.reduce((c, i, j) => c + (gapAfter(j) === cfg.gap && i.kind === "sp" ? 1 : 0), 0)
    const fixed = row.reduce((s, i, j) => s + (i.kind === "sp" ? 0 : i.kind === "arc" ? cfg.div + 2 : cfg.div) + gapAfter(j), 0)
    // 단별 배율은 ±12%까지, 남거나 모자란 몫은 등 사이 간격으로 흡수해 양 끝을 맞춘다
    const s = Math.max(0.88, Math.min(1.12, (W - fixed) / spSum))
    const slack = W - fixed - spSum * s
    const adj = spGaps ? Math.max(-cfg.gap, Math.min(1, slack / spGaps)) : 0
    let x = 0
    row.forEach((i, j) => {
      i.w = i.kind === "sp" ? baseW(notes[i.note!]!) * f * s : i.kind === "arc" ? cfg.div + 2 : cfg.div
      i.x = x
      const g = gapAfter(j)
      x += i.w + (g === cfg.gap && i.kind === "sp" ? cfg.gap + adj : g)
    })
    rows.push({ items: row, end: x })
  }
  return { rows, R, f, cut }
}
