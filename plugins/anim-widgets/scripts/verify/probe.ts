// 하니스 페이지에 들어가는 검사용 스크립트. draw가 progress의 순수 함수라는 점을 이용해
// 런타임 루프와 별개로 원하는 시점의 프레임을 결정론적으로 그려 본다.
import { makeUtil } from "../../src/util"

const COLOR_VARS = ["light", "lightgray", "gray", "darkgray", "dark", "secondary", "tertiary", "highlight"]

function readColors() {
  const style = getComputedStyle(document.documentElement)
  const colors: Record<string, string> = {}
  for (const n of COLOR_VARS) colors[n] = style.getPropertyValue(`--${n}`).trim()
  colors.font = style.getPropertyValue("--bodyFont").trim() || "sans-serif"
  colors.mono = style.getPropertyValue("--codeFont").trim() || "monospace"
  return colors
}

function digest(data: Uint8ClampedArray) {
  let h = 2166136261, inked = 0
  for (let i = 0; i < data.length; i++) {
    h = Math.imul(h ^ data[i]!, 16777619)
    if (i % 4 === 3 && data[i]! > 0) inked++
  }
  return { hash: (h >>> 0).toString(16), inked: inked / (data.length / 4) }
}

type DrawFn = (ctx: CanvasRenderingContext2D, f: object) => void
const cache = new Map<string, DrawFn>()

async function frame(src: string, o: { progress: number; width: number; height: number; cycle: number; reduced?: boolean }) {
  if (!cache.has(src)) cache.set(src, ((await import(src)) as { default: DrawFn }).default)
  const draw = cache.get(src)!
  const dpr = window.devicePixelRatio || 1
  const c = document.createElement("canvas")
  c.width = Math.round(o.width * dpr)
  c.height = Math.round(o.height * dpr)
  const ctx = c.getContext("2d")!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const colors = readColors()
  draw(ctx, { t: o.progress * o.cycle, progress: o.progress, width: o.width, height: o.height, colors, reduced: !!o.reduced, util: makeUtil(colors) })
  return { ...digest(ctx.getImageData(0, 0, c.width, c.height).data), png: c.toDataURL("image/png") }
}

function runtimeCanvas() {
  const c = document.querySelector<HTMLCanvasElement>(".anim-canvas canvas")
  if (!c || !c.width) return null
  return { ...digest(c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data), width: c.clientWidth, height: c.clientHeight }
}

;(window as unknown as { __probe: object }).__probe = { frame, runtimeCanvas }
