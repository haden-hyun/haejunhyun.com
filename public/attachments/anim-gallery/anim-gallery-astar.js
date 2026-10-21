// Dijkstra와 A*: 벽이 있는 격자에서 같은 길을 찾을 때 확장하는 칸 수를 나란히 비교한다(이동 비용 1, 4방향).
const W = 13, H = 8
const START = [2, 5], GOAL = [10, 5]
const WALL = new Set()
for (let y = 1; y < H; y++) WALL.add(6 + y * W) // x = 6 세로 벽, 맨 위 한 칸만 열림
const idx = (x, y) => x + y * W
const hDist = (i) => Math.abs((i % W) - GOAL[0]) + Math.abs(Math.floor(i / W) - GOAL[1])

function search(useH) {
  const s = idx(...START), goal = idx(...GOAL)
  const g = new Map([[s, 0]]), prev = new Map(), closed = [], seen = new Set()
  const open = [s]
  const key = (i) => g.get(i) + (useH ? hDist(i) : 0)
  while (open.length) {
    open.sort((a, b) => key(a) - key(b) || (useH ? hDist(a) - hDist(b) : 0) || a - b)
    const cur = open.shift()
    if (seen.has(cur)) continue
    seen.add(cur); closed.push(cur)
    if (cur === goal) break
    const x = cur % W, y = Math.floor(cur / W)
    for (const [dx, dy] of [[1, 0], [0, -1], [-1, 0], [0, 1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const ni = idx(nx, ny)
      if (WALL.has(ni) || seen.has(ni)) continue
      const ng = g.get(cur) + 1
      if (!g.has(ni) || ng < g.get(ni)) { g.set(ni, ng); prev.set(ni, cur); open.push(ni) }
    }
  }
  const path = []
  for (let v = goal; v !== undefined; v = prev.get(v)) path.unshift(v)
  return { closed, path }
}
const RUNS = [
  { name: "Dijkstra", rule: "가까운 칸부터 사방으로", ...search(false) },
  { name: "A*", rule: "g + 맨해튼 거리 h", ...search(true) },
]
const MAX = Math.max(...RUNS.map((r) => r.closed.length))
// 두 패널의 확장 칸은 같은 뜻(처리 완료)이라 같은 tertiary로 칠한다. 강조(secondary)는 결론을 만든 A*의 확장 칸 수 한 곳뿐이다.
const BEST = RUNS.reduce((b, r, i) => (r.closed.length < RUNS[b].closed.length ? i : b), 0)

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  const k = Math.floor(clamp01(progress) * MAX)
  const stacked = width < 520
  const panels = stacked
    ? [{ x: 0, y: 0, w: width, h: height / 2 - 6 }, { x: 0, y: height / 2 + 6, w: width, h: height / 2 - 6 }]
    : [{ x: 0, y: 0, w: width / 2 - 12, h: height }, { x: width / 2 + 12, y: 0, w: width / 2 - 12, h: height }]

  RUNS.forEach((run, side) => {
    const pn = panels[side]
    const shown = Math.min(k, run.closed.length)
    const done = shown >= run.closed.length
    text(ctx, run.name, pn.x, pn.y + 10, { size: 13, weight: 600, color: colors.dark })
    text(ctx, run.rule, pn.x + (run.name.length > 3 ? 70 : 26), pn.y + 10, { size: 11, color: colors.gray })
    text(ctx, `확장 ${shown}칸${done ? " · 도착" : ""}`, pn.x + pn.w, pn.y + 10, { size: 12, weight: 600, mono: true, color: done ? (side === BEST ? colors.secondary : colors.darkgray) : colors.gray, align: "right" })
    const cell = Math.min(pn.w / W, (pn.h - 30) / H)
    const ox = pn.x + (pn.w - cell * W) / 2, oy = pn.y + 24
    const C = (i) => [ox + (i % W) * cell, oy + Math.floor(i / W) * cell]
    const order = new Set(run.closed.slice(0, shown))
    for (let i = 0; i < W * H; i++) {
      const [x, y] = C(i)
      if (WALL.has(i)) { ctx.fillStyle = colors.darkgray; ctx.fillRect(x, y, cell, cell); continue }
      if (order.has(i)) {
        ctx.fillStyle = colors.tertiary
        ctx.globalAlpha = 0.35
        ctx.fillRect(x, y, cell, cell)
        ctx.globalAlpha = 1
      }
      ctx.strokeStyle = colors.lightgray; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1)
    }
    if (done) {
      ctx.strokeStyle = colors.dark; ctx.lineWidth = 2.5; ctx.beginPath()
      run.path.forEach((v, n) => { const [x, y] = C(v); n ? ctx.lineTo(x + cell / 2, y + cell / 2) : ctx.moveTo(x + cell / 2, y + cell / 2) })
      ctx.stroke()
    }
    const [sx, sy] = C(idx(...START)), [gx, gy] = C(idx(...GOAL))
    ctx.fillStyle = colors.dark; ctx.beginPath(); ctx.arc(sx + cell / 2, sy + cell / 2, cell * 0.32, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = colors.dark; ctx.lineWidth = 2; ctx.strokeRect(gx + cell * 0.2, gy + cell * 0.2, cell * 0.6, cell * 0.6)
  })
}
