// DBSCAN: 반지름 ε 안 이웃이 minPts개 이상인 핵심점에서 군집을 넓혀 간다. 휘어진 모양도 밀도로 묶고, 외딴 점은 잡음으로 남긴다.
// 데이터(초승달 두 개 + 흩어진 점)는 util.rng로 첫 프레임에 한 번만 만든다.
const EPS = 0.25, MIN_PTS = 4
// 외딴 점: 초승달에서 ε보다 충분히 먼 고정 위치(무작위로 두면 두 초승달 사이를 이어 군집이 합쳐진다)
const OUTLIERS = [[-1.1, 1.1], [2.1, 1.05], [0.5, -0.75], [-0.95, -0.6], [2.15, -0.55], [0.5, 1.2], [-0.3, 0.35], [1.35, 0.15]]
let M

function build(rng) {
  const r = rng(3)
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  let pts = []
  for (let i = 0; i < 48; i++) { const t = (Math.PI * i) / 47; pts.push([Math.cos(t) + g() * 0.04, Math.sin(t) + g() * 0.04]) }
  for (let i = 0; i < 48; i++) { const t = (Math.PI * i) / 47; pts.push([1 - Math.cos(t) + g() * 0.04, 0.5 - Math.sin(t) + g() * 0.04]) }
  pts.push(...OUTLIERS.map((p) => [...p]))
  // 순서를 섞어 탐색 시작점이 한쪽에 몰리지 않게 한다
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]] }
  const nb = (i) => pts.map((q, j) => (Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]) <= EPS ? j : -1)).filter((j) => j >= 0)
  const label = Array(pts.length).fill(undefined), core = Array(pts.length).fill(false), events = []
  let C = 0
  for (let i = 0; i < pts.length; i++) {
    if (label[i] !== undefined) continue
    const n0 = nb(i)
    if (n0.length < MIN_PTS) { label[i] = -1; events.push({ i, label: -1, core: false }); continue }
    C++
    label[i] = C; core[i] = true; events.push({ i, label: C, core: true })
    const queue = [...n0]
    while (queue.length) {
      const j = queue.shift()
      if (label[j] === -1) { label[j] = C; events.push({ i: j, label: C, core: false }) }
      if (label[j] !== undefined) continue
      label[j] = C
      const nj = nb(j)
      core[j] = nj.length >= MIN_PTS
      if (core[j]) queue.push(...nj)
      events.push({ i: j, label: C, core: core[j] })
    }
  }
  return { pts, events, clusters: C }
}

// 군집은 대등한 범주라 cat1부터 번호 순서대로 쓰고 모양(원·사각·삼각·마름모)을 함께 바꾼다. 잡음은 회색 ×, 강조(secondary)는 지금 보는 점의 ε 원 한 곳이다.
function mark(ctx, kind, x, y, s, filled, colors) {
  const color = [colors.cat1, colors.cat2, colors.cat3, colors.cat4][(kind - 1) % 4]
  ctx.beginPath()
  const shape = (kind - 1) % 4
  if (shape === 0) ctx.arc(x, y, s, 0, Math.PI * 2)
  else if (shape === 1) ctx.rect(x - s, y - s, s * 2, s * 2)
  else if (shape === 3) { ctx.moveTo(x, y - s * 1.3); ctx.lineTo(x + s * 1.3, y); ctx.lineTo(x, y + s * 1.3); ctx.lineTo(x - s * 1.3, y); ctx.closePath() }
  else { ctx.moveTo(x, y - s * 1.2); ctx.lineTo(x + s * 1.1, y + s * 0.8); ctx.lineTo(x - s * 1.1, y + s * 0.8); ctx.closePath() }
  if (filled) { ctx.fillStyle = color; ctx.fill() } else { ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke() }
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  M ??= build(util.rng)
  const E = M.events.length
  const k = Math.min(E, Math.floor(clamp01(progress) * (E + 1)))
  const state = new Map()
  for (const ev of M.events.slice(0, k)) state.set(ev.i, ev)
  const finished = k >= E
  const noise = [...state.values()].filter((e) => e.label === -1).length
  text(ctx, finished ? `군집 ${M.clusters}개 · 휘어진 모양도 밀도로 묶는다` : `탐색 ${k}/${E} · ε 안 이웃이 ${MIN_PTS}개 이상이면 핵심점`, 0, 10, { size: 13, weight: 600, color: colors.dark })
  // 끝나면 결론을 만든 잡음 개수 라벨 한 곳만 secondary로 칠하고, 범례는 그 왼쪽으로 비켜 준다
  if (finished) text(ctx, `잡음 ${noise}개`, width, 10, { size: 12, weight: 600, color: colors.secondary, align: "right" })
  if (width >= 520) text(ctx, "채움 = 핵심점 · 테두리 = 경계점 · × = 잡음", finished ? width - 72 : width, 10, { size: 10, color: colors.gray, align: "right" })

  const xr = [-1.25, 2.25], yr = [-0.8, 1.2]
  const top = 28, ph = height - top - 4
  const sc = Math.min(width / (xr[1] - xr[0]), ph / (yr[1] - yr[0]))
  const ox = (width - sc * (xr[1] - xr[0])) / 2
  const P = ([x, y]) => [ox + (x - xr[0]) * sc, top + (yr[1] - y) * sc]

  const cur = !finished && k > 0 ? M.events[k - 1] : null
  if (cur) {
    const [cx, cy] = P(M.pts[cur.i])
    ctx.fillStyle = colors.highlight; ctx.beginPath(); ctx.arc(cx, cy, EPS * sc, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = colors.secondary; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])
  }
  M.pts.forEach((p, i) => {
    const [x, y] = P(p)
    const ev = state.get(i)
    if (!ev) { ctx.fillStyle = colors.gray; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; return }
    if (ev.label === -1) {
      ctx.strokeStyle = colors.gray; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke()
      return
    }
    mark(ctx, ev.label, x, y, 3.6, ev.core, colors)
  })
}
