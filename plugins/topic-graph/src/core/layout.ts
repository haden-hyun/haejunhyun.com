// 폴더 클러스터 force 배치. 노드 순서·틱 수 고정이고 d3-force 내부 난수는 고정 시드 LCG라 같은 입력이면 같은 좌표가 나온다.
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3-force"
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force"
import { relations, type TopicGraphModel } from "./graph"

export type View = { w: number; h: number; pad: number }
export const VIEW_TALL: View = { w: 260, h: 280, pad: 8 }
// 화면 높이 760px 이하에서 쓰는 낮은 판 — 같은 모델을 이 비율로 따로 배치한다.
export const VIEW_SHORT: View = { w: 260, h: 220, pad: 8 }
const TICKS = 300

interface SimNode extends SimulationNodeDatum {
  id: string
  kind: string
  current: boolean
}
interface SimLink extends SimulationLinkDatum<SimNode> {
  kind: string
}

export type Point = { x: number; y: number }

export function layoutTopicGraph(model: TopicGraphModel, view: View): Map<string, Point> {
  const rel = relations(model)
  const curParent = rel.cur.parent
  const near = new Set([...rel.siblings, ...rel.direct])
  const nodes: SimNode[] = model.nodes.map((n) => ({ id: n.id, kind: n.kind, current: n.current }))
  const links: SimLink[] = model.edges.map((e) => ({ source: e.s, target: e.t, kind: e.kind }))
  // 현재 클러스터를 중심 쪽으로 강하게 당겨 현재 노트가 자기 폴더에서 떨어지지 않은 채 가운데로 온다.
  const pull = (d: SimNode) => (d.current || d.id === curParent ? 0.3 : rel.siblings.has(d.id) ? 0.15 : 0.05)
  const sim = forceSimulation<SimNode>(nodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(links)
        .id((d) => d.id)
        .distance((e) => {
          if (e.kind !== "tree") return 34
          const s = e.source as SimNode
          const t = e.target as SimNode
          return s.kind === "note" ? (t.id === curParent ? 22 : 16) : 42
        })
        .strength((e) => (e.kind === "tree" ? 0.9 : 0.12)),
    )
    .force("charge", forceManyBody<SimNode>().strength((d) => (d.kind === "note" ? -22 : -140)))
    .force("collide", forceCollide<SimNode>((d) => (d.current ? 13 : d.kind !== "note" ? 10 : near.has(d.id) ? 8 : 5)))
    .force("x", forceX<SimNode>(0).strength((d) => pull(d) * (view.h / view.w)))
    .force("y", forceY<SimNode>(0).strength(pull))
    .stop()
  for (let i = 0; i < TICKS; i++) sim.tick()

  // 현재 노트를 정중앙에 두고 네 방향 배율을 따로 잡는다(방향 간 비 ≤ 1.8, 최대 3배).
  const c0 = nodes.find((n) => n.current)!
  const cx = c0.x ?? 0
  const cy = c0.y ?? 0
  const padX = view.pad + 18
  const padY = view.pad + 12
  const ax = view.w / 2
  const ay = view.h / 2
  const ext = { r: 1e-6, l: 1e-6, d: 1e-6, u: 1e-6 }
  for (const n of nodes) {
    const x = (n.x ?? 0) - cx
    const y = (n.y ?? 0) - cy
    ext.r = Math.max(ext.r, x)
    ext.l = Math.max(ext.l, -x)
    ext.d = Math.max(ext.d, y)
    ext.u = Math.max(ext.u, -y)
  }
  const k = { r: (view.w - padX - ax) / ext.r, l: (ax - padX) / ext.l, d: (view.h - padY - ay) / ext.d, u: (ay - padY) / ext.u }
  const kmin = Math.min(k.r, k.l, k.d, k.u)
  for (const s of ["r", "l", "d", "u"] as const) k[s] = Math.min(k[s], kmin * 1.8, 3)
  const round = (v: number) => Math.round(v * 10) / 10
  return new Map(
    nodes.map((n) => {
      const x = (n.x ?? 0) - cx
      const y = (n.y ?? 0) - cy
      return [n.id, { x: round(ax + x * (x > 0 ? k.r : k.l)), y: round(ay + y * (y > 0 ? k.d : k.u)) }]
    }),
  )
}
