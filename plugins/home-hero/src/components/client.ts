// @ts-nocheck
// 히어로 브라우저 로직 — 색소폰 캔버스·키 툴팁·선반 배치·노트 카드.
// 주의: toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것(전부 L로 받는다).
export function heroClient(L) {
  const root = document.querySelector(".home-hero")
  const dataEl = root?.querySelector(".hero-data")
  if (!root || !dataEl) return
  const D = JSON.parse(dataEl.textContent)
  const now = Date.now()
  for (const n of D.notes) n.recent = (now - Date.parse(n.p)) / 864e5 <= 45 // 빌드가 뜸해도 오늘 기준으로 다시 판정
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const mobileQ = window.matchMedia("(max-width: 800px)")
  const cleanups = []
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)) }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e }

  // ---------- 색소폰 ----------
  const C = L.SAX_CFG
  const saxBox = root.querySelector(".hero-sax")
  const cv = saxBox?.querySelector(".hero-sax-cv")
  const keyLayer = saxBox?.querySelector(".hero-keys")
  const tip = saxBox?.querySelector(".hero-keytip")
  const topics = D.topics
    .map((k) => { const ns = D.notes.filter((n) => n.tp === k); return { k, label: D.labels[k] || k, n: ns.length, recent: ns.some((n) => n.recent) } })
    .sort((a, b) => b.n - a.n)
  let colors = null
  const readColors = () => {
    const pick = (cls) => getComputedStyle(saxBox.querySelector(".hero-tone." + cls)).color
    colors = [pick("t0"), pick("t1"), pick("t2"), pick("tb")]
  }
  let raf = 0, prev = 0, acc = 0, visible = false, drawn = false
  const S = { off: { ay: 0, ax: 0 }, vel: { ay: 0, ax: 0 }, drag: false, lx: 0, ly: 0, keys: [], tipK: -1, t0: performance.now() }
  const W = L.fit.cols * C.cw, H = C.rows * C.ch
  const buf = {}
  const keyBtns = []
  const showTip = (k) => {
    S.tipK = k
    if (k < 0 || !topics[k]) { tip.hidden = true; return }
    const t = topics[k]
    tip.textContent = ""
    tip.append(el("b", null, t.label), " · " + t.n + "편" + (t.recent ? " · 최근 글" : ""))
    tip.hidden = false
    placeTip()
  }
  const placeTip = () => {
    const k = S.tipK
    if (k < 0 || !S.keys[k]) return
    const s = cv.clientWidth / W
    tip.style.left = S.keys[k][0] * s + "px"
    tip.style.top = S.keys[k][1] * s + "px"
  }
  const sweepAt = (t) => {
    if (reduce) return () => 0
    const p = (t % 6) / 6
    if (p > 0.8) return () => 0
    const w = Math.max(50, 0.3 * W), X = -w + (W + 2 * w) * (p / 0.8)
    return (x) => Math.exp(-2.2 * ((x - X) / w) ** 2)
  }
  const draw = (nowT) => {
    if (!cv || !colors) return false
    const t = (nowT - S.t0) / 1000
    const sway = reduce ? 0 : 0.15 * Math.sin((t / 9) * Math.PI * 2)
    const { glyphs, keys } = L.composeSax(L.model, L.rasterSax, buf, L.fit, C, L.REST.ay + sway + S.off.ay, L.REST.ax + S.off.ax, sweepAt(t))
    S.keys = keys
    const cssW = cv.clientWidth || W, dpr = Math.min(2, window.devicePixelRatio || 1)
    const bw = Math.round(cssW * dpr), bh = Math.round(cssW * (H / W) * dpr)
    if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh }
    const ctx = cv.getContext("2d")
    const k = (cssW / W) * dpr
    ctx.setTransform(k, 0, 0, k, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    const groups = new Map()
    for (const g of glyphs) { const key = g[3] + (g[4] ? "b" : "s"); let a = groups.get(key); if (!a) groups.set(key, (a = [])); a.push(g) }
    for (const [key, arr] of groups) {
      ctx.font = (key[1] === "b" ? "8.5px" : "7.5px") + ' "Noto Music", sans-serif'
      ctx.fillStyle = colors[+key[0]]
      for (const g of arr) ctx.fillText(g[2], g[0], g[1])
    }
    // 운지 키: 원판 중심 둘레를 비우고 글자 하나. 최근 글이 있는 토픽은 눌린 키(--dark)
    const s = cssW / W
    keys.forEach((p, i) => {
      const tpc = topics[i]; if (!tpc) return
      const pressed = tpc.recent, hot = S.tipK === i, ch = C.keyChars[i], music = ch === "♭"
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath(); ctx.arc(p[0], p[1], pressed || hot ? 8 : 7, 0, Math.PI * 2); ctx.fill()
      ctx.globalCompositeOperation = "source-over"
      ctx.font = music ? (pressed || hot ? "14px" : "12px") + ' "Noto Music", sans-serif' : (pressed || hot ? "800 13px" : "800 11.5px") + " Inter, sans-serif"
      ctx.fillStyle = pressed || hot ? colors[3] : colors[1]
      ctx.fillText(ch, p[0], p[1] + (music ? 0 : 0.5))
      const b = keyBtns[i]; if (b) { b.style.left = p[0] * s + "px"; b.style.top = p[1] * s + "px" }
    })
    placeTip()
    if (!drawn) { drawn = true; saxBox.classList.add("is-live") }
    return S.drag || Math.abs(S.off.ay) + Math.abs(S.off.ax) + Math.abs(S.vel.ay) + Math.abs(S.vel.ax) > 0.0005
  }
  const step = (dt) => { if (S.drag) return; for (const k of ["ay", "ax"]) { S.vel[k] += (-22 * S.off[k] - 8 * S.vel[k]) * dt; S.off[k] += S.vel[k] * dt } }
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; prev = 0 }
  const tick = (t) => {
    raf = 0
    const dt = prev ? Math.min(0.05, (t - prev) / 1000) : 1 / 60
    prev = t; acc += dt
    step(dt)
    let more = !reduce
    if (acc >= 1 / 30) { acc = 0; more = draw(t) || more } else more = true
    if (more && visible && !document.hidden) raf = requestAnimationFrame(tick); else prev = 0
  }
  const kick = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick) }
  if (cv) {
    topics.forEach((t, i) => {
      const b = el("button", "hero-key"); b.type = "button"; b.tabIndex = i === 0 ? 0 : -1
      b.setAttribute("aria-label", t.label + " · " + t.n + "편" + (t.recent ? " · 최근 45일 글 있음" : ""))
      on(b, "focus", () => { showTip(i); kick() }); on(b, "blur", () => { showTip(-1); kick() })
      on(b, "pointerenter", () => { showTip(i); kick() }); on(b, "pointerleave", () => { showTip(-1); kick() })
      on(b, "click", (e) => { e.stopPropagation(); showTip(S.tipK === i && e.pointerType ? -1 : i); kick() })
      keyLayer.append(b); keyBtns.push(b)
    })
    on(keyLayer, "keydown", (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
      const cur = keyBtns.indexOf(document.activeElement)
      if (!d || cur < 0) return
      e.preventDefault()
      const nx = Math.max(0, Math.min(keyBtns.length - 1, cur + d))
      keyBtns.forEach((x, i) => (x.tabIndex = i === nx ? 0 : -1)); keyBtns[nx].focus()
    })
    on(cv, "pointerdown", (e) => { S.drag = true; S.lx = e.clientX; S.ly = e.clientY; S.vel.ay = S.vel.ax = 0; cv.setPointerCapture?.(e.pointerId); saxBox.classList.add("is-dragging"); kick() })
    on(cv, "pointermove", (e) => { if (!S.drag) return; S.off.ay += (e.clientX - S.lx) * 0.012; S.off.ax += (e.clientY - S.ly) * 0.012; S.lx = e.clientX; S.ly = e.clientY; kick() })
    const up = () => { if (!S.drag) return; S.drag = false; saxBox.classList.remove("is-dragging"); kick() }
    on(cv, "pointerup", up); on(cv, "pointercancel", up)
    on(document, "pointerdown", (e) => { if (!e.target.closest?.(".hero-key")) showTip(-1) })
    on(document, "visibilitychange", () => (document.hidden ? stop() : kick()))
    on(document, "themechange", () => { readColors(); draw(performance.now()) })
    const io = new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); visible ? kick() : stop() })
    io.observe(saxBox)
    cleanups.push(() => { stop(); io.disconnect() })
    const fontsReady = Promise.race([document.fonts.load('10px "Noto Music"', "♩♪♫♬♭"), new Promise((r) => setTimeout(r, 2500))])
    fontsReady.then(() => { if (!root.isConnected) return; readColors(); draw(performance.now()); kick() })
  }

  // ---------- 선반 ----------
  const shelf = root.querySelector(".hero-shelf")
  const dlg = root.querySelector(".hero-card")
  const SC = L.SHELF_CFG
  let spines = [], active = 0
  let lastKey = ""
  const layout = () => {
    const Wd = shelf.clientWidth
    if (!Wd) return
    const mobile = mobileQ.matches
    // 주의: 폭이 그대로면 다시 짓지 않는다 — 카드의 스크롤 잠금만으로도 관찰자가 깨어나 포커스한 등이 사라진다
    if (lastKey === Wd + "|" + mobile) return
    lastKey = Wd + "|" + mobile
    const hadFocus = shelf.contains(document.activeElement)
    const plan = L.planShelf(D.notes, D.topics, Wd, 3, SC)
    const height = mobile ? plan.R * 104 : L.shelfH
    const rowH = height / plan.R, PAD = 5, TAB = 18
    const boardY = (r) => (r + 1) * rowH - 1
    const tabTop = (r) => r * rowH + (r === 0 ? 0 : PAD)
    shelf.replaceChildren()
    shelf.style.height = height + "px"
    shelf.classList.add("is-laid")
    for (let r = 0; r < plan.R; r++) {
      const b = el("div", "hero-board"); b.style.top = boardY(r) + "px"; shelf.append(b)
      const f = el("div", "hero-front"); f.style.top = boardY(r) + 1 + "px"; shelf.append(f)
      const b2 = el("div", "hero-board is-lower"); b2.style.top = boardY(r) + 4 + "px"; shelf.append(b2)
    }
    spines = []
    const shortBy = (m) => (m <= 2 ? 10 : m <= 6 ? 5 : 0) // 읽는 시간이 짧을수록 키가 낮은 판형
    for (const row of plan.rows) {
      const items = row.items
      // 시리즈 묶음은 같은 높이
      const grp = []
      items.forEach((it, j) => { if (it.kind === "sp") { it.dh = shortBy(D.notes[it.note].m); if (it.joinPrev && items[j - 1]?.kind === "sp") { const g = items[j - 1].grp || [items[j - 1]]; g.push(it); g.forEach((x) => (x.grp = g)); if (!grp.includes(g)) grp.push(g) } } })
      grp.forEach((g) => { const h = Math.min(...g.map((x) => x.dh)); g.forEach((x) => (x.dh = h)) })
      items.forEach((it, j) => {
        if (it.kind === "sp") {
          const n = D.notes[it.note]
          const a = el("a", "hero-spine" + (n.recent ? " is-new" : ""))
          a.href = n.h; a.tabIndex = -1; a.dataset.routerIgnore = "" // 클릭은 카드가 받는다(SPA 라우터 제외)
          a.setAttribute("aria-haspopup", "dialog")
          a.setAttribute("aria-label", n.t + " · 노트 카드 열기")
          const top = tabTop(it.row) + TAB + it.dh
          a.style.cssText = "left:" + it.x.toFixed(2) + "px;width:" + it.w.toFixed(2) + "px;top:" + top + "px;height:" + (boardY(it.row) - top) + "px"
          if (it.w >= 9) { const no = el("span", "hero-spine-no", n.n.slice(-2)); no.setAttribute("aria-hidden", "true"); a.append(no) }
          a.append(el("span", "hero-spine-band"), el("span", "hero-spine-foot"))
          a.dataset.k = spines.length
          spines.push({ a, n, it })
          shelf.append(a)
          if (it.grp && it.grp[0] === it) {
            const last = it.grp[it.grp.length - 1]
            const cap = el("div", "hero-cap"); cap.style.cssText = "left:" + it.x + "px;width:" + (last.x + last.w - it.x) + "px;top:" + (top - 4) + "px"; shelf.append(cap)
          }
        } else {
          const dv = el(it.kind === "arc" ? "a" : "span", "hero-divider" + (it.cont ? " is-cont" : ""))
          if (it.kind === "arc") { dv.href = D.archive; dv.tabIndex = -1 }
          dv.style.cssText = "left:" + it.x.toFixed(2) + "px;width:" + it.w.toFixed(2) + "px;top:" + tabTop(it.row) + "px;height:" + (boardY(it.row) - tabTop(it.row)) + "px"
          dv.setAttribute("aria-hidden", "true")
          shelf.append(dv)
          const next = items.slice(j + 1).find((x) => x.kind !== "sp")
          const room = (next ? next.x : Wd) - it.x - 2
          const name = it.kind === "arc" ? "+" + plan.cut + " ARCHIVE" : D.tabs[it.topic] || it.topic
          const cands = it.kind === "arc" ? [name] : it.cont ? (mobile ? ["↩"] : [name + " ↩", name.slice(0, 4) + " ↩", "↩"]) : [name + " " + it.count, name, name.slice(0, 4) + " " + it.count, name.slice(0, 4)]
          const fit = cands.find((x) => x.length * 5.6 + 8 <= room) || cands[cands.length - 1]
          const tab = el("span", "hero-tab" + (it.cont ? " is-cont" : "") + (it.kind === "arc" ? " is-arc" : ""), fit)
          tab.style.cssText = "left:" + it.x + "px;top:" + tabTop(it.row) + "px"
          tab.setAttribute("aria-hidden", "true")
          shelf.append(tab)
        }
      })
    }
    active = Math.min(active, spines.length - 1)
    spines.forEach((s, i) => (s.a.tabIndex = i === active ? 0 : -1))
    if (hadFocus) spines[active]?.a.focus()
    shelf.setAttribute("aria-label", "노트 카탈로그 " + spines.length + "편. 화살표로 이동, Enter로 노트 카드")
  }
  const setActive = (k, focus) => { if (!spines.length) return; active = Math.max(0, Math.min(spines.length - 1, k)); spines.forEach((s, i) => (s.a.tabIndex = i === active ? 0 : -1)); if (focus) spines[active].a.focus() }
  const nearest = (e) => {
    const t = e.target.closest?.(".hero-spine")
    if (t) return +t.dataset.k
    const r = shelf.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top
    let best = -1, bd = 8
    spines.forEach((sp, k) => {
      const ar = sp.a.getBoundingClientRect()
      if (py < ar.top - r.top - 14 || py > ar.bottom - r.top + 2) return
      const d = Math.max(0, Math.abs(px - (ar.left - r.left + ar.width / 2)) - ar.width / 2)
      if (d < bd) { bd = d; best = k }
    })
    return best
  }
  let card = { k: 0, opener: null }
  const fillCard = () => {
    const n = spines[card.k].n
    const q = (s) => dlg.querySelector(s)
    q(".hero-card-eyebrow").textContent = n.n + " · " + (D.tabs[n.tp] || n.tp) + (n.st ? " · SERIES " + n.si + "/" + n.st : "") + (n.recent ? " · NEW" : "")
    q(".hero-card-title").textContent = n.t
    q(".hero-card-meta").textContent = "posted " + n.p + (n.c && n.c !== n.p ? " · 작성 " + n.c : "") + (n.m ? " · " + n.m + " min read" : "")
    q(".hero-card-desc").textContent = n.d || "요약이 없는 노트입니다."
    q(".hero-card-dive").href = n.h
    q(".hero-card-prev").disabled = card.k === 0
    q(".hero-card-next").disabled = card.k === spines.length - 1
  }
  const openCard = (k) => {
    card = { k, opener: spines[k].a }
    dlg.classList.toggle("is-sheet", mobileQ.matches)
    fillCard()
    dlg.showModal()
    document.documentElement.classList.add("hero-locked")
    dlg.querySelector(".hero-card-title").focus()
  }
  const moveCard = (d) => { const k = card.k + d; if (k < 0 || k >= spines.length) return; card.k = k; card.opener = spines[k].a; fillCard() }
  if (shelf && dlg) {
    layout()
    let pend = 0
    const ro = new ResizeObserver(() => { if (!pend) pend = requestAnimationFrame(() => { pend = 0; layout() }) })
    ro.observe(shelf)
    cleanups.push(() => ro.disconnect())
    on(shelf, "keydown", (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (d) { e.preventDefault(); setActive(active + d, true) }
      else if (e.key === "Home") { e.preventDefault(); setActive(0, true) }
      else if (e.key === "End") { e.preventDefault(); setActive(spines.length - 1, true) }
    })
    let hot = -1
    on(shelf, "pointermove", (e) => { const k = nearest(e); if (k === hot) return; spines[hot]?.a.classList.remove("is-hot"); hot = k; spines[k]?.a.classList.add("is-hot") })
    on(shelf, "pointerleave", () => { spines[hot]?.a.classList.remove("is-hot"); hot = -1 })
    on(shelf, "click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return // 새 탭 열기는 그대로
      if (e.target.closest?.(".hero-divider")) return
      const k = nearest(e)
      if (k < 0) return
      e.preventDefault()
      setActive(k, false)
      openCard(k)
    })
    // 선반이 다시 배치돼 원래 노드가 바뀌었을 수 있으니 번호로 되돌아간다
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
  }
  window.addCleanup?.(() => cleanups.forEach((fn) => fn()))
}
