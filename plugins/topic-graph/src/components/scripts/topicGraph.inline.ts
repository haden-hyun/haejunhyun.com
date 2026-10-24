// 주제 그래프 클라이언트.
// - 업스트림 graph의 사이드바 로컬 그래프 제거, 우측 island에 넘치면 GRAPH 숨김
// - 보이는 판에 d3-force를 붙여 진입·드래그·팬·줌·호버 이웃 강조를 처리한다
// - 확대 보기 <dialog> 열기·닫기·포커스 순환
import { forceLink, forceSimulation } from "d3-force"
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force"
import { clip, FONT, type Box } from "../../core/labels"

// 업스트림 graph의 사이드바 로컬 그래프만 걷어 낸다. ⌘G 전역 모달(.global-graph-outer)과 키 처리는 그대로 둔다.
// 주의: 업스트림 리스너는 CDN 로드 뒤에 붙어 이 스크립트가 항상 먼저 돈다. .graph 자체는 지우지 말 것 — 모달이 그 안에 있다.
function removeUpstreamLocal() {
  for (const outer of document.querySelectorAll(".graph > .graph-outer")) outer.remove()
}
removeUpstreamLocal()

// 보이는 판(tall/short)만 시뮬레이션을 붙인다 — 숨은 판은 미디어 쿼리·island 판정이 바뀔 때 붙는다. nav 전엔 null.
const SHORT = "(max-height: 760px)"
let bound: Set<SVGSVGElement> | null = null

// 데스크톱 우측 island에 TOC와 GRAPH가 다 안 들어가면 GRAPH를 숨긴다(⌘G는 남는다). 숨겨도 넘치면 긴 TOC 탓이라 그대로 둔다.
const DESKTOP = "(min-width: 1201px)"
function fitRight() {
  for (const panel of document.querySelectorAll<HTMLElement>(".sidebar.right .topic-graph")) {
    const island = panel.closest<HTMLElement>(".sidebar")
    panel.classList.remove("tg-overflow")
    if (!island || !window.matchMedia(DESKTOP).matches) continue
    if (island.scrollHeight > island.clientHeight + 1) panel.classList.add("tg-overflow")
  }
  bindVisible()
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
  bound = new Set()
  bindVisible()
  for (const panel of document.querySelectorAll<HTMLElement>(".topic-graph")) bindDialog(panel)
  const short = window.matchMedia(SHORT)
  short.addEventListener("change", bindVisible)
  window.addCleanup(() => short.removeEventListener("change", bindVisible))
}

function bindVisible() {
  if (!bound) return
  for (const box of document.querySelectorAll<HTMLElement>(".topic-graph-box"))
    for (const svg of box.querySelectorAll("svg")) {
      if (bound.has(svg) || svg.getClientRects().length === 0) continue
      bound.add(svg)
      bind(box, svg)
    }
}

// 확대 보기: 같은 그래프의 큰 판을 모달로 연다. 바깥은 showModal이 inert로 만들고, Tab 순환·포커스 복귀는 여기서 맡는다.
// 주의: 패널은 desktop-only라 800px 미만에서 display: none이다 — 그 안의 dialog는 열려도 안 그려지므로 여는 동안 body로 옮긴다.
function bindDialog(panel: HTMLElement) {
  const dialog = panel.querySelector<HTMLDialogElement>(".topic-graph-dialog")
  const open = panel.querySelector<HTMLButtonElement>(".topic-graph-expand")
  const close = dialog?.querySelector<HTMLButtonElement>(".topic-graph-close")
  if (!dialog || !open || !close) return
  let back: HTMLElement | null = null
  const onOpen = () => {
    back = document.activeElement instanceof HTMLElement ? document.activeElement : open
    document.body.appendChild(dialog)
    dialog.showModal()
    bindVisible()
  }
  const onClose = () => {
    panel.appendChild(dialog)
    back?.focus()
    back = null
  }
  const shut = () => dialog.close()
  // 판 바깥(::backdrop)을 누르면 click 대상이 dialog 자신이다 — 시트가 dialog를 꽉 채운다.
  const onBackdrop = (e: MouseEvent) => {
    if (e.target === dialog) dialog.close()
  }
  // ⌘G는 업스트림 전역 그래프가 받는다 — 모달 뒤에 열리지 않게 먼저 닫는다.
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") return dialog.close()
    if (e.key !== "Tab") return
    const stops = [...dialog.querySelectorAll<HTMLElement | SVGElement>("button, [tabindex='0']")].filter((el) => el.getClientRects().length > 0)
    const first = stops[0]
    const last = stops[stops.length - 1]
    if (!first || !last) return
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
  open.addEventListener("click", onOpen)
  close.addEventListener("click", shut)
  dialog.addEventListener("click", onBackdrop)
  dialog.addEventListener("close", onClose)
  dialog.addEventListener("keydown", onKey)
  window.addCleanup(() => {
    open.removeEventListener("click", onOpen)
    close.removeEventListener("click", shut)
    dialog.removeEventListener("click", onBackdrop)
    dialog.removeEventListener("close", onClose)
    dialog.removeEventListener("keydown", onKey)
    if (dialog.open) dialog.close()
  })
}

type SimNode = SimulationNodeDatum & { id: string; hx: number; hy: number; el: SVGGElement; rank: number }
type SimLink = SimulationLinkDatum<SimNode> & { el: SVGLineElement; rest: number; tree: boolean }

const REDUCE = "(prefers-reduced-motion: reduce)"
const K_MIN = 0.6
const K_MAX = 4
const DRAG_SLOP = 3
const HOME_MS = 320
const WHEEL_IDLE_MS = 700

// 빌드 타임 좌표가 곧 평형점이다 — 간선 정지 길이와 제자리 인력이 그 좌표에서 0이라 손대지 않으면 SVG 그대로 멈춰 있다.
function graph(svg: SVGSVGElement) {
  const world = svg.querySelector<SVGGElement>(".tg-world")!
  const nodes: SimNode[] = []
  const byId = new Map<string, SimNode>()
  for (const el of svg.querySelectorAll<SVGGElement>(".tg-n")) {
    const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(el.getAttribute("transform") ?? "")
    const hx = Number(m?.[1] ?? 0)
    const hy = Number(m?.[2] ?? 0)
    // 호버 라벨 우선순위: 현재 → 링크·시리즈 이웃 → 폴더·주제 → 형제 → 그 밖
    const rank = el.classList.contains("current") ? 0 : el.querySelector(".tg-direct") ? 1 : el.querySelector(".tg-sibling") ? 3 : el.querySelector(".tg-other") ? 4 : 2
    const n: SimNode = { id: el.dataset.id!, hx, hy, x: hx, y: hy, el, rank }
    nodes.push(n)
    byId.set(n.id, n)
  }
  const links: SimLink[] = []
  const adj = new Map<string, Set<string>>(nodes.map((n) => [n.id, new Set([n.id])]))
  for (const el of svg.querySelectorAll<SVGLineElement>(".tg-e")) {
    const a = byId.get(el.dataset.s!)
    const b = byId.get(el.dataset.t!)
    if (!a || !b) continue
    links.push({ source: a, target: b, el, rest: Math.hypot(a.hx - b.hx, a.hy - b.hy), tree: el.classList.contains("tg-tree") })
    adj.get(a.id)!.add(b.id)
    adj.get(b.id)!.add(a.id)
  }
  // 라벨은 자기 폴더 노드와의 빌드 타임 간격을 유지한 채 따라간다.
  const labels: { el: SVGTextElement; n: SimNode; dx: number; dy: number }[] = [...svg.querySelectorAll<SVGTextElement>(".tg-label")].flatMap((el) => {
    const n = byId.get(el.dataset.for!)
    return n ? [{ el, n, dx: Number(el.getAttribute("x")) - n.hx, dy: Number(el.getAttribute("y")) - n.hy }] : []
  })

  const draw = () => {
    for (const n of nodes) n.el.setAttribute("transform", `translate(${n.x!.toFixed(1)},${n.y!.toFixed(1)})`)
    for (const l of links) {
      const a = l.source as SimNode
      const b = l.target as SimNode
      l.el.setAttribute("x1", a.x!.toFixed(1))
      l.el.setAttribute("y1", a.y!.toFixed(1))
      l.el.setAttribute("x2", b.x!.toFixed(1))
      l.el.setAttribute("y2", b.y!.toFixed(1))
    }
    for (const l of labels) {
      l.el.setAttribute("x", (l.n.x! + l.dx).toFixed(1))
      l.el.setAttribute("y", (l.n.y! + l.dy).toFixed(1))
    }
  }

  // 제자리 인력은 alpha와 무관하게 건다 — alpha에 비례하면 식기 전에 집에 못 닿고 멈춘다.
  const home = () => {
    for (const n of nodes) {
      if (n.fx != null) continue
      n.vx! += (n.hx - n.x!) * 0.03
      n.vy! += (n.hy - n.y!) * 0.03
    }
  }
  // 식은 뒤 남은 오차가 보이면 조금 더 돌리고, 안 보이면 빌드 타임 좌표에 정확히 맞춘다.
  const settle = () => {
    if (nodes.some((n) => n.fx != null)) return
    const off = Math.max(...nodes.map((n) => Math.hypot(n.hx - n.x!, n.hy - n.y!)))
    if (off > 0.3) return void sim.alpha(0.05).restart()
    for (const n of nodes) {
      n.x = n.hx
      n.y = n.hy
      n.vx = n.vy = 0
    }
    draw()
  }
  const sim = forceSimulation<SimNode>(nodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(links)
        .distance((l) => l.rest)
        .strength((l) => (l.tree ? 0.7 : 0.3)),
    )
    .force("home", home)
    .velocityDecay(0.35)
    .alphaDecay(0.045)
    .on("tick", draw)
    .on("end", settle)
    .stop()

  let view = { k: 1, x: 0, y: 0 }
  const applyView = () => world.setAttribute("transform", `translate(${view.x.toFixed(2)},${view.y.toFixed(2)}) scale(${view.k.toFixed(3)})`)
  // 화면 ↔ viewBox 변환은 CTM으로 — 확대 판은 preserveAspectRatio 여백이 생긴다.
  const toView = (e: { clientX: number; clientY: number }) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse())
    return { x: p.x, y: p.y }
  }
  // 화면 이동·줌은 놓으면 원위치로 돌아온다 — 새 입력이 오면 진행 중인 복귀를 끊는다.
  let homeRaf = 0
  let homeTimer = 0
  const stopHome = () => {
    cancelAnimationFrame(homeRaf)
    clearTimeout(homeTimer)
  }
  const returnHome = (delay = 0) => {
    stopHome()
    homeTimer = window.setTimeout(() => {
      const from = view
      if (from.k === 1 && !from.x && !from.y) return
      if (window.matchMedia(REDUCE).matches) {
        view = { k: 1, x: 0, y: 0 }
        return applyView()
      }
      const t0 = performance.now()
      const step = (t: number) => {
        const q = Math.min(1, (t - t0) / HOME_MS)
        const e = 1 - (1 - q) ** 3
        view = { k: from.k + (1 - from.k) * e, x: from.x * (1 - e), y: from.y * (1 - e) }
        applyView()
        if (q < 1) homeRaf = requestAnimationFrame(step)
      }
      homeRaf = requestAnimationFrame(step)
    }, delay)
  }
  const zoomAt = (p: { x: number; y: number }, k: number) => {
    stopHome()
    k = Math.min(K_MAX, Math.max(K_MIN, k))
    view = { k, x: p.x - ((p.x - view.x) * k) / view.k, y: p.y - ((p.y - view.y) * k) / view.k }
    applyView()
  }

  const reduce = () => window.matchMedia(REDUCE).matches
  const entered = svg.dataset.entered === "1"
  const c = nodes.find((n) => n.el.classList.contains("current")) ?? nodes[0]
  if (c && !reduce() && !entered) {
    // 진입: 현재 노트 쪽으로 모였다가 제자리로 퍼진다.
    for (const n of nodes) {
      n.x = c.hx + (n.hx - c.hx) * 0.25
      n.y = c.hy + (n.hy - c.hy) * 0.25
    }
    draw()
    sim.alpha(1).restart()
  }
  svg.dataset.entered = "1"

  return {
    world,
    labels,
    nodes,
    byId,
    adj,
    sim,
    draw,
    reduce,
    toView,
    zoomAt,
    get view() {
      return view
    },
    returnHome,
    pan(dx: number, dy: number) {
      stopHome()
      view = { ...view, x: view.x + dx, y: view.y + dy }
      applyView()
    },
    reset() {
      stopHome()
      view = { k: 1, x: 0, y: 0 }
      applyView()
    },
    // 보이는 world 영역
    visible() {
      const vb = svg.viewBox.baseVal
      return { x: -view.x / view.k, y: -view.y / view.k, w: vb.width / view.k, h: vb.height / view.k }
    },
    // 노드의 화면 위치(box 기준 px)
    screenOf(n: SimNode, box: HTMLElement) {
      const p = new DOMPoint(n.x! * view.k + view.x, n.y! * view.k + view.y).matrixTransform(svg.getScreenCTM()!)
      const r = box.getBoundingClientRect()
      return { x: p.x - r.left, y: p.y - r.top }
    },
  }
}

// 마우스: hover·포커스 = 툴팁, 클릭 = 이동. 터치: 첫 탭 = 툴팁, 같은 점 두 번째 탭 = 이동, 바깥 탭 = 해제.
// 노드를 끌면 이웃이 간선을 따라 끌려오고 놓으면 제자리로 돌아온다. 빈 곳 끌기 = 팬, 휠·핀치 = 줌, 빈 곳 더블클릭 = 원위치.
function bind(box: HTMLElement, svg: SVGSVGElement) {
  const tip = box.querySelector<HTMLElement>(".topic-graph-tip")
  if (!tip) return
  const g = graph(svg)
  let armed: SVGGElement | null = null
  let lastPointer = "mouse"
  let hot: SVGGElement | null = null

  const nodeOf = (t: EventTarget | null) => (t as Element | null)?.closest?.<SVGGElement>(".tg-n") ?? null
  const simOf = (n: SVGGElement) => g.byId.get(n.dataset.id!)!

  const show = (n: SVGGElement) => {
    tip.textContent = n.dataset.tip ?? ""
    if (n.dataset.tags) {
      const tags = document.createElement("span")
      tags.className = "topic-graph-tip-tags"
      tags.textContent = " · " + n.dataset.tags
      tip.appendChild(tags)
    }
    tip.hidden = false
    const { x, y } = g.screenOf(simOf(n), box)
    const w = tip.offsetWidth
    tip.style.left = `${Math.max(0, Math.min(box.clientWidth - w, x - w / 2))}px`
    tip.style.top = `${y > tip.offsetHeight + 16 ? y - tip.offsetHeight - 12 : y + 14}px`
  }
  const hide = () => {
    tip.hidden = true
  }
  // 이웃 라벨: 상시 라벨이 없는 이웃에 이름을 단다. 다른 라벨·이웃 점·보이는 영역 밖과 겹치면 달지 않는다.
  const wide = svg.classList.contains("tg-wide")
  const CAP = wide ? 14 : 6
  const MAX = wide ? 28 : 16
  const layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
  layer.setAttribute("class", "tg-hover-labels")
  layer.setAttribute("aria-hidden", "true")
  g.world.appendChild(layer)
  const clearHover = () => {
    layer.replaceChildren()
    for (let i = g.labels.length - 1; i >= 0; i--) if (g.labels[i]!.el.classList.contains("tg-hover")) g.labels.splice(i, 1)
  }
  const overlap = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  const labelNear = (n: SVGGElement, near: Set<string>) => {
    const v = g.visible()
    const radius = (m: SimNode) => (m.rank === 0 ? 9 : (m.el.querySelector<SVGGraphicsElement>(":scope > :last-child")?.getBBox().width ?? 4) / 2)
    const taken: Box[] = []
    const shown = new Set<string>()
    // 툴팁(호버한 노드 이름)이 덮는 자리도 비운다.
    if (!tip.hidden) {
      const r = tip.getBoundingClientRect()
      const a = g.toView({ clientX: r.left, clientY: r.top })
      const b = g.toView({ clientX: r.right, clientY: r.bottom })
      const k = g.view.k
      taken.push({ x: (a.x - g.view.x) / k, y: (a.y - g.view.y) / k, w: (b.x - a.x) / k, h: (b.y - a.y) / k })
    }
    for (const l of svg.querySelectorAll<SVGTextElement>(".tg-labels .tg-label.near")) {
      const b = l.getBBox()
      taken.push({ x: b.x, y: b.y, w: b.width, h: b.height })
      shown.add(l.dataset.for!)
    }
    const dots = [...near].map((id) => {
      const m = g.byId.get(id)!
      const r = radius(m) + 1
      return { id, x: m.x! - r, y: m.y! - r, w: 2 * r, h: 2 * r }
    })
    const todo = [...near]
      .map((id) => g.byId.get(id)!)
      .filter((m) => m.id !== n.dataset.id && !shown.has(m.id))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, CAP)
    for (const m of todo) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "text")
      el.setAttribute("class", "tg-label tg-hover")
      el.setAttribute("font-size", String(FONT))
      el.textContent = clip(m.el.dataset.name ?? "", MAX)
      layer.appendChild(el)
      const w = el.getComputedTextLength()
      const gap = radius(m) + 3
      const spots: [number, number, "start" | "end" | "middle"][] = [
        [m.x! + gap, m.y! + FONT * 0.35, "start"],
        [m.x! - gap, m.y! + FONT * 0.35, "end"],
        [m.x!, m.y! + gap + FONT * 0.8, "middle"],
        [m.x!, m.y! - gap, "middle"],
      ]
      const fit = spots.find(([x, y, anchor]) => {
        const box = { x: anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2, y: y - FONT * 0.95, w, h: FONT * 1.25 }
        const inside = box.x >= v.x && box.y >= v.y && box.x + box.w <= v.x + v.w && box.y + box.h <= v.y + v.h
        return inside && !taken.some((t) => overlap(box, t)) && !dots.some((d) => d.id !== m.id && overlap(box, d))
          ? (taken.push(box), true)
          : false
      })
      if (!fit) {
        el.remove()
        continue
      }
      const [x, y, anchor] = fit
      el.setAttribute("x", x.toFixed(1))
      el.setAttribute("y", y.toFixed(1))
      el.setAttribute("text-anchor", anchor)
      g.labels.push({ el, n: m, dx: x - m.x!, dy: y - m.y! })
    }
  }
  // 호버한 노드와 이웃만 남긴다 — 점·선은 흐리고, 이웃 간선은 블루, 노드는 조금 키운다.
  // 라벨(텍스트)은 흐리지 않는다(AA) — 이웃 밖 상시 라벨은 숨기고, 이웃 라벨을 새로 단다.
  const focusOn = (n: SVGGElement | null) => {
    if (hot === n) return
    hot?.classList.remove("hot")
    hot = n
    n?.classList.add("hot")
    svg.classList.toggle("tg-focus", !!n)
    const near = n ? g.adj.get(n.dataset.id!)! : null
    for (const m of g.nodes) m.el.classList.toggle("near", !!near?.has(m.id))
    for (const l of svg.querySelectorAll<SVGLineElement>(".tg-e"))
      l.classList.toggle("near", !!n && (l.dataset.s === n.dataset.id || l.dataset.t === n.dataset.id))
    for (const l of svg.querySelectorAll<SVGTextElement>(".tg-labels .tg-label")) l.classList.toggle("near", !!near?.has(l.dataset.for!))
    clearHover()
    if (n && near) labelNear(n, near)
  }
  const disarm = () => {
    armed?.classList.remove("armed")
    armed = null
    hide()
    focusOn(null)
  }
  const go = (n: SVGGElement, newTab: boolean) => {
    const href = n.dataset.href
    if (!href || n.classList.contains("current")) return
    const url = new URL(href, window.location.toString())
    const dialog = svg.closest("dialog")
    if (dialog?.open && !newTab) dialog.close()
    if (newTab) window.open(url, "_blank")
    else if (window.spaNavigate) window.spaNavigate(url)
    else window.location.assign(url)
  }

  // 포인터 상태: 노드 드래그 / 빈 곳 팬 / 두 손가락 핀치
  const pointers = new Map<number, { x: number; y: number }>()
  let drag: { id: number; node: SVGGElement; start: { x: number; y: number }; moved: boolean } | null = null
  let pan: { id: number; last: { x: number; y: number }; moved: boolean } | null = null
  let pinch: { d: number; k: number } | null = null
  let suppressClick = false

  const pinchState = () => {
    const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }]
    return { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, d: Math.hypot(a.x - b.x, a.y - b.y) }
  }

  const onPointerDown = (e: PointerEvent) => {
    lastPointer = e.pointerType
    if (e.button !== 0) return
    const p = g.toView(e)
    pointers.set(e.pointerId, p)
    if (pointers.size === 2) {
      // 두 번째 손가락이 오면 드래그·팬을 접고 핀치로 넘어간다.
      if (drag) release()
      pan = null
      pinch = { d: pinchState().d, k: g.view.k }
      return
    }
    // 캡처는 실제로 움직인 뒤에 건다 — 먼저 걸면 click 대상이 svg로 바뀌어 노드 클릭 이동이 죽는다.
    const n = nodeOf(e.target)
    if (n) drag = { id: e.pointerId, node: n, start: p, moved: false }
    else pan = { id: e.pointerId, last: p, moved: false }
  }
  const release = () => {
    if (!drag) return
    const d = simOf(drag.node)
    d.fx = null
    d.fy = null
    drag.node.classList.remove("dragging")
    svg.classList.remove("tg-dragging")
    if (g.reduce()) {
      d.x = d.hx
      d.y = d.hy
      g.draw()
    } else g.sim.alphaTarget(0)
    drag = null
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return
    const p = g.toView(e)
    pointers.set(e.pointerId, p)
    if (pinch && pointers.size === 2) {
      const s = pinchState()
      g.zoomAt(s.mid, pinch.k * (s.d / pinch.d))
      suppressClick = true
      return
    }
    if (drag && drag.id === e.pointerId) {
      if (!drag.moved && Math.hypot(p.x - drag.start.x, p.y - drag.start.y) < DRAG_SLOP) return
      if (!drag.moved) {
        drag.moved = true
        svg.setPointerCapture(e.pointerId)
        drag.node.classList.add("dragging")
        svg.classList.add("tg-dragging")
        hide()
        if (!g.reduce()) g.sim.alphaTarget(0.3).restart()
      }
      const d = simOf(drag.node)
      d.fx = (p.x - g.view.x) / g.view.k
      d.fy = (p.y - g.view.y) / g.view.k
      if (g.reduce()) {
        d.x = d.fx
        d.y = d.fy
        g.draw()
      }
      return
    }
    if (pan && pan.id === e.pointerId) {
      const dx = p.x - pan.last.x
      const dy = p.y - pan.last.y
      if (!pan.moved && Math.hypot(dx, dy) < DRAG_SLOP) return
      if (!pan.moved) svg.setPointerCapture(e.pointerId)
      pan.moved = true
      svg.classList.add("tg-panning")
      pan.last = p
      g.pan(dx, dy)
    }
  }
  const onPointerUp = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId)) return
    if (pinch) {
      if (pointers.size < 2) pinch = null
      if (!pointers.size) g.returnHome()
      return
    }
    if (drag && drag.id === e.pointerId) {
      if (drag.moved) suppressClick = true
      release()
    }
    if (pan && pan.id === e.pointerId) {
      if (pan.moved) suppressClick = true
      svg.classList.remove("tg-panning")
      pan = null
      g.returnHome()
    }
  }
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    g.zoomAt(g.toView(e), g.view.k * Math.exp(-dy * 0.0025))
    g.returnHome(WHEEL_IDLE_MS)
    if (hot) show(hot)
  }
  const onDblClick = (e: MouseEvent) => {
    if (!nodeOf(e.target)) g.reset()
  }

  const onClick = (e: MouseEvent) => {
    const n = nodeOf(e.target)
    if (suppressClick) {
      suppressClick = false
      e.stopPropagation()
      return
    }
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
    focusOn(n)
  }
  const onOver = (e: PointerEvent) => {
    if (e.pointerType === "touch" || drag?.moved || pan?.moved) return
    const n = nodeOf(e.target)
    if (!n) return
    show(n)
    focusOn(n)
  }
  const onOut = (e: PointerEvent) => {
    if (e.pointerType === "touch" || armed || drag?.moved) return
    if (nodeOf(e.relatedTarget) === hot && hot) return
    hide()
    focusOn(null)
  }
  const onKey = (e: KeyboardEvent) => {
    const n = nodeOf(e.target)
    if (n && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      go(n, e.ctrlKey || e.metaKey)
    }
  }
  const onFocus = (e: FocusEvent) => {
    const n = nodeOf(e.target)
    if (!n) return
    show(n)
    focusOn(n)
  }
  const onBlur = () => {
    if (armed) return
    hide()
    focusOn(null)
  }
  const onDocClick = (e: MouseEvent) => {
    if (armed && !box.contains(e.target as Node)) disarm()
  }

  const on: [string, EventListener, AddEventListenerOptions?][] = [
    ["pointerdown", onPointerDown as EventListener],
    ["pointermove", onPointerMove as EventListener],
    ["pointerup", onPointerUp as EventListener],
    ["pointercancel", onPointerUp as EventListener],
    ["wheel", onWheel as EventListener, { passive: false }],
    ["dblclick", onDblClick as EventListener],
    ["click", onClick as EventListener],
    ["pointerover", onOver as EventListener],
    ["pointerout", onOut as EventListener],
    ["keydown", onKey as EventListener],
    ["focusin", onFocus as EventListener],
    ["focusout", onBlur],
  ]
  for (const [type, fn, o] of on) svg.addEventListener(type, fn, o)
  document.addEventListener("click", onDocClick)
  // 확대 보기를 닫으면 호버 상태를 비운다 — 다시 열 때 흐림이 남지 않게.
  const dialog = svg.closest("dialog")
  dialog?.addEventListener("close", disarm)
  window.addCleanup(() => {
    g.sim.stop()
    for (const [type, fn, o] of on) svg.removeEventListener(type, fn, o)
    document.removeEventListener("click", onDocClick)
    dialog?.removeEventListener("close", disarm)
  })
}

document.addEventListener("nav", setup)
document.addEventListener("render", removeUpstreamLocal)
