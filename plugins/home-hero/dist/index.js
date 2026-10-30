// src/components/sax.ts
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
        push(rr * Math.cos(b2), y2 + rr * Math.sin(b2), -(r2 + 0.015) - 0.01 * (1 - a2), 0, 0, -1, 4);
      }
    }
  });
  return { pts: Float32Array.from(P2), bell: [e2[0], e2[1] + 0.04, e2[2]] };
}
var SAX = {
  tilt: 20 * Math.PI / 180,
  // 연주 자세 20°(반시계)
  ax: -0.25,
  // 살짝 고개 숙인 시점
  rest: -0.35,
  // 정지·감속 모션 자세(yaw)
  period: 9,
  // 한 바퀴(초)
  cx0: 0.29,
  cy0: 0.16,
  cz0: -0.1,
  steps: 48
  // 각도별 중심 표 개수
};
function saxXf(x2, y2, z2, ca, sa, cr, sr, cxA, sxA, out) {
  const x1 = x2 * ca + z2 * sa;
  const z1 = -x2 * sa + z2 * ca;
  const y22 = y2 * cxA - z1 * sxA;
  out[0] = x1 * cr - y22 * sr;
  out[1] = x1 * sr + y22 * cr;
  out[2] = y2 * sxA + z1 * cxA;
}
function saxExtent(model) {
  const { tilt, ax, rest, cx0, cy0, cz0, steps } = SAX;
  const cr = Math.cos(tilt), sr = Math.sin(tilt), cxA = Math.cos(ax), sxA = Math.sin(ax);
  const o2 = [0, 0, 0];
  const P2 = model.pts;
  const bbox = (a2) => {
    const ca = Math.cos(a2), sa = Math.sin(a2);
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (let i2 = 0; i2 < P2.length / 7; i2 += 7) {
      const q2 = i2 * 7;
      saxXf(P2[q2] - cx0, P2[q2 + 1] - cy0, P2[q2 + 2] - cz0, ca, sa, cr, sr, cxA, sxA, o2);
      if (o2[0] < mnx) mnx = o2[0];
      if (o2[0] > mxx) mxx = o2[0];
      if (o2[1] < mny) mny = o2[1];
      if (o2[1] > mxy) mxy = o2[1];
    }
    return [mnx, mxx, mny, mxy];
  };
  const cxt = [], cyt = [];
  let umny = 1e9, umxy = -1e9, hx = 0, hy = 0;
  for (let k = 0; k < steps; k++) {
    const b2 = bbox(k / steps * Math.PI * 2);
    cxt.push(+((b2[0] + b2[1]) / 2).toFixed(4));
    cyt.push(+((b2[2] + b2[3]) / 2).toFixed(4));
    umny = Math.min(umny, b2[2]);
    umxy = Math.max(umxy, b2[3]);
    hx = Math.max(hx, (b2[1] - b2[0]) / 2);
    hy = Math.max(hy, (b2[3] - b2[2]) / 2);
  }
  const r2 = bbox(rest);
  const uh = (umxy - umny) * 1.03;
  return {
    k: +(2 * hy * 1.03 / uh).toFixed(4),
    ar: +(hx / hy).toFixed(4),
    h: +(2 * hy * 1.03).toFixed(4),
    cx: +((r2[0] + r2[1]) / 2).toFixed(4),
    cy: +((r2[2] + r2[3]) / 2).toFixed(4),
    cxt,
    cyt
  };
}
var HERO_NOTES = [
  ["B", "D", 0, 4, "e"],
  ["l", "F", 0, 4, "e"],
  ["u", "A", -1, 4, "e"],
  ["e", "C", 0, 5, "e"],
  ["N", "B", 0, 4, "e"],
  ["o", "G", 0, 4, "e"],
  ["t", "F", 0, 4, "e"],
  ["e", "D", 0, 4, "e"],
  ["s", "E", -1, 4, "e"],
  [".", "G", 0, 4, "e"],
  ["sax", "C", 0, 5, "dh"]
];

// src/components/client.ts
function heroClient(L2) {
  const root = document.querySelector(".home-hero");
  const h1 = root?.querySelector(".hero-headline");
  if (!h1) return;
  const wrap = h1.closest(".hero-title") || h1.parentElement;
  const slot = h1.querySelector(".hero-sax");
  const cv = slot?.querySelector("canvas");
  if (!cv || h1.dataset.notation !== "on") {
    h1.classList.add("hero-ready");
    return;
  }
  const html = document.documentElement;
  const TAU = Math.PI * 2;
  const SAX2 = L2.SAX, NOTES = L2.NOTES;
  const EXT = JSON.parse(slot.dataset.ext);
  const PTS = L2.model.pts, N2 = PTS.length / 7;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];
  const on = (t2, ev, fn, opt) => {
    t2.addEventListener(ev, fn, opt);
    cleanups.push(() => t2.removeEventListener(ev, fn, opt));
  };
  const cssNum = (name, fallback) => {
    const v2 = parseFloat(getComputedStyle(h1).getPropertyValue(name));
    return Number.isFinite(v2) ? v2 : fallback;
  };
  const f1 = (x2) => Math.round(x2 * 10) / 10;
  const ctx = cv.getContext("2d");
  let ROWS = 44, W = 0, H2 = 0, GW = 0, depth = null, shade = null;
  let ay = SAX2.rest, speed = reduce ? 0 : TAU / SAX2.period;
  let raf = 0, prev = 0, visible = false, colors = null;
  window.addCleanup?.(() => {
    if (raf) cancelAnimationFrame(raf);
    cleanups.forEach((fn) => fn());
  });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let LX = -0.5, LY = 0.6, LZ = 0.62;
  const LL = Math.hypot(LX, LY, LZ);
  LX /= LL;
  LY /= LL;
  LZ /= LL;
  const hex = (v2) => {
    v2 = v2.trim();
    if (v2[0] === "#") {
      if (v2.length === 4) v2 = "#" + v2[1] + v2[1] + v2[2] + v2[2] + v2[3] + v2[3];
      return [parseInt(v2.slice(1, 3), 16), parseInt(v2.slice(3, 5), 16), parseInt(v2.slice(5, 7), 16)];
    }
    const m2 = v2.match(/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/);
    return m2 ? [+m2[1], +m2[2], +m2[3]] : [28, 95, 149];
  };
  const readColors = () => {
    const cs = getComputedStyle(cv);
    colors = { a: hex(cs.getPropertyValue("--secondary")), b: hex(cs.getPropertyValue("--dark")), dark: html.getAttribute("saved-theme") === "dark" };
  };
  const centerAt = (a2) => {
    if (speed <= 0) return [EXT.cx, EXT.cy];
    const T2 = EXT.cxt.length, u3 = (a2 % TAU + TAU) % TAU / TAU * T2, i2 = Math.floor(u3) % T2, j2 = (i2 + 1) % T2, f3 = u3 - Math.floor(u3);
    return [EXT.cxt[i2] + (EXT.cxt[j2] - EXT.cxt[i2]) * f3, EXT.cyt[i2] + (EXT.cyt[j2] - EXT.cyt[i2]) * f3];
  };
  const size = () => {
    const r2 = cv.getBoundingClientRect();
    ROWS = Math.max(18, Math.round(r2.height / 1.9));
    W = Math.max(8, Math.round(r2.width * dpr));
    H2 = Math.max(8, Math.round(r2.height * dpr));
    cv.width = W;
    cv.height = H2;
    GW = Math.ceil(W / (H2 / ROWS));
    depth = new Float32Array(GW * ROWS);
    shade = new Float32Array(GW * ROWS);
    draw();
  };
  const draw = () => {
    if (!colors || !depth) return;
    const pitch = H2 / ROWS, sc = H2 / EXT.h, cc = centerAt(ay);
    const ca = Math.cos(ay), sa = Math.sin(ay), cr = Math.cos(SAX2.tilt), sr = Math.sin(SAX2.tilt), cxA = Math.cos(SAX2.ax), sxA = Math.sin(SAX2.ax);
    const o2 = [0, 0, 0], on3 = [0, 0, 0];
    depth.fill(-1e9);
    shade.fill(-1);
    for (let i2 = 0; i2 < N2; i2++) {
      const q2 = i2 * 7;
      L2.saxXf(PTS[q2] - SAX2.cx0, PTS[q2 + 1] - SAX2.cy0, PTS[q2 + 2] - SAX2.cz0, ca, sa, cr, sr, cxA, sxA, o2);
      const gx = Math.floor((W / 2 + (o2[0] - cc[0]) * sc) / pitch), gy = Math.floor((H2 / 2 - (o2[1] - cc[1]) * sc) / pitch);
      if (gx < 0 || gx >= GW || gy < 0 || gy >= ROWS) continue;
      const gi = gy * GW + gx;
      if (o2[2] <= depth[gi]) continue;
      depth[gi] = o2[2];
      L2.saxXf(PTS[q2 + 3], PTS[q2 + 4], PTS[q2 + 5], ca, sa, cr, sr, cxA, sxA, on3);
      const l2 = Math.max(0, on3[0] * LX + on3[1] * LY + on3[2] * LZ);
      shade[gi] = 0.18 + 0.82 * Math.pow(l2, 0.9);
    }
    ctx.clearRect(0, 0, W, H2);
    const A2 = colors.a, B2 = colors.b;
    for (let gy = 0; gy < ROWS; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        const s2 = shade[gy * GW + gx];
        if (s2 < 0) continue;
        const a2 = colors.dark ? s2 : 1 - s2, rad = pitch * 0.5 * (0.62 + 0.5 * a2);
        ctx.fillStyle = `rgb(${Math.round(A2[0] + (B2[0] - A2[0]) * a2)},${Math.round(A2[1] + (B2[1] - A2[1]) * a2)},${Math.round(A2[2] + (B2[2] - A2[2]) * a2)})`;
        ctx.beginPath();
        ctx.arc((gx + 0.5) * pitch, (gy + 0.5) * pitch, rad, 0, TAU);
        ctx.fill();
      }
    }
  };
  const tick = (t2) => {
    if (!prev) prev = t2;
    const dt = Math.min(0.1, (t2 - prev) / 1e3);
    if (dt >= 1 / 30) {
      prev = t2;
      ay += speed * dt;
      draw();
    }
    raf = visible && !document.hidden && speed > 0 ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (!raf && visible && !document.hidden && speed > 0) {
      prev = 0;
      raf = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const LIDX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const stepOf = (n2) => n2[3] * 7 + LIDX[n2[1]] - 30;
  const alignSax = () => {
    slot.style.transform = "";
    let bl = h1.querySelector(".hero-bl");
    if (!bl) {
      bl = document.createElement("span");
      bl.className = "hero-bl";
      bl.setAttribute("aria-hidden", "true");
      h1.insertBefore(bl, h1.firstChild);
    }
    const cs = getComputedStyle(h1), c2 = document.createElement("canvas").getContext("2d");
    c2.font = `${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`;
    const asc = c2.measureText("B").actualBoundingBoxAscent;
    const capC = bl.getBoundingClientRect().bottom - asc / 2, r2 = cv.getBoundingClientRect();
    slot.style.transform = `translateY(${capC - (r2.top + r2.bottom) / 2}px)`;
  };
  const buildScore = () => {
    wrap.querySelector("svg.hero-score")?.remove();
    const tr = h1.getBoundingClientRect();
    const els = [...h1.querySelectorAll(".hl"), slot];
    if (els.length !== NOTES.length) return;
    const R = els.map((e2) => {
      const r2 = e2.getBoundingClientRect();
      return { l: r2.left - tr.left, r: r2.right - tr.left, c: (r2.left + r2.right) / 2 - tr.left };
    });
    const s2 = cssNum("--s", 8), pad = cssNum("--pad", 9.5 * s2), BASE = cssNum("--hero-base", 450), STEP = cssNum("--hero-step", 90);
    const bare = tr.width < 560;
    const need = bare ? 0.9 * s2 : 10.75 * s2;
    const ctr = tr.width / 2;
    const half = Math.min(Math.max(ctr - (R[0].l - need), R[10].r + 0.7 * s2 - ctr), ctr - 0.3 * s2);
    const xL = ctr - half, xEnd = ctr + half, yb = 6.6 * s2;
    const sy = (st2) => yb - st2 * s2 / 2;
    let o2 = "";
    for (let k = 0; k < 5; k++) o2 += `<line class="ln" style="--k:${k}" x1="${f1(xL)}" x2="${f1(xEnd)}" y1="${f1(yb - k * s2)}" y2="${f1(yb - k * s2)}"/>`;
    if (!bare) {
      const xc = xL + 0.4 * s2, xk = xc + 3.3 * s2, fl = [4, 7, 3];
      o2 += `<text class="clef pop" style="--d:200ms" x="${f1(xc)}" y="${f1(yb)}" font-size="${4 * s2}">\u{1D11E}</text>`;
      for (let q2 = 0; q2 < 3; q2++) o2 += `<text class="ks pop" style="--d:${260 + 60 * q2}ms" x="${f1(xk + q2 * 1.15 * s2)}" y="${f1(sy(fl[q2]) + 0.5 * s2)}" font-size="${3.6 * s2}">\u266D</text>`;
      o2 += `<text class="ks pop" style="--d:440ms" x="${f1(xk + 3.45 * s2 + 0.8 * s2)}" y="${f1(yb)}" font-size="${4 * s2}">\u{1D134}</text>`;
    }
    const rx = 0.66 * s2, ry = 0.46 * s2;
    const st = NOTES.map(stepOf), cx = R.map((r2) => r2.c), cy = st.map(sy);
    const info = {};
    [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]].forEach((g2) => {
      const down = g2.reduce((a2, i2) => a2 + st[i2], 0) / g2.length >= 4;
      const sx = g2.map((i2) => down ? cx[i2] - rx + 0.6 : cx[i2] + rx - 0.6), n2 = g2.length, dx = sx[n2 - 1] - sx[0];
      const raw = (cy[g2[n2 - 1]] - cy[g2[0]]) / dx, maxS = 1.25 * s2 / dx, m2 = Math.max(-maxS, Math.min(maxS, raw * 0.6)), Lm = 3 * s2;
      let b2 = down ? -Infinity : Infinity;
      g2.forEach((i2, j2) => {
        b2 = down ? Math.max(b2, cy[i2] + Lm - m2 * (sx[j2] - sx[0])) : Math.min(b2, cy[i2] - Lm - m2 * (sx[j2] - sx[0]));
      });
      g2.forEach((i2, j2) => {
        info[i2] = { sx: sx[j2], by: b2 + m2 * (sx[j2] - sx[0]), down, j: j2, g: g2 };
      });
    });
    NOTES.forEach((n2, i2) => {
      const c2 = cx[i2], y2 = cy[i2], stp = st[i2];
      let g2 = `<g class="pop ng" style="--d:${BASE + i2 * STEP}ms">`;
      if (stp >= 10) for (let e2 = 10; e2 <= stp; e2 += 2) g2 += `<line class="led" x1="${f1(c2 - 1.35 * rx)}" x2="${f1(c2 + 1.35 * rx)}" y1="${f1(sy(e2))}" y2="${f1(sy(e2))}"/>`;
      if (stp <= -2) for (let e2 = -2; e2 >= stp; e2 -= 2) g2 += `<line class="led" x1="${f1(c2 - 1.35 * rx)}" x2="${f1(c2 + 1.35 * rx)}" y1="${f1(sy(e2))}" y2="${f1(sy(e2))}"/>`;
      const acc = bare ? n2[2] < 0 ? "\u266D" : "" : i2 === 4 ? "\u266E" : "";
      if (acc) g2 += `<text class="acc" text-anchor="end" x="${f1(c2 - rx - 0.4 * s2)}" y="${f1(y2 + 0.5 * s2)}" font-size="${3.6 * s2}">${acc}</text>`;
      const q2 = info[i2];
      if (q2) {
        g2 += `<line class="stem" x1="${f1(q2.sx)}" x2="${f1(q2.sx)}" y1="${f1(y2)}" y2="${f1(q2.by)}"/>`;
        if (q2.j > 0) {
          const p2 = info[q2.g[q2.j - 1]], t2 = 0.5 * s2;
          const P2 = q2.down ? [[p2.sx, p2.by - t2], [q2.sx, q2.by - t2], [q2.sx, q2.by], [p2.sx, p2.by]] : [[p2.sx, p2.by], [q2.sx, q2.by], [q2.sx, q2.by + t2], [p2.sx, p2.by + t2]];
          g2 += `<polygon class="bm" points="${P2.map((a2) => f1(a2[0]) + "," + f1(a2[1])).join(" ")}"/>`;
        }
      } else {
        const dn = stp >= 4, sxx = dn ? c2 - rx + 0.6 : c2 + rx - 0.6;
        g2 += `<line class="stem" x1="${f1(sxx)}" x2="${f1(sxx)}" y1="${f1(y2)}" y2="${f1(dn ? y2 + 3.5 * s2 : y2 - 3.5 * s2)}"/>`;
      }
      const head = `cx="${f1(c2)}" cy="${f1(y2)}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(-20 ${f1(c2)} ${f1(y2)})"`;
      if (n2[4] === "dh") g2 += `<ellipse class="hv" ${head}/><circle class="dot" cx="${f1(c2 + rx + 0.6 * s2)}" cy="${f1(stp % 2 === 0 ? y2 - 0.5 * s2 : y2)}" r="${f1(0.2 * s2)}"/>`;
      else g2 += `<ellipse class="hd" ${head}/>`;
      o2 += g2 + "</g>";
    });
    const xm = (R[7].r + R[8].l) / 2;
    o2 += `<line class="bar pop" style="--d:${BASE + 7.5 * STEP}ms" x1="${f1(xm)}" x2="${f1(xm)}" y1="${f1(yb)}" y2="${f1(yb - 4 * s2)}"/>`;
    o2 += `<g class="pop fb" style="--d:${BASE + 11 * STEP}ms"><line class="bar" x1="${f1(xEnd - 0.5 * s2)}" x2="${f1(xEnd - 0.5 * s2)}" y1="${f1(yb)}" y2="${f1(yb - 4 * s2)}"/><line class="barT" x1="${f1(xEnd)}" x2="${f1(xEnd)}" y1="${f1(yb)}" y2="${f1(yb - 4 * s2)}"/></g>`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "hero-score");
    svg.setAttribute("width", tr.width);
    svg.setAttribute("height", pad);
    svg.setAttribute("viewBox", `0 0 ${tr.width} ${pad}`);
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = o2;
    wrap.insertBefore(svg, wrap.firstChild);
  };
  const layout = () => {
    alignSax();
    buildScore();
    size();
  };
  on(document, "visibilitychange", () => document.hidden ? stop() : kick());
  on(document, "themechange", () => {
    readColors();
    draw();
  });
  const io = new IntersectionObserver((es) => {
    visible = es.some((x2) => x2.isIntersecting);
    visible ? kick() : stop();
  });
  io.observe(cv);
  cleanups.push(() => io.disconnect());
  let pend = 0;
  const ro = new ResizeObserver(() => {
    if (pend) return;
    pend = requestAnimationFrame(() => {
      pend = 0;
      if (h1.isConnected) layout();
    });
  });
  ro.observe(h1);
  cleanups.push(() => {
    ro.disconnect();
    if (pend) cancelAnimationFrame(pend);
  });
  on(root, "pointerdown", () => html.setAttribute("data-hero-swept", ""));
  const fontsReady = Promise.race([Promise.all([...L2.FONT_LOADS.map(([f3, t2]) => document.fonts.load(f3, t2).catch(() => {
  })), document.fonts.ready.catch(() => {
  })]), new Promise((r2) => setTimeout(r2, 2500))]).catch(() => {
  });
  if (document.fonts?.addEventListener) on(document.fonts, "loadingdone", () => {
    if (h1.isConnected) layout();
  });
  fontsReady.then(() => {
    if (!h1.isConnected) return;
    readColors();
    layout();
    kick();
    h1.classList.add("hero-ready");
    if (!reduce && !html.hasAttribute("data-hero-swept")) {
      const t2 = setTimeout(() => html.setAttribute("data-hero-swept", ""), 2400);
      cleanups.push(() => clearTimeout(t2));
    }
  });
}

// src/components/styles/hero.scss
var hero_default = '.home-hero {\n  container-type: inline-size;\n  padding: 40px 0 64px;\n  text-align: center;\n}\n@media all and (max-width: 899px) {\n  .home-hero {\n    padding: 8px 0 40px;\n  }\n}\n\n.hero-title {\n  position: relative;\n}\n\n.hero-headline {\n  --s: 8px;\n  --pad: calc(9.5 * var(--s));\n  --hero-base: 450ms;\n  --hero-step: 90ms;\n  position: relative;\n  margin: 0;\n  padding: var(--pad) 0 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-weight: 900;\n  font-size: clamp(2.25rem, 11.6279069767cqi, 4.75rem);\n  line-height: 1.1;\n  letter-spacing: -0.02em;\n  color: var(--dark);\n  white-space: nowrap;\n}\n@container (max-width: 559px) {\n  .hero-headline {\n    --s: 6.5px;\n  }\n}\n\n.hl {\n  display: inline-block;\n}\n\n.hero-bl {\n  display: inline-block;\n  width: 0;\n  height: 0;\n}\n\n.hero-sax {\n  position: relative;\n  display: inline-block;\n  width: calc(1.1em * var(--sax-k) * var(--sax-ar));\n  height: calc(1.1em * var(--sax-k));\n  margin-block: calc(0.55em * (1 - var(--sax-k)));\n  margin-left: 0.3em;\n  margin-right: calc(-1 * (0.3em + 1.1em * var(--sax-k) * var(--sax-ar)));\n  vertical-align: -0.2em;\n}\n.hero-sax canvas {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.hero-score {\n  position: absolute;\n  left: 0;\n  top: 0;\n  overflow: visible;\n  pointer-events: none;\n}\n.hero-score text {\n  font-family: "Noto Music", serif;\n  fill: var(--dark);\n}\n.hero-score .ln {\n  stroke: var(--gray);\n  stroke-width: 1;\n  opacity: 0.35;\n}\n.hero-score .ng {\n  opacity: 0.45;\n}\n.hero-score .clef,\n.hero-score .ks,\n.hero-score .bar,\n.hero-score .fb {\n  opacity: 0.4;\n}\n.hero-score .fb .bar {\n  opacity: 1;\n}\n.hero-score .hd,\n.hero-score .bm,\n.hero-score .dot,\n.hero-score .acc {\n  fill: var(--secondary);\n}\n.hero-score .hv {\n  fill: var(--light);\n  stroke: var(--secondary);\n  stroke-width: 1.6;\n}\n.hero-score .stem {\n  stroke: var(--secondary);\n  stroke-width: 1.3;\n}\n.hero-score .led {\n  stroke: var(--dark);\n  stroke-width: 1.1;\n}\n.hero-score .bar {\n  stroke: var(--dark);\n  stroke-width: 1;\n}\n.hero-score .barT {\n  stroke: var(--dark);\n  stroke-width: 3;\n}\n\n.hero-author {\n  margin: 14px 0 0;\n  font-family: var(--headerFont);\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: var(--darkgray);\n}\n@media all and (max-width: 800px) {\n  .hero-author {\n    margin-top: 10px;\n    font-size: 1rem;\n  }\n}\n\n.hero-description {\n  margin: 22px auto 0;\n  max-width: 29em;\n  font-family: var(--headerFont);\n  font-size: 17px;\n  line-height: 1.85;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n@media all and (max-width: 800px) {\n  .hero-description {\n    margin-top: 18px;\n    font-size: 16px;\n    line-height: 1.8;\n  }\n}\n\n.hero-links {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  margin: 24px 0 0;\n}\n.hero-links a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 0 16px;\n  box-sizing: border-box;\n  border-radius: 10px;\n  background: rgba(var(--accent-rgb), 0.08);\n  color: var(--secondary);\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.hero-links a:hover {\n  background: rgba(var(--accent-rgb), 0.16);\n}\n@media all and (max-width: 800px) {\n  .hero-links a {\n    min-height: 44px;\n  }\n}\n@media all and (max-width: 800px) {\n  .hero-links {\n    margin-top: 16px;\n  }\n}\n\n.hero-meta {\n  margin: 12px 0 0;\n  font-family: var(--codeFont);\n  font-size: 12px;\n  letter-spacing: 0.02em;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n@media all and (max-width: 800px) {\n  .hero-meta {\n    margin-top: 4px;\n    font-size: 11.5px;\n  }\n}\n\n.hero-num {\n  display: inline-block;\n  min-width: 1ch;\n}\n\n.hero-num-total {\n  min-width: 3ch;\n  text-align: right;\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  :root[data-hero-js]:not([data-hero-swept]) .hero-headline:not(.hero-ready) .hl,\n  :root[data-hero-js]:not([data-hero-swept]) .hero-headline:not(.hero-ready) .hero-sax canvas {\n    visibility: hidden;\n    animation: hero-failsafe 0s 2.5s forwards;\n  }\n  :root:not([data-hero-swept]) .hero-headline.hero-ready .hero-score .ln {\n    transform-box: fill-box;\n    transform-origin: left;\n    animation: hero-staff 500ms var(--ease-settle, cubic-bezier(0.32, 0.72, 0, 1)) both;\n    animation-delay: calc(var(--k) * 50ms);\n  }\n  :root:not([data-hero-swept]) .hero-headline.hero-ready .hero-score .pop {\n    animation: hero-score-in 240ms var(--ease-settle, cubic-bezier(0.32, 0.72, 0, 1)) both;\n    animation-delay: var(--d);\n  }\n  :root:not([data-hero-swept]) .hero-headline.hero-ready .hl,\n  :root:not([data-hero-swept]) .hero-headline.hero-ready .hero-sax canvas {\n    animation: hero-pop-up 240ms var(--ease-settle, cubic-bezier(0.32, 0.72, 0, 1)) both;\n    animation-delay: calc(var(--hero-base) + var(--i) * var(--hero-step));\n  }\n}\n@keyframes hero-staff {\n  from {\n    transform: scaleX(0);\n  }\n  to {\n    transform: none;\n  }\n}\n@keyframes hero-pop-up {\n  0% {\n    transform: translateY(8px);\n    visibility: hidden;\n  }\n  1% {\n    visibility: visible;\n  }\n  100% {\n    transform: none;\n    visibility: visible;\n  }\n}\n@keyframes hero-score-in {\n  0% {\n    transform: translateY(-8px);\n    visibility: hidden;\n  }\n  1% {\n    visibility: visible;\n  }\n  100% {\n    transform: none;\n    visibility: visible;\n  }\n}\n@keyframes hero-failsafe {\n  to {\n    visibility: visible;\n  }\n}';

// ../_shared/topics.ts
var TOPICS = [
  { key: "computer-science", label: "Computer Science" },
  { key: "data-engineering", label: "Data Engineering" },
  { key: "data-science", label: "Data Science" },
  { key: "gis", label: "GIS" },
  { key: "programming", label: "Programming" },
  { key: "finance-property", label: "Finance & Property" },
  { key: "tools", label: "Tools" }
];
Object.fromEntries(TOPICS.map((t2) => [t2.key, t2.label]));

// ../_shared/notes.ts
function isRealNote(slug) {
  if (!slug) return false;
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
function isListedNote(file) {
  return isRealNote(file.slug) && file.unlisted !== true && file.frontmatter?.unlisted !== true;
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
var NOTO_MUSIC_CSS = "https://fonts.googleapis.com/css2?family=Noto+Music&text=%F0%9D%84%9E%E2%99%AD%E2%99%AE%F0%9D%84%B4&display=block";
var FONT_LOADS = [
  ['10px "Noto Music"', "\u{1D11E}\u266D\u266E\u{1D134}"],
  ['900 10px "Hahmlet"', "Blue Notes."]
];
var sweptScript = `try { document.documentElement.setAttribute("data-hero-js", ""); if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`;
var heroScript = `
const heroLib = {
  buildSax: (${buildSax.toString()}),
  saxXf: (${saxXf.toString()}),
  SAX: ${JSON.stringify(SAX)},
  NOTES: ${JSON.stringify(HERO_NOTES)},
  FONT_LOADS: ${JSON.stringify(FONT_LOADS)},
}
const heroClient = (${heroClient.toString()})

function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const set = (el, n) => { if (el && Number.isFinite(n)) el.textContent = n }
  fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      if (!d || !Number.isFinite(d.total) || !Number.isFinite(d.today)) return Promise.reject()
      set(total, d.total)
      set(today, d.today)
    })
    .catch(() =>
      fetch("https://${GOATCOUNTER_SITE}.goatcounter.com/counter/TOTAL.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && total) total.textContent = d.count })
        .catch(() => {}),
    )
}

function markHeroSwept() {
  const root = document.documentElement
  if (!document.querySelector(".home-hero") || root.hasAttribute("data-hero-swept")) return
  try { sessionStorage.setItem("hero-swept", "1") } catch {}
  window.addCleanup(() => root.setAttribute("data-hero-swept", ""))
}

function initHero() {
  if (!document.querySelector(".home-hero")) return
  heroLib.model = heroLib.model || heroLib.buildSax()
  heroClient(heroLib)
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  markHeroSwept()
  initHero()
})
`;
var defaultOptions = {
  headline: "",
  author: "",
  description: "",
  links: []
};
var ext;
function getExtent() {
  return ext ??= saxExtent(buildSax());
}
var HomeHero_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const HomeHero = (props) => {
    const { fileData, allFiles, displayClass } = props;
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles.filter(
      (f3) => f3.slug !== fileData.slug && isListedNote(f3) && (f3.slug ?? "").includes("/")
    );
    const noteCount = files.length;
    const topicCount = new Set(files.map((f3) => (f3.slug ?? "").split("/")[0] ?? "")).size;
    const description = opts.description || (fileData.frontmatter?.description ?? "");
    const chars = [...opts.headline];
    const letterCount = chars.filter((c2) => c2.trim() !== "").length;
    const notation = letterCount === HERO_NOTES.length - 1;
    if (opts.headline && !notation) {
      console.warn(
        `[home-hero] \uD5E4\uB4DC\uB77C\uC778 \uAE00\uC790 \uC218(${letterCount})\uAC00 \uC74C\uD45C \uC218(${HERO_NOTES.length - 1})\uC640 \uB2EC\uB77C \uC545\uBCF4 \uC5F0\uCD9C\uC744 \uAC74\uB108\uB701\uB2C8\uB2E4.`
      );
    }
    let idx = 0;
    const x2 = getExtent();
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      notation && /* @__PURE__ */ u2("link", { rel: "stylesheet", href: NOTO_MUSIC_CSS }),
      notation ? (
        // 제목 이름은 aria-label로 준다(글자 span이 "B l u e"로 읽히지 않게). 악보 SVG는 h1 밖 래퍼에 둬 h1 텍스트에 음악 기호가 섞이지 않는다.
        /* @__PURE__ */ u2("div", { class: "hero-title", children: /* @__PURE__ */ u2("h1", { class: "hero-headline", "aria-label": opts.headline, "data-notation": "on", children: /* @__PURE__ */ u2("span", { class: "hero-letters", "aria-hidden": "true", children: [
          chars.map(
            (c2) => c2.trim() === "" ? c2 : /* @__PURE__ */ u2("span", { class: "hl", style: `--i:${idx++}`, children: c2 })
          ),
          /* @__PURE__ */ u2(
            "span",
            {
              class: "hero-sax",
              style: `--i:${HERO_NOTES.length - 1};--sax-k:${x2.k};--sax-ar:${x2.ar}`,
              "data-ext": JSON.stringify(x2),
              children: /* @__PURE__ */ u2("canvas", {})
            }
          )
        ] }) }) })
      ) : /* @__PURE__ */ u2("h1", { class: "hero-headline", children: opts.headline }),
      opts.author && /* @__PURE__ */ u2("p", { class: "hero-author", children: opts.author }),
      description && /* @__PURE__ */ u2("p", { class: "hero-description", children: description }),
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