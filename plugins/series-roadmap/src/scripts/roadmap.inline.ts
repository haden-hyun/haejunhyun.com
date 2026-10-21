// series-roadmap 연결선 진입점.
// 주의: 정리는 window.addCleanup에 맡긴다 — Quartz가 prenav에서 호출한다.
import { initRoadmap } from "../core/client"

function setup() {
  document.querySelectorAll<HTMLElement>('.series-roadmap .rm[data-roadmap-init="true"]').forEach((nav) => {
    nav.removeAttribute("data-roadmap-init")
    initRoadmap(nav, (fn) => window.addCleanup(fn))
  })
}

document.addEventListener("nav", setup)
document.addEventListener("render", setup)
