// Bagging: 복원 추출한 표본마다 얕은 회귀 나무(깊이 2)를 하나씩 맞추고, 다섯 나무의 예측을 평균한다.
// 데이터와 표본 추출은 util.rng로 첫 프레임에 한 번만 만든다.
// 나무가 5그루라 범주색(cat1~4)으로 가를 수 없고 서로 바꿔 끼울 수 있는 표본이므로, 지난 나무는 gray 문맥, 강조색은 지금 나무(최종은 평균) 한 곳이다.
const N = 24, MODELS = 5
let M

function fitTree(xs, ys, depth) {
  // 제곱오차를 가장 줄이는 분할을 재귀로 고른다. 결과는 [시작, 끝, 값] 구간 목록.
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length
  const sse = (a) => { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) }
  const leaf = () => [[-Infinity, Infinity, mean(ys)]]
  if (depth === 0 || xs.length < 4) return leaf()
  const order = xs.map((x, i) => i).sort((a, b) => xs[a] - xs[b])
  let best = null
  for (let s = 2; s <= order.length - 2; s++) {
    const lo = order.slice(0, s), hi = order.slice(s)
    const cut = (xs[lo[lo.length - 1]] + xs[hi[0]]) / 2
    const cost = sse(lo.map((i) => ys[i])) + sse(hi.map((i) => ys[i]))
    if (!best || cost < best.cost) best = { cost, cut, lo, hi }
  }
  const sub = (ids) => fitTree(ids.map((i) => xs[i]), ids.map((i) => ys[i]), depth - 1)
  const left = sub(best.lo).map(([a, b, v]) => [a, Math.min(b, best.cut), v]).filter(([a, b]) => a < b)
  const right = sub(best.hi).map(([a, b, v]) => [Math.max(a, best.cut), b, v]).filter(([a, b]) => a < b)
  return [...left, ...right]
}
const predict = (tree, x) => tree.find(([a, b]) => x >= a && x < b)?.[2] ?? tree[tree.length - 1][2]

function build(rng) {
  const r = rng(5)
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  const xs = Array.from({ length: N }, () => r()).sort((a, b) => a - b)
  const ys = xs.map((x) => 0.8 * Math.sin(2 * Math.PI * x) + g() * 0.25)
  const models = Array.from({ length: MODELS }, () => {
    const pick = Array.from({ length: N }, () => Math.floor(r() * N))
    const count = Array(N).fill(0)
    pick.forEach((i) => count[i]++)
    return { count, tree: fitTree(pick.map((i) => xs[i]), pick.map((i) => ys[i]), 2) }
  })
  return { xs, ys, models }
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, seg, ease } = util
  M ??= build(util.rng)
  const step = 0.14
  const i = Math.min(MODELS - 1, Math.floor(Math.min(progress, 0.7) / step))
  const pModel = ease(seg(progress, i * step, i * step + 0.1))
  const pAvg = ease(seg(progress, 0.69, 1))
  text(ctx, pAvg > 0 ? `${MODELS}개 평균 → 계단이 촘촘해지고 표본에 덜 흔들린다` : `모델 ${i + 1}/${MODELS} · 복원 추출한 표본으로 나무 하나`, 0, 10, { size: 13, weight: 600, color: colors.dark })
  if (width >= 520 && pAvg === 0) text(ctx, "점 크기 = 이 표본에서 뽑힌 횟수", width, 10, { size: 10, color: colors.gray, align: "right" })

  const top = 30, ph = height - top - 8
  const X = (x) => 6 + x * (width - 12), Y = (y) => top + ((1.4 - y) / 2.8) * ph
  ctx.strokeStyle = colors.lightgray; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1), Y(0)); ctx.stroke()

  const curve = (fn, lw, color, alpha, until = 1) => {
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath()
    for (let s = 0; s <= 200 * until; s++) { const x = s / 200; s ? ctx.lineTo(X(x), Y(fn(x))) : ctx.moveTo(X(x), Y(fn(x))) }
    ctx.stroke(); ctx.globalAlpha = 1
  }
  const shownModels = pAvg > 0 ? MODELS : i + 1
  for (let m = 0; m < shownModels; m++) {
    const isCur = m === i && pAvg === 0
    curve((x) => predict(M.models[m].tree, x), isCur ? 2.5 : 1, isCur ? colors.secondary : colors.gray, isCur ? pModel : pAvg > 0 ? 0.35 : 0.45)
  }
  if (pAvg > 0) curve((x) => M.models.reduce((s, m) => s + predict(m.tree, x), 0) / MODELS, 2.5, colors.secondary, 1, pAvg)

  const count = pAvg > 0 ? null : M.models[i].count
  M.xs.forEach((x, j) => {
    const c = count ? count[j] : 1
    ctx.beginPath(); ctx.arc(X(x), Y(M.ys[j]), c ? 2.5 + c * 1.3 : 3, 0, Math.PI * 2)
    if (c) { ctx.fillStyle = colors.darkgray; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1 }
    else { ctx.strokeStyle = colors.gray; ctx.lineWidth = 1; ctx.stroke() }
  })
}
