// 3D ASCII 색소폰 — 빌드 시 첫 프레임 프리렌더와 브라우저 애니메이션이 같은 함수를 쓴다.
// 주의: 두 함수는 toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것.

export interface SaxModel {
  pts: Float32Array
  bell: [number, number, number]
}

export interface SaxBuffers {
  zb?: Float32Array
  br?: Float32Array
  fxg?: Float32Array
}

export const SAX_REST = { ay: -0.35, ax: -0.25 }

export function buildSax(): SaxModel {
  const P: number[] = []
  const nrm = (a: number[]) => {
    const l = Math.hypot(a[0]!, a[1]!, a[2]!) || 1
    return [a[0]! / l, a[1]! / l, a[2]! / l]
  }
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, m: number) => {
    P.push(x, y, z, nx, ny, nz, m)
  }
  const tube = (path: number[][], rad: (t: number) => number, around: number, mat: number) => {
    for (let i = 0; i < path.length; i++) {
      const p = path[i]!
      const q = path[Math.min(path.length - 1, i + 1)]!
      const o = path[Math.max(0, i - 1)]!
      const t = nrm([q[0]! - o[0]!, q[1]! - o[1]!, q[2]! - o[2]!])
      let u = [t[1]!, -t[0]!, 0]
      if (Math.hypot(u[0]!, u[1]!) < 1e-6) u = [1, 0, 0]
      u = nrm(u)
      const v = nrm([
        t[1]! * u[2]! - t[2]! * u[1]!,
        t[2]! * u[0]! - t[0]! * u[2]!,
        t[0]! * u[1]! - t[1]! * u[0]!,
      ])
      const r = rad(i / (path.length - 1))
      for (let k = 0; k < around; k++) {
        const a = (k / around) * Math.PI * 2
        const c = Math.cos(a)
        const s = Math.sin(a)
        const n = [u[0]! * c + v[0]! * s, u[1]! * c + v[1]! * s, u[2]! * c + v[2]! * s]
        push(p[0]! + n[0]! * r, p[1]! + n[1]! * r, p[2]! + n[2]! * r, n[0]!, n[1]!, n[2]!, mat)
      }
    }
  }
  const seg = (a: number[], b: number[], n: number) =>
    Array.from({ length: n + 1 }, (_, i) => [
      a[0]! + ((b[0]! - a[0]!) * i) / n,
      a[1]! + ((b[1]! - a[1]!) * i) / n,
      a[2]! + ((b[2]! - a[2]!) * i) / n,
    ])

  // 몸통 → U자 굽이 → 상승관 → 벨 → 벨 테·안쪽 → 넥 → 마우스피스 → 키
  tube(seg([0, 0.95, 0], [0, -0.55, 0], 70), (t) => 0.07 + 0.075 * t, 56, 0)
  const bow: number[][] = []
  for (let i = 0; i <= 36; i++) {
    const th = (Math.PI * i) / 36
    bow.push([0.2 - 0.2 * Math.cos(th), -0.55 - 0.2 * Math.sin(th), 0])
  }
  tube(bow, (t) => 0.135 + 0.03 * t, 48, 0)
  tube(seg([0.4, -0.55, 0], [0.44, 0.0, 0], 26), (t) => 0.165 + 0.03 * t * t, 56, 0)
  const fl: number[][] = []
  for (let i = 0; i <= 26; i++) {
    const t = i / 26
    fl.push([0.44 + 0.16 * t * t, 0.26 * t, -0.1 * t * t])
  }
  tube(fl, (t) => 0.195 + 0.25 * Math.pow(t, 2.4), 110, 0)
  const e = fl[fl.length - 1]!
  for (let k = 0; k < 160; k++) {
    const a = (k / 160) * Math.PI * 2
    for (let m = 0; m < 10; m++) {
      const b = (m / 10) * Math.PI * 2
      const rr = 0.445 + 0.025 * Math.cos(b)
      push(
        e[0]! + rr * Math.cos(a),
        e[1]! + 0.025 * Math.sin(b),
        e[2]! + rr * Math.sin(a),
        Math.cos(b) * Math.cos(a),
        Math.sin(b),
        Math.cos(b) * Math.sin(a),
        1,
      )
    }
  }
  for (let rr = 0; rr <= 0.43; rr += 0.012) {
    const n = Math.max(8, Math.round(rr * 200))
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2
      push(e[0]! + rr * Math.cos(a), e[1]! - 0.03, e[2]! + rr * Math.sin(a), 0, 1, 0, 2)
    }
  }
  const nk: number[][] = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    const th = t * Math.PI * 0.75
    nk.push([-0.2 + 0.2 * Math.cos(th), 0.95 + 0.2 * Math.sin(th) + 0.02 * t, 0])
  }
  tube(nk, (t) => 0.075 - 0.03 * t, 30, 0)
  const last = nk[nk.length - 1]!
  tube(seg(last, [last[0]! - 0.12, last[1]! - 0.11, 0], 14), (t) => 0.045 - 0.01 * t, 24, 3)
  ;[0.78, 0.62, 0.46, 0.3, 0.14, -0.02, -0.18].forEach((y) => {
    const r = 0.07 + 0.075 * ((0.95 - y) / 1.5)
    for (let a = 0; a < 1; a += 0.02) {
      for (let b = 0; b < Math.PI * 2; b += 0.12) {
        const rr = 0.06 * a
        push(rr * Math.cos(b), y + rr * Math.sin(b), -(r + 0.015) - 0.01 * (1 - a), 0, 0, -1, 1)
      }
    }
  })
  return { pts: Float32Array.from(P), bell: [e[0]!, e[1]! + 0.04, e[2]!] }
}

/** 회전각(ay, ax)과 시간으로 본체(ink)·소리 파티클(fx) 두 레이어의 80×44 글자 화면을 만든다. */
export function renderSax(
  sax: SaxModel,
  buf: SaxBuffers,
  ay: number,
  ax: number,
  time: number,
): { ink: string; fx: string } {
  const COLS = 80
  const ROWS = 44
  const SX = 2
  const SY = 3
  const W = COLS * SX
  const H = ROWS * SY
  const ramp = "·.-:~;+=*o%#@"
  const zb = buf.zb || (buf.zb = new Float32Array(W * H))
  const br = buf.br || (buf.br = new Float32Array(W * H))
  zb.fill(0)
  const P = sax.pts
  const cy = Math.cos(ay)
  const sy = Math.sin(ay)
  const cx = Math.cos(ax)
  const sx = Math.sin(ax)
  const L = [-0.43, 0.57, -0.71]
  const hl = Math.hypot(L[0]!, L[1]!, L[2]! - 1)
  const Hx = L[0]! / hl
  const Hy = L[1]! / hl
  const Hz = (L[2]! - 1) / hl
  const proj = (x: number, y: number, z: number) => {
    x -= 0.12
    y -= 0.24
    const x1 = x * cy + z * sy
    const z1 = -x * sy + z * cy
    const y2 = y * cx - z1 * sx
    const z2 = y * sx + z1 * cx
    const d = 1 / (z2 + 4.2)
    return [COLS / 2 + 74 * 1.6667 * x1 * d, ROWS / 2 - 74 * y2 * d, d]
  }
  for (let i = 0; i < P.length; i += 7) {
    const pr = proj(P[i]!, P[i + 1]!, P[i + 2]!)
    let nx = P[i + 3]! * cy + P[i + 5]! * sy
    let nz = -P[i + 3]! * sy + P[i + 5]! * cy
    const ny = P[i + 4]! * cx - nz * sx
    nz = P[i + 4]! * sx + nz * cx
    const lam = Math.max(0, nx * L[0]! + ny * L[1]! + nz * L[2]!)
    const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 20)
    const m = P[i + 6]
    let b = 0.06 + 0.8 * lam + 0.5 * spec
    if (nz > 0.05 && m !== 2) b *= 0.35
    if (m === 2) b = 0.32
    else if (m === 3) b = 0.2 + 0.3 * lam
    else if (m === 1) b = Math.min(1, b + 0.25)
    const sc = Math.round(pr[0]! * SX)
    const sr = Math.round(pr[1]! * SY)
    const d = pr[2]!
    for (let dy = 0; dy < 2; dy++)
      for (let dx = 0; dx < 2; dx++) {
        const c = sc + dx
        const r = sr + dy
        if (c < 0 || c >= W || r < 0 || r >= H) continue
        const k = r * W + c
        if (d > zb[k]!) {
          zb[k] = d
          br[k] = b > 1 ? 1 : b
        }
      }
  }
  const fxg = buf.fxg || (buf.fxg = new Float32Array(COLS * ROWS))
  fxg.fill(0)
  const bp = proj(sax.bell[0], sax.bell[1], sax.bell[2])
  const streams = [
    { dx: -3, ph: 0, sp: 0.16 },
    { dx: 1.5, ph: 2.1, sp: 0.21 },
    { dx: 5, ph: 4.2, sp: 0.13 },
  ]
  for (const s of streams) {
    const amp = 0.6 + 0.4 * Math.sin(time * 0.8 + s.ph)
    for (let j = 0; j < 14; j++) {
      const f = (time * s.sp + j / 14 + s.ph) % 1
      const c = Math.round(
        bp[0]! + s.dx + f * 6 + Math.sin(f * 6 + s.ph + time * 0.6) * (0.6 + f * 2.2),
      )
      const r = Math.round(bp[1]! - 2 - f * 11)
      if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
        const k = r * COLS + c
        fxg[k] = fxg[k]! + Math.pow(Math.sin(f * Math.PI), 1.5) * amp
      }
    }
  }
  const fxc = " ·.:~"
  let ink = ""
  let fx = ""
  for (let r = 0; r < ROWS; r++) {
    let li = ""
    let lf = ""
    for (let c = 0; c < COLS; c++) {
      let n = 0
      let tot = 0
      for (let a = 0; a < SY; a++)
        for (let b2 = 0; b2 < SX; b2++) {
          const k = (r * SY + a) * W + c * SX + b2
          if (zb[k]! > 0) {
            n++
            tot += br[k]!
          }
        }
      const cov = n / (SX * SY)
      const fv = fxg[r * COLS + c]!
      if (cov >= 0.34) {
        li += ramp[Math.min(ramp.length - 1, Math.round((tot / n) * (ramp.length - 1)))]
        lf += " "
      } else if (fv > 0.12) {
        li += " "
        lf += fxc[Math.min(4, 1 + Math.floor(fv * 4))]
      } else {
        li += " "
        lf += " "
      }
    }
    ink += li.replace(/\s+$/, "") + (r < ROWS - 1 ? "\n" : "")
    fx += lf.replace(/\s+$/, "") + (r < ROWS - 1 ? "\n" : "")
  }
  return { ink, fx }
}
