
const heroLib = {
  buildSax: (function buildSax() {
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
}),
  rasterSax: (function rasterSax(model, buf, C2, R, cxp, cyp, ay, ax, scl) {
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
}),
  fitSax: (function fitSax(model, raster, rest, rows) {
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
}),
  composeSax: (function composeSax(model, raster, buf, fit, cfg, ay, ax, sweepAt) {
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
}),
  planShelf: (function planShelf(notes, topics, W, rowsMax, cfg) {
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
}),
  SAX_CFG: {"cw":4.6,"ch":8.2,"rows":41,"glyphTop":1.5,"glyphBottom":3,"keyY":[0.78,0.62,0.46,0.3,0.14,-0.02,-0.18],"keyChars":["♭","H","A","E","J","U","N"]},
  SHELF_CFG: {"div":5,"gap":1,"dgap":3,"fmin":0.62,"fmax2":3,"fmax3":2.2},
  REST: {"ay":-0.35,"ax":-0.25},
  shelfH: 332.7,
}
const heroClient = (function heroClient(L2) {
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
    q2(".hero-card-eyebrow").textContent = n2.n + " \xB7 " + (D2.tabs[n2.tp] || n2.tp) + (n2.sl ? " \xB7 \uC2DC\uB9AC\uC988 " + n2.sl : "") + (n2.recent ? " \xB7 NEW" : "");
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
})

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
      fetch("https://haejunhyun.goatcounter.com/counter/TOTAL.json")
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
  heroLib.fit = heroLib.fit || heroLib.fitSax(heroLib.model, heroLib.rasterSax, heroLib.REST, heroLib.SAX_CFG.rows)
  heroClient(heroLib)
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  markHeroSwept()
  initHero()
})
