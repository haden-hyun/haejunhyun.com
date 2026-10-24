
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
        glyphs.push([x2, y2, cfg.notes[2], 3, lit]);
        continue;
      }
      if (ras.s[i2] > 0.6) {
        glyphs.push([x2, y2, cfg.sparks[(c2 + r2) % 2], 2, lit]);
        continue;
      }
      const edge = !on(c2 - 1, r2) || !on(c2 + 1, r2) || !on(c2, r2 - 1) || !on(c2, r2 + 1);
      const ch = (c2 * 5 + r2 * 3) % 7 === 0 ? cfg.accidentals[(c2 + r2) % 3] : cfg.notes[(c2 + r2 * 2) % 4];
      if (edge) {
        glyphs.push([x2, y2, m2 === 1 ? cfg.rim : ch, 1, lit]);
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
  SAX_CFG: {"cw":4.6,"ch":8.2,"rows":41,"notes":"♩♪♫♬","accidentals":"♭♯♮","sparks":"✦✧","rim":"◦","keyY":[0.78,0.62,0.46,0.3,0.14,-0.02,-0.18],"keyChars":["♭","H","A","E","J","U","N"],"keyRing":true},
  REST: {"ay":-0.35,"ax":-0.25},
  FONT: "\"Noto Music\", \"Noto Sans Symbols 2\", sans-serif",
  FONT_LOADS: [["10px \"Noto Music\"","♩♪♫♬♭♯♮"],["10px \"Noto Sans Symbols 2\"","✦✧◦"]],
}
const heroClient = (function heroClient(L2) {
  const root = document.querySelector(".home-hero");
  const saxBox = root?.querySelector(".hero-sax");
  const cv = saxBox?.querySelector(".hero-sax-cv");
  if (!cv) return;
  const D2 = JSON.parse(root.querySelector(".hero-data").textContent);
  const now = Date.now();
  const topics = D2.topics.map((t2) => ({ ...t2, recent: !!t2.p && (now - Date.parse(t2.p)) / 864e5 <= 45 }));
  const keyLayer = saxBox.querySelector(".hero-keys");
  const tip = saxBox.querySelector(".hero-keytip");
  const el = (tag, cls, txt) => {
    const e2 = document.createElement(tag);
    if (cls) e2.className = cls;
    if (txt != null) e2.textContent = txt;
    return e2;
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];
  const on = (t2, ev, fn, opt) => {
    t2.addEventListener(ev, fn, opt);
    cleanups.push(() => t2.removeEventListener(ev, fn, opt));
  };
  const C2 = L2.SAX_CFG;
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
  const placeTip = () => {
    const k = S2.tipK;
    if (k < 0 || !S2.keys[k]) return;
    const s2 = cv.clientWidth / W;
    tip.style.left = S2.keys[k][0] * s2 + "px";
    tip.style.top = S2.keys[k][1] * s2 + "px";
  };
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
  const sweepAt = (t2) => {
    if (reduce) return () => 0;
    const p2 = t2 % 6 / 6;
    if (p2 > 0.8) return () => 0;
    const w2 = Math.max(50, 0.3 * W), X = -w2 + (W + 2 * w2) * (p2 / 0.8);
    return (x2) => Math.exp(-2.2 * ((x2 - X) / w2) ** 2);
  };
  const draw = (nowT) => {
    if (!colors) return false;
    const t2 = (nowT - S2.t0) / 1e3;
    const sway = reduce ? 0 : 0.15 * Math.sin(t2 / 9 * Math.PI * 2);
    const { glyphs, keys } = L2.composeSax(L2.model, L2.rasterSax, buf, L2.fit, C2, L2.REST.ay + sway + S2.off.ay, L2.REST.ax + S2.off.ax, sweepAt(t2));
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
      ctx.font = (key[1] === "b" ? "8.5px" : "7.5px") + " " + L2.FONT;
      ctx.fillStyle = colors[+key[0]];
      for (const g2 of arr) ctx.fillText(g2[2], g2[0], g2[1]);
    }
    S2.keys = keys;
    const sc = cssW / W;
    keys.forEach((p2, i2) => {
      const tpc = topics[i2];
      if (!tpc) return;
      const hot = tpc.recent || S2.tipK === i2, ch = C2.keyChars[i2], music = i2 === 0, ring = C2.keyRing;
      const r2 = (ring ? 8 : 7) + (hot ? 1 : 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(p2[0], p2[1], r2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hot ? colors[3] : colors[1];
      if (ring) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p2[0], p2[1], r2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.font = music ? (hot ? "14px" : "12px") + " " + L2.FONT : (hot ? "500 12.5px" : "500 11px") + " Inter, sans-serif";
      ctx.fillText(ch, p2[0], p2[1] + (music ? 0 : 0.5));
      const b2 = keyBtns[i2];
      if (b2) {
        b2.style.left = p2[0] * sc + "px";
        b2.style.top = p2[1] * sc + "px";
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
  on(document, "pointerdown", (e2) => {
    if (!e2.target.closest?.(".hero-key")) {
      showTip(-1);
      kick();
    }
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
  const fontsReady = Promise.race([Promise.all(L2.FONT_LOADS.map(([f3, t2]) => document.fonts.load(f3, t2))), new Promise((r2) => setTimeout(r2, 2500))]);
  fontsReady.then(() => {
    if (!root.isConnected) return;
    readColors();
    draw(performance.now());
    kick();
  });
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
