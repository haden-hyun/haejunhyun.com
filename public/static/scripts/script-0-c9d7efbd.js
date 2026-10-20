
const buildSax = (function buildSax() {
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
});
const renderSax = (function renderSax(sax, buf, ay, ax, time) {
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
});
const REST = {"ay":-0.35,"ax":-0.25};
let saxModel = null;

function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const base = "https://haejunhyun.goatcounter.com/counter/TOTAL.json"
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
  // 자동 회전 → 손 떼면 관성 감쇠 + 기울기 복귀. 그리기는 30fps로 제한한다.
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
