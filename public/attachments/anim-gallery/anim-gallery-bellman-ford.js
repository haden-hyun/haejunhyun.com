// Bellman-Ford: 모든 간선을 V−1번(라운드) 차례로 완화한다. 음수 간선이 있어도 최단 거리가 맞게 수렴한다.
// 그래프는 CLRS의 예제(정점 5개, 간선 10개, 음수 간선 3개)와 같은 구조다.
const NAMES = ["S", "T", "X", "Y", "Z"]
const POS = [[0.06, 0.5], [0.4, 0.1], [0.94, 0.1], [0.4, 0.9], [0.94, 0.9]]
const EDGES = [[1, 2, 5], [1, 3, 8], [1, 4, -4], [2, 1, -2], [3, 2, -3], [3, 4, 9], [4, 2, 7], [4, 0, 2], [0, 1, 6], [0, 3, 7]]
const ROUNDS = NAMES.length - 1

const SIM = (() => {
  const dist = [0, Infinity, Infinity, Infinity, Infinity]
  const events = [], rows = [[...dist]]
  for (let r = 0; r < ROUNDS; r++) {
    EDGES.forEach(([a, b, w], e) => {
      const changed = dist[a] + w < dist[b]
      if (changed) dist[b] = dist[a] + w
      events.push({ round: r, edge: e, changed, dist: [...dist] })
    })
    rows.push([...dist])
  }
  const stable = EDGES.every(([a, b, w]) => !(dist[a] + w < dist[b]))
  return { events, rows, stable }
})()
const hasReverse = (a, b) => EDGES.some(([x, y]) => x === b && y === a)
const fmt = (v) => (v === Infinity ? "∞" : String(v))

function arrow(ctx, x1, y1, x2, y2, r, off, at = 0.35) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L
  const nx = -uy * off, ny = ux * off
  const sx = x1 + ux * r + nx, sy = y1 + uy * r + ny, ex = x2 - ux * (r + 2) + nx, ey = y2 - uy * (r + 2) + ny
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * 8 - uy * 4, ey - uy * 8 + ux * 4); ctx.lineTo(ex - ux * 8 + uy * 4, ey - uy * 8 - ux * 4); ctx.closePath(); ctx.fill()
  // 라벨은 출발점 쪽 35% 지점: 가운데서 교차하는 간선(T→Z, Y→X)의 라벨이 겹치지 않는다
  const lx = sx + (ex - sx) * at, ly = sy + (ey - sy) * at
  return off ? [lx + nx * 2.2, ly + ny * 2.2] : [lx - uy * 9, ly + ux * 9]
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  const total = SIM.events.length
  const k = Math.min(total, Math.floor(clamp01(progress) * (total + 1)))
  const ev = k > 0 ? SIM.events[k - 1] : null
  const dist = ev ? ev.dist : SIM.rows[0]
  const finished = k >= total
  const stacked = width < 560
  const graph = stacked ? { x: 0, y: 30, w: width, h: height * 0.5 } : { x: 0, y: 30, w: width * 0.56, h: height - 40 }
  const table = stacked ? { x: 0, y: graph.y + graph.h + 14, w: width - 44, h: height - graph.y - graph.h - 14 } : { x: width * 0.6, y: 30, w: width * 0.4, h: height - 40 }
  const r = 15
  const P = (i) => [graph.x + r + POS[i][0] * (graph.w - 2 * r), graph.y + r + POS[i][1] * (graph.h - 2 * r)]

  text(ctx, finished ? `${ROUNDS}라운드(V−1) 후 수렴 · 음수 간선도 정확히 처리` : `라운드 ${ev ? ev.round + 1 : 1}/${ROUNDS} · 간선 ${ev ? ev.edge + 1 : 0}/${EDGES.length} 완화`, 0, 10, { size: 13, weight: 600, color: colors.dark })

  EDGES.forEach(([a, b, w], e) => {
    const [x1, y1] = P(a), [x2, y2] = P(b)
    const cur = ev && !finished && ev.edge === e
    ctx.strokeStyle = ctx.fillStyle = cur ? colors.secondary : w < 0 ? colors.darkgray : colors.gray
    ctx.globalAlpha = cur ? 1 : 0.6
    ctx.lineWidth = cur ? 2.5 : w < 0 ? 1.5 : 1
    // Z→S는 긴 간선이라 Y→X 라벨과 겹치지 않게 S 쪽으로 라벨을 옮긴다
    const [mx, my] = arrow(ctx, x1, y1, x2, y2, r, hasReverse(a, b) ? 5 : 0, a === 4 && b === 0 ? 0.72 : 0.35)
    ctx.globalAlpha = 1
    text(ctx, String(w), mx, my, { size: 11, weight: w < 0 ? 600 : 400, mono: true, color: cur ? colors.secondary : w < 0 ? colors.dark : colors.gray, align: "center" })
  })
  NAMES.forEach((name, i) => {
    const [x, y] = P(i)
    const changed = ev && !finished && ev.changed && EDGES[ev.edge][1] === i
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = changed ? colors.highlight : colors.light; ctx.fill()
    ctx.strokeStyle = changed ? colors.secondary : colors.gray; ctx.lineWidth = changed ? 1.5 : 1; ctx.stroke()
    text(ctx, name, x, y, { size: 12, weight: 600, mono: true, color: changed ? colors.secondary : colors.darkgray, align: "center" })
  })

  // 라운드별 거리표: 끝난 라운드는 확정 값, 진행 중인 라운드는 현재 값.
  // 강조(secondary)는 진행 중엔 지금 완화하는 간선과 그 도착 정점 한 쌍, 끝나면 수렴한 마지막 행 한 곳이다.
  const cols = NAMES.length + 1, cw = table.w / cols, rh = Math.min(24, table.h / (ROUNDS + 3))
  const curRound = finished ? ROUNDS : ev ? ev.round + 1 : 0
  ;["라운드", ...NAMES].forEach((h, c) => text(ctx, h, table.x + cw * c + cw / 2, table.y + rh / 2, { size: 11, weight: 600, color: colors.gray, align: "center" }))
  for (let row = 0; row <= ROUNDS; row++) {
    if (row > curRound) break
    const vals = row < curRound || finished ? SIM.rows[row] : dist
    const y = table.y + rh * (row + 1)
    if (row === curRound && !finished) { ctx.fillStyle = colors.highlight; ctx.fillRect(table.x, y, table.w, rh) }
    text(ctx, String(row), table.x + cw / 2, y + rh / 2, { size: 11, mono: true, color: colors.gray, align: "center" })
    vals.forEach((v, c) => text(ctx, fmt(v), table.x + cw * (c + 1) + cw / 2, y + rh / 2, { size: 12, mono: true, color: finished && row === ROUNDS ? colors.secondary : colors.darkgray, weight: finished && row === ROUNDS ? 600 : 400, align: "center" }))
  }
  if (finished && SIM.stable) text(ctx, "한 번 더 돌려도 변화 없음 → 음수 사이클 없음", table.x, table.y + rh * (ROUNDS + 2) + rh / 2, { size: 11, color: colors.gray })
}
