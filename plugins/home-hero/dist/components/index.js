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
        push(rr * Math.cos(b2), y2 + rr * Math.sin(b2), -(r2 + 0.015) - 0.01 * (1 - a2), 0, 0, -1, 4);
      }
    }
  });
  return { pts: Float32Array.from(P2), bell: [e2[0], e2[1] + 0.04, e2[2]] };
}
var SAX_CFG = {
  cw: 4.6,
  // 셀 가로 피치 — 기호 사이 숨 쉴 틈
  ch: 8.2,
  rows: 41,
  glyphTop: 1.5,
  // 글자 위 여백 — 캔버스를 이만큼 올려 칠해진 윗끝 = 탭 윗끝
  glyphBottom: 3,
  keyY: [0.78, 0.62, 0.46, 0.3, 0.14, -0.02, -0.18],
  // 키 7개는 모두 몸통 앞면 원판. 맨 위(넥 쪽)를 옥타브 키 자리로 보고 ♭, 아래 6개 = 왼손 H·A·E / 오른손 J·U·N
  keyChars: ["\u266D", "H", "A", "E", "J", "U", "N"]
};
function rasterSax(model, buf, C2, R, cxp, cyp, ay, ax, scl) {
  const SX = 2;
  const SY = 3;
  const W = C2 * SX;
  const H2 = R * SY;
  if (!buf.zb || buf.zb.length !== W * H2) {
    buf.zb = new Float32Array(W * H2);
    buf.br = new Float32Array(W * H2);
    buf.sp = new Float32Array(W * H2);
    buf.mt = new Uint8Array(W * H2);
    buf.v = new Float32Array(C2 * R);
    buf.s = new Float32Array(C2 * R);
    buf.m = new Uint8Array(C2 * R);
  }
  const zb = buf.zb;
  const br = buf.br;
  const sp = buf.sp;
  const mt = buf.mt;
  zb.fill(0);
  const P2 = model.pts;
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
    return [cxp + scl * 1.6667 * x1 * d2, cyp - scl * y22 * d2, d2];
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
    else if (m2 === 1 || m2 === 4) b2 = Math.min(1, b2 + 0.25);
    const sc = Math.round(pr[0] * SX);
    const sr = Math.round(pr[1] * SY);
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const c2 = sc + dx;
        const r2 = sr + dy;
        if (c2 < 0 || c2 >= W || r2 < 0 || r2 >= H2) continue;
        const k = r2 * W + c2;
        if (pr[2] > zb[k]) {
          zb[k] = pr[2];
          br[k] = b2 > 1 ? 1 : b2;
          sp[k] = nz > 0.05 ? 0 : spec;
          mt[k] = m2;
        }
      }
    }
  }
  const v2 = buf.v;
  const s2 = buf.s;
  const mm = buf.m;
  for (let r2 = 0; r2 < R; r2++) {
    for (let c2 = 0; c2 < C2; c2++) {
      let n2 = 0;
      let tot = 0;
      let fd = 0;
      let fm = 0;
      let fs = 0;
      for (let a2 = 0; a2 < SY; a2++) {
        for (let b2 = 0; b2 < SX; b2++) {
          const k = (r2 * SY + a2) * W + c2 * SX + b2;
          if (zb[k] > 0) {
            n2++;
            tot += br[k];
            if (zb[k] > fd) {
              fd = zb[k];
              fm = mt[k];
              fs = sp[k];
            }
          }
        }
      }
      const on = n2 / (SX * SY) >= 0.34;
      v2[r2 * C2 + c2] = on ? tot / n2 : -1;
      mm[r2 * C2 + c2] = fm;
      s2[r2 * C2 + c2] = fs;
    }
  }
  buf.proj = proj;
  return buf;
}
function fitSax(model, raster, rest, rows) {
  const bb = (scl2) => {
    const b3 = raster(model, {}, 140, 90, 70, 45, rest.ay, rest.ax, scl2);
    let c0 = 1e9;
    let c1 = -1;
    let r0 = 1e9;
    let r1 = -1;
    for (let r2 = 0; r2 < 90; r2++) {
      for (let c2 = 0; c2 < 140; c2++) {
        if (b3.v[r2 * 140 + c2] >= 0) {
          c0 = Math.min(c0, c2);
          c1 = Math.max(c1, c2);
          r0 = Math.min(r0, r2);
          r1 = Math.max(r1, r2);
        }
      }
    }
    return { c0, c1, r0, r1 };
  };
  let b2 = bb(74);
  let scl = 74 * rows / (b2.r1 - b2.r0 + 1);
  b2 = bb(scl);
  for (let i2 = 0; i2 < 6 && b2.r1 - b2.r0 + 1 !== rows; i2++) {
    const h2 = b2.r1 - b2.r0 + 1;
    scl *= rows / h2 * (h2 < rows ? 1.004 : 0.998);
    b2 = bb(scl);
  }
  return { scl, cols: b2.c1 - b2.c0 + 3, cx: 70 - b2.c0 + 1, cy: 45 - b2.r0 };
}
function composeSax(model, raster, buf, fit, cfg, ay, ax, sweepAt) {
  const C2 = fit.cols;
  const R = cfg.rows;
  const ras = raster(model, buf, C2, R, fit.cx, fit.cy, ay, ax, fit.scl);
  const bell = ras.proj(model.bell[0], model.bell[1], model.bell[2]);
  const on = (c2, r2) => c2 >= 0 && r2 >= 0 && c2 < C2 && r2 < R && ras.v[r2 * C2 + c2] >= 0;
  const glyphs = [];
  for (let r2 = 0; r2 < R; r2++) {
    for (let c2 = 0; c2 < C2; c2++) {
      const i2 = r2 * C2 + c2;
      const v2 = ras.v[i2];
      if (v2 < 0) continue;
      const x2 = (c2 + 0.5) * cfg.cw;
      const y2 = (r2 + 0.5) * cfg.ch;
      const m2 = ras.m[i2];
      const lit = sweepAt(x2) > 0.45;
      if (m2 === 2 || m2 === 1 && r2 < bell[1] - 0.5) {
        glyphs.push([x2, y2, "\u266B", 3, lit]);
        continue;
      }
      const ch = "\u2669\u266A\u266B\u266C"[(c2 + r2 * 2) % 4];
      if (ras.s[i2] > 0.6) {
        glyphs.push([x2, y2, ch, 2, lit]);
        continue;
      }
      const edge = !on(c2 - 1, r2) || !on(c2 + 1, r2) || !on(c2, r2 - 1) || !on(c2, r2 + 1);
      if (edge) {
        glyphs.push([x2, y2, ch, 1, lit]);
        continue;
      }
      let tier = v2 < 0.33 ? 0 : v2 < 0.66 ? 1 : 2;
      if (lit) tier = Math.min(2, tier + 1);
      glyphs.push([x2, y2, ch, tier, lit]);
    }
  }
  const keys = cfg.keyY.map((y2) => {
    const r0 = 0.07 + 0.075 * ((0.95 - y2) / 1.5);
    const p2 = ras.proj(0, y2, -(r0 + 0.02));
    return [p2[0] * cfg.cw, p2[1] * cfg.ch];
  });
  return { glyphs, keys };
}

// src/components/shelf.ts
var SHELF_CFG = { div: 5, gap: 1, dgap: 3, fmin: 0.62, fmax2: 3, fmax3: 2.2 };
function planShelf(notes, topics, W, rowsMax, cfg) {
  const baseW = (n3) => 1.8 + Math.sqrt(n3.len) / 20;
  const fmaxFor = (R2) => R2 <= 2 ? cfg.fmax2 : cfg.fmax3;
  const key = (n3) => n3.posted + "|" + n3.created + "|" + n3.href;
  const order = notes.map((_2, i2) => i2).sort((a2, b2) => key(notes[a2]).localeCompare(key(notes[b2])));
  let keep = order;
  let cut = 0;
  const seq = (idx) => {
    const out = [];
    for (const t2 of topics) {
      const g2 = idx.filter((i2) => notes[i2].topic === t2);
      if (!g2.length) continue;
      const first = {};
      for (const i2 of g2) {
        const n3 = notes[i2];
        if (n3.series && (!first[n3.series] || first[n3.series] > key(n3))) first[n3.series] = key(n3);
      }
      const gk = (i2) => {
        const n3 = notes[i2];
        return n3.series ? first[n3.series] + "|" + n3.series : key(n3);
      };
      g2.sort((a2, b2) => gk(a2).localeCompare(gk(b2)) || (notes[a2].series && notes[a2].series === notes[b2].series ? notes[a2].sidx - notes[b2].sidx : 0));
      out.push({ kind: "dv", topic: t2, count: g2.length });
      g2.forEach((i2, j2) => {
        const prev = j2 > 0 ? notes[g2[j2 - 1]] : null;
        out.push({ kind: "sp", topic: t2, note: i2, joinPrev: !!(prev && notes[i2].series && prev.series === notes[i2].series) });
      });
    }
    return out;
  };
  const fFor = (idx, R2) => {
    const it = seq(idx);
    const sp = it.filter((i2) => i2.kind === "sp");
    const dv = it.length - sp.length + (R2 - 1) + (cut ? 1 : 0);
    return (R2 * W * 0.985 - dv * (cfg.div + cfg.dgap) - sp.length * cfg.gap) / sp.reduce((s2, i2) => s2 + baseW(notes[i2.note]), 0);
  };
  let R = rowsMax;
  while (R > 1 && fFor(keep, R) > fmaxFor(R) * 1.12) R--;
  while (fFor(keep, R) < cfg.fmin && keep.length > 10) {
    keep = keep.slice(1);
    cut++;
  }
  const f3 = Math.min(fmaxFor(R), fFor(keep, R));
  const items = seq(keep);
  if (cut) items.push({ kind: "arc" });
  const wOf = (i2) => i2.kind === "sp" ? baseW(notes[i2.note]) * f3 + (i2.joinPrev ? 0 : cfg.gap) : cfg.div + cfg.dgap;
  const n2 = items.length;
  const pre = [0];
  for (const i2 of items) pre.push(pre[pre.length - 1] + wOf(i2));
  const T2 = pre[n2] / R + (R - 1) * (cfg.div + cfg.dgap) / R;
  const cost = (a2, b2) => {
    const cont = items[a2].kind === "sp" ? cfg.div + cfg.dgap : 0;
    const s2 = pre[b2] - pre[a2] + cont;
    return (s2 - T2) ** 2 + (cont ? (0.04 * T2) ** 2 : 0) + (items[a2].joinPrev ? (0.2 * T2) ** 2 : 0) + (s2 > W ? 1e9 : 0);
  };
  const dp = Array.from({ length: R + 1 }, () => new Float64Array(n2 + 1).fill(Infinity));
  const back = Array.from({ length: R + 1 }, () => new Int32Array(n2 + 1));
  dp[0][0] = 0;
  for (let r2 = 1; r2 <= R; r2++) {
    for (let b2 = 1; b2 <= n2; b2++) {
      for (let a2 = r2 - 1; a2 < b2; a2++) {
        const v2 = dp[r2 - 1][a2] + cost(a2, b2);
        if (v2 < dp[r2][b2]) {
          dp[r2][b2] = v2;
          back[r2][b2] = a2;
        }
      }
    }
  }
  const cuts = [n2];
  for (let r2 = R, b2 = n2; r2 > 0; r2--) {
    b2 = back[r2][b2];
    cuts.unshift(b2);
  }
  const rows = [];
  for (let r2 = 0; r2 < R; r2++) {
    let row = items.slice(cuts[r2], cuts[r2 + 1]).map((i2) => ({ ...i2, x: 0, w: 0, row: r2 }));
    if (row.length && row[0].kind === "sp") {
      row[0].joinPrev = false;
      row = [{ kind: "dv", topic: row[0].topic, cont: true, x: 0, w: 0, row: r2 }, ...row];
    }
    const gapAfter = (j2) => j2 >= row.length - 1 ? 0 : row[j2].kind === "sp" && row[j2 + 1].kind === "sp" ? row[j2 + 1].joinPrev ? 0 : cfg.gap : cfg.dgap;
    const sp = row.filter((i2) => i2.kind === "sp");
    const spSum = sp.reduce((s3, i2) => s3 + baseW(notes[i2.note]) * f3, 0);
    const spGaps = row.reduce((c2, i2, j2) => c2 + (gapAfter(j2) === cfg.gap && i2.kind === "sp" ? 1 : 0), 0);
    const fixed = row.reduce((s3, i2, j2) => s3 + (i2.kind === "sp" ? 0 : i2.kind === "arc" ? cfg.div + 2 : cfg.div) + gapAfter(j2), 0);
    const s2 = Math.max(0.88, Math.min(1.12, (W - fixed) / spSum));
    const slack = W - fixed - spSum * s2;
    const adj = spGaps ? Math.max(-cfg.gap, Math.min(1, slack / spGaps)) : 0;
    let x2 = 0;
    row.forEach((i2, j2) => {
      i2.w = i2.kind === "sp" ? baseW(notes[i2.note]) * f3 * s2 : i2.kind === "arc" ? cfg.div + 2 : cfg.div;
      i2.x = x2;
      const g2 = gapAfter(j2);
      x2 += i2.w + (g2 === cfg.gap && i2.kind === "sp" ? cfg.gap + adj : g2);
    });
    rows.push({ items: row, end: x2 });
  }
  return { rows, R, f: f3, cut };
}

// src/components/client.ts
function heroClient(L2) {
  const root = document.querySelector(".home-hero");
  const dataEl = root?.querySelector(".hero-data");
  if (!root || !dataEl) return;
  const D2 = JSON.parse(dataEl.textContent);
  const now = Date.now();
  for (const n2 of D2.notes) n2.recent = (now - Date.parse(n2.p)) / 864e5 <= 45;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQ = window.matchMedia("(max-width: 800px)");
  const cleanups = [];
  const on = (t2, ev, fn, opt) => {
    t2.addEventListener(ev, fn, opt);
    cleanups.push(() => t2.removeEventListener(ev, fn, opt));
  };
  const el = (tag, cls, txt) => {
    const e2 = document.createElement(tag);
    if (cls) e2.className = cls;
    if (txt != null) e2.textContent = txt;
    return e2;
  };
  const C2 = L2.SAX_CFG;
  const saxBox = root.querySelector(".hero-sax");
  const cv = saxBox?.querySelector(".hero-sax-cv");
  const keyLayer = saxBox?.querySelector(".hero-keys");
  const tip = saxBox?.querySelector(".hero-keytip");
  const topics = D2.topics.map((k) => {
    const ns = D2.notes.filter((n2) => n2.tp === k);
    return { k, label: D2.labels[k] || k, n: ns.length, recent: ns.some((n2) => n2.recent) };
  }).sort((a2, b2) => b2.n - a2.n);
  let colors = null;
  const readColors = () => {
    const pick = (cls) => getComputedStyle(saxBox.querySelector(".hero-tone." + cls)).color;
    colors = [pick("t0"), pick("t1"), pick("t2"), pick("tb")];
  };
  let raf = 0, prev = 0, acc = 0, visible = false, drawn = false;
  const S2 = { off: { ay: 0, ax: 0 }, vel: { ay: 0, ax: 0 }, drag: false, lx: 0, ly: 0, keys: [], tipK: -1, t0: performance.now() };
  const W = L2.fit.cols * C2.cw, H2 = C2.rows * C2.ch;
  const buf = {};
  const keyBtns = [];
  const showTip = (k) => {
    S2.tipK = k;
    if (k < 0 || !topics[k]) {
      tip.hidden = true;
      return;
    }
    const t2 = topics[k];
    tip.textContent = "";
    tip.append(el("b", null, t2.label), " \xB7 " + t2.n + "\uD3B8" + (t2.recent ? " \xB7 \uCD5C\uADFC \uAE00" : ""));
    tip.hidden = false;
    placeTip();
  };
  const placeTip = () => {
    const k = S2.tipK;
    if (k < 0 || !S2.keys[k]) return;
    const s2 = cv.clientWidth / W;
    tip.style.left = S2.keys[k][0] * s2 + "px";
    tip.style.top = S2.keys[k][1] * s2 + "px";
  };
  const sweepAt = (t2) => {
    if (reduce) return () => 0;
    const p2 = t2 % 6 / 6;
    if (p2 > 0.8) return () => 0;
    const w2 = Math.max(50, 0.3 * W), X = -w2 + (W + 2 * w2) * (p2 / 0.8);
    return (x2) => Math.exp(-2.2 * ((x2 - X) / w2) ** 2);
  };
  const draw = (nowT) => {
    if (!cv || !colors) return false;
    const t2 = (nowT - S2.t0) / 1e3;
    const sway = reduce ? 0 : 0.15 * Math.sin(t2 / 9 * Math.PI * 2);
    const { glyphs, keys } = L2.composeSax(L2.model, L2.rasterSax, buf, L2.fit, C2, L2.REST.ay + sway + S2.off.ay, L2.REST.ax + S2.off.ax, sweepAt(t2));
    S2.keys = keys;
    const cssW = cv.clientWidth || W, dpr = Math.min(2, window.devicePixelRatio || 1);
    const bw = Math.round(cssW * dpr), bh = Math.round(cssW * (H2 / W) * dpr);
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw;
      cv.height = bh;
    }
    const ctx = cv.getContext("2d");
    const k = cssW / W * dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, W, H2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const groups = /* @__PURE__ */ new Map();
    for (const g2 of glyphs) {
      const key = g2[3] + (g2[4] ? "b" : "s");
      let a2 = groups.get(key);
      if (!a2) groups.set(key, a2 = []);
      a2.push(g2);
    }
    for (const [key, arr] of groups) {
      ctx.font = (key[1] === "b" ? "8.5px" : "7.5px") + ' "Noto Music", sans-serif';
      ctx.fillStyle = colors[+key[0]];
      for (const g2 of arr) ctx.fillText(g2[2], g2[0], g2[1]);
    }
    const s2 = cssW / W;
    keys.forEach((p2, i2) => {
      const tpc = topics[i2];
      if (!tpc) return;
      const pressed = tpc.recent, hot = S2.tipK === i2, ch = C2.keyChars[i2], music = ch === "\u266D";
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(p2[0], p2[1], pressed || hot ? 8 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.font = music ? (pressed || hot ? "14px" : "12px") + ' "Noto Music", sans-serif' : (pressed || hot ? "800 13px" : "800 11.5px") + " Inter, sans-serif";
      ctx.fillStyle = pressed || hot ? colors[3] : colors[1];
      ctx.fillText(ch, p2[0], p2[1] + (music ? 0 : 0.5));
      const b2 = keyBtns[i2];
      if (b2) {
        b2.style.left = p2[0] * s2 + "px";
        b2.style.top = p2[1] * s2 + "px";
      }
    });
    placeTip();
    if (!drawn) {
      drawn = true;
      saxBox.classList.add("is-live");
    }
    return S2.drag || Math.abs(S2.off.ay) + Math.abs(S2.off.ax) + Math.abs(S2.vel.ay) + Math.abs(S2.vel.ax) > 5e-4;
  };
  const step = (dt) => {
    if (S2.drag) return;
    for (const k of ["ay", "ax"]) {
      S2.vel[k] += (-22 * S2.off[k] - 8 * S2.vel[k]) * dt;
      S2.off[k] += S2.vel[k] * dt;
    }
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    prev = 0;
  };
  const tick = (t2) => {
    raf = 0;
    const dt = prev ? Math.min(0.05, (t2 - prev) / 1e3) : 1 / 60;
    prev = t2;
    acc += dt;
    step(dt);
    let more = !reduce;
    if (acc >= 1 / 30) {
      acc = 0;
      more = draw(t2) || more;
    } else more = true;
    if (more && visible && !document.hidden) raf = requestAnimationFrame(tick);
    else prev = 0;
  };
  const kick = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
  };
  if (cv) {
    topics.forEach((t2, i2) => {
      const b2 = el("button", "hero-key");
      b2.type = "button";
      b2.tabIndex = i2 === 0 ? 0 : -1;
      b2.setAttribute("aria-label", t2.label + " \xB7 " + t2.n + "\uD3B8" + (t2.recent ? " \xB7 \uCD5C\uADFC 45\uC77C \uAE00 \uC788\uC74C" : ""));
      on(b2, "focus", () => {
        showTip(i2);
        kick();
      });
      on(b2, "blur", () => {
        showTip(-1);
        kick();
      });
      on(b2, "pointerenter", () => {
        showTip(i2);
        kick();
      });
      on(b2, "pointerleave", () => {
        showTip(-1);
        kick();
      });
      on(b2, "click", (e2) => {
        e2.stopPropagation();
        showTip(S2.tipK === i2 && e2.pointerType ? -1 : i2);
        kick();
      });
      keyLayer.append(b2);
      keyBtns.push(b2);
    });
    on(keyLayer, "keydown", (e2) => {
      const d2 = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e2.key];
      const cur = keyBtns.indexOf(document.activeElement);
      if (!d2 || cur < 0) return;
      e2.preventDefault();
      const nx = Math.max(0, Math.min(keyBtns.length - 1, cur + d2));
      keyBtns.forEach((x2, i2) => x2.tabIndex = i2 === nx ? 0 : -1);
      keyBtns[nx].focus();
    });
    on(cv, "pointerdown", (e2) => {
      S2.drag = true;
      S2.lx = e2.clientX;
      S2.ly = e2.clientY;
      S2.vel.ay = S2.vel.ax = 0;
      cv.setPointerCapture?.(e2.pointerId);
      saxBox.classList.add("is-dragging");
      kick();
    });
    on(cv, "pointermove", (e2) => {
      if (!S2.drag) return;
      S2.off.ay += (e2.clientX - S2.lx) * 0.012;
      S2.off.ax += (e2.clientY - S2.ly) * 0.012;
      S2.lx = e2.clientX;
      S2.ly = e2.clientY;
      kick();
    });
    const up = () => {
      if (!S2.drag) return;
      S2.drag = false;
      saxBox.classList.remove("is-dragging");
      kick();
    };
    on(cv, "pointerup", up);
    on(cv, "pointercancel", up);
    on(document, "pointerdown", (e2) => {
      if (!e2.target.closest?.(".hero-key")) showTip(-1);
    });
    on(document, "visibilitychange", () => document.hidden ? stop() : kick());
    on(document, "themechange", () => {
      readColors();
      draw(performance.now());
    });
    const io = new IntersectionObserver((es) => {
      visible = es.some((x2) => x2.isIntersecting);
      visible ? kick() : stop();
    });
    io.observe(saxBox);
    cleanups.push(() => {
      stop();
      io.disconnect();
    });
    const fontsReady = Promise.race([document.fonts.load('10px "Noto Music"', "\u2669\u266A\u266B\u266C\u266D"), new Promise((r2) => setTimeout(r2, 2500))]);
    fontsReady.then(() => {
      if (!root.isConnected) return;
      readColors();
      draw(performance.now());
      kick();
    });
  }
  const shelf = root.querySelector(".hero-shelf");
  const dlg = root.querySelector(".hero-card");
  const SC = L2.SHELF_CFG;
  let spines = [], active = 0;
  let lastKey = "";
  const layout = () => {
    const Wd = shelf.clientWidth;
    if (!Wd) return;
    const mobile = mobileQ.matches;
    if (lastKey === Wd + "|" + mobile) return;
    lastKey = Wd + "|" + mobile;
    const hadFocus = shelf.contains(document.activeElement);
    const plan = L2.planShelf(D2.notes, D2.topics, Wd, 3, SC);
    const height = mobile ? plan.R * 104 : L2.shelfH;
    const rowH = height / plan.R, PAD = 5, TAB = 18;
    const boardY = (r2) => (r2 + 1) * rowH - 1;
    const tabTop = (r2) => r2 * rowH + (r2 === 0 ? 0 : PAD);
    shelf.replaceChildren();
    shelf.style.height = height + "px";
    shelf.classList.add("is-laid");
    for (let r2 = 0; r2 < plan.R; r2++) {
      const b2 = el("div", "hero-board");
      b2.style.top = boardY(r2) + "px";
      shelf.append(b2);
      const f3 = el("div", "hero-front");
      f3.style.top = boardY(r2) + 1 + "px";
      shelf.append(f3);
      const b22 = el("div", "hero-board is-lower");
      b22.style.top = boardY(r2) + 4 + "px";
      shelf.append(b22);
    }
    spines = [];
    const shortBy = (m2) => m2 <= 2 ? 10 : m2 <= 6 ? 5 : 0;
    for (const row of plan.rows) {
      const items = row.items;
      const grp = [];
      items.forEach((it, j2) => {
        if (it.kind === "sp") {
          it.dh = shortBy(D2.notes[it.note].m);
          if (it.joinPrev && items[j2 - 1]?.kind === "sp") {
            const g2 = items[j2 - 1].grp || [items[j2 - 1]];
            g2.push(it);
            g2.forEach((x2) => x2.grp = g2);
            if (!grp.includes(g2)) grp.push(g2);
          }
        }
      });
      grp.forEach((g2) => {
        const h2 = Math.min(...g2.map((x2) => x2.dh));
        g2.forEach((x2) => x2.dh = h2);
      });
      items.forEach((it, j2) => {
        if (it.kind === "sp") {
          const n2 = D2.notes[it.note];
          const a2 = el("a", "hero-spine" + (n2.recent ? " is-new" : ""));
          a2.href = n2.h;
          a2.tabIndex = -1;
          a2.dataset.routerIgnore = "";
          a2.setAttribute("aria-haspopup", "dialog");
          a2.setAttribute("aria-label", n2.t + " \xB7 \uB178\uD2B8 \uCE74\uB4DC \uC5F4\uAE30");
          const top = tabTop(it.row) + TAB + it.dh;
          a2.style.cssText = "left:" + it.x.toFixed(2) + "px;width:" + it.w.toFixed(2) + "px;top:" + top + "px;height:" + (boardY(it.row) - top) + "px";
          if (it.w >= 9) {
            const no = el("span", "hero-spine-no", n2.n.slice(-2));
            no.setAttribute("aria-hidden", "true");
            a2.append(no);
          }
          a2.append(el("span", "hero-spine-band"), el("span", "hero-spine-foot"));
          a2.dataset.k = spines.length;
          spines.push({ a: a2, n: n2, it });
          shelf.append(a2);
          if (it.grp && it.grp[0] === it) {
            const last = it.grp[it.grp.length - 1];
            const cap = el("div", "hero-cap");
            cap.style.cssText = "left:" + it.x + "px;width:" + (last.x + last.w - it.x) + "px;top:" + (top - 4) + "px";
            shelf.append(cap);
          }
        } else {
          const dv = el(it.kind === "arc" ? "a" : "span", "hero-divider" + (it.cont ? " is-cont" : ""));
          if (it.kind === "arc") {
            dv.href = D2.archive;
            dv.tabIndex = -1;
          }
          dv.style.cssText = "left:" + it.x.toFixed(2) + "px;width:" + it.w.toFixed(2) + "px;top:" + tabTop(it.row) + "px;height:" + (boardY(it.row) - tabTop(it.row)) + "px";
          dv.setAttribute("aria-hidden", "true");
          shelf.append(dv);
          const next = items.slice(j2 + 1).find((x2) => x2.kind !== "sp");
          const room = (next ? next.x : Wd) - it.x - 2;
          const name = it.kind === "arc" ? "+" + plan.cut + " ARCHIVE" : D2.tabs[it.topic] || it.topic;
          const cands = it.kind === "arc" ? [name] : it.cont ? mobile ? ["\u21A9"] : [name + " \u21A9", name.slice(0, 4) + " \u21A9", "\u21A9"] : [name + " " + it.count, name, name.slice(0, 4) + " " + it.count, name.slice(0, 4)];
          const fit = cands.find((x2) => x2.length * 5.6 + 8 <= room) || cands[cands.length - 1];
          const tab = el("span", "hero-tab" + (it.cont ? " is-cont" : "") + (it.kind === "arc" ? " is-arc" : ""), fit);
          tab.style.cssText = "left:" + it.x + "px;top:" + tabTop(it.row) + "px";
          tab.setAttribute("aria-hidden", "true");
          shelf.append(tab);
        }
      });
    }
    active = Math.min(active, spines.length - 1);
    spines.forEach((s2, i2) => s2.a.tabIndex = i2 === active ? 0 : -1);
    if (hadFocus) spines[active]?.a.focus();
    shelf.setAttribute("aria-label", "\uB178\uD2B8 \uCE74\uD0C8\uB85C\uADF8 " + spines.length + "\uD3B8. \uD654\uC0B4\uD45C\uB85C \uC774\uB3D9, Enter\uB85C \uB178\uD2B8 \uCE74\uB4DC");
  };
  const setActive = (k, focus) => {
    if (!spines.length) return;
    active = Math.max(0, Math.min(spines.length - 1, k));
    spines.forEach((s2, i2) => s2.a.tabIndex = i2 === active ? 0 : -1);
    if (focus) spines[active].a.focus();
  };
  const nearest = (e2) => {
    const t2 = e2.target.closest?.(".hero-spine");
    if (t2) return +t2.dataset.k;
    const r2 = shelf.getBoundingClientRect(), px = e2.clientX - r2.left, py = e2.clientY - r2.top;
    let best = -1, bd = 8;
    spines.forEach((sp, k) => {
      const ar = sp.a.getBoundingClientRect();
      if (py < ar.top - r2.top - 14 || py > ar.bottom - r2.top + 2) return;
      const d2 = Math.max(0, Math.abs(px - (ar.left - r2.left + ar.width / 2)) - ar.width / 2);
      if (d2 < bd) {
        bd = d2;
        best = k;
      }
    });
    return best;
  };
  let card = { k: 0, opener: null };
  const fillCard = () => {
    const n2 = spines[card.k].n;
    const q2 = (s2) => dlg.querySelector(s2);
    q2(".hero-card-eyebrow").textContent = n2.n + " \xB7 " + (D2.tabs[n2.tp] || n2.tp) + (n2.st ? " \xB7 SERIES " + n2.si + "/" + n2.st : "") + (n2.recent ? " \xB7 NEW" : "");
    q2(".hero-card-title").textContent = n2.t;
    q2(".hero-card-meta").textContent = "posted " + n2.p + (n2.c && n2.c !== n2.p ? " \xB7 \uC791\uC131 " + n2.c : "") + (n2.m ? " \xB7 " + n2.m + " min read" : "");
    q2(".hero-card-desc").textContent = n2.d || "\uC694\uC57D\uC774 \uC5C6\uB294 \uB178\uD2B8\uC785\uB2C8\uB2E4.";
    q2(".hero-card-dive").href = n2.h;
    q2(".hero-card-prev").disabled = card.k === 0;
    q2(".hero-card-next").disabled = card.k === spines.length - 1;
  };
  const openCard = (k) => {
    card = { k, opener: spines[k].a };
    dlg.classList.toggle("is-sheet", mobileQ.matches);
    fillCard();
    dlg.showModal();
    document.documentElement.classList.add("hero-locked");
    dlg.querySelector(".hero-card-title").focus();
  };
  const moveCard = (d2) => {
    const k = card.k + d2;
    if (k < 0 || k >= spines.length) return;
    card.k = k;
    card.opener = spines[k].a;
    fillCard();
  };
  if (shelf && dlg) {
    layout();
    let pend = 0;
    const ro = new ResizeObserver(() => {
      if (!pend) pend = requestAnimationFrame(() => {
        pend = 0;
        layout();
      });
    });
    ro.observe(shelf);
    cleanups.push(() => ro.disconnect());
    on(shelf, "keydown", (e2) => {
      const d2 = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e2.key];
      if (d2) {
        e2.preventDefault();
        setActive(active + d2, true);
      } else if (e2.key === "Home") {
        e2.preventDefault();
        setActive(0, true);
      } else if (e2.key === "End") {
        e2.preventDefault();
        setActive(spines.length - 1, true);
      }
    });
    let hot = -1;
    on(shelf, "pointermove", (e2) => {
      const k = nearest(e2);
      if (k === hot) return;
      spines[hot]?.a.classList.remove("is-hot");
      hot = k;
      spines[k]?.a.classList.add("is-hot");
    });
    on(shelf, "pointerleave", () => {
      spines[hot]?.a.classList.remove("is-hot");
      hot = -1;
    });
    on(shelf, "click", (e2) => {
      if (e2.metaKey || e2.ctrlKey || e2.shiftKey || e2.button === 1) return;
      if (e2.target.closest?.(".hero-divider")) return;
      const k = nearest(e2);
      if (k < 0) return;
      e2.preventDefault();
      setActive(k, false);
      openCard(k);
    });
    on(dlg, "close", () => {
      document.documentElement.classList.remove("hero-locked");
      if (card.opener) requestAnimationFrame(() => setActive(card.k, true));
    });
    on(dlg, "click", (e2) => {
      if (e2.target === dlg) dlg.close();
    });
    on(dlg.querySelector(".hero-card-close"), "click", () => dlg.close());
    on(dlg.querySelector(".hero-card-prev"), "click", () => moveCard(-1));
    on(dlg.querySelector(".hero-card-next"), "click", () => moveCard(1));
    on(dlg, "keydown", (e2) => {
      if (e2.key === "ArrowLeft") {
        e2.preventDefault();
        moveCard(-1);
      } else if (e2.key === "ArrowRight") {
        e2.preventDefault();
        moveCard(1);
      } else if (e2.key === "Tab") {
        const f3 = [...dlg.querySelectorAll("button:not(:disabled), a[href]")];
        const i2 = f3.indexOf(document.activeElement);
        if (e2.shiftKey && i2 <= 0) {
          e2.preventDefault();
          f3[f3.length - 1].focus();
        } else if (!e2.shiftKey && i2 === f3.length - 1) {
          e2.preventDefault();
          f3[0].focus();
        }
      }
    });
    on(dlg.querySelector(".hero-card-dive"), "click", (e2) => {
      if (e2.metaKey || e2.ctrlKey || e2.shiftKey || e2.button === 1) return;
      e2.preventDefault();
      const url = new URL(e2.currentTarget.href, window.location.href);
      card.opener = null;
      dlg.close();
      window.spaNavigate ? window.spaNavigate(url) : window.location.href = url.href;
    });
    const hd = dlg.querySelector(".hero-card-handle");
    let y0 = null;
    on(hd, "pointerdown", (e2) => {
      y0 = e2.clientY;
      hd.setPointerCapture?.(e2.pointerId);
    });
    on(hd, "pointermove", (e2) => {
      if (y0 == null) return;
      const d2 = Math.max(0, e2.clientY - y0);
      dlg.style.transform = d2 ? "translateY(" + d2 + "px)" : "";
    });
    const end = (e2) => {
      if (y0 == null) return;
      const d2 = e2.clientY - y0;
      y0 = null;
      dlg.style.transform = "";
      if (d2 > 70) dlg.close();
    };
    on(hd, "pointerup", end);
    on(hd, "pointercancel", end);
    cleanups.push(() => {
      if (dlg.open) {
        card.opener = null;
        dlg.close();
      }
      document.documentElement.classList.remove("hero-locked");
    });
  }
  window.addCleanup?.(() => cleanups.forEach((fn) => fn()));
}

// src/components/styles/hero.scss
var hero_default = '.home-hero {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) clamp(440px, 38%, 600px) auto;\n  grid-template-areas: "text shelf sax";\n  align-items: end;\n  gap: 24px 40px;\n  padding: 56px 0 88px;\n}\n@media all and (max-width: 1279px) {\n  .home-hero {\n    grid-template-columns: minmax(0, 1fr) auto;\n    grid-template-areas: "text text" "shelf sax";\n  }\n}\n@media all and (max-width: 800px) {\n  .home-hero {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas: "sax" "text" "shelf";\n    gap: 18px;\n    padding: 12px 0 56px;\n  }\n}\n\n.hero-text {\n  grid-area: text;\n  align-self: center;\n  min-width: 0;\n}\n\n.hero-headline {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-weight: 900;\n  font-size: clamp(2.5rem, 6vw, 3.75rem);\n  line-height: 1.1;\n  letter-spacing: -0.02em;\n  color: var(--dark);\n}\n\n.hero-author {\n  margin: 14px 0 0;\n  font-family: var(--headerFont);\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: var(--darkgray);\n}\n@media all and (max-width: 800px) {\n  .hero-author {\n    margin-top: 10px;\n    font-size: 1rem;\n  }\n}\n\n.hero-description {\n  margin: 26px 0 0;\n  max-width: 29em;\n  font-family: var(--headerFont);\n  font-size: 17px;\n  line-height: 1.85;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n@media all and (max-width: 800px) {\n  .hero-description {\n    margin-top: 20px;\n    font-size: 16px;\n    line-height: 1.8;\n  }\n}\n\n.hero-links {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  margin: 26px 0 0;\n}\n.hero-links a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 0 16px;\n  box-sizing: border-box;\n  border-radius: 10px;\n  background: rgba(var(--accent-rgb), 0.08);\n  color: var(--secondary);\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.hero-links a:hover {\n  background: rgba(var(--accent-rgb), 0.16);\n}\n@media all and (max-width: 800px) {\n  .hero-links a {\n    min-height: 44px;\n  }\n}\n@media all and (max-width: 800px) {\n  .hero-links {\n    margin-top: 16px;\n  }\n}\n\n.hero-meta {\n  margin: 12px 0 0;\n  font-family: var(--codeFont);\n  font-size: 12px;\n  letter-spacing: 0.02em;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n@media all and (max-width: 800px) {\n  .hero-meta {\n    margin-top: 4px;\n    font-size: 11.5px;\n  }\n}\n\n.hero-num {\n  display: inline-block;\n  min-width: 1ch;\n}\n\n.hero-num-total {\n  min-width: 3ch;\n  text-align: right;\n}\n\n.hero-shelf-wrap {\n  grid-area: shelf;\n  min-width: 0;\n}\n\n.hero-shelf {\n  --sp-face: color-mix(in srgb, var(--gray) 9%, var(--light));\n  --sp-hi: color-mix(in srgb, var(--light) 60%, #fff);\n  --sp-lo: color-mix(in srgb, var(--gray) 48%, var(--light));\n  --sp-top: color-mix(in srgb, var(--gray) 22%, var(--light));\n  position: relative;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1px;\n  align-items: flex-end;\n}\n.hero-shelf:not(.is-laid) {\n  min-height: var(--shelf-h);\n}\n.hero-shelf.is-laid {\n  display: block;\n}\n\n:root[saved-theme=dark] .hero-shelf {\n  --sp-hi: color-mix(in srgb, var(--gray) 32%, var(--light));\n}\n\n.hero-spine {\n  position: relative;\n  display: block;\n  box-sizing: border-box;\n  width: 7px;\n  height: 92px;\n  background: var(--sp-face);\n  border-left: 1px solid var(--sp-hi);\n  border-right: 1px solid var(--sp-lo);\n  text-decoration: none;\n  transition: transform var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)), background-color var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1));\n}\n.is-laid .hero-spine {\n  position: absolute;\n}\n.hero-spine::before {\n  content: "";\n  position: absolute;\n  left: 0;\n  right: -1px;\n  top: -3px;\n  height: 3px;\n  background: var(--sp-top);\n  transform: skewX(-45deg);\n  transform-origin: bottom left;\n}\n.hero-spine.is-new {\n  background: color-mix(in srgb, var(--secondary) 12%, var(--light));\n  border-right-color: var(--secondary);\n  transform: translateY(-8px);\n}\n.hero-spine.is-new::before {\n  background: color-mix(in srgb, var(--secondary) 35%, var(--light));\n}\n.hero-spine.is-new .hero-spine-band {\n  border-color: var(--secondary);\n}\n.hero-spine:hover, .hero-spine.is-hot, .hero-spine:focus-visible {\n  background: color-mix(in srgb, var(--secondary) 16%, var(--light));\n  border-right-color: var(--secondary);\n  transform: translateY(-14px);\n  outline: none;\n}\n.hero-spine:focus-visible {\n  box-shadow: 0 0 0 2px var(--light), 0 0 0 3.5px var(--secondary);\n}\n\n.hero-spine-no {\n  position: absolute;\n  top: 4px;\n  left: 50%;\n  transform: translateX(-50%);\n  writing-mode: vertical-rl;\n  font: 700 6.5px/1 var(--codeFont);\n  letter-spacing: 0.04em;\n  color: var(--gray);\n  pointer-events: none;\n}\n\n.hero-spine-band {\n  position: absolute;\n  left: 1px;\n  right: 1px;\n  top: 22%;\n  height: 3px;\n  border-top: 1px solid var(--sp-lo);\n  border-bottom: 1px solid var(--sp-lo);\n  pointer-events: none;\n}\n\n.hero-spine-foot {\n  position: absolute;\n  left: 50%;\n  bottom: 5px;\n  width: 3px;\n  height: 3px;\n  margin-left: -1.5px;\n  border-radius: 50%;\n  background: var(--sp-lo);\n  pointer-events: none;\n}\n\n.hero-divider {\n  position: absolute;\n  box-sizing: border-box;\n  background: var(--light);\n  border: 1px solid var(--sp-lo);\n  border-bottom: 0;\n}\n\n.hero-tab {\n  position: absolute;\n  z-index: 2;\n  height: 14px;\n  padding: 0 4px 0 5px;\n  font: 700 9px/13px var(--codeFont);\n  letter-spacing: 0.04em;\n  color: var(--darkgray);\n  white-space: nowrap;\n  background: var(--light);\n  border: 1px solid var(--sp-lo);\n  border-left: 0;\n  border-radius: 0 3px 3px 0;\n  pointer-events: none;\n}\n.hero-tab.is-cont {\n  border-style: dashed;\n  border-left: 0;\n}\n.hero-tab.is-arc {\n  color: var(--secondary);\n  border-color: var(--secondary);\n}\n\n.hero-cap {\n  position: absolute;\n  z-index: 1;\n  height: 3px;\n  border-radius: 1px;\n  background: var(--sp-lo);\n  pointer-events: none;\n}\n\n.hero-board,\n.hero-front {\n  position: absolute;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n}\n\n.hero-board {\n  height: 1px;\n  background: var(--gray);\n  opacity: 0.55;\n}\n.hero-board.is-lower {\n  opacity: 0.28;\n}\n\n.hero-front {\n  height: 3px;\n  background: color-mix(in srgb, var(--gray) 14%, var(--light));\n}\n\n.hero-sax {\n  --t0: var(--dark);\n  --t1: var(--secondary);\n  --t2: color-mix(in srgb, var(--secondary) 90%, var(--light));\n  --tb: var(--dark);\n  grid-area: sax;\n  position: relative;\n  justify-self: end;\n  width: var(--sax-w);\n  height: var(--box-h);\n  touch-action: pan-y;\n}\n@media all and (max-width: 800px) {\n  .hero-sax {\n    justify-self: center;\n    width: calc(260px * var(--sax-ar));\n    height: 260px;\n  }\n}\n\n:root[saved-theme=dark] .hero-sax {\n  --t0: color-mix(in srgb, var(--secondary) 70%, var(--light));\n  --t2: var(--dark);\n}\n\n.hero-sax-pre,\n.hero-sax-cv,\n.hero-keys {\n  position: absolute;\n  left: 0;\n  top: calc(-1 * var(--g-top));\n  width: 100%;\n  height: auto;\n  aspect-ratio: var(--sax-ar);\n}\n@media all and (max-width: 800px) {\n  .hero-sax-pre,\n  .hero-sax-cv,\n  .hero-keys {\n    top: 0;\n  }\n}\n\n.hero-sax-pre {\n  overflow: visible;\n  font-family: "Noto Music", sans-serif;\n  font-size: 7.5px;\n  text-anchor: middle;\n  dominant-baseline: central;\n}\n.hero-sax-pre .t0 {\n  fill: var(--t0);\n}\n.hero-sax-pre .t1 {\n  fill: var(--t1);\n}\n.hero-sax-pre .t2 {\n  fill: var(--t2);\n}\n.hero-sax-pre .t3 {\n  fill: var(--tb);\n}\n.hero-sax-pre .k {\n  font: 800 11.5px Inter, var(--bodyFont);\n  fill: var(--t1);\n}\n.hero-sax-pre .k.is-music {\n  font-family: "Noto Music", sans-serif;\n  font-size: 12px;\n}\n.hero-sax-pre .k.is-pressed {\n  fill: var(--tb);\n}\n.is-live .hero-sax-pre {\n  visibility: hidden;\n}\n\n.hero-sax-cv {\n  cursor: grab;\n  visibility: hidden;\n}\n.is-live .hero-sax-cv {\n  visibility: visible;\n}\n.is-dragging .hero-sax-cv {\n  cursor: grabbing;\n}\n\n.hero-keys {\n  pointer-events: none;\n}\n\n.hero-key {\n  position: absolute;\n  width: 22px;\n  height: 22px;\n  margin: -11px 0 0 -11px;\n  padding: 0;\n  border: 0;\n  border-radius: 50%;\n  background: transparent;\n  cursor: help;\n  pointer-events: auto;\n}\n.hero-key:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 1px;\n}\n\n.hero-keytip {\n  position: absolute;\n  z-index: 3;\n  margin-top: calc(-1 * var(--g-top));\n  transform: translate(18px, -50%);\n  padding: 3px 8px;\n  font: 500 12px var(--bodyFont);\n  white-space: nowrap;\n  color: var(--darkgray);\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 6px;\n  pointer-events: none;\n}\n.hero-keytip b {\n  color: var(--dark);\n}\n\n.hero-tone {\n  display: none;\n}\n.hero-tone.t0 {\n  color: var(--t0);\n}\n.hero-tone.t1 {\n  color: var(--t1);\n}\n.hero-tone.t2 {\n  color: var(--t2);\n}\n.hero-tone.tb {\n  color: var(--tb);\n}\n\n.hero-card {\n  width: min(520px, 100vw - 32px);\n  max-height: min(80dvh, 640px);\n  padding: 0;\n  color: var(--darkgray);\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 14px;\n}\n.hero-card::backdrop {\n  background: rgba(10, 16, 28, 0.42);\n}\n.hero-card[open] {\n  animation: hero-card-in var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1));\n}\n.hero-card.is-sheet {\n  width: 100%;\n  max-width: 100%;\n  margin: auto 0 0;\n  max-height: 75dvh;\n  border-bottom: 0;\n  border-radius: 16px 16px 0 0;\n}\n.hero-card.is-sheet .hero-card-in {\n  padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px));\n}\n.hero-card.is-sheet .hero-card-handle {\n  display: block;\n}\n.hero-card.is-sheet .hero-card-actions {\n  flex-wrap: wrap;\n}\n.hero-card.is-sheet .hero-card-dive {\n  order: -1;\n  flex: 1 0 100%;\n  justify-content: center;\n  min-height: 48px;\n}\n\n.hero-card-in {\n  display: grid;\n  gap: 10px;\n  padding: 22px 22px 18px;\n}\n\n.hero-card-handle {\n  display: none;\n  width: 44px;\n  height: 5px;\n  margin: 0 auto 2px;\n  border-radius: 3px;\n  background: var(--lightgray);\n  cursor: grab;\n  touch-action: none;\n}\n\n.hero-card-eyebrow,\n.hero-card-meta {\n  margin: 0;\n  font: 400 12px var(--codeFont);\n  letter-spacing: 0.04em;\n  color: var(--gray);\n}\n\n.hero-card-title {\n  margin: 0;\n  font-family: var(--headerFont);\n  font-size: 1.35rem;\n  font-weight: 700;\n  color: var(--dark);\n  outline: none;\n}\n\n.hero-card-desc {\n  margin: 0;\n  font-size: 15px;\n  line-height: 1.75;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n\n.hero-card-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 6px;\n}\n.hero-card-actions button {\n  min-height: 40px;\n  padding: 0 12px;\n  font: 500 13px var(--bodyFont);\n  color: var(--darkgray);\n  background: none;\n  border: 1px solid var(--lightgray);\n  border-radius: 9px;\n  cursor: pointer;\n}\n.hero-card-actions button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.hero-card-gap {\n  flex: 1 1 auto;\n}\n\n.hero-card-dive {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  min-height: 40px;\n  padding: 0 18px;\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  color: var(--light);\n  text-decoration: none;\n  background: var(--accent-action);\n  border-radius: 9px;\n}\n\n:root.hero-locked {\n  overflow: hidden;\n  scrollbar-gutter: stable;\n}\n\n@keyframes hero-card-in {\n  from {\n    opacity: 0;\n    transform: translateY(6px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .hero-spine,\n  .hero-card[open] {\n    transition: none;\n    animation: none;\n  }\n}\n@media (prefers-reduced-motion: no-preference) {\n  :root:not([data-hero-swept]) .hero-headline {\n    background-image: linear-gradient(90deg, currentColor 0 50%, transparent 50% 100%);\n    background-size: 200% 100%;\n    background-position: 100% 0;\n    -webkit-background-clip: text;\n    background-clip: text;\n    -webkit-text-fill-color: transparent;\n    animation: hero-sweep 1.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) 0.15s forwards;\n  }\n  :root:not([data-hero-swept]) .hero-rise {\n    animation: hero-rise var(--dur-slow, 900ms) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) both;\n  }\n  :root:not([data-hero-swept]) .hero-rise-1 {\n    animation-delay: 0.12s;\n  }\n  :root:not([data-hero-swept]) .hero-rise-2 {\n    animation-delay: 0.24s;\n  }\n  :root:not([data-hero-swept]) .hero-rise-3 {\n    animation-delay: 0.36s;\n  }\n}\n@keyframes hero-sweep {\n  to {\n    background-position: 0 0;\n  }\n}\n@keyframes hero-rise {\n  from {\n    opacity: 0;\n    transform: translateY(12px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}';

// ../_shared/noteMeta.ts
function inRanges(code, ranges) {
  return ranges.some(([lo, hi]) => lo <= code && code <= hi);
}
var isCJK = (c2) => typeof c2 === "string" && inRanges(c2.charCodeAt(0), [
  [12352, 12447],
  [19968, 40959],
  [44032, 55203],
  [131072, 191456]
]);
var isWordBound = (c2) => typeof c2 === "string" && " \n\r	".includes(c2);
var isPunctuation = (c2) => typeof c2 === "string" && inRanges(c2.charCodeAt(0), [
  [33, 47],
  [58, 64],
  [91, 96],
  [123, 126],
  [12288, 12351],
  [65280, 65519]
]);
function countWords(text) {
  let words = 0;
  let start = 0;
  let end = text.length - 1;
  while (isWordBound(text[start])) start++;
  while (end >= 0 && isWordBound(text[end])) end--;
  const t2 = `${text}
`;
  for (let i2 = start; i2 <= end; i2++) {
    if (isCJK(t2[i2]) || !isWordBound(t2[i2]) && (isWordBound(t2[i2 + 1]) || isCJK(t2[i2 + 1]))) {
      words++;
    }
    if (isCJK(t2[i2])) {
      while (i2 <= end && (isPunctuation(t2[i2 + 1]) || isWordBound(t2[i2 + 1]))) i2++;
    }
  }
  return words;
}
function readingMinutes(text) {
  return text ? Math.ceil(countWords(text) / 200) : 0;
}
function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? void 0 : value;
  if (typeof value !== "string" && typeof value !== "number") return void 0;
  const d2 = new Date(value);
  return Number.isNaN(d2.getTime()) ? void 0 : d2;
}
function formatYmd(date) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}
function getNoteDates(file) {
  const created = file.dates?.created ?? file.dates?.published;
  const differs = (d2, ...others) => d2 && !others.some((o2) => o2 && formatYmd(o2) === formatYmd(d2)) ? d2 : void 0;
  const revised = differs(toDate(file.frontmatter?.posted), created);
  const updated = differs(file.dates?.modified, created, revised);
  return { created, revised, updated };
}
function getListDate(file) {
  const { created, revised } = getNoteDates(file);
  return revised ?? created;
}

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
var TOPIC_NAMES = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools"
};
function titleCase(key) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function topicName(slug) {
  const key = slug.split("/")[0] ?? "";
  return TOPIC_NAMES[key] ?? titleCase(key);
}

// ../_shared/path.ts
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  return endsWith(s2, suffix) ? s2.slice(0, -suffix.length) : s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) s2 = s2.substring(1);
  if (!onlyStripPrefix && s2.endsWith("/")) s2 = s2.slice(0, -1);
  return s2;
}
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) return "";
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) joined = "/" + joined;
  if (last?.endsWith("/")) joined = joined + "/";
  return joined;
}
function pathToRoot(slug) {
  const rootPath = slug.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  return rootPath.length === 0 ? "." : rootPath;
}
function resolveRelative(current, target) {
  return joinSegments(pathToRoot(current), simplifySlug(target));
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
var NOTO_MUSIC_CSS = "https://fonts.googleapis.com/css2?family=Noto+Music&text=%E2%99%A9%E2%99%AA%E2%99%AB%E2%99%AC%E2%99%AD&display=swap";
var TAB_NAMES = {
  programming: "PROG",
  "data-engineering": "DATA-ENG",
  "data-science": "DATA-SCI",
  "computer-science": "CS",
  gis: "GIS",
  "finance-property": "FINANCE",
  tools: "TOOLS"
};
var sweptScript = `try { if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`;
var heroScript = `
const heroLib = {
  buildSax: (${buildSax.toString()}),
  rasterSax: (${rasterSax.toString()}),
  fitSax: (${fitSax.toString()}),
  composeSax: (${composeSax.toString()}),
  planShelf: (${planShelf.toString()}),
  SAX_CFG: ${JSON.stringify(SAX_CFG)},
  SHELF_CFG: ${JSON.stringify(SHELF_CFG)},
  REST: ${JSON.stringify(SAX_REST)},
}
const heroClient = (${heroClient.toString()})

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

function initHero() {
  if (!document.querySelector(".home-hero")) return
  heroLib.model = heroLib.model || heroLib.buildSax()
  heroLib.fit = heroLib.fit || heroLib.fitSax(heroLib.model, heroLib.rasterSax, heroLib.REST, heroLib.SAX_CFG.rows)
  heroLib.shelfH = heroLib.SAX_CFG.rows * heroLib.SAX_CFG.ch - heroLib.SAX_CFG.glyphTop - heroLib.SAX_CFG.glyphBottom + 1
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
var saxModel;
var saxFit;
var prerender;
function getPrerender() {
  saxModel ??= buildSax();
  saxFit ??= fitSax(saxModel, rasterSax, SAX_REST, SAX_CFG.rows);
  prerender ??= composeSax(saxModel, rasterSax, {}, saxFit, SAX_CFG, SAX_REST.ay, SAX_REST.ax, () => 0);
  return { fit: saxFit, ...prerender };
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
    const topicKey = (f3) => (f3.slug ?? "").split("/")[0] ?? "";
    const topicKeys = [...new Set(files.map(topicKey).filter(Boolean))];
    const topicCount = topicKeys.length;
    const description = opts.description || (fileData.frontmatter?.description ?? "");
    const ymd = (d2) => d2 ? formatYmd(d2) : "";
    const rows = files.map((f3) => {
      const fm = f3.frontmatter ?? {};
      const text = f3.text ?? "";
      return {
        slug: f3.slug ?? "",
        t: fm.title ?? f3.slug ?? "",
        h: resolveRelative(fileData.slug, f3.slug),
        p: ymd(getListDate(f3)),
        c: ymd(getNoteDates(f3).created),
        m: readingMinutes(text),
        d: fm.description ?? "",
        tp: topicKey(f3),
        len: text.replace(/\s+/g, "").length,
        series: fm.series ?? "",
        sidx: Number(fm.series_index ?? 0) || 0
      };
    }).sort((a2, b2) => a2.p.localeCompare(b2.p) || a2.c.localeCompare(b2.c) || a2.slug.localeCompare(b2.slug));
    const seriesTotal = /* @__PURE__ */ new Map();
    for (const r2 of rows) if (r2.series) seriesTotal.set(r2.series, (seriesTotal.get(r2.series) ?? 0) + 1);
    const notes = rows.map((r2, i2) => ({
      n: "HJ " + (4001 + i2),
      t: r2.t,
      h: r2.h,
      p: r2.p,
      c: r2.c,
      m: r2.m,
      d: r2.d,
      tp: r2.tp,
      len: r2.len,
      topic: r2.tp,
      posted: r2.p,
      created: r2.c,
      href: r2.h,
      series: r2.series,
      sidx: r2.sidx,
      si: r2.sidx,
      st: r2.series ? seriesTotal.get(r2.series) : 0
    }));
    const tabs = Object.fromEntries(topicKeys.map((k) => [k, TAB_NAMES[k] ?? k.toUpperCase()]));
    const labels = Object.fromEntries(topicKeys.map((k) => [k, topicName(k)]));
    const topicOrder = Object.keys(TAB_NAMES).filter((k) => topicKeys.includes(k)).concat(topicKeys.filter((k) => !(k in TAB_NAMES)));
    const data = {
      notes,
      topics: topicOrder,
      tabs,
      labels,
      archive: resolveRelative(fileData.slug, "archive")
    };
    const json = JSON.stringify(data).replace(/</g, "\\u003c");
    const pre = getPrerender();
    const W = pre.fit.cols * SAX_CFG.cw;
    const H2 = SAX_CFG.rows * SAX_CFG.ch;
    const byRow = /* @__PURE__ */ new Map();
    for (const [x2, y2, ch, tier] of pre.glyphs) {
      const k = y2 + "|" + tier;
      const g2 = byRow.get(k) ?? { y: y2, tier, xs: [], chs: "" };
      g2.xs.push(x2.toFixed(1));
      g2.chs += ch;
      byRow.set(k, g2);
    }
    const buildNow = Date.now();
    const keyTopics = topicKeys.map((k) => ({ k, n: files.filter((f3) => topicKey(f3) === k).length, recent: notes.some((n2) => n2.tp === k && (buildNow - Date.parse(n2.p)) / 864e5 <= 45) })).sort((a2, b2) => b2.n - a2.n);
    const shelfH = SAX_CFG.rows * SAX_CFG.ch - SAX_CFG.glyphTop - SAX_CFG.glyphBottom + 1;
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      /* @__PURE__ */ u2("link", { rel: "stylesheet", href: NOTO_MUSIC_CSS }),
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
      /* @__PURE__ */ u2("div", { class: "hero-shelf-wrap hero-rise hero-rise-2", children: /* @__PURE__ */ u2("nav", { class: "hero-shelf", role: "group", "aria-label": `\uB178\uD2B8 \uCE74\uD0C8\uB85C\uADF8 ${noteCount}\uD3B8`, style: `--shelf-h:${shelfH.toFixed(2)}px`, children: notes.map((n2) => /* @__PURE__ */ u2("a", { class: "hero-spine", href: n2.h, title: n2.t, children: /* @__PURE__ */ u2("span", { class: "hero-spine-band" }) })) }) }),
      /* @__PURE__ */ u2(
        "div",
        {
          class: "hero-sax hero-rise hero-rise-1",
          style: `--sax-w:${W.toFixed(1)}px;--sax-ar:${(W / H2).toFixed(4)};--box-h:${shelfH.toFixed(2)}px;--g-top:${SAX_CFG.glyphTop}px`,
          children: [
            /* @__PURE__ */ u2("svg", { class: "hero-sax-pre", viewBox: `0 0 ${W.toFixed(1)} ${H2.toFixed(1)}`, "aria-hidden": "true", children: [
              [...byRow.values()].map((g2) => /* @__PURE__ */ u2("text", { class: `t${g2.tier}`, x: g2.xs.join(" "), y: g2.y.toFixed(1), children: g2.chs })),
              pre.keys.map(([x2, y2], i2) => /* @__PURE__ */ u2("text", { class: classNames("k", keyTopics[i2]?.recent && "is-pressed", i2 === 0 && "is-music"), x: x2.toFixed(1), y: (y2 + (i2 === 0 ? 0 : 0.5)).toFixed(1), children: SAX_CFG.keyChars[i2] }))
            ] }),
            /* @__PURE__ */ u2("canvas", { class: "hero-sax-cv", "aria-hidden": "true" }),
            /* @__PURE__ */ u2("div", { class: "hero-keys", role: "group", "aria-label": "\uC0C9\uC18C\uD3F0 \uD0A4 = \uD1A0\uD53D" }),
            /* @__PURE__ */ u2("div", { class: "hero-keytip", role: "tooltip", hidden: true }),
            /* @__PURE__ */ u2("i", { class: "hero-tone t0" }),
            /* @__PURE__ */ u2("i", { class: "hero-tone t1" }),
            /* @__PURE__ */ u2("i", { class: "hero-tone t2" }),
            /* @__PURE__ */ u2("i", { class: "hero-tone tb" })
          ]
        }
      ),
      /* @__PURE__ */ u2("script", { type: "application/json", class: "hero-data", dangerouslySetInnerHTML: { __html: json } }),
      /* @__PURE__ */ u2("dialog", { class: "hero-card", "aria-labelledby": "hero-card-title", "aria-describedby": "hero-card-desc", children: /* @__PURE__ */ u2("div", { class: "hero-card-in", children: [
        /* @__PURE__ */ u2("div", { class: "hero-card-handle", "aria-hidden": "true" }),
        /* @__PURE__ */ u2("p", { class: "hero-card-eyebrow" }),
        /* @__PURE__ */ u2("h2", { class: "hero-card-title", id: "hero-card-title", tabindex: -1 }),
        /* @__PURE__ */ u2("p", { class: "hero-card-meta" }),
        /* @__PURE__ */ u2("p", { class: "hero-card-desc", id: "hero-card-desc" }),
        /* @__PURE__ */ u2("div", { class: "hero-card-actions", children: [
          /* @__PURE__ */ u2("button", { class: "hero-card-prev", type: "button", "aria-label": "\uC774\uC804 \uB178\uD2B8", children: "\u2039" }),
          /* @__PURE__ */ u2("button", { class: "hero-card-next", type: "button", "aria-label": "\uB2E4\uC74C \uB178\uD2B8", children: "\u203A" }),
          /* @__PURE__ */ u2("span", { class: "hero-card-gap" }),
          /* @__PURE__ */ u2("button", { class: "hero-card-close", type: "button", children: "\uB2EB\uAE30" }),
          /* @__PURE__ */ u2("a", { class: "hero-card-dive", href: "#", "data-router-ignore": true, children: [
            "DIVE IN ",
            /* @__PURE__ */ u2("span", { "aria-hidden": "true", children: "\u2192" })
          ] })
        ] })
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