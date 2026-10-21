// 블로그 anim.inline.ts를 Obsidian용으로 옮긴 런타임. 위젯 동작은 블로그와 같은 코어(src/runtime/core.ts)를 쓴다.
// 블로그와 다른 점은 Host 하나로 모았다: 정리(window.addCleanup → Component.register), 모듈 로딩(import(url) → Blob import),
// 테마 신호(themechange → css-change), 색 읽기(documentElement → 위젯 루트 기준). DOM은 여기서 직접 만든다.
import type { AnimSpec, CanvasSpec, StepsSpec, VideoSpec } from "@blog/parse"
import { initCanvas, initSteps, initVideo, COLOR_VARS, reducedMotion, type Draw, type Host as CoreHost } from "../../src/runtime/core"

export type { Draw }

export interface Host {
  register(cleanup: () => void): void
  loadDraw(src: string): Promise<Draw>
  resolveUrl(name: string): string | undefined
  onThemeChange(fn: () => void): void
  onSourceChange(src: string, fn: () => void): void
}

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

const core = (host: Host, root: HTMLElement): CoreHost => ({
  tag: "anim-preview",
  register: (fn) => host.register(fn),
  onThemeChange: (fn) => host.onThemeChange(fn),
  readColors: () => readColors(root),
})

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

  initSteps(root, scene.querySelector("svg")!, say, spec.steps, spec.interval, spec.autoplay, core(host, root))
}

function mountCanvas(el: HTMLElement, spec: CanvasSpec, host: Host) {
  const { root, caption } = figure(el, spec, {})
  root.style.setProperty("--anim-height", `${spec.height}px`)
  const stage = root.createDiv({ cls: "anim-stage" })
  const canvas = stage.createEl("canvas", { attr: { role: "img", "aria-label": spec.alt } })
  caption()
  const { src } = spec
  const c = initCanvas(root, stage, canvas, src, spec.cycle, spec.hold, core(host, root))
  if (!c) return
  const { bar, use } = c

  const load = () =>
    host
      .loadDraw(src)
      .then((fn) => {
        if (!use(fn)) return
        bar.hidden = reducedMotion()
        stage.querySelector(".anim-error")?.remove()
      })
      .catch((e: Error) => {
        console.error(`[anim-preview] ${src} 로드 실패`, e)
        use(undefined)
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
  initVideo(video, core(host, root))
}

export function mount(el: HTMLElement, spec: AnimSpec, host: Host) {
  if (spec.kind === "steps") mountSteps(el, spec, host)
  else if (spec.kind === "canvas") mountCanvas(el, spec, host)
  else mountVideo(el, spec, host)
}
