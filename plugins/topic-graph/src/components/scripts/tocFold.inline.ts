// 긴 TOC 접기.
// - 데스크톱 우측 island에 TOC만으로도 다 안 들어가면 h3를 접고 현재 h2 절의 h3만 펼친다(.toc-fold·.toc-folded)
// - 접힌 항목은 화면에서만 숨겨 스크린리더·Tab엔 남는다 — 키보드 포커스가 들어오면 custom.scss가 전부 펼친다
const DESKTOP = "(min-width: 1201px)"

function sections(list: HTMLElement) {
  const groups: { head: HTMLLIElement; target: HTMLElement | null; subs: HTMLLIElement[] }[] = []
  for (const li of list.querySelectorAll<HTMLLIElement>(":scope > li")) {
    if (li.classList.contains("depth-0") || !groups.length) {
      const slug = li.querySelector("a")?.dataset.for ?? ""
      groups.push({ head: li, target: document.getElementById(slug), subs: [] })
    } else groups[groups.length - 1]!.subs.push(li)
  }
  return groups
}

function setup() {
  const list = document.querySelector<HTMLElement>(".sidebar.right .toc-content")
  const island = list?.closest<HTMLElement>(".sidebar")
  if (!list || !island) return
  const groups = sections(list)
  if (!groups.some((g) => g.subs.length)) return

  let current = -1
  const mark = () => {
    let next = -1
    groups.forEach((g, i) => {
      if (g.target && g.target.getBoundingClientRect().top < window.innerHeight) next = i
    })
    if (next === current) return
    current = next
    groups.forEach((g, i) => g.subs.forEach((li) => li.classList.toggle("toc-folded", i !== current)))
  }

  // 접기 전 높이로 판정한다 — GRAPH는 잴 때만 빼 두고(긴 TOC면 어차피 숨는다) 같은 프레임 안에서 되돌린다.
  const fit = () => {
    list.classList.remove("toc-fold")
    let fold = false
    if (window.matchMedia(DESKTOP).matches && !list.classList.contains("collapsed")) {
      const graph = island.querySelector<HTMLElement>(".topic-graph")
      const prev = graph?.style.display ?? ""
      if (graph) graph.style.display = "none"
      fold = island.scrollHeight > island.clientHeight + 1
      if (graph) graph.style.display = prev
    }
    list.classList.toggle("toc-fold", fold)
    // 주의: -1(현재 절 없음)과도 달라야 mark()가 접기 클래스를 새로 칠한다.
    current = -2
    if (fold) mark()
  }

  const queue = (fn: () => void) => {
    let frame = 0
    return () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), fn()))
    }
  }
  const onScroll = queue(() => list.classList.contains("toc-fold") && mark())
  const onResize = queue(fit)
  const header = list.closest(".toc")?.querySelector(".toc-header")

  fit()
  document.fonts?.ready.then(onResize)
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onResize, { passive: true })
  header?.addEventListener("click", onResize)
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onResize)
    header?.removeEventListener("click", onResize)
  })
}

document.addEventListener("nav", setup)
