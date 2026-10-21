// 하니스 페이지에 들어가는 검사용 스크립트. draw가 progress의 순수 함수라는 점을 이용해
// 런타임 루프와 별개로 원하는 시점의 프레임을 결정론적으로 그려 본다.
import { makeUtil } from "../../src/util"
import { readColors } from "../../src/runtime/core"

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

type FrameOpts = { progress: number; width: number; height: number; cycle: number; reduced?: boolean }

async function render(src: string, o: FrameOpts) {
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
  return { c, data: ctx.getImageData(0, 0, c.width, c.height).data }
}

// PNG는 테마 배경 위에 얹어 저장한다(투명 배경이면 다크 프레임이 흰 뷰어에서 흐리게 보인다). 해시·잉크는 원래 캔버스로 잰다.
async function frame(src: string, o: FrameOpts) {
  const { c, data } = await render(src, o)
  const out = document.createElement("canvas")
  out.width = c.width
  out.height = c.height
  const octx = out.getContext("2d")!
  octx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--light").trim() || "white"
  octx.fillRect(0, 0, out.width, out.height)
  octx.drawImage(c, 0, 0)
  return { ...digest(data), png: out.toDataURL("image/png") }
}

// 재생 구간(progress 0→1)을 stepMs 간격으로 그려 같은 프레임이 가장 오래 이어진 구간을 찾는다.
// progress 1까지 이어지는 마지막 정지는 결론 화면(hold 앞 머묾)이라 세지 않는다.
async function longestFreeze(src: string, o: Omit<FrameOpts, "progress">, stepMs = 50) {
  const n = Math.ceil(o.cycle / stepMs)
  let prev = "", runStart = 0, best = { ms: 0, from: 0, to: 0 }
  for (let k = 0; k <= n; k++) {
    const p = Math.min(1, (k * stepMs) / o.cycle)
    const { hash } = digest((await render(src, { ...o, progress: p })).data)
    if (hash !== prev) {
      const ms = (k - 1 - runStart) * stepMs
      if (k > 0 && ms > best.ms) best = { ms, from: (runStart * stepMs) / o.cycle, to: ((k - 1) * stepMs) / o.cycle }
      prev = hash
      runStart = k
    }
  }
  return best
}

// 화면에 붙은 런타임 캔버스와 probe 캔버스는 래스터 경로가 달라(GPU·CPU) 플랫폼에 따라
// 안티에일리어싱 픽셀이 채널값 ±1~2 어긋난다. 그래서 해시 대신 픽셀 차이로 비교한다.
async function compareRuntime(src: string, o: FrameOpts) {
  const rc = document.querySelector<HTMLCanvasElement>(".anim-canvas canvas")
  if (!rc) return null
  const a = rc.getContext("2d")!.getImageData(0, 0, rc.width, rc.height).data
  const { data: b } = await render(src, o)
  if (a.length !== b.length) return { sameSize: false, diffRatio: 1, maxDelta: 255 }
  let diff = 0, maxDelta = 0
  for (let i = 0; i < a.length; i += 4) {
    let d = 0
    for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(a[i + k]! - b[i + k]!))
    if (d) { diff++; if (d > maxDelta) maxDelta = d }
  }
  return { sameSize: true, diffRatio: diff / (a.length / 4), maxDelta }
}

function runtimeCanvas() {
  const c = document.querySelector<HTMLCanvasElement>(".anim-canvas canvas")
  if (!c || !c.width) return null
  return { ...digest(c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data), width: c.clientWidth, height: c.clientHeight }
}

;(window as unknown as { __probe: object }).__probe = { frame, longestFreeze, runtimeCanvas, compareRuntime }
