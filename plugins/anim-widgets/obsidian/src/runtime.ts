// 블로그 anim.inline.ts를 Obsidian용으로 옮긴 런타임. 위젯 동작(단계 진행·rAF 루프·cycle/hold·HiDPI·reduced-motion)은 블로그와 같다.
// 블로그와 다른 점은 Host 하나로 모았다: 정리(window.addCleanup → Component.register), 모듈 로딩(import(url) → Blob import),
// 테마 신호(themechange → css-change), 색 읽기(documentElement → 위젯 루트 기준).
import type { AnimSpec, CanvasSpec, StepsSpec, VideoSpec } from "@blog/parse"
import { makeUtil, type Util } from "../../src/util"

export type Draw = (ctx: CanvasRenderingContext2D, frame: Frame) => void
interface Frame {
  t: number
  progress: number
  width: number
  height: number
  colors: Record<string, string>
  reduced: boolean
  util: Util
}

export interface Host {
  register(cleanup: () => void): void
  loadDraw(src: string): Promise<Draw>
  resolveUrl(name: string): string | undefined
  onThemeChange(fn: () => void): void
  onSourceChange(src: string, fn: () => void): void
}

const COLOR_VARS = ["light", "lightgray", "gray", "darkgray", "dark", "secondary", "tertiary", "highlight"]

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

// 주의: Obsidian 변수는 hsl(calc(...))·color-mix처럼 캔버스가 못 읽는 꼴일 수 있어 color 속성에 태워 rgb로 정규화한다.
function readColors(root: HTMLElement): Record<string, string> {
  const probe = root.createSpan({ attr: { "aria-hidden": "true" } })
  probe.style.display = "none"
  const colors: Record<string, string> = {}
  for (const name of COLOR_VARS) {
    probe.style.color = `var(--${name})`
    colors[name] = getComputedStyle(probe).color
  }
  colors.font = getComputedStyle(root).getPropertyValue("--bodyFont").trim() || "sans-serif"
  colors.mono = getComputedStyle(root).getPropertyValue("--codeFont").trim() || "monospace"
  probe.remove()
  return colors
}

function onVisible(host: Host, el: Element, fn: (visible: boolean) => void) {
  // 주의: 비율이 임계 아래로 내려갈 때도 isIntersecting이 true일 수 있어 비율로 판정하고, 상태가 바뀔 때만 알린다.
  let shown: boolean | undefined
  const io = new IntersectionObserver(
    ([entry]) => {
      const visible = (entry?.intersectionRatio ?? 0) >= 0.15
      if (visible === shown) return
      shown = visible
      fn(visible)
    },
    { threshold: [0, 0.15] },
  )
  io.observe(el)
  host.register(() => io.disconnect())
}

function controlButton(bar: HTMLElement, label: string, glyph: string, onClick: () => void) {
  const button = bar.createEl("button", { cls: "anim-btn", text: glyph, attr: { type: "button", "aria-label": label } })
  button.addEventListener("click", onClick)
  return button
}

/** build-nodes.ts가 빌드 시점에 만드는 figure와 같은 DOM을 그린다. */
function figure(el: HTMLElement, spec: AnimSpec, attrs: Record<string, string>) {
  const root = el.createEl("figure", { cls: ["anim", `anim-${spec.kind}`], attr: attrs })
  return {
    root,
    caption: () => spec.caption && root.createEl("figcaption", { cls: "anim-caption", text: spec.caption }),
  }
}

function mountSteps(el: HTMLElement, spec: StepsSpec, host: Host) {
  const { root, caption } = figure(el, spec, { role: "group", "aria-label": spec.alt })
  const scene = root.createDiv({ cls: "anim-scene" })
  // parse.ts가 script·on*을 이미 막았다. DOMParser 문서의 스크립트는 실행되지 않는다.
  // 주의: image/svg+xml로 읽으면 xmlns 없는 원고 SVG가 SVG 네임스페이스를 잃어 그려지지 않는다 — 블로그처럼 HTML 파서를 쓴다.
  const svg = new DOMParser().parseFromString(spec.scene, "text/html").body.firstElementChild
  if (!(svg instanceof SVGSVGElement)) throw new Error("scene SVG 파싱 실패")
  scene.appendChild(document.importNode(svg, true))
  const say = root.createEl("p", { cls: "anim-say", text: spec.steps[0]!.say, attr: { "aria-live": "polite" } })
  caption()

  const steps = spec.steps
  const live = scene.querySelector("svg")!
  let index = 0
  let timer: number | undefined
  let paused = !spec.autoplay

  const render = () => {
    const step = steps[index]!
    live.querySelectorAll<SVGElement>("[id]").forEach((node) => {
      node.classList.toggle("is-on", step.on.includes(node.id))
      node.classList.toggle("is-flow", step.flow.includes(node.id))
    })
    say.textContent = `${index + 1}/${steps.length} · ${step.say}`
  }
  const go = (n: number) => {
    index = (n + steps.length) % steps.length
    render()
  }

  const bar = createDiv({ cls: "anim-controls" })
  const stop = () => {
    window.clearInterval(timer)
    timer = undefined
    playButton.textContent = "▶"
    playButton.setAttribute("aria-label", "재생")
  }
  const start = () => {
    if (timer !== undefined || reducedMotion()) return
    timer = window.setInterval(() => go(index + 1), spec.interval)
    playButton.textContent = "❚❚"
    playButton.setAttribute("aria-label", "일시정지")
  }
  controlButton(bar, "이전 단계", "‹", () => {
    paused = true
    stop()
    go(index - 1)
  })
  const playButton = controlButton(bar, "재생", "▶", () => {
    if (reducedMotion()) return go(index + 1)
    paused = timer !== undefined
    if (paused) stop()
    else start()
  })
  controlButton(bar, "다음 단계", "›", () => {
    paused = true
    stop()
    go(index + 1)
  })
  root.insertBefore(bar, say.nextSibling)
  // 동작 줄이기면 마지막(요약) 단계에서 시작한다 — 정지 화면이 완성 그림이어야 한다.
  if (reducedMotion()) index = steps.length - 1
  render()

  // 다시 화면에 들어오면 처음부터 — 사용자가 멈췄거나 동작 줄이기면 위치를 지킨다.
  onVisible(host, root, (visible) => {
    if (!visible) return stop()
    if (paused || reducedMotion()) return
    go(0)
    start()
  })
  host.register(stop)
}

function mountCanvas(el: HTMLElement, spec: CanvasSpec, host: Host) {
  const { root, caption } = figure(el, spec, {})
  root.style.setProperty("--anim-height", `${spec.height}px`)
  const stage = root.createDiv({ cls: "anim-stage" })
  const canvas = stage.createEl("canvas", { attr: { role: "img", "aria-label": spec.alt } })
  caption()
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const { cycle, hold, src } = spec
  let draw: Draw | undefined
  let colors: Record<string, string> = {}
  let util = makeUtil(colors)
  let width = 0
  let height = 0
  let raf = 0
  let elapsed = 0
  let last = 0
  let visible = false
  let paused = false
  let alive = true

  const paint = () => {
    if (!draw || width === 0) return
    const reduced = reducedMotion()
    const t = reduced ? cycle : elapsed % (cycle + hold)
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    try {
      draw(ctx, { t, progress: Math.min(1, t / cycle), width, height, colors, reduced, util })
    } catch (e) {
      console.error(`[anim-preview] ${src}`, e)
      stopLoop()
    }
  }
  // 주의: 코드블록 프로세서는 문서에 붙기 전의 el을 받을 수 있다. 색은 실제로 배치된 뒤(ResizeObserver 첫 호출)에 읽는다.
  const resize = () => {
    colors = readColors(root)
    util = makeUtil(colors)
    const dpr = window.devicePixelRatio || 1
    width = stage.clientWidth
    height = stage.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    paint()
  }
  const tick = (now: number) => {
    // 첫 rAF 타임스탬프는 startLoop의 performance.now()보다 이를 수 있다 → 음수면 progress < 0이 된다.
    elapsed += Math.min(100, Math.max(0, now - last)) // 상한: 탭 복귀 시 시간이 튀지 않게
    last = now
    paint()
    raf = requestAnimationFrame(tick)
  }
  const startLoop = () => {
    if (raf || !draw || !visible || paused || reducedMotion()) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
  const stopLoop = () => {
    cancelAnimationFrame(raf)
    raf = 0
  }

  const bar = stage.createDiv({ cls: "anim-controls anim-overlay" })
  const toggle = controlButton(bar, "일시정지", "❚❚", () => {
    paused = !paused
    toggle.textContent = paused ? "▶" : "❚❚"
    toggle.setAttribute("aria-label", paused ? "재생" : "일시정지")
    if (paused) stopLoop()
    else startLoop()
  })
  if (reducedMotion()) bar.hidden = true

  const ro = new ResizeObserver(resize)
  ro.observe(stage)
  host.onThemeChange(() => {
    colors = readColors(root)
    util = makeUtil(colors)
    paint()
  })
  onVisible(host, root, (v) => {
    visible = v
    if (!v) return stopLoop()
    if (!paused) elapsed = 0 // 다시 화면에 들어오면 처음부터
    startLoop()
  })
  host.register(() => {
    alive = false
    stopLoop()
    ro.disconnect()
  })

  const load = () =>
    host
      .loadDraw(src)
      .then((fn) => {
        if (!alive) return
        draw = fn
        bar.hidden = reducedMotion()
        stage.querySelector(".anim-error")?.remove()
        resize()
        startLoop()
      })
      .catch((e: Error) => {
        console.error(`[anim-preview] ${src} 로드 실패`, e)
        draw = undefined
        stopLoop()
        bar.hidden = true
        stage.querySelector(".anim-error")?.remove()
        stage.prepend(createEl("p", { cls: "anim-error", text: `anim: ${src} 로드 실패 — ${e.message}` }))
      })
  // 블로그에 없는 기능: 그리기 파일을 저장하면 노트를 다시 열지 않아도 바로 다시 그린다.
  host.onSourceChange(src, () => void load())
  void load()
}

function mountVideo(el: HTMLElement, spec: VideoSpec, host: Host) {
  const { root, caption } = figure(el, spec, {})
  const url = host.resolveUrl(spec.src)
  if (!url) throw new Error(`자산을 찾지 못함 (${spec.src})`)
  const poster = spec.poster ? host.resolveUrl(spec.poster) : undefined
  const video = root.createEl("video", {
    attr: { src: url, "aria-label": spec.alt, loop: "", playsinline: "", preload: "metadata", ...(poster ? { poster } : {}) },
  })
  caption()
  video.muted = true
  if (reducedMotion()) {
    video.controls = true
    return
  }
  onVisible(host, video, (visible) => {
    if (visible) void video.play().catch(() => (video.controls = true))
    else video.pause()
  })
  host.register(() => video.pause())
}

export function mount(el: HTMLElement, spec: AnimSpec, host: Host) {
  if (spec.kind === "steps") mountSteps(el, spec, host)
  else if (spec.kind === "canvas") mountCanvas(el, spec, host)
  else mountVideo(el, spec, host)
}
