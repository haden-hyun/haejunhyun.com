// canvas draw 함수에 frame.util로 넘기는 공용 도우미. 블로그 런타임과 Obsidian 미리보기가 같은 파일을 번들한다.
// 주의: 그리기 파일이 이 값들을 쓰므로 이름·시그니처를 바꾸면 기존 .js가 깨진다 — 추가만 한다.

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

/** 전체 진행률 p에서 [a, b] 구간의 진행률(0→1). 한 그림 안의 여러 단계를 나눌 때 쓴다. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

export const easeOut = (x: number) => 1 - (1 - x) * (1 - x)

/** 시드 고정 의사난수(mulberry32). Math.random 대신 쓴다 — 매 프레임 같은 그림이 나와야 한다. */
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface TextOpts {
  size?: number
  weight?: number
  mono?: boolean
  color?: string
  align?: CanvasTextAlign
  base?: CanvasTextBaseline
}

/** 테마 글꼴·색으로 글자 하나를 찍는다. color 기본값은 colors.darkgray. */
export function makeText(colors: Record<string, string>) {
  return (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: TextOpts = {}) => {
    ctx.font = `${o.weight ?? 400} ${o.size ?? 12}px ${o.mono ? colors.mono : colors.font}`
    ctx.fillStyle = o.color ?? colors.darkgray ?? "#333"
    ctx.textAlign = o.align ?? "left"
    ctx.textBaseline = o.base ?? "middle"
    ctx.fillText(s, x, y)
  }
}

export function makeUtil(colors: Record<string, string>) {
  return { clamp01, seg, lerp, ease, easeOut, rng, text: makeText(colors) }
}
export type Util = ReturnType<typeof makeUtil>
