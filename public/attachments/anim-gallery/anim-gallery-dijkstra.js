// Dijkstra: 아직 확정하지 않은 노드 중 가장 가까운 것을 확정하고, 그 이웃의 거리를 줄이는 과정을 반복한다.
const NAMES = ["S", "A", "B", "C", "D", "T"]
const POS = [[0.04, 0.5], [0.32, 0.12], [0.32, 0.88], [0.66, 0.12], [0.66, 0.88], [0.96, 0.5]]
const EDGES = [[0, 1, 4], [0, 2, 2], [2, 1, 1], [1, 3, 5], [2, 4, 10], [3, 4, 2], [3, 5, 3], [4, 5, 2]]

const STEPS = (() => {
  const n = NAMES.length, dist = Array(n).fill(Infinity), prev = Array(n).fill(-1), done = Array(n).fill(false)
  dist[0] = 0
  const out = []
  for (let it = 0; it < n; it++) {
    let cur = -1
    for (let i = 0; i < n; i++) if (!done[i] && (cur < 0 || dist[i] < dist[cur])) cur = i
    const before = [...dist]
    done[cur] = true
    for (const [a, b, w] of EDGES) {
      const v = a === cur ? b : b === cur ? a : -1
      if (v < 0 || done[v]) continue
      if (dist[cur] + w < dist[v]) { dist[v] = dist[cur] + w; prev[v] = cur }
    }
    out.push({ cur, before, after: [...dist], prev: [...prev], done: [...done] })
  }
  return out
})()
const FINAL = STEPS[STEPS.length - 1]
const PATH = (() => { const p = []; for (let v = 5; v >= 0; v = FINAL.prev[v]) p.unshift(v); return p })()
const onPath = (a, b) => PATH.some((v, i) => i > 0 && ((PATH[i - 1] === a && v === b) || (PATH[i - 1] === b && v === a)))

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  const p = clamp01(progress)
  const n = STEPS.length
  const k = Math.min(n - 1, Math.floor(p * n))
  const local = p >= 1 ? 1 : p * n - k
  const st = STEPS[k]
  const dist = local < 0.5 ? st.before : st.after
  const done = st.done.map((d, i) => d && (i !== st.cur || local >= 0.2))
  const finished = p >= 1
  const r = width < 520 ? 14 : 17
  const top = 40, bottom = height - 26
  const P = (i) => [r + POS[i][0] * (width - 2 * r), top + POS[i][1] * (bottom - top)]

  text(ctx, finished ? `확정 완료 · S→T 최단 거리 ${FINAL.after[5]} (${PATH.map((i) => NAMES[i]).join("→")})` : `${k + 1}/${n} 확정: ${NAMES[st.cur]} (거리 ${st.before[st.cur]}) · 이웃 거리를 줄인다`, 0, 10, { size: 13, weight: 600, color: colors.dark })

  // 강조(secondary)는 지금 확정하는 노드와 그 이웃 갱신(입력·결과 한 쌍), 끝 화면에서는 최단 경로와 T의 거리 한 곳이다.
  // 확정된 노드·최단 경로 트리는 처리 완료(옅은 secondary 0.4), 간선은 구조(gray)다.
  for (const [a, b, w] of EDGES) {
    const [x1, y1] = P(a), [x2, y2] = P(b)
    const tree = st.prev[b] === a || st.prev[a] === b
    const relaxing = !finished && local >= 0.5 && (a === st.cur || b === st.cur)
    const best = finished && onPath(a, b)
    ctx.strokeStyle = best || relaxing ? colors.secondary : tree ? colors.secondary : colors.gray
    ctx.globalAlpha = tree && !best && !relaxing ? 0.4 : 1
    ctx.lineWidth = best || relaxing ? 2.5 : tree ? 1.5 : 1
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    ctx.globalAlpha = 1
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    ctx.fillStyle = colors.light; ctx.fillRect(mx - 9, my - 8, 18, 16)
    text(ctx, String(w), mx, my, { size: 11, mono: true, color: colors.gray, align: "center" })
  }
  NAMES.forEach((name, i) => {
    const [x, y] = P(i)
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    const cur = i === st.cur && !finished
    ctx.fillStyle = colors.light; ctx.fill()
    if (cur) { ctx.fillStyle = colors.highlight; ctx.fill() }
    if (done[i]) { ctx.globalAlpha = 0.4; ctx.fillStyle = colors.secondary; ctx.fill(); ctx.globalAlpha = 1 }
    ctx.strokeStyle = cur ? colors.secondary : colors.gray
    ctx.lineWidth = cur ? 2.5 : 1
    if (cur || !done[i]) ctx.stroke()
    text(ctx, name, x, y, { size: 12, weight: 700, mono: true, color: done[i] ? colors.dark : colors.darkgray, align: "center" })
    const d = dist[i] === Infinity ? "∞" : String(dist[i])
    const changed = (!finished && local >= 0.5 && st.before[i] !== st.after[i]) || (finished && i === 5)
    text(ctx, d, x, POS[i][1] > 0.5 ? y + r + 11 : y - r - 10, { size: 12, weight: changed ? 700 : 400, mono: true, color: changed ? colors.secondary : colors.darkgray, align: "center" })
  })
}
