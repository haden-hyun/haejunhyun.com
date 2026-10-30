// @ts-nocheck
// 히어로 브라우저 로직(nav마다 HomeHero의 인라인 스크립트가 호출).
// - 색소폰: 기울어진 3D 점군을 하프톤 점으로 그린다. 9초에 한 바퀴(악기 축), 각도마다 보이는 중심을 캔버스 중심에 맞춰 흔들리지 않게 한다
// - 악보: 글자 위치를 재서 SVG로 그린다(음자리표·조표·박자표·오선·음표 11개·마디선). 좁은 화면은 오선과 음표만
// - 연출은 CSS가 재생한다(.hero-ready가 붙으면 시작). 클릭하면 건너뛴다. 화면 밖·탭 숨김에서 rAF 정지, 30fps 상한, 감속 모션이면 정지 자세
// 주의: toString()으로 인라인 스크립트에 직렬화된다. 바깥 식별자·import를 참조하지 말 것(전부 L로 받는다).
export function heroClient(L) {
  const root = document.querySelector(".home-hero")
  const h1 = root?.querySelector(".hero-headline")
  if (!h1) return
  const wrap = h1.closest(".hero-title") || h1.parentElement
  const slot = h1.querySelector(".hero-sax")
  const cv = slot?.querySelector("canvas")
  if (!cv || h1.dataset.notation !== "on") { h1.classList.add("hero-ready"); return }

  const html = document.documentElement
  const TAU = Math.PI * 2
  const SAX = L.SAX, NOTES = L.NOTES
  const EXT = JSON.parse(slot.dataset.ext)
  const PTS = L.model.pts, N = PTS.length / 7
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const cleanups = []
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)) }
  const cssNum = (name, fallback) => { const v = parseFloat(getComputedStyle(h1).getPropertyValue(name)); return Number.isFinite(v) ? v : fallback }
  const f1 = (x) => Math.round(x * 10) / 10
  // 시간 토큰은 sass가 450ms를 0.45s로 바꿔 내보낼 수 있다 — 단위를 보고 ms로 읽는다
  const cssMs = (name, fallback) => { const v = getComputedStyle(h1).getPropertyValue(name).trim(); const n = parseFloat(v); return !Number.isFinite(n) ? fallback : v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : n }

  // ── 색소폰 ────────────────────────────────────────────────────────────
  const ctx = cv.getContext("2d")
  let ROWS = 44, W = 0, H = 0, GW = 0, depth = null, shade = null
  let ay = SAX.rest, speed = reduce ? 0 : TAU / SAX.period
  let raf = 0, prev = 0, visible = false, colors = null
  // 정리는 초기화 중 예외가 나도 남도록 가장 먼저 등록한다
  window.addCleanup?.(() => { if (raf) cancelAnimationFrame(raf); cleanups.forEach((fn) => fn()) })
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  let LX = -0.5, LY = 0.6, LZ = 0.62
  const LL = Math.hypot(LX, LY, LZ); LX /= LL; LY /= LL; LZ /= LL

  const hex = (v) => {
    v = v.trim()
    if (v[0] === "#") { if (v.length === 4) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)] }
    const m = v.match(/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/)
    return m ? [+m[1], +m[2], +m[3]] : [28, 95, 149]
  }
  const readColors = () => {
    const cs = getComputedStyle(cv)
    colors = { a: hex(cs.getPropertyValue("--secondary")), b: hex(cs.getPropertyValue("--dark")), dark: html.getAttribute("saved-theme") === "dark" }
  }
  const centerAt = (a) => {
    if (speed <= 0) return [EXT.cx, EXT.cy]
    const T = EXT.cxt.length, u = ((((a % TAU) + TAU) % TAU) / TAU) * T, i = Math.floor(u) % T, j = (i + 1) % T, f = u - Math.floor(u)
    return [EXT.cxt[i] + (EXT.cxt[j] - EXT.cxt[i]) * f, EXT.cyt[i] + (EXT.cyt[j] - EXT.cyt[i]) * f]
  }
  const size = () => {
    const r = cv.getBoundingClientRect()
    ROWS = Math.max(18, Math.round(r.height / 1.9))
    W = Math.max(8, Math.round(r.width * dpr)); H = Math.max(8, Math.round(r.height * dpr))
    cv.width = W; cv.height = H
    GW = Math.ceil(W / (H / ROWS))
    depth = new Float32Array(GW * ROWS); shade = new Float32Array(GW * ROWS)
    draw()
  }
  const draw = () => {
    if (!colors || !depth) return
    const pitch = H / ROWS, sc = H / EXT.h, cc = centerAt(ay)
    const ca = Math.cos(ay), sa = Math.sin(ay), cr = Math.cos(SAX.tilt), sr = Math.sin(SAX.tilt), cxA = Math.cos(SAX.ax), sxA = Math.sin(SAX.ax)
    const o = [0, 0, 0], on3 = [0, 0, 0]
    depth.fill(-1e9); shade.fill(-1)
    for (let i = 0; i < N; i++) {
      const q = i * 7
      L.saxXf(PTS[q] - SAX.cx0, PTS[q + 1] - SAX.cy0, PTS[q + 2] - SAX.cz0, ca, sa, cr, sr, cxA, sxA, o)
      const gx = Math.floor((W / 2 + (o[0] - cc[0]) * sc) / pitch), gy = Math.floor((H / 2 - (o[1] - cc[1]) * sc) / pitch)
      if (gx < 0 || gx >= GW || gy < 0 || gy >= ROWS) continue
      const gi = gy * GW + gx
      if (o[2] <= depth[gi]) continue
      depth[gi] = o[2]
      L.saxXf(PTS[q + 3], PTS[q + 4], PTS[q + 5], ca, sa, cr, sr, cxA, sxA, on3)
      const l = Math.max(0, on3[0] * LX + on3[1] * LY + on3[2] * LZ)
      shade[gi] = 0.18 + 0.82 * Math.pow(l, 0.9)
    }
    ctx.clearRect(0, 0, W, H)
    const A = colors.a, B = colors.b
    for (let gy = 0; gy < ROWS; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        const s = shade[gy * GW + gx]
        if (s < 0) continue
        const a = colors.dark ? s : 1 - s, rad = pitch * 0.5 * (0.62 + 0.5 * a)
        ctx.fillStyle = `rgb(${Math.round(A[0] + (B[0] - A[0]) * a)},${Math.round(A[1] + (B[1] - A[1]) * a)},${Math.round(A[2] + (B[2] - A[2]) * a)})`
        ctx.beginPath(); ctx.arc((gx + 0.5) * pitch, (gy + 0.5) * pitch, rad, 0, TAU); ctx.fill()
      }
    }
  }
  const tick = (t) => {
    if (!prev) prev = t
    const dt = Math.min(0.1, (t - prev) / 1000)
    if (dt >= 1 / 30) { prev = t; ay += speed * dt; draw() }
    raf = visible && !document.hidden && speed > 0 ? requestAnimationFrame(tick) : 0
  }
  const kick = () => { if (!raf && visible && !document.hidden && speed > 0) { prev = 0; raf = requestAnimationFrame(tick) } }
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

  // ── 악보 ──────────────────────────────────────────────────────────────
  const LIDX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
  const stepOf = (n) => n[3] * 7 + LIDX[n[1]] - 30 // 높은음자리표 맨 아랫줄(E4) = 0, 칸·줄이 번갈아 1씩
  // 색소폰 중심을 대문자 높이의 중심에 맞춘다(보이는 무게 기준). 슬롯 하나만 움직이므로 글자 레이아웃은 그대로다.
  const alignSax = () => {
    slot.style.transform = ""
    let bl = h1.querySelector(".hero-bl")
    if (!bl) { bl = document.createElement("span"); bl.className = "hero-bl"; bl.setAttribute("aria-hidden", "true"); h1.insertBefore(bl, h1.firstChild) }
    const cs = getComputedStyle(h1), c2 = document.createElement("canvas").getContext("2d")
    c2.font = `${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`
    const asc = c2.measureText("B").actualBoundingBoxAscent
    const capC = bl.getBoundingClientRect().bottom - asc / 2, r = cv.getBoundingClientRect()
    slot.style.transform = `translateY(${capC - (r.top + r.bottom) / 2}px)`
  }
  const buildScore = () => {
    wrap.querySelector("svg.hero-score")?.remove()
    const tr = h1.getBoundingClientRect()
    const els = [...h1.querySelectorAll(".hl"), slot]
    if (els.length !== NOTES.length) return
    const R = els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left - tr.left, r: r.right - tr.left, c: (r.left + r.right) / 2 - tr.left } })
    const s = cssNum("--s", 8), pad = cssNum("--pad", 9.5 * s), BASE = cssMs("--hero-base", 450), STEP = cssMs("--hero-step", 90)
    const bare = tr.width < 560 // 좁은 화면은 음자리표·조표·박자표 없이 오선과 음표만
    const need = bare ? 0.9 * s : 10.75 * s
    const ctr = tr.width / 2
    const half = Math.min(Math.max(ctr - (R[0].l - need), R[10].r + 0.7 * s - ctr), ctr - 0.3 * s)
    const xL = ctr - half, xEnd = ctr + half, yb = 6.6 * s
    const sy = (st) => yb - (st * s) / 2
    let o = ""
    for (let k = 0; k < 5; k++) o += `<line class="ln" style="--k:${k}" x1="${f1(xL)}" x2="${f1(xEnd)}" y1="${f1(yb - k * s)}" y2="${f1(yb - k * s)}"/>`
    if (!bare) {
      const xc = xL + 0.4 * s, xk = xc + 3.3 * s, fl = [4, 7, 3]
      o += `<text class="clef pop" style="--d:200ms" x="${f1(xc)}" y="${f1(yb)}" font-size="${4 * s}">\u{1D11E}</text>`
      for (let q = 0; q < 3; q++) o += `<text class="ks pop" style="--d:${260 + 60 * q}ms" x="${f1(xk + q * 1.15 * s)}" y="${f1(sy(fl[q]) + 0.5 * s)}" font-size="${3.6 * s}">♭</text>`
      o += `<text class="ks pop" style="--d:440ms" x="${f1(xk + 3.45 * s + 0.8 * s)}" y="${f1(yb)}" font-size="${4 * s}">\u{1D134}</text>`
    }
    const rx = 0.66 * s, ry = 0.46 * s
    const st = NOTES.map(stepOf), cx = R.map((r) => r.c), cy = st.map(sy)
    const info = {}
    ;[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]].forEach((g) => { // 빔 묶음: 평균이 가운데 줄 이상이면 기둥 아래, 아니면 위. 기울기 최대 1.25칸, 기둥 최소 3칸
      const down = g.reduce((a, i) => a + st[i], 0) / g.length >= 4
      const sx = g.map((i) => (down ? cx[i] - rx + 0.6 : cx[i] + rx - 0.6)), n = g.length, dx = sx[n - 1] - sx[0]
      const raw = (cy[g[n - 1]] - cy[g[0]]) / dx, maxS = (1.25 * s) / dx, m = Math.max(-maxS, Math.min(maxS, raw * 0.6)), Lm = 3 * s
      let b = down ? -Infinity : Infinity
      g.forEach((i, j) => { b = down ? Math.max(b, cy[i] + Lm - m * (sx[j] - sx[0])) : Math.min(b, cy[i] - Lm - m * (sx[j] - sx[0])) })
      g.forEach((i, j) => { info[i] = { sx: sx[j], by: b + m * (sx[j] - sx[0]), down, j, g } })
    })
    NOTES.forEach((n, i) => {
      const c = cx[i], y = cy[i], stp = st[i]
      let g = `<g class="pop ng" style="--d:${BASE + i * STEP}ms">`
      if (stp >= 10) for (let e = 10; e <= stp; e += 2) g += `<line class="led" x1="${f1(c - 1.35 * rx)}" x2="${f1(c + 1.35 * rx)}" y1="${f1(sy(e))}" y2="${f1(sy(e))}"/>`
      if (stp <= -2) for (let e = -2; e >= stp; e -= 2) g += `<line class="led" x1="${f1(c - 1.35 * rx)}" x2="${f1(c + 1.35 * rx)}" y1="${f1(sy(e))}" y2="${f1(sy(e))}"/>`
      const acc = bare ? (n[2] < 0 ? "♭" : "") : i === 4 ? "♮" : "" // 조표가 없으면 ♭을 음마다, 조표가 있으면 조표 B♭을 되돌리는 B에만 ♮
      if (acc) g += `<text class="acc" text-anchor="end" x="${f1(c - rx - 0.4 * s)}" y="${f1(y + 0.5 * s)}" font-size="${3.6 * s}">${acc}</text>`
      const q = info[i]
      if (q) {
        g += `<line class="stem" x1="${f1(q.sx)}" x2="${f1(q.sx)}" y1="${f1(y)}" y2="${f1(q.by)}"/>`
        if (q.j > 0) {
          const p = info[q.g[q.j - 1]], t = 0.5 * s
          const P = q.down ? [[p.sx, p.by - t], [q.sx, q.by - t], [q.sx, q.by], [p.sx, p.by]] : [[p.sx, p.by], [q.sx, q.by], [q.sx, q.by + t], [p.sx, p.by + t]]
          g += `<polygon class="bm" points="${P.map((a) => f1(a[0]) + "," + f1(a[1])).join(" ")}"/>`
        }
      } else {
        const dn = stp >= 4, sxx = dn ? c - rx + 0.6 : c + rx - 0.6
        g += `<line class="stem" x1="${f1(sxx)}" x2="${f1(sxx)}" y1="${f1(y)}" y2="${f1(dn ? y + 3.5 * s : y - 3.5 * s)}"/>`
      }
      const head = `cx="${f1(c)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(-20 ${f1(c)} ${f1(y)})"`
      if (n[4] === "dh") g += `<ellipse class="hv" ${head}/><circle class="dot" cx="${f1(c + rx + 0.6 * s)}" cy="${f1(stp % 2 === 0 ? y - 0.5 * s : y)}" r="${f1(0.2 * s)}"/>`
      else g += `<ellipse class="hd" ${head}/>`
      o += g + "</g>"
    })
    const xm = (R[7].r + R[8].l) / 2
    o += `<line class="bar pop" style="--d:${BASE + 7.5 * STEP}ms" x1="${f1(xm)}" x2="${f1(xm)}" y1="${f1(yb)}" y2="${f1(yb - 4 * s)}"/>`
    o += `<g class="pop fb" style="--d:${BASE + 11 * STEP}ms"><line class="bar" x1="${f1(xEnd - 0.5 * s)}" x2="${f1(xEnd - 0.5 * s)}" y1="${f1(yb)}" y2="${f1(yb - 4 * s)}"/><line class="barT" x1="${f1(xEnd)}" x2="${f1(xEnd)}" y1="${f1(yb)}" y2="${f1(yb - 4 * s)}"/></g>`
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("class", "hero-score"); svg.setAttribute("width", tr.width); svg.setAttribute("height", pad)
    svg.setAttribute("viewBox", `0 0 ${tr.width} ${pad}`); svg.setAttribute("aria-hidden", "true")
    svg.innerHTML = o
    wrap.insertBefore(svg, wrap.firstChild)
  }
  const layout = () => { alignSax(); buildScore(); size() }

  // ── 시작 ──────────────────────────────────────────────────────────────
  on(document, "visibilitychange", () => (document.hidden ? stop() : kick()))
  on(document, "themechange", () => { readColors(); draw() })
  const io = new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); visible ? kick() : stop() })
  io.observe(cv); cleanups.push(() => io.disconnect())
  let pend = 0
  const ro = new ResizeObserver(() => { if (pend) return; pend = requestAnimationFrame(() => { pend = 0; if (h1.isConnected) layout() }) })
  ro.observe(h1); cleanups.push(() => { ro.disconnect(); if (pend) cancelAnimationFrame(pend) })
  // 연출 중 클릭하면 건너뛴다(감속 모션 아닌 경우의 "Let people cancel motion")
  on(root, "pointerdown", () => html.setAttribute("data-hero-swept", ""))

  // 글꼴 로드가 거부돼도 히어로는 끝까지 진행한다(악보 글리프는 폴백 글꼴로 그려진다)
  const fontsReady = Promise.race([Promise.all([...L.FONT_LOADS.map(([f, t]) => document.fonts.load(f, t).catch(() => {})), document.fonts.ready.catch(() => {})]), new Promise((r) => setTimeout(r, 2500))]).catch(() => {})
  // 헤드라인 글꼴이 늦게 들어와 글자 폭이 바뀌면 악보를 다시 맞춘다(h1 박스 크기는 안 변해 ResizeObserver가 못 잡는다)
  if (document.fonts?.addEventListener) on(document.fonts, "loadingdone", () => { if (h1.isConnected) layout() })
  fontsReady.then(() => {
    if (!h1.isConnected) return
    readColors(); layout(); kick()
    wrap.classList.add("hero-ready") // 악보 SVG는 h1 밖 래퍼에 있다 — 둘 다에 단다
    h1.classList.add("hero-ready") // 이 시점부터 CSS 연출이 시작한다. 악보·글자·색소폰이 같은 시계를 쓴다
    if (!reduce && !html.hasAttribute("data-hero-swept")) {
      const t = setTimeout(() => html.setAttribute("data-hero-swept", ""), 2400) // 끝난 뒤 크기 변경으로 악보를 다시 그려도 연출이 재시작하지 않게
      cleanups.push(() => clearTimeout(t))
    }
  })
}
