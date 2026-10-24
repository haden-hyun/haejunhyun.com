// @ts-nocheck
// 히어로 브라우저 로직(nav마다 HomeHero의 인라인 스크립트가 호출).
// - 책등: hover·포커스 칩, 로빙 tabindex(선반 = Tab 정지점 하나, 방향키로 두 단을 가로지른다)
// - 노트 카드: <dialog>(모바일 바텀시트), DIVE IN만 spaNavigate. 리스너는 window.addCleanup으로 해제
// 주의: toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것.
export function heroClient() {
  const root = document.querySelector(".home-hero")
  const dataEl = root?.querySelector(".hero-data")
  const shelf = root?.querySelector(".hero-shelf")
  const dlg = root?.querySelector(".hero-card")
  const tip = root?.querySelector(".hero-tip")
  if (!dataEl || !shelf || !dlg || !tip) return
  const notes = JSON.parse(dataEl.textContent).notes
  const spines = [...shelf.querySelectorAll(".hero-spine")]
  if (spines.length !== notes.length) return
  const mobileQ = window.matchMedia("(max-width: 800px)")
  const perRow = shelf.querySelector(".hero-row").children.length
  const cleanups = []
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)) }
  const el = (tag, txt) => { const e = document.createElement(tag); e.textContent = txt; return e }

  let active = 0
  spines.forEach((a, i) => {
    a.tabIndex = i === active ? 0 : -1
    a.dataset.routerIgnore = "" // 클릭은 카드가 받는다(SPA 라우터 제외)
    a.setAttribute("aria-haspopup", "dialog")
    a.setAttribute("aria-label", notes[i].t + " — " + notes[i].tl + " · 노트 카드 열기")
  })
  const setActive = (k, focus) => {
    active = Math.max(0, Math.min(spines.length - 1, k))
    spines.forEach((a, i) => (a.tabIndex = i === active ? 0 : -1))
    if (focus) spines[active].focus()
  }

  // 칩: 책등 위 가운데, 선반 안으로 가둔다. 들림 전 레이아웃 좌표(offset*)를 쓴다.
  const showTip = (k) => {
    const a = spines[k], n = notes[k], lift = 9
    tip.replaceChildren(el("b", n.t), el("small", n.tl))
    tip.classList.add("is-on")
    const x = a.offsetLeft + a.offsetWidth / 2 - tip.offsetWidth / 2
    tip.style.left = Math.max(0, Math.min(shelf.clientWidth - tip.offsetWidth, x)) + "px"
    tip.style.top = a.offsetTop - lift - tip.offsetHeight - 8 + "px"
  }
  const hideTip = () => tip.classList.remove("is-on")
  spines.forEach((a, i) => {
    on(a, "pointerenter", (e) => { if (e.pointerType !== "touch") showTip(i) })
    on(a, "pointerleave", hideTip)
    on(a, "focus", () => { active = i; showTip(i) })
    on(a, "blur", hideTip)
  })
  on(shelf, "keydown", (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: perRow, ArrowUp: -perRow }[e.key]
    if (d) { e.preventDefault(); const k = active + d; if (k >= 0 && k < spines.length) setActive(k, true) }
    else if (e.key === "Home") { e.preventDefault(); setActive(0, true) }
    else if (e.key === "End") { e.preventDefault(); setActive(spines.length - 1, true) }
  })

  // ---------- 노트 카드 ----------
  let card = { k: 0, opener: null }
  const fillCard = () => {
    const n = notes[card.k]
    const q = (s) => dlg.querySelector(s)
    q(".hero-card-eyebrow").textContent = n.tl + (n.sl ? " · 시리즈 " + n.sl : "") + (n.isNew ? " · NEW" : "")
    q(".hero-card-title").textContent = n.t
    q(".hero-card-meta").textContent = "posted " + n.p + (n.c && n.c !== n.p ? " · 작성 " + n.c : "") + (n.m ? " · " + n.m + " min read" : "")
    q(".hero-card-desc").textContent = n.d || "요약이 없는 노트입니다."
    q(".hero-card-dive").href = n.h
    q(".hero-card-prev").disabled = card.k === 0
    q(".hero-card-next").disabled = card.k === spines.length - 1
  }
  const openCard = (k) => {
    card = { k, opener: spines[k] }
    hideTip()
    dlg.classList.toggle("is-sheet", mobileQ.matches)
    fillCard()
    dlg.showModal()
    document.documentElement.classList.add("hero-locked")
    dlg.querySelector(".hero-card-title").focus()
  }
  const moveCard = (d) => { const k = card.k + d; if (k < 0 || k >= spines.length) return; card.k = k; card.opener = spines[k]; fillCard() }
  on(shelf, "click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return // 새 탭 열기는 그대로
    const a = e.target.closest?.(".hero-spine")
    if (!a) return
    e.preventDefault()
    const k = spines.indexOf(a)
    setActive(k, false)
    openCard(k)
  })
  on(dlg, "close", () => { document.documentElement.classList.remove("hero-locked"); if (card.opener) requestAnimationFrame(() => setActive(card.k, true)) }) // 주의: 브라우저의 기본 포커스 복귀가 끝난 뒤에 옮겨야 한다
  on(dlg, "click", (e) => { if (e.target === dlg) dlg.close() })
  on(dlg.querySelector(".hero-card-close"), "click", () => dlg.close())
  on(dlg.querySelector(".hero-card-prev"), "click", () => moveCard(-1))
  on(dlg.querySelector(".hero-card-next"), "click", () => moveCard(1))
  on(dlg, "keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); moveCard(-1) }
    else if (e.key === "ArrowRight") { e.preventDefault(); moveCard(1) }
    else if (e.key === "Tab") {
      const f = [...dlg.querySelectorAll("button:not(:disabled), a[href]")]
      const i = f.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus() }
    }
  })
  on(dlg.querySelector(".hero-card-dive"), "click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    const url = new URL(e.currentTarget.href, window.location.href)
    card.opener = null
    dlg.close()
    window.spaNavigate ? window.spaNavigate(url) : (window.location.href = url.href)
  })
  // 바텀시트: 손잡이를 아래로 끌면 닫힘
  const hd = dlg.querySelector(".hero-card-handle")
  let y0 = null
  on(hd, "pointerdown", (e) => { y0 = e.clientY; hd.setPointerCapture?.(e.pointerId) })
  on(hd, "pointermove", (e) => { if (y0 == null) return; const d = Math.max(0, e.clientY - y0); dlg.style.transform = d ? "translateY(" + d + "px)" : "" })
  const end = (e) => { if (y0 == null) return; const d = e.clientY - y0; y0 = null; dlg.style.transform = ""; if (d > 70) dlg.close() }
  on(hd, "pointerup", end); on(hd, "pointercancel", end)
  cleanups.push(() => { if (dlg.open) { card.opener = null; dlg.close() } document.documentElement.classList.remove("hero-locked") })
  window.addCleanup?.(() => cleanups.forEach((fn) => fn()))
}
