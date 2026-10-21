// ```anim 위젯 공용 코어. 블로그(anim.inline.ts)·Obsidian 미리보기(obsidian/src/runtime.ts)가 같이 쓴다.
// 위젯 동작(단계 진행·rAF 루프·cycle/hold·HiDPI·동작 줄이기·화면 밖 정지)은 여기 한 벌만 둔다.
// 플랫폼 차이(정리 등록·테마 신호·색 읽기)는 Host로 받는다. 표준 DOM만 쓴다.
import { makeUtil, type Util } from "../util"

export type Draw = (ctx: CanvasRenderingContext2D, frame: Frame) => void
export interface Frame {
  t: number
  progress: number
  width: number
  height: number
  colors: Record<string, string>
  reduced: boolean
  util: Util
}

export interface Host {
  tag: string // 콘솔 로그 접두어
  register(cleanup: () => void): void
  onThemeChange(fn: () => void): void
  readColors(): Record<string, string>
}

export const COLOR_VARS = ["light", "lightgray", "gray", "darkgray", "dark", "secondary", "tertiary", "highlight", "cat1", "cat2", "cat3", "cat4"]

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** documentElement의 Quartz 테마 변수를 읽는다(블로그·검증기 프로브). */
export function readColors(): Record<string, string> {
  const style = getComputedStyle(document.documentElement)
  const colors: Record<string, string> = {}
  for (const name of COLOR_VARS) colors[name] = style.getPropertyValue(`--${name}`).trim()
  colors.font = style.getPropertyValue("--bodyFont").trim() || "sans-serif"
  colors.mono = style.getPropertyValue("--codeFont").trim() || "monospace"
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
  const button = document.createElement("button")
  button.type = "button"
  button.className = "anim-btn"
  button.setAttribute("aria-label", label)
  button.textContent = glyph
  button.addEventListener("click", onClick)
  bar.appendChild(button)
  return button
}

export interface Step {
  say: string
  on: string[]
  flow: string[]
}

/** 단계 진행 컨트롤러를 붙이고 버튼 줄(bar)을 돌려준다. bar는 say 바로 뒤에 들어간다. */
export function initSteps(root: HTMLElement, svg: SVGSVGElement, say: HTMLElement, steps: Step[], interval: number, autoplay: boolean, host: Host) {
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
  onVisible(host, root, (visible) => {
    if (!visible) return stop()
    if (paused || reducedMotion()) return
    go(0)
    start()
  })
  host.register(stop)
  return bar
}

/**
 * canvas 루프를 붙인다. 그리기 함수는 플랫폼이 불러와 use()로 넘긴다(undefined면 루프를 멈춘다).
 * use()는 이미 정리된 위젯이면 아무것도 하지 않고 false를 돌려준다. ctx를 못 얻으면 undefined.
 */
export function initCanvas(root: HTMLElement, stage: HTMLElement, canvas: HTMLCanvasElement, src: string, cycle: number, hold: number, host: Host) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

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
      console.error(`[${host.tag}] ${src}`, e)
      stopLoop()
    }
  }
  const readTheme = () => {
    colors = host.readColors()
    util = makeUtil(colors)
  }
  // 주의: Obsidian 코드블록 프로세서는 문서에 붙기 전의 el을 받을 수 있다. 색은 실제로 배치된 뒤(ResizeObserver 첫 호출)에 읽는다.
  const resize = () => {
    readTheme()
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
  host.onThemeChange(() => {
    readTheme()
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

  const use = (fn: Draw | undefined) => {
    if (!alive) return false
    draw = fn
    if (fn) {
      resize()
      startLoop()
    } else stopLoop()
    return true
  }
  return { bar, use }
}

export function initVideo(video: HTMLVideoElement, host: Host) {
  video.muted = true // 주의: 속성만으로는 일부 브라우저가 자동재생을 막는다
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
