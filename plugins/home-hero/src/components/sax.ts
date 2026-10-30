// 홈 히어로 색소폰 — 3D 점군 모델과 기울기·회전 투영.
// - buildSax: 점군 / saxXf: 회전·기울기 투영 / saxExtent: 빌드 시 크기·중심 표 계산(레이아웃 이동 방지)
// - 클라이언트 캔버스(하프톤 점)가 같은 buildSax·saxXf를 쓴다. 기울기 = 연주 자세(위쪽이 왼쪽으로), 회전축 = 악기 축(기울기가 늘 보인다)
// 주의: buildSax·saxXf는 toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것(상수는 인자로).

export interface SaxModel {
  pts: Float32Array
  bell: [number, number, number]
}

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

export const SAX = {
  tilt: (20 * Math.PI) / 180, // 연주 자세 20°(반시계)
  ax: -0.25, // 살짝 고개 숙인 시점
  rest: -0.35, // 정지·감속 모션 자세(yaw)
  period: 9, // 한 바퀴(초)
  cx0: 0.29,
  cy0: 0.16,
  cz0: -0.1,
  steps: 48, // 각도별 중심 표 개수
}

/** 한 점(또는 법선)을 yaw → pitch → 화면 roll 순서로 돌린다. out = [x, y, depth]. */
export function saxXf(
  x: number, y: number, z: number,
  ca: number, sa: number, cr: number, sr: number, cxA: number, sxA: number,
  out: number[],
) {
  const x1 = x * ca + z * sa
  const z1 = -x * sa + z * ca
  const y2 = y * cxA - z1 * sxA
  out[0] = x1 * cr - y2 * sr
  out[1] = x1 * sr + y2 * cr
  out[2] = y * sxA + z1 * cxA
}

export interface SaxExtent {
  /** 슬롯 높이 = 1.1em × k, 폭 = 높이 × ar */
  k: number
  ar: number
  /** 캔버스 전체 높이에 대응하는 모델 높이 */
  h: number
  /** 정지 자세의 보이는 중심 */
  cx: number
  cy: number
  /** 각도별 보이는 중심 — 회전 중 위아래로 흔들리지 않게 캔버스 중심에 맞춘다 */
  cxt: number[]
  cyt: number[]
}

export function saxExtent(model: SaxModel): SaxExtent {
  const { tilt, ax, rest, cx0, cy0, cz0, steps } = SAX
  const cr = Math.cos(tilt), sr = Math.sin(tilt), cxA = Math.cos(ax), sxA = Math.sin(ax)
  const o = [0, 0, 0]
  const P = model.pts
  const bbox = (a: number) => {
    const ca = Math.cos(a), sa = Math.sin(a)
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9
    for (let i = 0; i < P.length / 7; i += 7) { // 7점마다 샘플(속도) — 슬롯의 1.03배 여유가 오차를 덮는다
      const q = i * 7
      saxXf(P[q]! - cx0, P[q + 1]! - cy0, P[q + 2]! - cz0, ca, sa, cr, sr, cxA, sxA, o)
      if (o[0]! < mnx) mnx = o[0]!
      if (o[0]! > mxx) mxx = o[0]!
      if (o[1]! < mny) mny = o[1]!
      if (o[1]! > mxy) mxy = o[1]!
    }
    return [mnx, mxx, mny, mxy] as const
  }
  const cxt: number[] = [], cyt: number[] = []
  let umny = 1e9, umxy = -1e9, hx = 0, hy = 0
  for (let k = 0; k < steps; k++) {
    const b = bbox((k / steps) * Math.PI * 2)
    cxt.push(+((b[0] + b[1]) / 2).toFixed(4))
    cyt.push(+((b[2] + b[3]) / 2).toFixed(4))
    umny = Math.min(umny, b[2]); umxy = Math.max(umxy, b[3])
    hx = Math.max(hx, (b[1] - b[0]) / 2); hy = Math.max(hy, (b[3] - b[2]) / 2)
  }
  const r = bbox(rest)
  const uh = (umxy - umny) * 1.03
  return {
    k: +((2 * hy * 1.03) / uh).toFixed(4),
    ar: +(hx / hy).toFixed(4),
    h: +(2 * hy * 1.03).toFixed(4),
    cx: +((r[0] + r[1]) / 2).toFixed(4),
    cy: +((r[2] + r[3]) / 2).toFixed(4),
    cxt, cyt,
  }
}

/** 제목 글자 10개 + 색소폰 1개 = 11음. [글자, 음이름, 변화음(-1=♭), 높은음자리표 옥타브, 리듬(e=8분, dh=점2분)]
 *  C단조 ii–V–i: Dm7♭5(D F A♭ C) → G7(B♮ G F D) → Cm7(E♭ G C). 4/4 두 마디. */
export const HERO_NOTES: [string, string, number, number, string][] = [
  ["B", "D", 0, 4, "e"],
  ["l", "F", 0, 4, "e"],
  ["u", "A", -1, 4, "e"],
  ["e", "C", 0, 5, "e"],
  ["N", "B", 0, 4, "e"],
  ["o", "G", 0, 4, "e"],
  ["t", "F", 0, 4, "e"],
  ["e", "D", 0, 4, "e"],
  ["s", "E", -1, 4, "e"],
  [".", "G", 0, 4, "e"],
  ["sax", "C", 0, 5, "dh"],
]
