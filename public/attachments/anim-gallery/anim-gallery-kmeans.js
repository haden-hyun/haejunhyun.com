// K-means 반복 수렴: 잘못 놓인 중심 3개가 할당 → 평균 갱신을 반복해 덩어리 중앙으로 간다.
// 점은 util.rng(시드 고정)로 첫 프레임에 한 번만 만든다 — 매 프레임 같은 데이터여야 한다.
let MODEL

function build(rng, clamp01) {
  const r = rng(7)
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  const pts = []
  for (const [bx, by] of [[0.22, 0.3], [0.74, 0.28], [0.52, 0.76]])
    for (let i = 0; i < 22; i++) pts.push([clamp01(bx + gauss() * 0.075), clamp01(by + gauss() * 0.075)])
  let cents = [[0.12, 0.85], [0.3, 0.62], [0.9, 0.7]]
  const hist = []
  for (let it = 0; it < 6; it++) {
    const assign = pts.map(([x, y]) => {
      let best = 0, bd = Infinity
      cents.forEach(([cx, cy], k) => { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; best = k } })
      return best
    })
    const next = cents.map((c, k) => {
      const m = pts.filter((_, i) => assign[i] === k)
      return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c
    })
    const sse = pts.reduce((s, [x, y], i) => s + (x - cents[assign[i]][0]) ** 2 + (y - cents[assign[i]][1]) ** 2, 0)
    hist.push({ cents, assign, next, sse })
    const moved = next.some((c, k) => Math.hypot(c[0] - cents[k][0], c[1] - cents[k][1]) > 1e-4)
    cents = next
    if (!moved) break
  }
  return { pts, hist }
}

// 군집은 대등한 범주라 cat1~3을 번호 순서대로 쓰고, 모양(원·사각·삼각)을 함께 바꾼다. 강조(secondary)는 수렴 SSE 한 곳뿐이다.
// 폭 420 미만에서는 제목을 줄여 SSE 라벨 자리를 남긴다.
const catColor = (colors, k) => [colors.cat1, colors.cat2, colors.cat3][k]
function marker(ctx, k, x, y, s, colors) {
  ctx.fillStyle = catColor(colors, k)
  ctx.beginPath()
  if (k === 0) ctx.arc(x, y, s, 0, Math.PI * 2)
  else if (k === 1) ctx.rect(x - s, y - s, s * 2, s * 2)
  else { ctx.moveTo(x, y - s * 1.2); ctx.lineTo(x + s * 1.1, y + s * 0.8); ctx.lineTo(x - s * 1.1, y + s * 0.8); ctx.closePath() }
  ctx.fill()
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, seg, ease, lerp } = util
  MODEL ??= build(util.rng, util.clamp01)
  const H = MODEL.hist, n = H.length
  const top = 30, plotH = height - top - 8, plotW = Math.min(width, plotH * 1.6), ox = (width - plotW) / 2
  const P = ([x, y]) => [ox + x * plotW, top + y * plotH]
  const p = util.clamp01(progress) // 배열 인덱스로 쓰므로 0~1로 자른다
  const it = Math.min(n - 1, Math.floor(p * n)), local = p >= 1 ? 1 : p * n - it
  const pAssign = local >= 0.2, pMove = ease(seg(local, 0.45, 0.9))
  const cur = H[it]
  const converged = p >= 1 || (it === n - 1 && local > 0.9)
  const sse = pAssign ? cur.sse : it > 0 ? H[it - 1].sse : cur.sse
  text(ctx, converged ? (width >= 420 ? `반복 ${n}회 · 중심이 더 움직이지 않음(수렴)` : `반복 ${n}회 · 수렴`) : `반복 ${it + 1} · ${local < 0.45 ? "가장 가까운 중심에 할당" : "군집 평균으로 중심 이동"}`, 0, 10, { size: 13, weight: 600, color: colors.dark })
  text(ctx, `SSE ${sse.toFixed(3)}`, width, 10, { size: 12, weight: converged ? 600 : 400, mono: true, color: converged ? colors.secondary : colors.gray, align: "right" })
  ctx.strokeStyle = colors.lightgray; ctx.lineWidth = 1; ctx.strokeRect(ox + 0.5, top + 0.5, plotW - 1, plotH - 1)

  const assign = pAssign ? cur.assign : it > 0 ? H[it - 1].assign : null
  MODEL.pts.forEach((p, i) => {
    const [x, y] = P(p)
    if (!assign) { ctx.fillStyle = colors.gray; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill() }
    else { ctx.globalAlpha = 0.75; marker(ctx, assign[i], x, y, 3.4, colors) }
    ctx.globalAlpha = 1
  })
  // 중심의 이동 궤적과 현재 위치
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = colors.darkgray; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath()
    for (let j = 0; j <= it; j++) { const [x, y] = P(H[j].cents[k]); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }
    const [cx, cy] = P([lerp(cur.cents[k][0], cur.next[k][0], pMove), lerp(cur.cents[k][1], cur.next[k][1], pMove)])
    ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fillStyle = colors.light; ctx.fill()
    ctx.strokeStyle = catColor(colors, k); ctx.lineWidth = 2.5; ctx.stroke()
    marker(ctx, k, cx, cy, 4.5, colors)
  }
}
