// 시간복잡도: n이 1→64로 커질 때 복잡도별 연산 수를 로그 눈금 막대로 비교한다.
const ROWS = [
  { name: "O(1)", f: () => 1 },
  { name: "O(log n)", f: (n) => Math.max(1, Math.log2(n)) },
  { name: "O(n)", f: (n) => n },
  { name: "O(n log n)", f: (n) => n * Math.max(1, Math.log2(n)) },
  { name: "O(n²)", f: (n) => n * n },
  { name: "O(2ⁿ)", f: (n) => 2 ** n },
]
const MAX_EXP = 12 // 가로축 끝 = 10¹²
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹"
const sup = (k) => String(k).split("").map((d) => SUP[+d]).join("")
const comma = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
function fmt(v) {
  if (v < 1e6) return comma(v)
  const e = Math.floor(Math.log10(v))
  return `${(v / 10 ** e).toFixed(1)}×10${sup(e)}`
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  const p = clamp01(progress)
  const nf = 1 + 63 * p * p // 막대는 연속 n으로 자라고, 글자는 정수 n으로 읽는다
  const n = Math.max(1, Math.round(nf))
  const narrow = width < 520
  const labelW = narrow ? 88 : 96, valueW = narrow ? 80 : 100
  const top = 34, bottom = 40 // 오른쪽 아래 일시정지 버튼 자리를 비운다
  const barX = labelW, barW = width - labelW - valueW
  const rowH = (height - top - bottom) / ROWS.length
  text(ctx, `n = ${n}일 때 필요한 연산 수`, 0, 10, { size: 13, weight: 600, color: colors.dark })
  if (!narrow) text(ctx, "가로축은 로그 눈금", width, 10, { size: 10, color: colors.gray, align: "right" })

  ctx.strokeStyle = colors.lightgray
  ctx.lineWidth = 1
  for (let e = 0; e <= MAX_EXP; e += 3) {
    const x = barX + (e / MAX_EXP) * barW
    ctx.beginPath(); ctx.moveTo(x, top - 4); ctx.lineTo(x, height - bottom); ctx.stroke()
    text(ctx, `10${sup(e)}`, x, height - bottom + 14, { size: 10, mono: true, color: colors.gray, align: "center" })
  }

  ROWS.forEach((r, i) => {
    const v = r.f(n)
    const y = top + i * rowH
    const exp = Math.log10(v)
    const frac = Math.min(1, Math.log10(r.f(nf)) / MAX_EXP)
    // 강조는 가로축을 넘어서는 O(2ⁿ) 한 줄뿐이고, 나머지 막대는 회색 문맥이다
    const hot = i === ROWS.length - 1
    text(ctx, r.name, labelW - 8, y + rowH / 2, { size: 12, mono: true, color: colors.darkgray, align: "right" })
    ctx.fillStyle = hot ? colors.secondary : colors.gray
    ctx.globalAlpha = hot ? 1 : 0.55
    ctx.fillRect(barX, y + rowH * 0.22, Math.max(2, frac * barW), rowH * 0.56)
    ctx.globalAlpha = 1
    const label = exp > MAX_EXP ? `${fmt(v)} ↑` : fmt(v)
    text(ctx, label, barX + frac * barW + 6, y + rowH / 2, { size: 11, mono: true, weight: hot ? 600 : 400, color: hot ? colors.secondary : colors.darkgray })
  })
}
