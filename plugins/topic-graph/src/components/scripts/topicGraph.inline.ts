// 업스트림 graph의 사이드바 로컬 그래프만 걷어 낸다. ⌘G 전역 모달(.global-graph-outer)과 키 처리는 그대로 둔다.
// 주의: 업스트림 리스너는 CDN 로드 뒤에 붙어 이 스크립트가 항상 먼저 돈다. .graph 자체는 지우지 말 것 — 모달이 그 안에 있다.
function removeUpstreamLocal() {
  for (const outer of document.querySelectorAll(".graph > .graph-outer")) outer.remove()
}
removeUpstreamLocal()

// 데스크톱 우측 island에 TOC와 GRAPH가 다 안 들어가면 GRAPH를 숨긴다(⌘G는 남는다). 숨겨도 넘치면 긴 TOC 탓이라 그대로 둔다.
const DESKTOP = "(min-width: 1201px)"
function fitRight() {
  for (const panel of document.querySelectorAll<HTMLElement>(".sidebar.right .topic-graph")) {
    const island = panel.closest<HTMLElement>(".sidebar")
    panel.classList.remove("tg-overflow")
    if (!island || !window.matchMedia(DESKTOP).matches) continue
    if (island.scrollHeight > island.clientHeight + 1) panel.classList.add("tg-overflow")
  }
}
fitRight()
let fitFrame = 0
const queueFit = () => {
  if (!fitFrame) fitFrame = requestAnimationFrame(() => ((fitFrame = 0), fitRight()))
}
window.addEventListener("resize", queueFit, { passive: true })
document.fonts?.ready.then(queueFit)

function setup() {
  removeUpstreamLocal()
  fitRight()
  // TOC 접기·펼치기처럼 TOC 높이가 바뀌면 다시 잰다.
  const toc = document.querySelector(".sidebar.right .toc")
  if (toc && "ResizeObserver" in window) {
    const ro = new ResizeObserver(queueFit)
    ro.observe(toc)
    window.addCleanup(() => ro.disconnect())
  }
  for (const box of document.querySelectorAll<HTMLElement>(".topic-graph-box"))
    for (const svg of box.querySelectorAll("svg")) bind(box, svg)
}

// 마우스: hover·포커스 = 툴팁, 클릭 = 이동. 터치: 첫 탭 = 툴팁, 같은 점 두 번째 탭 = 이동, 바깥 탭 = 해제.
function bind(box: HTMLElement, svg: SVGSVGElement) {
  const tip = box.querySelector<HTMLElement>(".topic-graph-tip")
  if (!tip) return
  let armed: SVGGElement | null = null
  let lastPointer = "mouse"

  const show = (n: SVGGElement) => {
    tip.textContent = n.dataset.tip ?? ""
    if (n.dataset.tags) {
      const tags = document.createElement("span")
      tags.className = "topic-graph-tip-tags"
      tags.textContent = " · " + n.dataset.tags
      tip.appendChild(tags)
    }
    tip.hidden = false
    const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width
    const x = Number(n.dataset.x) * scale
    const y = Number(n.dataset.y) * scale
    const w = tip.offsetWidth
    tip.style.left = `${Math.max(0, Math.min(box.clientWidth - w, x - w / 2))}px`
    tip.style.top = `${y > 60 * scale ? y - tip.offsetHeight - 12 : y + 14}px`
  }
  const hide = () => {
    tip.hidden = true
  }
  const disarm = () => {
    armed?.classList.remove("armed")
    armed = null
    hide()
  }
  const go = (n: SVGGElement, newTab: boolean) => {
    const href = n.dataset.href
    if (!href || n.classList.contains("current")) return
    const url = new URL(href, window.location.toString())
    if (newTab) window.open(url, "_blank")
    else if (window.spaNavigate) window.spaNavigate(url)
    else window.location.assign(url)
  }

  const onPointerDown = (e: PointerEvent) => {
    lastPointer = e.pointerType
  }
  const onClick = (e: MouseEvent) => {
    const n = (e.target as Element).closest<SVGGElement>(".tg-n")
    if (!n) return
    e.stopPropagation()
    if (lastPointer !== "touch") return go(n, e.ctrlKey || e.metaKey)
    if (armed === n) {
      disarm()
      return go(n, false)
    }
    disarm()
    armed = n
    n.classList.add("armed")
    show(n)
  }
  const onOver = (e: PointerEvent) => {
    if (e.pointerType === "touch") return
    const n = (e.target as Element).closest<SVGGElement>(".tg-n")
    if (n) show(n)
  }
  const onOut = (e: PointerEvent) => {
    if (e.pointerType !== "touch" && !armed) hide()
  }
  const onKey = (e: KeyboardEvent) => {
    const n = (e.target as Element).closest<SVGGElement>(".tg-n")
    if (n && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      go(n, e.ctrlKey || e.metaKey)
    }
  }
  const onFocus = (e: FocusEvent) => {
    const n = (e.target as Element).closest<SVGGElement>(".tg-n")
    if (n) show(n)
  }
  const onBlur = () => {
    if (!armed) hide()
  }
  const onDocClick = (e: MouseEvent) => {
    if (armed && !box.contains(e.target as Node)) disarm()
  }

  svg.addEventListener("pointerdown", onPointerDown)
  svg.addEventListener("click", onClick)
  svg.addEventListener("pointerover", onOver)
  svg.addEventListener("pointerout", onOut)
  svg.addEventListener("keydown", onKey)
  svg.addEventListener("focusin", onFocus)
  svg.addEventListener("focusout", onBlur)
  document.addEventListener("click", onDocClick)
  window.addCleanup(() => {
    svg.removeEventListener("pointerdown", onPointerDown)
    svg.removeEventListener("click", onClick)
    svg.removeEventListener("pointerover", onOver)
    svg.removeEventListener("pointerout", onOut)
    svg.removeEventListener("keydown", onKey)
    svg.removeEventListener("focusin", onFocus)
    svg.removeEventListener("focusout", onBlur)
    document.removeEventListener("click", onDocClick)
  })
}

document.addEventListener("nav", setup)
document.addEventListener("render", removeUpstreamLocal)
