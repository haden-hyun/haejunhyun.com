// @ts-nocheck
// 히어로 브라우저 로직(nav마다 HomeHero의 인라인 스크립트가 호출).
// - 색소폰 캔버스: 자동 흔들림 · 드래그 회전 + 스프링 복귀 · 글자 사이로 지나는 빛 물결
// - 운지 키 7개 = 토픽: 원 테두리 + 글자(Inter 500), 최근 글이 있는 토픽은 눌린 키(--dark). Tab 정지점 하나, hover·포커스·탭 툴팁
// - 화면 밖·탭 숨김에서 rAF 정지, 30fps 상한, 감속 모션이면 정지 프레임(드래그만). 리스너는 window.addCleanup으로 해제
// 주의: toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것(전부 L로 받는다).
export function heroClient(L) {
  const root = document.querySelector(".home-hero")
  const saxBox = root?.querySelector(".hero-sax")
  const cv = saxBox?.querySelector(".hero-sax-cv")
  if (!cv) return
  const D = JSON.parse(root.querySelector(".hero-data").textContent)
  const now = Date.now()
  const topics = D.topics.map((t) => ({ ...t, recent: !!t.p && (now - Date.parse(t.p)) / 864e5 <= 45 })) // 빌드가 뜸해도 오늘 기준으로 다시 판정
  const keyLayer = saxBox.querySelector(".hero-keys")
  const tip = saxBox.querySelector(".hero-keytip")
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const cleanups = []
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)) }

  const C = L.SAX_CFG
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
  const placeTip = () => {
    const k = S.tipK
    if (k < 0 || !S.keys[k]) return
    const s = cv.clientWidth / W
    tip.style.left = S.keys[k][0] * s + "px"
    tip.style.top = S.keys[k][1] * s + "px"
  }
  const showTip = (k) => {
    S.tipK = k
    if (k < 0 || !topics[k]) { tip.hidden = true; return }
    const t = topics[k]
    tip.textContent = ""
    tip.append(el("b", null, t.label), " · " + t.n + "편" + (t.recent ? " · 최근 글" : ""))
    tip.hidden = false
    placeTip()
  }
  const sweepAt = (t) => {
    if (reduce) return () => 0
    const p = (t % 6) / 6
    if (p > 0.8) return () => 0
    const w = Math.max(50, 0.3 * W), X = -w + (W + 2 * w) * (p / 0.8)
    return (x) => Math.exp(-2.2 * ((x - X) / w) ** 2)
  }
  const draw = (nowT) => {
    if (!colors) return false
    const t = (nowT - S.t0) / 1000
    const sway = reduce ? 0 : 0.15 * Math.sin((t / 9) * Math.PI * 2)
    const { glyphs, keys } = L.composeSax(L.model, L.rasterSax, buf, L.fit, C, L.REST.ay + sway + S.off.ay, L.REST.ax + S.off.ax, sweepAt(t))
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
      ctx.font = (key[1] === "b" ? "8.5px" : "7.5px") + " " + L.FONT
      ctx.fillStyle = colors[+key[0]]
      for (const g of arr) ctx.fillText(g[2], g[0], g[1])
    }
    S.keys = keys
    // 운지 키: 원판 둘레를 비우고 원 테두리 + 글자. 눌림·hover는 굵기가 아니라 색(--dark)·크기로 구분
    const sc = cssW / W
    keys.forEach((p, i) => {
      const tpc = topics[i]; if (!tpc) return
      const hot = tpc.recent || S.tipK === i, ch = C.keyChars[i], music = i === 0, ring = C.keyRing
      const r = (ring ? 8 : 7) + (hot ? 1 : 0)
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath(); ctx.arc(p[0], p[1], r + 0.5, 0, Math.PI * 2); ctx.fill()
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = hot ? colors[3] : colors[1]
      if (ring) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.stroke() }
      ctx.font = music ? (hot ? "14px" : "12px") + " " + L.FONT : (hot ? "500 12.5px" : "500 11px") + " Inter, sans-serif"
      ctx.fillText(ch, p[0], p[1] + (music ? 0 : 0.5))
      const b = keyBtns[i]; if (b) { b.style.left = p[0] * sc + "px"; b.style.top = p[1] * sc + "px" }
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
  on(document, "pointerdown", (e) => { if (!e.target.closest?.(".hero-key")) { showTip(-1); kick() } })
  on(cv, "pointerdown", (e) => { S.drag = true; S.lx = e.clientX; S.ly = e.clientY; S.vel.ay = S.vel.ax = 0; cv.setPointerCapture?.(e.pointerId); saxBox.classList.add("is-dragging"); kick() })
  on(cv, "pointermove", (e) => { if (!S.drag) return; S.off.ay += (e.clientX - S.lx) * 0.012; S.off.ax += (e.clientY - S.ly) * 0.012; S.lx = e.clientX; S.ly = e.clientY; kick() })
  const up = () => { if (!S.drag) return; S.drag = false; saxBox.classList.remove("is-dragging"); kick() }
  on(cv, "pointerup", up); on(cv, "pointercancel", up)
  on(document, "visibilitychange", () => (document.hidden ? stop() : kick()))
  on(document, "themechange", () => { readColors(); draw(performance.now()) })
  const io = new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); visible ? kick() : stop() })
  io.observe(saxBox)
  cleanups.push(() => { stop(); io.disconnect() })
  // 주의: 글꼴 하위 집합이 올 때까지 기다린 뒤 첫 그리기(미적재 글자가 두부로 박히지 않게). 2.5초 넘으면 그냥 그린다.
  const fontsReady = Promise.race([Promise.all(L.FONT_LOADS.map(([f, t]) => document.fonts.load(f, t))), new Promise((r) => setTimeout(r, 2500))])
  fontsReady.then(() => { if (!root.isConnected) return; readColors(); draw(performance.now()); kick() })
  window.addCleanup?.(() => cleanups.forEach((fn) => fn()))
}
