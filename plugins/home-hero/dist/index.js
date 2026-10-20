// src/components/sax.ts
var SAX_REST = { ay: -0.35, ax: -0.25 };
function buildSax() {
  const P2 = [];
  const nrm = (a2) => {
    const l2 = Math.hypot(a2[0], a2[1], a2[2]) || 1;
    return [a2[0] / l2, a2[1] / l2, a2[2] / l2];
  };
  const push = (x2, y2, z2, nx, ny, nz, m2) => {
    P2.push(x2, y2, z2, nx, ny, nz, m2);
  };
  const tube = (path, rad, around, mat) => {
    for (let i2 = 0; i2 < path.length; i2++) {
      const p2 = path[i2];
      const q2 = path[Math.min(path.length - 1, i2 + 1)];
      const o2 = path[Math.max(0, i2 - 1)];
      const t2 = nrm([q2[0] - o2[0], q2[1] - o2[1], q2[2] - o2[2]]);
      let u3 = [t2[1], -t2[0], 0];
      if (Math.hypot(u3[0], u3[1]) < 1e-6) u3 = [1, 0, 0];
      u3 = nrm(u3);
      const v2 = nrm([
        t2[1] * u3[2] - t2[2] * u3[1],
        t2[2] * u3[0] - t2[0] * u3[2],
        t2[0] * u3[1] - t2[1] * u3[0]
      ]);
      const r2 = rad(i2 / (path.length - 1));
      for (let k = 0; k < around; k++) {
        const a2 = k / around * Math.PI * 2;
        const c2 = Math.cos(a2);
        const s2 = Math.sin(a2);
        const n2 = [u3[0] * c2 + v2[0] * s2, u3[1] * c2 + v2[1] * s2, u3[2] * c2 + v2[2] * s2];
        push(p2[0] + n2[0] * r2, p2[1] + n2[1] * r2, p2[2] + n2[2] * r2, n2[0], n2[1], n2[2], mat);
      }
    }
  };
  const seg = (a2, b2, n2) => Array.from({ length: n2 + 1 }, (_2, i2) => [
    a2[0] + (b2[0] - a2[0]) * i2 / n2,
    a2[1] + (b2[1] - a2[1]) * i2 / n2,
    a2[2] + (b2[2] - a2[2]) * i2 / n2
  ]);
  tube(seg([0, 0.95, 0], [0, -0.55, 0], 70), (t2) => 0.07 + 0.075 * t2, 56, 0);
  const bow = [];
  for (let i2 = 0; i2 <= 36; i2++) {
    const th = Math.PI * i2 / 36;
    bow.push([0.2 - 0.2 * Math.cos(th), -0.55 - 0.2 * Math.sin(th), 0]);
  }
  tube(bow, (t2) => 0.135 + 0.03 * t2, 48, 0);
  tube(seg([0.4, -0.55, 0], [0.44, 0, 0], 26), (t2) => 0.165 + 0.03 * t2 * t2, 56, 0);
  const fl = [];
  for (let i2 = 0; i2 <= 26; i2++) {
    const t2 = i2 / 26;
    fl.push([0.44 + 0.16 * t2 * t2, 0.26 * t2, -0.1 * t2 * t2]);
  }
  tube(fl, (t2) => 0.195 + 0.25 * Math.pow(t2, 2.4), 110, 0);
  const e2 = fl[fl.length - 1];
  for (let k = 0; k < 160; k++) {
    const a2 = k / 160 * Math.PI * 2;
    for (let m2 = 0; m2 < 10; m2++) {
      const b2 = m2 / 10 * Math.PI * 2;
      const rr = 0.445 + 0.025 * Math.cos(b2);
      push(
        e2[0] + rr * Math.cos(a2),
        e2[1] + 0.025 * Math.sin(b2),
        e2[2] + rr * Math.sin(a2),
        Math.cos(b2) * Math.cos(a2),
        Math.sin(b2),
        Math.cos(b2) * Math.sin(a2),
        1
      );
    }
  }
  for (let rr = 0; rr <= 0.43; rr += 0.012) {
    const n2 = Math.max(8, Math.round(rr * 200));
    for (let k = 0; k < n2; k++) {
      const a2 = k / n2 * Math.PI * 2;
      push(e2[0] + rr * Math.cos(a2), e2[1] - 0.03, e2[2] + rr * Math.sin(a2), 0, 1, 0, 2);
    }
  }
  const nk = [];
  for (let i2 = 0; i2 <= 40; i2++) {
    const t2 = i2 / 40;
    const th = t2 * Math.PI * 0.75;
    nk.push([-0.2 + 0.2 * Math.cos(th), 0.95 + 0.2 * Math.sin(th) + 0.02 * t2, 0]);
  }
  tube(nk, (t2) => 0.075 - 0.03 * t2, 30, 0);
  const last = nk[nk.length - 1];
  tube(seg(last, [last[0] - 0.12, last[1] - 0.11, 0], 14), (t2) => 0.045 - 0.01 * t2, 24, 3);
  [0.78, 0.62, 0.46, 0.3, 0.14, -0.02, -0.18].forEach((y2) => {
    const r2 = 0.07 + 0.075 * ((0.95 - y2) / 1.5);
    for (let a2 = 0; a2 < 1; a2 += 0.02) {
      for (let b2 = 0; b2 < Math.PI * 2; b2 += 0.12) {
        const rr = 0.06 * a2;
        push(rr * Math.cos(b2), y2 + rr * Math.sin(b2), -(r2 + 0.015) - 0.01 * (1 - a2), 0, 0, -1, 1);
      }
    }
  });
  return { pts: Float32Array.from(P2), bell: [e2[0], e2[1] + 0.04, e2[2]] };
}
function renderSax(sax, buf, ay, ax, time) {
  const COLS = 80;
  const ROWS = 44;
  const SX = 2;
  const SY = 3;
  const W = COLS * SX;
  const H2 = ROWS * SY;
  const ramp = "\xB7.-:~;+=*o%#@";
  const zb = buf.zb || (buf.zb = new Float32Array(W * H2));
  const br = buf.br || (buf.br = new Float32Array(W * H2));
  zb.fill(0);
  const P2 = sax.pts;
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const L2 = [-0.43, 0.57, -0.71];
  const hl = Math.hypot(L2[0], L2[1], L2[2] - 1);
  const Hx = L2[0] / hl;
  const Hy = L2[1] / hl;
  const Hz = (L2[2] - 1) / hl;
  const proj = (x2, y2, z2) => {
    x2 -= 0.12;
    y2 -= 0.24;
    const x1 = x2 * cy + z2 * sy;
    const z1 = -x2 * sy + z2 * cy;
    const y22 = y2 * cx - z1 * sx;
    const z22 = y2 * sx + z1 * cx;
    const d2 = 1 / (z22 + 4.2);
    return [COLS / 2 + 74 * 1.6667 * x1 * d2, ROWS / 2 - 74 * y22 * d2, d2];
  };
  for (let i2 = 0; i2 < P2.length; i2 += 7) {
    const pr = proj(P2[i2], P2[i2 + 1], P2[i2 + 2]);
    let nx = P2[i2 + 3] * cy + P2[i2 + 5] * sy;
    let nz = -P2[i2 + 3] * sy + P2[i2 + 5] * cy;
    const ny = P2[i2 + 4] * cx - nz * sx;
    nz = P2[i2 + 4] * sx + nz * cx;
    const lam = Math.max(0, nx * L2[0] + ny * L2[1] + nz * L2[2]);
    const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 20);
    const m2 = P2[i2 + 6];
    let b2 = 0.06 + 0.8 * lam + 0.5 * spec;
    if (nz > 0.05 && m2 !== 2) b2 *= 0.35;
    if (m2 === 2) b2 = 0.32;
    else if (m2 === 3) b2 = 0.2 + 0.3 * lam;
    else if (m2 === 1) b2 = Math.min(1, b2 + 0.25);
    const sc = Math.round(pr[0] * SX);
    const sr = Math.round(pr[1] * SY);
    const d2 = pr[2];
    for (let dy = 0; dy < 2; dy++)
      for (let dx = 0; dx < 2; dx++) {
        const c2 = sc + dx;
        const r2 = sr + dy;
        if (c2 < 0 || c2 >= W || r2 < 0 || r2 >= H2) continue;
        const k = r2 * W + c2;
        if (d2 > zb[k]) {
          zb[k] = d2;
          br[k] = b2 > 1 ? 1 : b2;
        }
      }
  }
  const fxg = buf.fxg || (buf.fxg = new Float32Array(COLS * ROWS));
  fxg.fill(0);
  const bp = proj(sax.bell[0], sax.bell[1], sax.bell[2]);
  const streams = [
    { dx: -3, ph: 0, sp: 0.16 },
    { dx: 1.5, ph: 2.1, sp: 0.21 },
    { dx: 5, ph: 4.2, sp: 0.13 }
  ];
  for (const s2 of streams) {
    const amp = 0.6 + 0.4 * Math.sin(time * 0.8 + s2.ph);
    for (let j2 = 0; j2 < 14; j2++) {
      const f3 = (time * s2.sp + j2 / 14 + s2.ph) % 1;
      const c2 = Math.round(
        bp[0] + s2.dx + f3 * 6 + Math.sin(f3 * 6 + s2.ph + time * 0.6) * (0.6 + f3 * 2.2)
      );
      const r2 = Math.round(bp[1] - 2 - f3 * 11);
      if (c2 >= 0 && c2 < COLS && r2 >= 0 && r2 < ROWS) {
        const k = r2 * COLS + c2;
        fxg[k] = fxg[k] + Math.pow(Math.sin(f3 * Math.PI), 1.5) * amp;
      }
    }
  }
  const fxc = " \xB7.:~";
  let ink = "";
  let fx = "";
  for (let r2 = 0; r2 < ROWS; r2++) {
    let li = "";
    let lf = "";
    for (let c2 = 0; c2 < COLS; c2++) {
      let n2 = 0;
      let tot = 0;
      for (let a2 = 0; a2 < SY; a2++)
        for (let b2 = 0; b2 < SX; b2++) {
          const k = (r2 * SY + a2) * W + c2 * SX + b2;
          if (zb[k] > 0) {
            n2++;
            tot += br[k];
          }
        }
      const cov = n2 / (SX * SY);
      const fv = fxg[r2 * COLS + c2];
      if (cov >= 0.34) {
        li += ramp[Math.min(ramp.length - 1, Math.round(tot / n2 * (ramp.length - 1)))];
        lf += " ";
      } else if (fv > 0.12) {
        li += " ";
        lf += fxc[Math.min(4, 1 + Math.floor(fv * 4))];
      } else {
        li += " ";
        lf += " ";
      }
    }
    ink += li.replace(/\s+$/, "") + (r2 < ROWS - 1 ? "\n" : "");
    fx += lf.replace(/\s+$/, "") + (r2 < ROWS - 1 ? "\n" : "");
  }
  return { ink, fx };
}

// src/components/styles/hero.scss
var hero_default = ".home-hero {\n  display: flex;\n  align-items: center;\n  gap: 24px 48px;\n  padding: 56px 0 88px;\n}\n@media all and (max-width: 800px) {\n  .home-hero {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 8px;\n    padding: 12px 0 56px;\n  }\n}\n\n.hero-text {\n  flex: 1 1 420px;\n  min-width: 0;\n}\n@media all and (max-width: 800px) {\n  .hero-text {\n    flex-basis: auto;\n  }\n}\n\n.hero-headline {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-weight: 900;\n  font-size: clamp(2.5rem, 6vw, 3.75rem);\n  line-height: 1.1;\n  letter-spacing: -0.02em;\n  color: var(--dark);\n}\n\n.hero-author {\n  margin: 14px 0 0;\n  font-family: var(--headerFont);\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: var(--darkgray);\n}\n@media all and (max-width: 800px) {\n  .hero-author {\n    margin-top: 10px;\n    font-size: 1rem;\n  }\n}\n\n.hero-description {\n  margin: 26px 0 0;\n  max-width: 29em;\n  font-family: var(--headerFont);\n  font-size: 17px;\n  line-height: 1.85;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n@media all and (max-width: 800px) {\n  .hero-description {\n    margin-top: 20px;\n    font-size: 16px;\n    line-height: 1.8;\n  }\n}\n\n.hero-links {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  margin: 26px 0 0;\n}\n.hero-links a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 0 16px;\n  box-sizing: border-box;\n  border-radius: 10px;\n  background: rgba(var(--accent-rgb), 0.08);\n  color: var(--secondary);\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.hero-links a:hover {\n  background: rgba(var(--accent-rgb), 0.16);\n}\n@media all and (max-width: 800px) {\n  .hero-links a {\n    min-height: 44px;\n  }\n}\n@media all and (max-width: 800px) {\n  .hero-links {\n    margin-top: 16px;\n  }\n}\n\n.hero-meta {\n  margin: 12px 0 0;\n  font-family: var(--codeFont);\n  font-size: 12px;\n  letter-spacing: 0.02em;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n@media all and (max-width: 800px) {\n  .hero-meta {\n    margin-top: 4px;\n    font-size: 11.5px;\n  }\n}\n\n.hero-num {\n  display: inline-block;\n  min-width: 1ch;\n}\n\n.hero-num-total {\n  min-width: 3ch;\n  text-align: right;\n}\n\n.hero-sax-figure {\n  flex: 0 0 auto;\n  margin: 0;\n}\n@media all and (max-width: 800px) {\n  .hero-sax-figure {\n    order: -1;\n    margin: 0 auto;\n  }\n}\n\n.hero-sax {\n  position: relative;\n  width: 340px;\n  height: 336px;\n  cursor: grab;\n  touch-action: pan-y;\n  user-select: none;\n  -webkit-user-select: none;\n}\n.hero-sax.is-dragging {\n  cursor: grabbing;\n}\n@media all and (max-width: 800px) {\n  .hero-sax {\n    width: 250px;\n    height: 250px;\n  }\n}\n\n.hero-sax-ink,\n.hero-sax-fx {\n  position: absolute;\n  inset: 0;\n  margin: 0;\n  font-family: var(--codeFont);\n  font-size: 7px;\n  line-height: 7.6px;\n  letter-spacing: 0.02px;\n  white-space: pre;\n  pointer-events: none;\n}\n@media all and (max-width: 800px) {\n  .hero-sax-ink,\n  .hero-sax-fx {\n    font-size: 5.2px;\n    line-height: 5.65px;\n  }\n}\n\n.hero-sax-ink {\n  color: var(--secondary);\n}\n\n.hero-sax-fx {\n  color: color-mix(in srgb, var(--secondary) 50%, var(--light));\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  :root:not([data-hero-swept]) .hero-headline {\n    background-image: linear-gradient(90deg, currentColor 0 50%, transparent 50% 100%);\n    background-size: 200% 100%;\n    background-position: 100% 0;\n    -webkit-background-clip: text;\n    background-clip: text;\n    -webkit-text-fill-color: transparent;\n    animation: hero-sweep 1.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) 0.15s forwards;\n  }\n  :root:not([data-hero-swept]) .hero-rise {\n    animation: hero-rise var(--dur-slow, 900ms) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) both;\n  }\n  :root:not([data-hero-swept]) .hero-rise-1 {\n    animation-delay: 0.12s;\n  }\n  :root:not([data-hero-swept]) .hero-rise-2 {\n    animation-delay: 0.24s;\n  }\n  :root:not([data-hero-swept]) .hero-rise-3 {\n    animation-delay: 0.36s;\n  }\n}\n@keyframes hero-sweep {\n  to {\n    background-position: 0 0;\n  }\n}\n@keyframes hero-rise {\n  from {\n    opacity: 0;\n    transform: translateY(12px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}";

// ../_shared/notes.ts
function isRealNote(slug) {
  if (!slug) return false;
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
var l;
function S(n2) {
  return n2.children;
}
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/HomeHero.tsx
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
var GOATCOUNTER_SITE = "haejunhyun";
var sweptScript = `try { if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`;
var heroScript = `
const buildSax = (${buildSax.toString()});
const renderSax = (${renderSax.toString()});
const REST = ${JSON.stringify(SAX_REST)};
let saxModel = null;

function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const base = "https://${GOATCOUNTER_SITE}.goatcounter.com/counter/TOTAL.json"
  const day = new Date().toISOString().slice(0, 10)
  const next = new Date(Date.now() + 864e5).toISOString().slice(0, 10)
  const get = (url, el) =>
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && el) el.textContent = d.count })
      .catch(() => {})
  get(base, total)
  get(base + "?start=" + day + "&end=" + next, today)
}

function markHeroSwept() {
  const root = document.documentElement
  if (!document.querySelector(".home-hero") || root.hasAttribute("data-hero-swept")) return
  try { sessionStorage.setItem("hero-swept", "1") } catch {}
  window.addCleanup(() => root.setAttribute("data-hero-swept", ""))
}

function initHeroSax() {
  const box = document.querySelector(".hero-sax")
  const inkEl = box?.querySelector(".hero-sax-ink")
  const fxEl = box?.querySelector(".hero-sax-fx")
  if (!box || !inkEl || !fxEl) return
  saxModel = saxModel || buildSax()
  const buf = {}
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const m = { ay: REST.ay, ax: REST.ax, vy: 0, vx: 0, t: 0, drag: false, lx: 0, ly: 0, lt: 0 }
  let raf = 0, prev = 0, acc = 0, visible = false

  const draw = () => {
    const f = renderSax(saxModel, buf, m.ay, m.ax, m.t)
    inkEl.textContent = f.ink
    fxEl.textContent = f.fx
  }
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; prev = 0 }
  const schedule = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame) }
  // \uC790\uB3D9 \uD68C\uC804 \u2192 \uC190 \uB5BC\uBA74 \uAD00\uC131 \uAC10\uC1E0 + \uAE30\uC6B8\uAE30 \uBCF5\uADC0. \uADF8\uB9AC\uAE30\uB294 30fps\uB85C \uC81C\uD55C\uD55C\uB2E4.
  function frame(now) {
    raf = 0
    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60
    prev = now
    const spin = reduce ? 0 : 0.3
    if (!m.drag) {
      m.vy += (spin - m.vy) * (1 - Math.exp(-dt * 2.2))
      m.vx += (REST.ax - m.ax) * 30 * dt
      m.vx *= Math.exp(-dt * 5)
      m.ay += m.vy * dt
      m.ax += m.vx * dt
    }
    if (!reduce) m.t += dt
    acc += dt
    if (acc >= 1 / 30) { acc = 0; draw() }
    if (reduce && !m.drag && Math.abs(m.vy) < 0.001 && Math.abs(m.vx) < 0.001) { prev = 0; return }
    schedule()
  }

  const down = (e) => {
    m.drag = true; m.lx = e.clientX; m.ly = e.clientY; m.lt = performance.now(); m.vy = 0; m.vx = 0
    box.setPointerCapture?.(e.pointerId)
    box.classList.add("is-dragging")
    schedule()
  }
  const move = (e) => {
    if (!m.drag) return
    const now = performance.now(), dt = Math.max(0.008, (now - m.lt) / 1000)
    const dx = e.clientX - m.lx, dy = e.clientY - m.ly
    m.lx = e.clientX; m.ly = e.clientY; m.lt = now
    m.ay += dx * 0.012; m.ax += dy * 0.012
    m.vy = (dx * 0.012) / dt; m.vx = (dy * 0.012) / dt
  }
  const up = () => {
    if (!m.drag) return
    m.drag = false
    if (performance.now() - m.lt > 80) { m.vy = 0; m.vx = 0 }
    box.classList.remove("is-dragging")
    schedule()
  }
  const onVisibility = () => (document.hidden ? stop() : schedule())
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((en) => en.isIntersecting)
    visible ? schedule() : stop()
  })

  io.observe(box)
  box.addEventListener("pointerdown", down)
  box.addEventListener("pointermove", move)
  box.addEventListener("pointerup", up)
  box.addEventListener("pointercancel", up)
  document.addEventListener("visibilitychange", onVisibility)
  window.addCleanup(() => {
    stop()
    io.disconnect()
    box.removeEventListener("pointerdown", down)
    box.removeEventListener("pointermove", move)
    box.removeEventListener("pointerup", up)
    box.removeEventListener("pointercancel", up)
    document.removeEventListener("visibilitychange", onVisibility)
  })
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  markHeroSwept()
  initHeroSax()
})
`;
var defaultOptions = {
  headline: "",
  author: "",
  description: "",
  links: []
};
var saxModel;
var firstFrame;
function getFirstFrame() {
  saxModel ??= buildSax();
  firstFrame ??= renderSax(saxModel, {}, SAX_REST.ay, SAX_REST.ax, 0);
  return firstFrame;
}
var HomeHero_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const HomeHero = (props) => {
    const { fileData, allFiles, displayClass } = props;
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles.filter(
      (f3) => f3.slug !== fileData.slug && isRealNote(f3.slug) && (f3.slug ?? "").includes("/")
    );
    const noteCount = files.length;
    const topicCount = new Set(files.map((f3) => (f3.slug ?? "").split("/")[0]).filter(Boolean)).size;
    const frame = getFirstFrame();
    const description = opts.description || (fileData.frontmatter?.description ?? "");
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      /* @__PURE__ */ u2("div", { class: "hero-text", children: [
        /* @__PURE__ */ u2("h1", { class: "hero-headline", children: opts.headline }),
        opts.author && /* @__PURE__ */ u2("p", { class: "hero-author hero-rise hero-rise-1", children: opts.author }),
        description && /* @__PURE__ */ u2("p", { class: "hero-description hero-rise hero-rise-2", children: description }),
        /* @__PURE__ */ u2("div", { class: "hero-rise hero-rise-3", children: [
          opts.links.length > 0 && /* @__PURE__ */ u2("p", { class: "hero-links", children: opts.links.map((link) => /* @__PURE__ */ u2("a", { href: link.href, children: link.label })) }),
          /* @__PURE__ */ u2("p", { class: "hero-meta", children: [
            noteCount,
            " notes \xB7 ",
            topicCount,
            " topics \xB7",
            " ",
            /* @__PURE__ */ u2("span", { id: "hero-visits-total", class: "hero-num hero-num-total", children: "-" }),
            " ",
            "visits \xB7",
            " ",
            /* @__PURE__ */ u2("span", { id: "hero-visits-today", class: "hero-num", children: "-" }),
            " ",
            "today"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u2("figure", { class: "hero-sax-figure hero-rise hero-rise-1", "aria-hidden": "true", children: /* @__PURE__ */ u2("div", { class: "hero-sax", children: [
        /* @__PURE__ */ u2("div", { class: "hero-sax-ink", children: frame.ink }),
        /* @__PURE__ */ u2("div", { class: "hero-sax-fx", children: frame.fx })
      ] }) })
    ] });
  };
  HomeHero.css = hero_default;
  HomeHero.beforeDOMLoaded = sweptScript;
  HomeHero.afterDOMLoaded = heroScript;
  return HomeHero;
});

export { HomeHero_default as HomeHero };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map