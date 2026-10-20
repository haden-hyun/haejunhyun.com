// anim-widgets canvas 데모: 학습률에 따른 경사하강 경로.
// 계약: default export draw(ctx, { t, progress, width, height, colors, reduced }) — 순수 그리기 함수.
// progress가 0→1로 가는 동안 재생되고, 1에서 hold만큼 멈춘 뒤 반복된다.

const PANELS = [
  { lr: 0.05, label: "학습률 0.05", note: "너무 느리다" },
  { lr: 0.35, label: "학습률 0.35", note: "적당하다" },
  { lr: 1.04, label: "학습률 1.04", note: "발산한다" },
]
const STEPS = 12
const W0 = -1

const loss = (w) => w * w

function path(lr) {
  const ws = [W0]
  for (let i = 0; i < STEPS; i++) ws.push(ws[i] - lr * 2 * ws[i])
  return ws
}

const easeOut = (x) => 1 - (1 - x) * (1 - x)

function drawPanel(ctx, x, y, w, h, panel, progress, colors) {
  const pad = 14
  const top = y + 34
  const plotW = w - pad * 2
  const plotH = h - (top - y) - pad
  const range = 1.25
  const sx = (v) => x + pad + ((v + range) / (range * 2)) * plotW
  const sy = (v) => top + plotH - (Math.min(v, range * range) / (range * range)) * plotH

  ctx.fillStyle = colors.dark
  ctx.font = `600 ${w < 140 ? 11 : 13}px ${colors.font}`
  ctx.textAlign = "center"
  ctx.fillText(panel.label, x + w / 2, y + 12)
  ctx.fillStyle = colors.gray
  ctx.font = `${w < 140 ? 10.5 : 12}px ${colors.font}`
  ctx.fillText(panel.note, x + w / 2, y + 27)

  ctx.strokeStyle = colors.lightgray
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(sx(-range), sy(0))
  ctx.lineTo(sx(range), sy(0))
  ctx.stroke()

  ctx.strokeStyle = colors.gray
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i <= 60; i++) {
    const v = -range + (i / 60) * range * 2
    if (i === 0) ctx.moveTo(sx(v), sy(loss(v)))
    else ctx.lineTo(sx(v), sy(loss(v)))
  }
  ctx.stroke()

  // 진행률만큼 단계를 보이고, 마지막 구간은 보간해서 점이 미끄러지듯 움직이게 한다.
  const ws = path(panel.lr).map((v) => Math.max(-range, Math.min(range, v)))
  const pos = progress * STEPS
  const done = Math.floor(pos)
  const frac = easeOut(pos - done)

  ctx.strokeStyle = colors.secondary
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.moveTo(sx(ws[0]), sy(loss(ws[0])))
  for (let i = 1; i <= done; i++) ctx.lineTo(sx(ws[i]), sy(loss(ws[i])))
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = colors.secondary
  for (let i = 0; i <= done; i++) {
    ctx.globalAlpha = 0.25 + 0.5 * (i / STEPS)
    ctx.beginPath()
    ctx.arc(sx(ws[i]), sy(loss(ws[i])), 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const from = ws[Math.min(done, STEPS)]
  const to = ws[Math.min(done + 1, STEPS)]
  const cur = from + (to - from) * (done >= STEPS ? 0 : frac)
  ctx.beginPath()
  ctx.arc(sx(cur), sy(loss(cur)), 5.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = colors.gray
  ctx.font = `11px ${colors.font}`
  ctx.textAlign = "left"
  ctx.fillText(`step ${Math.min(done, STEPS)}/${STEPS}`, x + pad, y + h - 4)
}

export default function draw(ctx, { progress, width, height, colors }) {
  const stacked = width < 300
  const n = PANELS.length
  const gap = 12
  const pw = stacked ? width : (width - gap * (n - 1)) / n
  const ph = stacked ? (height - gap * (n - 1)) / n : height

  PANELS.forEach((panel, i) => {
    const x = stacked ? 0 : i * (pw + gap)
    const y = stacked ? i * (ph + gap) : 0
    drawPanel(ctx, x, y, pw, ph, panel, progress, colors)
  })
}
