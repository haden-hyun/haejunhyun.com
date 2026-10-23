// 상시 라벨(폴더명) 배치. 빌드 타임엔 글자 폭을 잴 수 없어 Inter·Noto Sans KR 근사 폭표로 추정하고, 여유 6%를 둔다.
import { VIEW, type Point } from "./layout"

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
  return em * size * (bold ? 1.06 : 1) * 1.06
}

export interface LabelRequest {
  id: string
  text: string
  bold: boolean
  at: Point
  /** 노드 중심에서 글자까지 간격. */
  gap: number
}

export interface PlacedLabel {
  id: string
  text: string
  x: number
  y: number
  anchor: "start" | "end" | "middle"
  box: Box
}

// 옆(R·L) → 아래·위(D·U) → 옆에서 반 줄·한 줄 비킨 자리 → 한 칸 더 떨어진 아래·위 순서로 본다.
const NEAR = ["D", "U", "R-", "R+", "L-", "L+", "R--", "R++", "L--", "L++", "D2", "U2"]
const RIGHT_FIRST = ["R", "L", ...NEAR]
const LEFT_FIRST = ["L", "R", ...NEAR]

function boxFor(req: LabelRequest, cand: string, width: number): PlacedLabel {
  const side = cand[0]
  const shift = cand.slice(1)
  const dy = (shift.startsWith("+") ? 1 : shift.startsWith("-") ? -1 : 0) * shift.length * FONT * 0.9
  const far = shift === "2" ? 8 : 0
  const { x: px, y: py } = req.at
  const x = side === "R" ? px + req.gap : side === "L" ? px - req.gap : px
  const y = side === "D" ? py + req.gap + far + FONT * 0.8 : side === "U" ? py - req.gap - far : py + FONT * 0.35 + dy
  const anchor = side === "R" ? "start" : side === "L" ? "end" : "middle"
  const left = anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2
  return { id: req.id, text: req.text, x, y, anchor, box: { x: left, y: y - FONT * 0.95, w: width, h: FONT * 1.25 } }
}

const area = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))

/** 요청 순서가 우선순위다. 다른 라벨·장애물(강조 노드)과 안 겹치는 첫 후보, 없으면 겹침 넓이가 가장 작은 후보. */
export function placeLabels(requests: LabelRequest[], obstacles: (Box & { id: string })[]): PlacedLabel[] {
  const placed: PlacedLabel[] = []
  for (const req of requests) {
    const width = textWidth(req.text, FONT, req.bold)
    const order = req.at.x < VIEW.w * 0.62 ? RIGHT_FIRST : LEFT_FIRST
    let best: { label: PlacedLabel; cost: number } | undefined
    for (const cand of order) {
      const label = boxFor(req, cand, width)
      const b = label.box
      const out = b.x < 0 || b.y < 0 || b.x + b.w > VIEW.w || b.y + b.h > VIEW.h ? 1e4 : 0
      const cost =
        out +
        placed.reduce((s, p) => s + area(b, p.box), 0) +
        obstacles.filter((o) => o.id !== req.id).reduce((s, o) => s + area(b, o), 0)
      if (!best || cost < best.cost) best = { label, cost }
      if (cost === 0) break
    }
    placed.push(best!.label)
  }
  return placed
}
