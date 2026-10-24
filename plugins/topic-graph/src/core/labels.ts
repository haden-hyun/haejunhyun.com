// 상시 라벨(폴더명) 배치. 빌드 타임엔 글자 폭을 잴 수 없어 Inter·Noto Sans KR 근사 폭표로 추정하고, 여유 12%를 둔다.
import type { Point, View } from "./layout"

export const FONT = 10

export type Box = { x: number; y: number; w: number; h: number }

function charEm(c: string): number {
  if (/[가-힣㄰-㆏]/.test(c)) return 1
  if (c === " ") return 0.27
  if ("il.,:;'|!".includes(c)) return 0.28
  if ("fjrtI".includes(c)) return 0.36
  if ("MW".includes(c)) return 0.88
  if ("mw".includes(c)) return 0.85
  if (/[A-Z]/.test(c)) return 0.68
  if (/[0-9]/.test(c)) return 0.6
  return 0.56
}

export function textWidth(text: string, size = FONT, bold = false): number {
  let em = 0
  for (const c of text) em += charEm(c)
  return em * size * (bold ? 1.08 : 1) * 1.12
}

export interface LabelRequest {
  id: string
  text: string
  bold: boolean
  at: Point
  /** 노드 중심에서 글자까지 간격. */
  gap: number
  /** 겹치지 않는 자리가 없으면 버린다. */
  optional?: boolean
}

export interface PlacedLabel {
  id: string
  text: string
  x: number
  y: number
  anchor: "start" | "end" | "middle"
  box: Box
}

type Candidate = { side: "R" | "L" | "D" | "U"; far: number; dy: number }

// 노드에서 가까운 자리부터: 옆(먼저 넓은 쪽) → 아래·위 → 반 줄씩 비킨 옆, 다시 8px씩 멀리. 첫 무충돌 자리를 쓴다.
function candidates(rightFirst: boolean): Candidate[] {
  const sides: ("R" | "L")[] = rightFirst ? ["R", "L"] : ["L", "R"]
  const out: Candidate[] = []
  for (const far of [0, 8, 16, 24]) {
    for (const side of sides) out.push({ side, far, dy: 0 })
    out.push({ side: "D", far, dy: 0 }, { side: "U", far, dy: 0 })
    for (const step of [1, 2, 3]) for (const side of sides) out.push({ side, far, dy: -step }, { side, far, dy: step })
  }
  return out
}

function boxFor(req: LabelRequest, c: Candidate, width: number): PlacedLabel {
  const { x: px, y: py } = req.at
  const x = c.side === "R" ? px + req.gap + c.far : c.side === "L" ? px - req.gap - c.far : px
  const y =
    c.side === "D" ? py + req.gap + c.far + FONT * 0.8 : c.side === "U" ? py - req.gap - c.far : py + FONT * 0.35 + c.dy * FONT * 0.9
  const anchor = c.side === "R" ? "start" : c.side === "L" ? "end" : "middle"
  const left = anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2
  return { id: req.id, text: req.text, x, y, anchor, box: { x: left, y: y - FONT * 0.95, w: width, h: FONT * 1.25 } }
}

const area = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))

/** 요청 순서가 우선순위다. 다른 라벨·장애물(강조 노드)과 안 겹치는 첫 후보, 없으면 겹침 넓이가 가장 작은 후보. */
export function placeLabels(requests: LabelRequest[], obstacles: (Box & { id: string })[], view: View): PlacedLabel[] {
  const placed: PlacedLabel[] = []
  for (const req of requests) {
    const width = textWidth(req.text, FONT, req.bold)
    const order = candidates(req.at.x < view.w * 0.62)
    let best: { label: PlacedLabel; cost: number } | undefined
    for (const cand of order) {
      const label = boxFor(req, cand, width)
      const b = label.box
      const out = b.x < 0 || b.y < 0 || b.x + b.w > view.w || b.y + b.h > view.h ? 1e4 : 0
      const cost =
        out +
        placed.reduce((s, p) => s + area(b, p.box), 0) +
        obstacles.filter((o) => o.id !== req.id).reduce((s, o) => s + area(b, o), 0)
      if (!best || cost < best.cost) best = { label, cost }
      if (cost === 0) break
    }
    if (req.optional && best!.cost > 0) continue
    placed.push(best!.label)
  }
  return placed
}
