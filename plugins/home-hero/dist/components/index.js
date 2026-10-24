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
  ch: 8.2,
  rows: 41,
  // 조밀도 순(렌더 잉크 면적, 7.5px): · .024 | ◦ .046 | ♩ .062 ♭ .075 | ♪ .092 ♮ .098 | ♯ .141 ♫ .153 | ♬ .175 | ✧ .224. ✦(.366)는 정반사 정점 전용
  ramp: ["\xB7", "\u25E6", "\u2669\u266D", "\u266A\u266E", "\u266F\u266B", "\u266C\u266B", "\u266C", "\u266C\u2727"],
  sparks: "\u2726\u2727",
  rim: "\u25E6",
  bell: "\u266B",
  // 음영 값 → 단 정규화 구간, 빛 물결이 올리는 양
  lo: 0.06,
  hi: 0.8,
  gammaLight: 1.9,
  // 라이트는 밝은 면이 종이로 날아가지 않게 음영을 어두운 쪽으로 당긴다
  gammaDark: 1.2,
  lift: 0.14,
  // 운지 키: 위 → 아래 7개, 키 i = 편수 순 i번째 토픽(맨 위는 ♭ 옥타브 키)
  keyY: [0.78, 0.62, 0.46, 0.3, 0.14, -0.02, -0.18],
  keyChars: ["\u266D", "H", "A", "E", "J", "U", "N"],
  keyRing: true
  // 키 둘레 1px 원 테두리
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
  const L2 = [-0.62, 0.5, -0.6];
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
    const dl = nx * L2[0] + ny * L2[1] + nz * L2[2];
    const wrap = Math.max(0, (dl + 0.15) / 1.15);
    const lam = Math.max(0, dl);
    const spec = Math.pow(Math.max(0, nx * Hx + ny * Hy + nz * Hz), 20);
    const m2 = P2[i2 + 6];
    const face = Math.min(1, Math.max(0, -nz) / 0.6);
    const limb = 0.5 + 0.5 * face * face * (3 - 2 * face);
    let b2 = (0.07 + 0.8 * wrap + 0.5 * spec) * limb;
    if (nz > 0.05 && m2 !== 2) b2 *= 0.35;
    if (m2 === 2) {
      const q2 = Math.min(1, Math.hypot(P2[i2] - model.bell[0], P2[i2 + 2] - model.bell[2]) / 0.43);
      b2 = 0.1 + 0.34 * q2 * Math.sqrt(q2);
    } else if (m2 === 3) b2 = 0.2 + 0.3 * lam;
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
      v2[r2 * C2 + c2] = on ? tot / n2 * (0.78 + 0.22 * Math.min(1, n2 / (SX * SY))) : -1;
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
function composeSax(model, raster, buf, fit, cfg, ay, ax, sweepAt, dark) {
  const C2 = fit.cols;
  const R = cfg.rows;
  const N2 = cfg.ramp.length;
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
      let sh = Math.pow(Math.min(1, Math.max(0, (v2 - cfg.lo) / (cfg.hi - cfg.lo))), dark ? cfg.gammaDark : cfg.gammaLight);
      if (lit) sh = Math.min(1, sh + cfg.lift);
      const q2 = Math.min(N2 - 1, Math.floor(sh * N2));
      const k = dark ? q2 : N2 - 1 - q2;
      let ch;
      if (m2 === 2 || m2 === 1 && r2 < bell[1] - 0.5) ch = cfg.bell;
      else if (ras.s[i2] > 0.6) ch = cfg.sparks[(c2 + r2) % 2];
      else if (m2 === 1 && !(on(c2 - 1, r2) && on(c2 + 1, r2) && on(c2, r2 - 1) && on(c2, r2 + 1))) ch = cfg.rim;
      else {
        const g2 = cfg.ramp[k];
        ch = g2[(c2 + r2) % g2.length];
      }
      glyphs.push([x2, y2, ch, k, lit]);
    }
  }
  const keys = cfg.keyY.map((y2) => {
    const r0 = 0.07 + 0.075 * ((0.95 - y2) / 1.5);
    const p2 = ras.proj(0, y2, -(r0 + 0.02));
    return [p2[0] * cfg.cw, p2[1] * cfg.ch];
  });
  return { glyphs, keys };
}

// src/components/client.ts
function heroClient(L2) {
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
  let colors = null, keyInk = null, pressInk = null;
  const readColors = () => {
    const pick = (cls) => getComputedStyle(saxBox.querySelector(".hero-tone." + cls)).color;
    colors = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => pick("s" + k));
    keyInk = pick("tk");
    pressInk = pick("tp");
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
    const dark = document.documentElement.getAttribute("saved-theme") === "dark";
    const { glyphs, keys } = L2.composeSax(L2.model, L2.rasterSax, buf, L2.fit, C2, L2.REST.ay + sway + S2.off.ay, L2.REST.ax + S2.off.ax, sweepAt(t2), dark);
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
      const r2 = (ring ? 6 : 5.5) + (hot ? 1 : 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(p2[0], p2[1], r2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hot ? pressInk : keyInk;
      if (ring) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p2[0], p2[1], r2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.font = music ? (hot ? "10px" : "9px") + " " + L2.FONT : (hot ? "500 9px" : "500 8px") + " Inter, sans-serif";
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
}

// src/components/styles/hero.scss
var hero_default = '.home-hero {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  grid-template-areas: "text sax";\n  align-items: center;\n  gap: 24px 56px;\n  padding: 48px 0 64px;\n}\n@media all and (max-width: 899px) {\n  .home-hero {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas: "sax" "text";\n    gap: 18px;\n    padding: 12px 0 40px;\n  }\n}\n\n.hero-text {\n  grid-area: text;\n  align-self: center;\n  min-width: 0;\n}\n\n.hero-headline {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-weight: 900;\n  font-size: clamp(2.5rem, 6vw, 3.75rem);\n  line-height: 1.1;\n  letter-spacing: -0.02em;\n  color: var(--dark);\n}\n\n.hero-author {\n  margin: 14px 0 0;\n  font-family: var(--headerFont);\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: var(--darkgray);\n}\n@media all and (max-width: 800px) {\n  .hero-author {\n    margin-top: 10px;\n    font-size: 1rem;\n  }\n}\n\n.hero-description {\n  margin: 26px 0 0;\n  max-width: 29em;\n  font-family: var(--headerFont);\n  font-size: 17px;\n  line-height: 1.85;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n@media all and (max-width: 800px) {\n  .hero-description {\n    margin-top: 20px;\n    font-size: 16px;\n    line-height: 1.8;\n  }\n}\n\n.hero-links {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  margin: 26px 0 0;\n}\n.hero-links a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 0 16px;\n  box-sizing: border-box;\n  border-radius: 10px;\n  background: rgba(var(--accent-rgb), 0.08);\n  color: var(--secondary);\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.hero-links a:hover {\n  background: rgba(var(--accent-rgb), 0.16);\n}\n@media all and (max-width: 800px) {\n  .hero-links a {\n    min-height: 44px;\n  }\n}\n@media all and (max-width: 800px) {\n  .hero-links {\n    margin-top: 16px;\n  }\n}\n\n.hero-meta {\n  margin: 12px 0 0;\n  font-family: var(--codeFont);\n  font-size: 12px;\n  letter-spacing: 0.02em;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n@media all and (max-width: 800px) {\n  .hero-meta {\n    margin-top: 4px;\n    font-size: 11.5px;\n  }\n}\n\n.hero-num {\n  display: inline-block;\n  min-width: 1ch;\n}\n\n.hero-num-total {\n  min-width: 3ch;\n  text-align: right;\n}\n\n.hero-sax {\n  --sa: color-mix(in srgb, var(--secondary) 90%, var(--light));\n  --s0: var(--sa);\n  --s1: color-mix(in srgb, var(--secondary) 28.6%, var(--sa));\n  --s2: color-mix(in srgb, var(--secondary) 57.1%, var(--sa));\n  --s3: color-mix(in srgb, var(--secondary) 85.7%, var(--sa));\n  --s4: color-mix(in srgb, var(--dark) 14.3%, var(--secondary));\n  --s5: color-mix(in srgb, var(--dark) 42.9%, var(--secondary));\n  --s6: color-mix(in srgb, var(--dark) 71.4%, var(--secondary));\n  --s7: var(--dark);\n  --tk: var(--secondary);\n  --tp: var(--dark);\n  grid-area: sax;\n  position: relative;\n  justify-self: end;\n  width: var(--sax-w);\n  height: var(--box-h);\n  touch-action: pan-y;\n}\n@media all and (max-width: 899px) {\n  .hero-sax {\n    justify-self: center;\n    width: calc(260px * var(--sax-ar));\n    height: 260px;\n  }\n}\n\n:root[saved-theme=dark] .hero-sax {\n  --sa: color-mix(in srgb, var(--secondary) 76%, var(--light));\n}\n\n.hero-sax-pre,\n.hero-sax-cv,\n.hero-keys {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: auto;\n  aspect-ratio: var(--sax-ar);\n}\n\n.hero-sax-pre {\n  overflow: visible;\n  font-family: "Noto Music", "Noto Sans Symbols 2", sans-serif;\n  font-size: 7.5px;\n  text-anchor: middle;\n  dominant-baseline: central;\n}\n.hero-sax-pre .s0 {\n  fill: var(--s0);\n}\n.hero-sax-pre .s1 {\n  fill: var(--s1);\n}\n.hero-sax-pre .s2 {\n  fill: var(--s2);\n}\n.hero-sax-pre .s3 {\n  fill: var(--s3);\n}\n.hero-sax-pre .s4 {\n  fill: var(--s4);\n}\n.hero-sax-pre .s5 {\n  fill: var(--s5);\n}\n.hero-sax-pre .s6 {\n  fill: var(--s6);\n}\n.hero-sax-pre .s7 {\n  fill: var(--s7);\n}\n.hero-sax-pre .k {\n  font: 500 8px Inter, var(--bodyFont);\n  fill: var(--tk);\n}\n.hero-sax-pre .k.is-music {\n  font-family: "Noto Music", sans-serif;\n  font-size: 9px;\n}\n.hero-sax-pre .kr {\n  fill: none;\n  stroke: var(--tk);\n  stroke-width: 1px;\n}\n.hero-sax-pre .k.is-pressed {\n  fill: var(--tp);\n}\n.hero-sax-pre .kr.is-pressed {\n  stroke: var(--tp);\n}\n.hero-sax-pre.on-dark {\n  display: none;\n}\n.is-live .hero-sax-pre {\n  visibility: hidden;\n}\n\n:root[saved-theme=dark] .hero-sax-pre.on-light {\n  display: none;\n}\n:root[saved-theme=dark] .hero-sax-pre.on-dark {\n  display: block;\n}\n\n.hero-sax-cv {\n  cursor: grab;\n  visibility: hidden;\n}\n.is-live .hero-sax-cv {\n  visibility: visible;\n}\n.is-dragging .hero-sax-cv {\n  cursor: grabbing;\n}\n\n.hero-keys {\n  pointer-events: none;\n}\n\n.hero-key {\n  position: absolute;\n  width: 22px;\n  height: 22px;\n  margin: -11px 0 0 -11px;\n  padding: 0;\n  border: 0;\n  border-radius: 50%;\n  background: transparent;\n  cursor: help;\n  pointer-events: auto;\n}\n.hero-key:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 1px;\n}\n\n.hero-keytip {\n  position: absolute;\n  z-index: 3;\n  transform: translate(18px, -50%);\n  padding: 3px 8px;\n  font: 500 12px var(--bodyFont);\n  white-space: nowrap;\n  color: var(--darkgray);\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 6px;\n  pointer-events: none;\n}\n.hero-keytip b {\n  color: var(--dark);\n}\n\n.hero-tone {\n  display: none;\n}\n.hero-tone.s0 {\n  color: var(--s0);\n}\n.hero-tone.s1 {\n  color: var(--s1);\n}\n.hero-tone.s2 {\n  color: var(--s2);\n}\n.hero-tone.s3 {\n  color: var(--s3);\n}\n.hero-tone.s4 {\n  color: var(--s4);\n}\n.hero-tone.s5 {\n  color: var(--s5);\n}\n.hero-tone.s6 {\n  color: var(--s6);\n}\n.hero-tone.s7 {\n  color: var(--s7);\n}\n.hero-tone.tk {\n  color: var(--tk);\n}\n.hero-tone.tp {\n  color: var(--tp);\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  :root:not([data-hero-swept]) .hero-headline {\n    background-image: linear-gradient(90deg, currentColor 0 50%, transparent 50% 100%);\n    background-size: 200% 100%;\n    background-position: 100% 0;\n    -webkit-background-clip: text;\n    background-clip: text;\n    -webkit-text-fill-color: transparent;\n    animation: hero-sweep 1.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) 0.15s forwards;\n  }\n  :root:not([data-hero-swept]) .hero-rise {\n    animation: hero-rise var(--dur-slow, 900ms) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) both;\n  }\n  :root:not([data-hero-swept]) .hero-rise-1 {\n    animation-delay: 0.12s;\n  }\n  :root:not([data-hero-swept]) .hero-rise-2 {\n    animation-delay: 0.24s;\n  }\n  :root:not([data-hero-swept]) .hero-rise-3 {\n    animation-delay: 0.36s;\n  }\n}\n@keyframes hero-sweep {\n  to {\n    background-position: 0 0;\n  }\n}\n@keyframes hero-rise {\n  from {\n    opacity: 0;\n    transform: translateY(12px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}';

// ../_shared/noteMeta.ts
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
var TOPIC_NAMES = Object.fromEntries(TOPICS.map((t2) => [t2.key, t2.label]));

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
function titleCase(key) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function topicName(slug) {
  const key = slug.split("/")[0] ?? "";
  return TOPIC_NAMES[key] ?? titleCase(key);
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
var NOTO_MUSIC_CSS = "https://fonts.googleapis.com/css2?family=Noto+Music&text=%E2%99%A9%E2%99%AA%E2%99%AB%E2%99%AC%E2%99%AD%E2%99%AE%E2%99%AF&display=swap";
var NOTO_SYMBOLS_CSS = "https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&text=%E2%9C%A6%E2%9C%A7%E2%97%A6%C2%B7&display=swap";
var SAX_FONT = '"Noto Music", "Noto Sans Symbols 2", sans-serif';
var SAX_FONT_LOADS = [
  ['10px "Noto Music"', "\u2669\u266A\u266B\u266C\u266D\u266E\u266F"],
  ['10px "Noto Sans Symbols 2"', "\u2726\u2727\u25E6\xB7"]
];
var sweptScript = `try { if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`;
var heroScript = `
const heroLib = {
  buildSax: (${buildSax.toString()}),
  rasterSax: (${rasterSax.toString()}),
  fitSax: (${fitSax.toString()}),
  composeSax: (${composeSax.toString()}),
  SAX_CFG: ${JSON.stringify(SAX_CFG)},
  REST: ${JSON.stringify(SAX_REST)},
  FONT: ${JSON.stringify(SAX_FONT)},
  FONT_LOADS: ${JSON.stringify(SAX_FONT_LOADS)},
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
  heroLib.fit = heroLib.fit || heroLib.fitSax(heroLib.model, heroLib.rasterSax, heroLib.REST, heroLib.SAX_CFG.rows)
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
var prerender = {};
function getPrerender(theme) {
  saxModel ??= buildSax();
  saxFit ??= fitSax(saxModel, rasterSax, SAX_REST, SAX_CFG.rows);
  prerender[theme] ??= composeSax(saxModel, rasterSax, {}, saxFit, SAX_CFG, SAX_REST.ay, SAX_REST.ax, () => 0, theme === "dark");
  return { fit: saxFit, ...prerender[theme] };
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
    const byTopic = /* @__PURE__ */ new Map();
    for (const f3 of files) {
      const k = topicKey(f3);
      const p2 = getListDate(f3) ? formatYmd(getListDate(f3)) : "";
      const cur = byTopic.get(k) ?? { n: 0, p: "" };
      byTopic.set(k, { n: cur.n + 1, p: p2 > cur.p ? p2 : cur.p });
    }
    const topics = [...byTopic.entries()].map(([k, v2]) => ({ k, label: topicName(k), n: v2.n, p: v2.p })).sort((a2, b2) => b2.n - a2.n || a2.k.localeCompare(b2.k));
    const topicCount = topics.length;
    const buildNow = Date.now();
    const isRecent = (p2) => !!p2 && (buildNow - Date.parse(p2)) / 864e5 <= 45;
    const json = JSON.stringify({ topics }).replace(/</g, "\\u003c");
    const description = opts.description || (fileData.frontmatter?.description ?? "");
    const pre = getPrerender("light");
    const W = pre.fit.cols * SAX_CFG.cw;
    const H2 = SAX_CFG.rows * SAX_CFG.ch;
    const levels = (g2) => {
      const by = /* @__PURE__ */ new Map();
      for (const [x2, y2, ch, k] of g2) {
        const e2 = by.get(k) ?? { x: [], y: [], chs: "" };
        e2.x.push(x2.toFixed(1));
        e2.y.push(y2.toFixed(1));
        e2.chs += ch;
        by.set(k, e2);
      }
      return [...by.entries()].sort((a2, b2) => a2[0] - b2[0]);
    };
    const keyMarks = pre.keys.map(([x2, y2], i2) => {
      const pressed = !!topics[i2] && isRecent(topics[i2].p);
      const music = i2 === 0;
      return /* @__PURE__ */ u2(S, { children: [
        SAX_CFG.keyRing && /* @__PURE__ */ u2("circle", { class: classNames("kr", pressed && "is-pressed"), cx: x2.toFixed(1), cy: y2.toFixed(1), r: pressed ? 7 : 6 }),
        /* @__PURE__ */ u2("text", { class: classNames("k", pressed && "is-pressed", music && "is-music"), x: x2.toFixed(1), y: (y2 + (music ? 0 : 0.5)).toFixed(1), children: SAX_CFG.keyChars[i2] })
      ] });
    });
    const preSvg = (theme) => /* @__PURE__ */ u2("svg", { class: `hero-sax-pre on-${theme}`, viewBox: `0 0 ${W.toFixed(1)} ${H2.toFixed(1)}`, "aria-hidden": "true", children: [
      levels(getPrerender(theme).glyphs).map(([k, e2]) => /* @__PURE__ */ u2("text", { class: `s${k}`, x: e2.x.join(" "), y: e2.y.join(" "), children: e2.chs })),
      keyMarks
    ] });
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      /* @__PURE__ */ u2("link", { rel: "stylesheet", href: NOTO_MUSIC_CSS }),
      /* @__PURE__ */ u2("link", { rel: "stylesheet", href: NOTO_SYMBOLS_CSS }),
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
      /* @__PURE__ */ u2(
        "div",
        {
          class: "hero-sax hero-rise hero-rise-1",
          style: `--sax-w:${W.toFixed(1)}px;--sax-ar:${(W / H2).toFixed(4)};--box-h:${H2.toFixed(1)}px`,
          children: [
            preSvg("light"),
            preSvg("dark"),
            /* @__PURE__ */ u2("canvas", { class: "hero-sax-cv", "aria-hidden": "true" }),
            /* @__PURE__ */ u2("div", { class: "hero-keys", role: "group", "aria-label": "\uC0C9\uC18C\uD3F0 \uD0A4 = \uD1A0\uD53D" }),
            /* @__PURE__ */ u2("div", { class: "hero-keytip", role: "tooltip", hidden: true }),
            [0, 1, 2, 3, 4, 5, 6, 7].map((k) => /* @__PURE__ */ u2("i", { class: `hero-tone s${k}` })),
            /* @__PURE__ */ u2("i", { class: "hero-tone tk" }),
            /* @__PURE__ */ u2("i", { class: "hero-tone tp" })
          ]
        }
      ),
      /* @__PURE__ */ u2("script", { type: "application/json", class: "hero-data", dangerouslySetInnerHTML: { __html: json } })
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