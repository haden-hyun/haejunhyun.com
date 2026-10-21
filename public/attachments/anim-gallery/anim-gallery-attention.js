// 예제-7 계산 단계 전이: it의 쿼리 점수 → softmax 가중치 → 값 벡터의 가중합. 수치는 개념 설명용 예시 값이다.
// 램프는 한 장면에 하나: 1~2단계는 점수·가중치(secondary), 값 벡터 칸은 gray 투명도. 3단계는 출력 칸이 secondary 램프이고 막대·호·섞기 선은 gray로 내린다. 투명도 하한 0.15.
const TOK = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "tired"]
const SCORE = [0.1, 3.1, 0.2, 0.6, 0.1, 1.6, 0.3, 1.0, 0.2, 1.3]
const Q = 7
const VAL = [
  [0.2, 0.1, 0.3, 0.1], [0.95, 0.15, 0.85, 0.3], [0.1, 0.4, 0.1, 0.2], [0.3, 0.6, 0.2, 0.1], [0.2, 0.1, 0.3, 0.1],
  [0.15, 0.9, 0.1, 0.7], [0.1, 0.2, 0.4, 0.1], [0.5, 0.3, 0.4, 0.4], [0.1, 0.1, 0.2, 0.3], [0.6, 0.2, 0.3, 0.9],
]
const W = (() => { const e = SCORE.map(Math.exp); const s = e.reduce((a, b) => a + b, 0); return e.map((v) => v / s) })()
const W_MAX = Math.max(...W)
const OUT = [0, 1, 2, 3].map((d) => VAL.reduce((acc, v, i) => acc + W[i] * v[d], 0))

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, seg, ease, lerp } = util
  const n = TOK.length, slot = width / n
  const small = slot < 52
  const tokY = height * 0.34, barTop = tokY + 18, barH = height * 0.2
  const vy = barTop + barH + 18, cw = Math.min(10, (slot - 8) / 4)
  const pScore = seg(progress, 0, 0.3), pSoft = seg(progress, 0.32, 0.62), pMix = seg(progress, 0.66, 1)
  const title = progress < 0.32 ? "1 · 점수: q(it) · k(각 단어)" : progress < 0.66 ? "2 · softmax로 가중치(합 = 1)" : "3 · 가중치로 값 벡터를 섞는다"
  text(ctx, title, 0, 10, { size: 13, weight: 600, color: colors.dark })
  const cx = (i) => slot * i + slot / 2

  // 쿼리 it에서 각 단어로 가는 호: 두께 = 가중치
  if (pSoft > 0) {
    for (let i = 0; i < n; i++) {
      if (i === Q) continue
      const dx = Math.abs(cx(i) - cx(Q))
      const h = Math.min(tokY - (small ? 48 : 34), 14 + dx * 0.3)
      const lift = small ? 26 : 12
      ctx.globalAlpha = ease(pSoft) * (0.2 + 0.8 * Math.min(1, W[i] / 0.45))
      ctx.strokeStyle = pMix > 0 ? colors.gray : colors.secondary; ctx.lineWidth = 1 + 9 * W[i]
      ctx.beginPath(); ctx.moveTo(cx(Q), tokY - lift)
      ctx.quadraticCurveTo((cx(i) + cx(Q)) / 2, tokY - lift - h * 2, cx(i), tokY - lift); ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  for (let i = 0; i < n; i++) {
    const isQ = i === Q
    text(ctx, TOK[i], cx(i), tokY - (small && i % 2 ? 13 : 0), { size: small ? 10 : 13, weight: isQ ? 700 : 400, mono: true, color: isQ ? colors.secondary : colors.dark, align: "center" })
    // 점수 막대가 가중치 막대로 바뀐다
    const v = lerp((SCORE[i] / 3.1) * ease(pScore), W[i] / W_MAX, ease(pSoft))
    ctx.fillStyle = pSoft > 0 && pMix === 0 ? colors.secondary : colors.gray
    ctx.globalAlpha = 0.35 + 0.65 * v
    ctx.fillRect(cx(i) - slot * 0.22, barTop, slot * 0.44, barH * v)
    ctx.globalAlpha = 1
    if (pScore > 0.95 && !small) {
      const label = pSoft > 0.5 ? `${Math.round(W[i] * 100)}%` : SCORE[i].toFixed(1)
      text(ctx, label, cx(i), barTop + barH * v + 9, { size: 11, mono: true, color: colors.gray, align: "center" })
    }
    // 값 벡터 4칸
    for (let d = 0; d < 4; d++) {
      ctx.globalAlpha = Math.max(0.15, (0.15 + 0.85 * VAL[i][d]) * (pMix > 0 ? 0.35 + 0.65 * Math.min(1, W[i] / 0.45) : 1))
      ctx.fillStyle = colors.gray
      ctx.fillRect(cx(i) - (cw * 4 + 3) / 2 + d * (cw + 1), vy, cw, cw * 1.6)
    }
    ctx.globalAlpha = 1
  }

  // 출력: it의 새 표현 = Σ wᵢ·vᵢ
  const oy = Math.min(height - 34, vy + 64), ow = small ? 14 : 22
  const ox = width / 2 - (ow * 4 + 6) / 2
  if (pMix > 0) {
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = Math.max(0.15, Math.min(1, W[i] / 0.45) * 0.7) * ease(pMix)
      ctx.strokeStyle = colors.gray; ctx.lineWidth = 1 + 4 * W[i]
      ctx.beginPath(); ctx.moveTo(cx(i), vy + cw * 1.6 + 2); ctx.lineTo(width / 2, oy - 4); ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
  for (let d = 0; d < 4; d++) {
    ctx.globalAlpha = 0.15 + 0.85 * OUT[d] * ease(pMix)
    ctx.fillStyle = colors.secondary; ctx.fillRect(ox + d * (ow + 2), oy, ow, 18)
    ctx.globalAlpha = 1
    ctx.strokeStyle = pMix > 0.9 ? colors.secondary : colors.lightgray; ctx.lineWidth = pMix > 0.9 ? 2 : 1; ctx.strokeRect(ox + d * (ow + 2) + 0.5, oy + 0.5, ow - 1, 17)
  }
  text(ctx, "it의 새 표현", ox - 10, oy + 9, { size: 12, color: colors.dark, align: "right" })
  if (pMix > 0.9) text(ctx, "≈ animal", ox + ow * 4 + 16, oy + 9, { size: 12, weight: 600, mono: true, color: colors.secondary })
}
