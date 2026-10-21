// 로드맵 연결선·강조의 단일 구현. 블로그 인라인 스크립트와 Obsidian 미리보기가 함께 쓴다.

const NS = "http://www.w3.org/2000/svg"
let uid = 0

interface Box {
  l: number
  r: number
  t: number
  b: number
  cx: number
}

/** register는 정리 함수를 받는다(블로그 window.addCleanup, Obsidian MarkdownRenderChild.register). */
export function initRoadmap(nav: HTMLElement, register: (cleanup: () => void) => void) {
  const board = nav.querySelector<HTMLElement>(".rm-board")
  const svg = nav.querySelector<SVGSVGElement>(".rm-wires")
  if (!board || !svg) return
  const my = ++uid
  let current: [string?, string?] = []

  function draw() {
    svg!.replaceChildren()
    if (getComputedStyle(svg!).display === "none") return
    const B = board!.getBoundingClientRect()
    const rel = (n: Element): Box => {
      const r = n.getBoundingClientRect()
      return { l: r.left - B.left, r: r.right - B.left, t: r.top - B.top, b: r.bottom - B.top, cx: (r.left + r.right) / 2 - B.left }
    }
    const defs = document.createElementNS(NS, "defs")
    defs.innerHTML = ["flow", "part", "req"]
      .map(
        (k) =>
          `<marker id="rm-ah-${k}-${my}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah-${k}" d="M0,0 L10,5 L0,10 z"/></marker>`,
      )
      .join("")
    svg!.appendChild(defs)
    const path = (d: string, cls: string, k: string, to?: string) => {
      const p = document.createElementNS(NS, "path")
      p.setAttribute("d", d)
      p.setAttribute("class", cls)
      p.setAttribute("marker-end", `url(#rm-ah-${k}-${my})`)
      if (to) p.dataset.to = to
      svg!.appendChild(p)
    }

    // 부 순서: 부 이름 상자끼리 세로 화살표
    const heads = [...board!.querySelectorAll(".rm-part-head")].map(rel)
    for (let i = 0; i < heads.length - 1; i++) {
      const a = heads[i]!
      const b = heads[i + 1]!
      path(`M${a.cx},${a.b + 3} L${a.cx},${b.t - 3}`, "w-part", "part")
    }
    // 편 순서: 같은 줄 카드끼리 가로 화살표(줄바꿈된 카드는 잇지 않는다)
    board!.querySelectorAll(".rm-eps").forEach((ol) => {
      const cards = [...ol.children].map(rel)
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i]!
        const b = cards[i + 1]!
        if (Math.abs(a.t - b.t) > 4) continue
        const y = a.t + 18
        path(`M${a.r + 3},${y} L${b.l - 3},${y}`, "w-flow", "flow")
      }
    })

    // 선수 선(그릴 대상은 SSR이 data-req로 확정): 앞선 부·같은 열 직선, 다른 열 S자, 같은 부 아치, 여러 선은 대상 위 20~80% 슬롯 배정
    const lanes = [...board!.querySelectorAll(".rm-part")]
    const laneOf = (n: Element) => lanes.indexOf(n.closest(".rm-part")!)
    board!.querySelectorAll<HTMLElement>(".rm-ep[data-req]").forEach((li) => {
      const to = li.dataset.no!
      const t = rel(li)
      const tLane = laneOf(li)
      const inner = { l: t.l + (t.r - t.l) * 0.2, r: t.r - (t.r - t.l) * 0.2 }
      const srcs = (li.dataset.req ?? "")
        .split(",")
        .filter(Boolean)
        .flatMap((from) => {
          const el = board!.querySelector(`.rm-ep[data-no="${from}"]`)
          return el ? [{ from, s: rel(el), lane: laneOf(el) }] : []
        })
        .sort((a, b) => a.s.cx - b.s.cx || a.lane - b.lane)
      srcs.forEach((x, i) => {
        const { s } = x
        let tx: number
        if (srcs.length > 1) tx = inner.l + (inner.r - inner.l) * ((i + 0.5) / srcs.length)
        else if (Math.abs(s.cx - t.cx) < 8) tx = t.cx
        else tx = s.cx < t.cx ? inner.l : inner.r
        const ty = t.t - 2
        let d: string
        if (x.lane === tLane) {
          const top = Math.min(s.t, t.t) - 22
          d = `M${s.cx},${s.t} C${s.cx},${top} ${tx},${top} ${tx},${ty}`
        } else if (Math.abs(s.cx - tx) < 1) {
          d = `M${s.cx},${s.b} L${tx},${ty}`
        } else {
          const c = Math.max(30, (ty - s.b) * 0.45)
          d = `M${s.cx},${s.b} C${s.cx},${s.b + c} ${tx},${ty - c} ${tx},${ty}`
        }
        path(d, "w-req", "req", `${x.from}>${to}`)
      })
    })
    // 주의: 다시 그리면 경로가 새로 생기므로 강조 중이던 상태를 다시 입힌다
    if (current[0]) hl(...current)
  }

  // 카드에 올리면 그 편의 선수 선 전부, 칩에 올리면 그 칩의 선 하나만
  function hl(no?: string, only?: string) {
    current = [no, only]
    nav.classList.toggle("has-hl", !!no)
    board!.querySelectorAll(".rm-ep").forEach((n) => n.classList.remove("is-hl", "is-src"))
    board!.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-on"))
    if (!no) {
      svg!.querySelectorAll(".w-req").forEach((p) => p.classList.remove("is-hl"))
      return
    }
    const li = board!.querySelector<HTMLElement>(`.rm-ep[data-no="${no}"]`)
    if (!li) return
    const froms = only ? [only] : (li.dataset.req ?? "").split(",").filter(Boolean)
    svg!.querySelectorAll<SVGPathElement>(".w-req").forEach((p) =>
      p.classList.toggle("is-hl", froms.some((f) => p.dataset.to === `${f}>${no}`)),
    )
    li.classList.add("is-hl")
    froms.forEach((f) => {
      board!.querySelector(`.rm-ep[data-no="${f}"]`)?.classList.add("is-src")
      li.querySelector(`.chip[data-from="${f}"]`)?.classList.add("is-on")
    })
  }

  const ac = new AbortController()
  const { signal } = ac
  board.querySelectorAll<HTMLElement>(".rm-ep").forEach((li) => {
    if (!li.dataset.req) return
    const no = li.dataset.no
    li.addEventListener("mouseenter", () => hl(no), { signal })
    li.addEventListener("mouseleave", () => hl(), { signal })
    li.addEventListener("focusin", (e) => hl(no, (e.target as HTMLElement).dataset?.from), { signal })
    li.addEventListener("focusout", () => hl(), { signal })
    li.querySelectorAll<HTMLElement>(".chip[data-from]").forEach((c) => {
      c.addEventListener("mouseenter", () => hl(no, c.dataset.from), { signal })
      c.addEventListener("mouseleave", () => hl(no), { signal })
    })
  })
  register(() => ac.abort())

  draw()
  const ro = new ResizeObserver(() => draw())
  ro.observe(board)
  register(() => ro.disconnect())
  document.fonts?.ready.then(() => {
    if (board.isConnected) draw()
  })
}
