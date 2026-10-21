// ```anim 위젯 런타임. 동작 줄이기·화면 밖 정지·테마 전환을 여기서 한 번에 처리한다.
// 위젯 동작은 ../runtime/core에 있고, 여기서는 빌드 시점에 만든 figure DOM(data-*)을 찾아 코어에 넘긴다.
// 주의: 정리는 window.addCleanup에 맡긴다 — Quartz가 prenav에서 호출한다.

import { initCanvas, initSteps, initVideo, readColors, type Draw, type Host, type Step } from "../runtime/core"

const host: Host = {
  tag: "anim",
  register: (cleanup) => window.addCleanup(cleanup),
  onThemeChange: (fn) => {
    document.addEventListener("themechange", fn)
    window.addCleanup(() => document.removeEventListener("themechange", fn))
  },
  readColors,
}

function setupSteps(root: HTMLElement) {
  const steps = JSON.parse(root.dataset.steps ?? "[]") as Step[]
  const svg = root.querySelector("svg")
  const say = root.querySelector<HTMLElement>(".anim-say")
  if (!svg || !say || steps.length === 0) return
  const bar = initSteps(root, svg, say, steps, Number(root.dataset.interval) || 1800, root.dataset.autoplay !== "false", host)
  window.addCleanup(() => bar.remove())
}

function setupCanvas(root: HTMLElement) {
  const canvas = root.querySelector("canvas")
  const stage = root.querySelector<HTMLElement>(".anim-stage")
  const src = root.dataset.src
  if (!canvas || !stage || !src) return
  const c = initCanvas(root, stage, canvas, src, Number(root.dataset.cycle) || 4000, Number(root.dataset.hold ?? 2000), host)
  if (!c) return
  window.addCleanup(() => c.bar.remove())

  import(/* @vite-ignore */ new URL(src, document.baseURI).href)
    .then((mod: { default?: Draw }) => {
      if (typeof mod.default === "function") c.use(mod.default)
    })
    .catch((e) => {
      console.error(`[anim] ${src} 로드 실패`, e)
      const fallback = document.createElement("p")
      fallback.className = "anim-say"
      fallback.textContent = canvas.getAttribute("aria-label") ?? ""
      stage.replaceWith(fallback)
    })
}

function setup() {
  document.querySelectorAll<HTMLElement>('.anim[data-needs-init="true"]').forEach((root) => {
    root.removeAttribute("data-needs-init")
    if (root.classList.contains("anim-steps")) setupSteps(root)
    else if (root.classList.contains("anim-canvas")) setupCanvas(root)
    else if (root.classList.contains("anim-video")) {
      const video = root.querySelector("video")
      if (video) initVideo(video, host)
    }
  })
}

document.addEventListener("nav", setup)
document.addEventListener("render", setup)
