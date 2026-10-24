// 음표로 그린 색소폰 — 빌드 시 정지 자세 프리렌더(SVG)와 브라우저 캔버스가 같은 함수를 쓴다.
// - buildSax: 3D 점군 모델 / rasterSax: 회전·투영·조명 래스터 / fitSax: 높이 맞춤 / composeSax: 프레임 글자 목록
// - 운지 키 7개(♭ + HAEJUN)의 위치도 composeSax가 투영해 돌려준다
// - 명암은 연속 음영(램버트+정반사+림·벨 속 어둠)을 SAX_CFG.ramp 8단으로 양자화한다: 단마다 글자(실제 잉크 면적순)와 잉크 세기가 하나씩
// - 방향은 테마가 뒤집는다: 라이트 = 어두움이 조밀·진함, 다크 = 밝음이 조밀·진함. 정체성 표식: 광택 ✦✧, 벨 안 ♫, 벨 테 ◦
// 주의: 함수들은 toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것(상수는 인자로).

export interface SaxModel {
  pts: Float32Array
  bell: [number, number, number]
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
        push(rr * Math.cos(b), y + rr * Math.sin(b), -(r + 0.015) - 0.01 * (1 - a), 0, 0, -1, 4)
      }
    }
  })
  return { pts: Float32Array.from(P), bell: [e[0]!, e[1]! + 0.04, e[2]!] }
}

/** 래스터 결과. 셀마다 밝기(v, 비어 있으면 -1)·최전면 재질(m)·정반사(s). */
export interface SaxRaster {
  zb: Float32Array
  br: Float32Array
  sp: Float32Array
  mt: Uint8Array
  v: Float32Array
  s: Float32Array
  m: Uint8Array
  proj: (x: number, y: number, z: number) => [number, number, number]
}

/** 정지 자세 실루엣이 rows행을 꽉 채우는 배율과 격자 원점. */
export interface SaxFit {
  scl: number
  cols: number
  cx: number
  cy: number
}

/** 칠할 글자 하나: x·y(px), 문자, 조밀도 단(0 성김 … 7 조밀 = 잉크 세기 단), 물결이 지나는 중인지. */
export type SaxGlyph = [number, number, string, number, boolean]

/** 그리기 상수(글자 모음 포함). 주의: 아래 함수들은 이 객체를 인자로만 받는다(인라인 직렬화). */
export const SAX_CFG = {
  cw: 4.6,
  ch: 8.2,
  rows: 41,
  // 조밀도 순(렌더 잉크 면적, 7.5px): · .024 | ◦ .046 | ♩ .062 ♭ .075 | ♪ .092 ♮ .098 | ♯ .141 ♫ .153 | ♬ .175 | ✧ .224. ✦(.366)는 정반사 정점 전용
  ramp: ["·", "◦", "♩♭", "♪♮", "♯♫", "♬♫", "♬", "♬✧"],
  sparks: "✦✧",
  rim: "◦",
  bell: "♫",
  // 음영 값 → 단 정규화 구간, 빛 물결이 올리는 양
  lo: 0.06,
  hi: 0.8,
  gammaLight: 1.9, // 라이트는 밝은 면이 종이로 날아가지 않게 음영을 어두운 쪽으로 당긴다
  gammaDark: 1.2,
  lift: 0.14,
  // 운지 키: 위 → 아래 7개, 키 i = 편수 순 i번째 토픽(맨 위는 ♭ 옥타브 키)
  keyY: [0.78, 0.62, 0.46, 0.3, 0.14, -0.02, -0.18],
  keyChars: ["♭", "H", "A", "E", "J", "U", "N"],
  keyRing: true, // 키 둘레 1px 원 테두리
}

/** 회전·투영·램버트+정반사로 셀별 커버리지·밝기·최전면 재질·정반사를 굽는다. */
export function rasterSax(
  model: SaxModel,
  buf: Partial<SaxRaster>,
  C: number,
  R: number,
  cxp: number,
  cyp: number,
  ay: number,
  ax: number,
  scl: number,
): SaxRaster {
  const SX = 2
  const SY = 3
  const W = C * SX
  const H = R * SY
  if (!buf.zb || buf.zb.length !== W * H) {
    buf.zb = new Float32Array(W * H)
    buf.br = new Float32Array(W * H)
    buf.sp = new Float32Array(W * H)
    buf.mt = new Uint8Array(W * H)
    buf.v = new Float32Array(C * R)
    buf.s = new Float32Array(C * R)
    buf.m = new Uint8Array(C * R)
  }
  const zb = buf.zb
  const br = buf.br!
  const sp = buf.sp!
  const mt = buf.mt!
  zb.fill(0)
  const P = model.pts
  const cy = Math.cos(ay)
  const sy = Math.sin(ay)
  const cx = Math.cos(ax)
  const sx = Math.sin(ax)
  const L = [-0.62, 0.5, -0.6]
  const hl = Math.hypot(L[0]!, L[1]!, L[2]! - 1)
  const Hx = L[0]! / hl
  const Hy = L[1]! / hl
  const Hz = (L[2]! - 1) / hl
  const proj = (x: number, y: number, z: number): [number, number, number] => {
    x -= 0.12
    y -= 0.24
    const x1 = x * cy + z * sy
    const z1 = -x * sy + z * cy
    const y2 = y * cx - z1 * sx
    const z2 = y * sx + z1 * cx
    const d = 1 / (z2 + 4.2)
    return [cxp + scl * 1.6667 * x1 * d, cyp - scl * y2 * d, d]
  }
  for (let i = 0; i < P.length; i += 7) {
    const pr = proj(P[i]!, P[i + 1]!, P[i + 2]!)
    let nx = P[i + 3]! * cy + P[i + 5]! * sy
    let nz = -P[i + 3]! * sy + P[i + 5]! * cy
    const ny = P[i + 4]! * cx - nz * sx
    nz = P[i + 4]! * sx + nz * cx
    const dl = nx * L[0]! + ny * L[1]! + nz * L[2]!
    const wrap = Math.max(0, (dl + 0.15) / 1.15) // 부드러운 명암 경계
    const lam = Math.max(0, dl)
    const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 20)
    const m = P[i + 6]!
    const face = Math.min(1, Math.max(0, -nz) / 0.6)
    const limb = 0.5 + 0.5 * face * face * (3 - 2 * face) // 가장자리로 갈수록 어두워져 관이 원통으로 읽힌다
    let b = (0.07 + 0.8 * wrap + 0.5 * spec) * limb
    if (nz > 0.05 && m !== 2) b *= 0.35
    if (m === 2) {
      const q = Math.min(1, Math.hypot(P[i]! - model.bell[0], P[i + 2]! - model.bell[2]) / 0.43)
      b = 0.1 + 0.34 * q * Math.sqrt(q) // 벨 속은 깊을수록 어둡다
    } else if (m === 3) b = 0.2 + 0.3 * lam
    else if (m === 1 || m === 4) b = Math.min(1, b + 0.25)
    const sc = Math.round(pr[0] * SX)
    const sr = Math.round(pr[1] * SY)
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const c = sc + dx
        const r = sr + dy
        if (c < 0 || c >= W || r < 0 || r >= H) continue
        const k = r * W + c
        if (pr[2] > zb[k]!) {
          zb[k] = pr[2]
          br[k] = b > 1 ? 1 : b
          sp[k] = nz > 0.05 ? 0 : spec
          mt[k] = m
        }
      }
    }
  }
  const v = buf.v!
  const s = buf.s!
  const mm = buf.m!
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      let n = 0
      let tot = 0
      let fd = 0
      let fm = 0
      let fs = 0
      for (let a = 0; a < SY; a++) {
        for (let b2 = 0; b2 < SX; b2++) {
          const k = (r * SY + a) * W + c * SX + b2
          if (zb[k]! > 0) {
            n++
            tot += br[k]!
            if (zb[k]! > fd) {
              fd = zb[k]!
              fm = mt[k]!
              fs = sp[k]!
            }
          }
        }
      }
      const on = n / (SX * SY) >= 0.34
      v[r * C + c] = on ? (tot / n) * (0.78 + 0.22 * Math.min(1, n / (SX * SY))) : -1 // 부분 커버 칸은 한 단 어둡게
      mm[r * C + c] = fm
      s[r * C + c] = fs
    }
  }
  buf.proj = proj
  return buf as SaxRaster
}

/** 정지 자세 실루엣이 정확히 rows행을 채우는 배율·열 수·원점을 찾는다. */
export function fitSax(model: SaxModel, raster: typeof rasterSax, rest: { ay: number; ax: number }, rows: number): SaxFit {
  const bb = (scl: number) => {
    const b = raster(model, {}, 140, 90, 70, 45, rest.ay, rest.ax, scl)
    let c0 = 1e9
    let c1 = -1
    let r0 = 1e9
    let r1 = -1
    for (let r = 0; r < 90; r++) {
      for (let c = 0; c < 140; c++) {
        if (b.v[r * 140 + c]! >= 0) {
          c0 = Math.min(c0, c)
          c1 = Math.max(c1, c)
          r0 = Math.min(r0, r)
          r1 = Math.max(r1, r)
        }
      }
    }
    return { c0, c1, r0, r1 }
  }
  let b = bb(74)
  let scl = (74 * rows) / (b.r1 - b.r0 + 1)
  b = bb(scl)
  for (let i = 0; i < 6 && b.r1 - b.r0 + 1 !== rows; i++) {
    const h = b.r1 - b.r0 + 1
    scl *= (rows / h) * (h < rows ? 1.004 : 0.998)
    b = bb(scl)
  }
  return { scl, cols: b.c1 - b.c0 + 3, cx: 70 - b.c0 + 1, cy: 45 - b.r0 }
}

/**
 * 한 프레임의 글자 목록. 음영 값을 ramp 단으로 양자화하고, 단이 글자와 잉크 세기를 함께 정한다.
 * dark면 밝은 쪽이 조밀, 아니면 어두운 쪽이 조밀. 벨 안 ♫·벨 테 ◦·정반사 ✦✧는 글자만 고정하고 세기는 음영을 따른다.
 */
export function composeSax(
  model: SaxModel,
  raster: typeof rasterSax,
  buf: Partial<SaxRaster>,
  fit: SaxFit,
  cfg: typeof SAX_CFG,
  ay: number,
  ax: number,
  sweepAt: (x: number) => number,
  dark: boolean,
): { glyphs: SaxGlyph[]; keys: [number, number][] } {
  const C = fit.cols
  const R = cfg.rows
  const N = cfg.ramp.length
  const ras = raster(model, buf, C, R, fit.cx, fit.cy, ay, ax, fit.scl)
  const bell = ras.proj(model.bell[0], model.bell[1], model.bell[2])
  const on = (c: number, r: number) => c >= 0 && r >= 0 && c < C && r < R && ras.v[r * C + c]! >= 0
  const glyphs: SaxGlyph[] = []
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const i = r * C + c
      const v = ras.v[i]!
      if (v < 0) continue
      const x = (c + 0.5) * cfg.cw
      const y = (r + 0.5) * cfg.ch
      const m = ras.m[i]!
      const lit = sweepAt(x) > 0.45
      let sh = Math.pow(Math.min(1, Math.max(0, (v - cfg.lo) / (cfg.hi - cfg.lo))), dark ? cfg.gammaDark : cfg.gammaLight)
      if (lit) sh = Math.min(1, sh + cfg.lift)
      const q = Math.min(N - 1, Math.floor(sh * N))
      const k = dark ? q : N - 1 - q
      let ch: string
      if (m === 2 || (m === 1 && r < bell[1] - 0.5)) ch = cfg.bell
      else if (ras.s[i]! > 0.6) ch = cfg.sparks[(c + r) % 2]!
      else if (m === 1 && !(on(c - 1, r) && on(c + 1, r) && on(c, r - 1) && on(c, r + 1))) ch = cfg.rim
      else {
        const g = cfg.ramp[k]!
        ch = g[(c + r) % g.length]!
      }
      glyphs.push([x, y, ch, k, lit])
    }
  }
  const keys = cfg.keyY.map((y): [number, number] => {
    const r0 = 0.07 + 0.075 * ((0.95 - y) / 1.5)
    const p = ras.proj(0, y, -(r0 + 0.02))
    return [p[0] * cfg.cw, p[1] * cfg.ch]
  })
  return { glyphs, keys }
}
