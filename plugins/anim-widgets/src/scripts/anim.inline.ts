// ```anim 위젯 런타임. 동작 줄이기·화면 밖 정지·테마 전환을 여기서 한 번에 처리한다.
// 주의: 정리는 window.addCleanup에 맡긴다 — Quartz가 prenav에서 호출한다.

import { makeUtil, type Util } from "../util"

type Draw = (ctx: CanvasRenderingContext2D, frame: Frame) => void
interface Frame {
  t: number
  progress: number
  width: number
  height: number
  colors: Record<string, string>
  reduced: boolean
  util: Util
}

const COLOR_VARS = ["light", "lightgray", "gray", "darkgray", "dark", "secondary", "tertiary", "highlight"]

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

function readColors(): Record<string, string> {
  const style = getComputedStyle(document.documentElement)
  const colors: Record<string, string> = {}
  for (const name of COLOR_VARS) colors[name] = style.getPropertyValue(`--${name}`).trim()
  colors.font = style.getPropertyValue("--bodyFont").trim() || "sans-serif"
  colors.mono = style.getPropertyValue("--codeFont").trim() || "monospace"
  return colors
}

function onVisible(el: Element, fn: (visible: boolean) => void) {
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
  window.addCleanup(() => io.disconnect())
}

function controlButton(bar: HTMLElement, label: string, glyph: string, onClick: () => void) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "anim-btn"
  button.setAttribute("aria-label", label)
  button.textContent = glyph
  button.addEventListener("click", onClick)
  bar.appendChild(button)
  return button
}

function initSteps(root: HTMLElement) {
  const steps = JSON.parse(root.dataset.steps ?? "[]") as { say: string; on: string[]; flow: string[] }[]
  const svg = root.querySelector("svg")
  const say = root.querySelector<HTMLElement>(".anim-say")
  if (!svg || !say || steps.length === 0) return

  const interval = Number(root.dataset.interval) || 1800
  const autoplay = root.dataset.autoplay !== "false"
  let index = 0
  let timer: number | undefined
  let paused = !autoplay

  const render = () => {
    const step = steps[index]!
    svg.querySelectorAll<SVGElement>("[id]").forEach((el) => {
      el.classList.toggle("is-on", step.on.includes(el.id))
      el.classList.toggle("is-flow", step.flow.includes(el.id))
    })
    say.textContent = `${index + 1}/${steps.length} · ${step.say}`
  }
  const go = (n: number) => {
    index = (n + steps.length) % steps.length
    render()
  }

  const bar = document.createElement("div")
  bar.className = "anim-controls"
  const stop = () => {
    window.clearInterval(timer)
    timer = undefined
    playButton.textContent = "▶"
    playButton.setAttribute("aria-label", "재생")
  }
  const start = () => {
    if (timer !== undefined || reducedMotion()) return
    timer = window.setInterval(() => go(index + 1), interval)
    playButton.textContent = "❚❚"
    playButton.setAttribute("aria-label", "일시정지")
  }
  controlButton(bar, "이전 단계", "‹", () => {
    paused = true
    stop()
    go(index - 1)
  })
  const playButton = controlButton(bar, "재생", "▶", () => {
    if (reducedMotion()) return go(index + 1) // 동작 줄이기: 재생 = 한 단계 넘김
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
  onVisible(root, (visible) => {
    if (!visible) return stop()
    if (paused || reducedMotion()) return
    go(0)
    start()
  })
  window.addCleanup(() => {
    stop()
    bar.remove()
  })
}

function initCanvas(root: HTMLElement) {
  const canvas = root.querySelector("canvas")
  const stage = root.querySelector<HTMLElement>(".anim-stage")
  const src = root.dataset.src
  if (!canvas || !stage || !src) return

  const cycle = Number(root.dataset.cycle) || 4000
  const hold = Number(root.dataset.hold ?? 2000)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  let draw: Draw | undefined
  let colors = readColors()
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
      console.error(`[anim] ${src}`, e)
      stopLoop()
    }
  }
  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    width = stage.clientWidth
    height = stage.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    paint()
  }
  const tick = (now: number) => {
    elapsed += Math.min(100, now - last) // 탭 복귀 시 시간이 튀지 않게 상한을 둔다
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

  const bar = document.createElement("div")
  bar.className = "anim-controls anim-overlay"
  const toggle = controlButton(bar, "일시정지", "❚❚", () => {
    paused = !paused
    toggle.textContent = paused ? "▶" : "❚❚"
    toggle.setAttribute("aria-label", paused ? "재생" : "일시정지")
    if (paused) stopLoop()
    else startLoop()
  })
  if (reducedMotion()) bar.hidden = true
  stage.appendChild(bar)

  const ro = new ResizeObserver(resize)
  ro.observe(stage)
  const onTheme = () => {
    colors = readColors()
    util = makeUtil(colors)
    paint()
  }
  document.addEventListener("themechange", onTheme)
  onVisible(root, (v) => {
    visible = v
    if (!v) return stopLoop()
    if (!paused) elapsed = 0 // 다시 화면에 들어오면 처음부터
    startLoop()
  })
  window.addCleanup(() => {
    alive = false
    stopLoop()
    ro.disconnect()
    document.removeEventListener("themechange", onTheme)
    bar.remove()
  })

  import(/* @vite-ignore */ new URL(src, document.baseURI).href)
    .then((mod: { default?: Draw }) => {
      if (!alive || typeof mod.default !== "function") return
      draw = mod.default
      resize()
      startLoop()
    })
    .catch((e) => {
      console.error(`[anim] ${src} 로드 실패`, e)
      const fallback = document.createElement("p")
      fallback.className = "anim-say"
      fallback.textContent = canvas.getAttribute("aria-label") ?? ""
      stage.replaceWith(fallback)
    })
}

function initVideo(root: HTMLElement) {
  const video = root.querySelector("video")
  if (!video) return
  video.muted = true // 주의: 속성만으로는 일부 브라우저가 자동재생을 막는다
  if (reducedMotion()) {
    video.controls = true
    return
  }
  onVisible(video, (visible) => {
    if (visible) void video.play().catch(() => (video.controls = true))
    else video.pause()
  })
  window.addCleanup(() => video.pause())
}

function setup() {
  document.querySelectorAll<HTMLElement>('.anim[data-needs-init="true"]').forEach((root) => {
    root.removeAttribute("data-needs-init")
    if (root.classList.contains("anim-steps")) initSteps(root)
    else if (root.classList.contains("anim-canvas")) initCanvas(root)
    else if (root.classList.contains("anim-video")) initVideo(root)
  })
}

document.addEventListener("nav", setup)
document.addEventListener("render", setup)
