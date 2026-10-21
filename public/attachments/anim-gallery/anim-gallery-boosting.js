// Gradient Boosting: 지금까지의 예측이 남긴 오차(잔차)에 그루터기 나무(분할 1번)를 맞춰 학습률 0.5만큼 더하기를 8라운드 반복한다.
// 데이터는 util.rng로 첫 프레임에 한 번만 만든다.
// 강조색은 지금 예측 곡선과 그 MSE 막대 한 쌍이다. 지난 라운드 막대는 gray, 아직 오지 않은 라운드는 lightgray.
const N = 26, ROUNDS = 8, LR = 0.5
let M

function stump(xs, rs) {
  const order = xs.map((x, i) => i).sort((a, b) => xs[a] - xs[b])
  const mean = (ids) => ids.reduce((s, i) => s + rs[i], 0) / ids.length
  let best = null
  for (let s = 1; s < order.length; s++) {
    const lo = order.slice(0, s), hi = order.slice(s)
    const ml = mean(lo), mh = mean(hi)
    const cost = lo.reduce((t, i) => t + (rs[i] - ml) ** 2, 0) + hi.reduce((t, i) => t + (rs[i] - mh) ** 2, 0)
    if (!best || cost < best.cost) best = { cost, cut: (xs[lo[lo.length - 1]] + xs[hi[0]]) / 2, ml, mh }
  }
  return best
}

function build(rng) {
  const r = rng(9)
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  const xs = Array.from({ length: N }, () => r()).sort((a, b) => a - b)
  const ys = xs.map((x) => 0.8 * Math.sin(2 * Math.PI * x) + g() * 0.15)
  const f0 = ys.reduce((s, v) => s + v, 0) / N
  const stumps = []
  const predictAt = (x, m) => stumps.slice(0, m).reduce((s, t) => s + LR * (x < t.cut ? t.ml : t.mh), f0)
  const mse = [ys.reduce((s, y) => s + (y - f0) ** 2, 0) / N]
  for (let m = 0; m < ROUNDS; m++) {
    const rs = ys.map((y, i) => y - predictAt(xs[i], m))
    stumps.push(stump(xs, rs))
    mse.push(ys.reduce((s, y, i) => s + (y - predictAt(xs[i], m + 1)) ** 2, 0) / N)
  }
  return { xs, ys, predictAt, mse }
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, ease, clamp01, lerp } = util
  M ??= build(util.rng)
  const t = clamp01(progress) * ROUNDS
  const m = Math.min(ROUNDS, Math.floor(t))
  const local = m >= ROUNDS ? 1 : ease(t - m)
  const pred = (x) => (m >= ROUNDS ? M.predictAt(x, ROUNDS) : lerp(M.predictAt(x, m), M.predictAt(x, m + 1), local))
  const finished = clamp01(progress) >= 1
  text(ctx, finished ? `${ROUNDS}라운드 · MSE ${M.mse[0].toFixed(3)} → ${M.mse[ROUNDS].toFixed(3)}` : `라운드 ${m + 1}/${ROUNDS} · 남은 오차(잔차)에 작은 나무를 맞춰 더한다`, 0, 10, { size: 13, weight: 600, color: colors.dark })

  const top = 30, stripH = 52, ph = height - top - stripH - 16
  const X = (x) => 6 + x * (width - 12), Y = (y) => top + ((1.3 - y) / 2.6) * ph
  // 잔차 막대: 점에서 현재 예측까지
  M.xs.forEach((x, i) => {
    ctx.strokeStyle = colors.gray; ctx.globalAlpha = 0.55; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(X(x), Y(M.ys[i])); ctx.lineTo(X(x), Y(pred(x))); ctx.stroke(); ctx.globalAlpha = 1
  })
  ctx.strokeStyle = colors.secondary; ctx.lineWidth = 2.5; ctx.beginPath()
  for (let s = 0; s <= 240; s++) { const x = s / 240; s ? ctx.lineTo(X(x), Y(pred(x))) : ctx.moveTo(X(x), Y(pred(x))) }
  ctx.stroke()
  M.xs.forEach((x, i) => { ctx.fillStyle = colors.darkgray; ctx.beginPath(); ctx.arc(X(x), Y(M.ys[i]), 3, 0, Math.PI * 2); ctx.fill() })

  // 아래: 라운드별 MSE
  const sy = height - stripH, maxM = M.mse[0]
  const bw = Math.min(28, (width - 88) / (ROUNDS + 1) - 4) // 오른쪽 아래 40px는 비운다
  text(ctx, "MSE", 0, sy + stripH / 2, { size: 11, mono: true, color: colors.gray })
  M.mse.forEach((v, j) => {
    const h = (v / maxM) * (stripH - 14)
    const x = 40 + j * (bw + 4)
    const latest = finished ? ROUNDS : m
    ctx.fillStyle = j === latest ? colors.secondary : j < latest ? colors.gray : colors.lightgray
    ctx.fillRect(x, sy + stripH - 10 - h, bw, h)
    text(ctx, String(j), x + bw / 2, sy + stripH - 2, { size: 10, mono: true, color: colors.gray, align: "center" })
  })
}
