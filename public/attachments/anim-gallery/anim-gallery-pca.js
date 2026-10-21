// PCA: 축을 돌려 가며 투영한 점들의 분산이 가장 큰 방향(PC1)을 찾고, 점을 그 축에 투영해 2차원을 1차원으로 줄인다.
// 데이터는 util.rng로 첫 프레임에 한 번만 만들고, PC1은 공분산 행렬의 고유벡터로 계산한다.
// 강조색은 지금의 축(최종은 PC1)과 그 이름 한 곳이다. 분산 막대·점은 darkgray, PC2는 gray 점선.
let M

function build(rng) {
  const r = rng(21)
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  const rot = Math.PI / 6
  const pts = Array.from({ length: 60 }, () => {
    const a = g() * 1.0, b = g() * 0.32
    return [a * Math.cos(rot) - b * Math.sin(rot), a * Math.sin(rot) + b * Math.cos(rot)]
  })
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length, my = pts.reduce((s, p) => s + p[1], 0) / pts.length
  let sxx = 0, syy = 0, sxy = 0
  for (const [x, y] of pts) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my) }
  sxx /= pts.length; syy /= pts.length; sxy /= pts.length
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy)
  const half = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy ** 2)
  const l1 = (sxx + syy) / 2 + half, l2 = (sxx + syy) / 2 - half
  return { pts, mx, my, theta, ratio: l1 / (l1 + l2), total: sxx + syy }
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, seg, ease, lerp } = util
  M ??= build(util.rng)
  const pFind = ease(seg(progress, 0, 0.45)), pProj = ease(seg(progress, 0.5, 0.8)), pPc2 = seg(progress, 0.82, 1)
  const angle = M.theta - 1.3 * (1 - pFind)
  const ux = Math.cos(angle), uy = Math.sin(angle)
  const proj = M.pts.map(([x, y]) => (x - M.mx) * ux + (y - M.my) * uy)
  const varHere = proj.reduce((s, t) => s + t * t, 0) / proj.length
  const share = varHere / M.total

  const title = pProj > 0 ? (pPc2 > 0 ? `PC1이 분산의 ${Math.round(M.ratio * 100)}% · 2차원을 1차원으로` : "점을 PC1 축에 투영한다") : `축을 돌려 분산이 가장 큰 방향을 찾는다`
  text(ctx, title, 0, 10, { size: 13, weight: 600, color: colors.dark })
  // 이 축 위 분산 막대
  const bw = Math.min(160, width * 0.35), bx = width - bw, by = 30
  text(ctx, `이 축 위 분산 ${Math.round(share * 100)}%`, bx - 8, by + 5, { size: 11, mono: true, color: colors.gray, align: "right" })
  ctx.strokeStyle = colors.lightgray; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 9)
  ctx.fillStyle = colors.darkgray; ctx.fillRect(bx + 1, by + 1, (bw - 2) * share, 8)

  const top = 48, ph = height - top - 6
  const sc = Math.min(width / 6.4, ph / 4.2)
  const cx = width / 2, cy = top + ph / 2
  const P = (x, y) => [cx + (x - M.mx) * sc, cy - (y - M.my) * sc]
  const L = 3.2 * sc
  // 후보 축(찾은 뒤에는 PC1)과 PC2
  ctx.strokeStyle = colors.secondary; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(cx - ux * L, cy + uy * L); ctx.lineTo(cx + ux * L, cy - uy * L); ctx.stroke()
  if (pPc2 > 0) {
    ctx.globalAlpha = pPc2; ctx.strokeStyle = colors.gray; ctx.setLineDash([4, 4]); ctx.lineWidth = 1
    const L2 = 1.4 * sc
    ctx.beginPath(); ctx.moveTo(cx + uy * L2, cy + ux * L2); ctx.lineTo(cx - uy * L2, cy - ux * L2); ctx.stroke()
    ctx.setLineDash([]); ctx.globalAlpha = 1
    text(ctx, "PC1", cx + ux * L - 4, cy - uy * L - 12, { size: 11, weight: 600, mono: true, color: colors.secondary, align: "right" })
    text(ctx, "PC2", cx - uy * L2 + 6, cy - ux * L2, { size: 11, mono: true, color: colors.gray })
  }
  M.pts.forEach(([x, y], i) => {
    const [px, py] = P(x, y)
    const qx = cx + ux * proj[i] * sc, qy = cy - uy * proj[i] * sc
    // 투영선(점 → 축)
    if (pProj === 0) {
      ctx.strokeStyle = colors.lightgray; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke()
    }
    if (pProj > 0) { ctx.fillStyle = colors.gray; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1 }
    ctx.fillStyle = colors.darkgray
    ctx.beginPath(); ctx.arc(lerp(px, qx, pProj), lerp(py, qy, pProj), 3, 0, Math.PI * 2); ctx.fill()
  })
}
