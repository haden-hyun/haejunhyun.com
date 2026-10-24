// src/components/shelf.ts
var SHELF_SIZE = 24;
var PER_ROW = 12;
var NEW_COUNT = 3;
var newer = (a2, b2) => b2.date.localeCompare(a2.date) || a2.slug.localeCompare(b2.slug);
var older = (a2, b2) => a2.date.localeCompare(b2.date) || a2.slug.localeCompare(b2.slug);
function spineHeight(slug) {
  let h2 = 0;
  for (const c2 of slug) h2 = h2 * 31 + c2.charCodeAt(0) >>> 0;
  return 82 + h2 % 19;
}
function pickShelf(notes, size = SHELF_SIZE, perRow = PER_ROW) {
  const byTopic = /* @__PURE__ */ new Map();
  for (const n2 of notes) byTopic.set(n2.topic, [...byTopic.get(n2.topic) ?? [], n2]);
  const topics = [...byTopic.keys()].sort((a2, b2) => byTopic.get(b2).length - byTopic.get(a2).length || a2.localeCompare(b2));
  const lists = topics.map((t2) => byTopic.get(t2).sort(newer));
  const picked = [];
  for (let i2 = 0; picked.length < size; i2++) {
    let any = false;
    for (const list of lists) {
      if (list[i2] && picked.length < size) {
        picked.push(list[i2]);
        any = true;
      }
    }
    if (!any) break;
  }
  const fresh = new Set([...picked].sort(newer).slice(0, NEW_COUNT).map((n2) => n2.slug));
  const ordered = topics.flatMap((t2) => picked.filter((n2) => n2.topic === t2).sort(older));
  const rows = [];
  ordered.forEach((n2, k) => {
    const r2 = Math.floor(k / perRow);
    const row = rows[r2] ??= [];
    const prev = row[row.length - 1];
    row.push({ ...n2, k, gap: !!prev && prev.topic !== n2.topic, isNew: fresh.has(n2.slug), hp: spineHeight(n2.slug) });
  });
  return rows;
}

// src/components/client.ts
function heroClient() {
  const root = document.querySelector(".home-hero");
  const dataEl = root?.querySelector(".hero-data");
  const shelf = root?.querySelector(".hero-shelf");
  const dlg = root?.querySelector(".hero-card");
  const tip = root?.querySelector(".hero-tip");
  if (!dataEl || !shelf || !dlg || !tip) return;
  const notes = JSON.parse(dataEl.textContent).notes;
  const spines = [...shelf.querySelectorAll(".hero-spine")];
  if (spines.length !== notes.length) return;
  const mobileQ = window.matchMedia("(max-width: 800px)");
  const perRow = shelf.querySelector(".hero-row").children.length;
  const cleanups = [];
  const on = (t2, ev, fn, opt) => {
    t2.addEventListener(ev, fn, opt);
    cleanups.push(() => t2.removeEventListener(ev, fn, opt));
  };
  const el = (tag, txt) => {
    const e2 = document.createElement(tag);
    e2.textContent = txt;
    return e2;
  };
  let active = 0;
  spines.forEach((a2, i2) => {
    a2.tabIndex = i2 === active ? 0 : -1;
    a2.dataset.routerIgnore = "";
    a2.setAttribute("aria-haspopup", "dialog");
    a2.setAttribute("aria-label", notes[i2].t + " \u2014 " + notes[i2].tl + " \xB7 \uB178\uD2B8 \uCE74\uB4DC \uC5F4\uAE30");
  });
  const setActive = (k, focus) => {
    active = Math.max(0, Math.min(spines.length - 1, k));
    spines.forEach((a2, i2) => a2.tabIndex = i2 === active ? 0 : -1);
    if (focus) spines[active].focus();
  };
  const showTip = (k) => {
    const a2 = spines[k], n2 = notes[k], lift = 9;
    tip.replaceChildren(el("b", n2.t), el("small", n2.tl));
    tip.classList.add("is-on");
    const x2 = a2.offsetLeft + a2.offsetWidth / 2 - tip.offsetWidth / 2;
    tip.style.left = Math.max(0, Math.min(shelf.clientWidth - tip.offsetWidth, x2)) + "px";
    tip.style.top = a2.offsetTop - lift - tip.offsetHeight - 8 + "px";
  };
  const hideTip = () => tip.classList.remove("is-on");
  spines.forEach((a2, i2) => {
    on(a2, "pointerenter", (e2) => {
      if (e2.pointerType !== "touch") showTip(i2);
    });
    on(a2, "pointerleave", hideTip);
    on(a2, "focus", () => {
      active = i2;
      showTip(i2);
    });
    on(a2, "blur", hideTip);
  });
  on(shelf, "keydown", (e2) => {
    const d2 = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: perRow, ArrowUp: -perRow }[e2.key];
    if (d2) {
      e2.preventDefault();
      const k = active + d2;
      if (k >= 0 && k < spines.length) setActive(k, true);
    } else if (e2.key === "Home") {
      e2.preventDefault();
      setActive(0, true);
    } else if (e2.key === "End") {
      e2.preventDefault();
      setActive(spines.length - 1, true);
    }
  });
  let card = { k: 0, opener: null };
  const fillCard = () => {
    const n2 = notes[card.k];
    const q2 = (s2) => dlg.querySelector(s2);
    q2(".hero-card-eyebrow").textContent = n2.tl + (n2.sl ? " \xB7 \uC2DC\uB9AC\uC988 " + n2.sl : "") + (n2.isNew ? " \xB7 NEW" : "");
    q2(".hero-card-title").textContent = n2.t;
    q2(".hero-card-meta").textContent = "posted " + n2.p + (n2.c && n2.c !== n2.p ? " \xB7 \uC791\uC131 " + n2.c : "") + (n2.m ? " \xB7 " + n2.m + " min read" : "");
    q2(".hero-card-desc").textContent = n2.d || "\uC694\uC57D\uC774 \uC5C6\uB294 \uB178\uD2B8\uC785\uB2C8\uB2E4.";
    q2(".hero-card-dive").href = n2.h;
    q2(".hero-card-prev").disabled = card.k === 0;
    q2(".hero-card-next").disabled = card.k === spines.length - 1;
  };
  const openCard = (k) => {
    card = { k, opener: spines[k] };
    hideTip();
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
    card.opener = spines[k];
    fillCard();
  };
  on(shelf, "click", (e2) => {
    if (e2.metaKey || e2.ctrlKey || e2.shiftKey || e2.button === 1) return;
    const a2 = e2.target.closest?.(".hero-spine");
    if (!a2) return;
    e2.preventDefault();
    const k = spines.indexOf(a2);
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
  window.addCleanup?.(() => cleanups.forEach((fn) => fn()));
}

// src/components/styles/hero.scss
var hero_default = '.home-hero {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) clamp(400px, 50%, 600px);\n  grid-template-areas: "text shelf";\n  align-items: end;\n  gap: 28px 56px;\n  padding: 40px 0 56px;\n}\n@media all and (max-width: 899px) {\n  .home-hero {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas: "text" "shelf";\n    padding: 12px 0 40px;\n  }\n}\n\n.hero-text {\n  grid-area: text;\n  min-width: 0;\n}\n\n.hero-headline {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-weight: 900;\n  font-size: clamp(2.5rem, 6vw, 3.75rem);\n  line-height: 1.1;\n  letter-spacing: -0.02em;\n  color: var(--dark);\n}\n\n.hero-author {\n  margin: 14px 0 0;\n  font-family: var(--headerFont);\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: var(--darkgray);\n}\n@media all and (max-width: 800px) {\n  .hero-author {\n    margin-top: 10px;\n    font-size: 1rem;\n  }\n}\n\n.hero-description {\n  margin: 26px 0 0;\n  max-width: 29em;\n  font-family: var(--headerFont);\n  font-size: 17px;\n  line-height: 1.85;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n@media all and (max-width: 800px) {\n  .hero-description {\n    margin-top: 20px;\n    font-size: 16px;\n    line-height: 1.8;\n  }\n}\n\n.hero-links {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  margin: 26px 0 0;\n}\n.hero-links a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 0 16px;\n  box-sizing: border-box;\n  border-radius: 10px;\n  background: rgba(var(--accent-rgb), 0.08);\n  color: var(--secondary);\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.hero-links a:hover {\n  background: rgba(var(--accent-rgb), 0.16);\n}\n@media all and (max-width: 800px) {\n  .hero-links a {\n    min-height: 44px;\n  }\n}\n@media all and (max-width: 800px) {\n  .hero-links {\n    margin-top: 16px;\n  }\n}\n\n.hero-meta {\n  margin: 12px 0 0;\n  font-family: var(--codeFont);\n  font-size: 12px;\n  letter-spacing: 0.02em;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n@media all and (max-width: 800px) {\n  .hero-meta {\n    margin-top: 4px;\n    font-size: 11.5px;\n  }\n}\n\n.hero-num {\n  display: inline-block;\n  min-width: 1ch;\n}\n\n.hero-num-total {\n  min-width: 3ch;\n  text-align: right;\n}\n\n.hero-shelf {\n  --paper: var(--light);\n  --ink: var(--dark);\n  --row-h: 120px;\n  --lift: 9px;\n  grid-area: shelf;\n  position: relative;\n  display: grid;\n  gap: 24px;\n  min-width: 0;\n  padding-top: var(--lift);\n}\n@media all and (max-width: 700px) {\n  .hero-shelf {\n    --row-h: 108px;\n    gap: 22px;\n  }\n}\n\n:root[saved-theme=dark] .hero-shelf {\n  --paper: var(--dark);\n  --ink: var(--light);\n}\n\n.hero-row {\n  display: flex;\n  align-items: flex-end;\n  gap: 3px;\n  height: var(--row-h);\n  border-bottom: 2px solid var(--dark);\n  box-shadow: 0 6px 6px -5px color-mix(in srgb, var(--dark) 22%, transparent);\n}\n@media all and (max-width: 700px) {\n  .hero-row {\n    gap: 2px;\n  }\n}\n\n.hero-spine {\n  position: relative;\n  display: flex;\n  flex: 1 1 0;\n  align-items: center;\n  justify-content: center;\n  box-sizing: border-box;\n  min-width: 0;\n  max-width: 44px;\n  background: var(--paper);\n  color: var(--ink);\n  border: 1px solid color-mix(in srgb, var(--ink) 18%, var(--paper));\n  border-bottom: 0;\n  border-radius: 2px 2px 0 0;\n  box-shadow: inset -3px 0 3px -2px color-mix(in srgb, var(--ink) 16%, transparent);\n  text-decoration: none;\n  transition: transform var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1));\n}\n.hero-spine.has-gap {\n  margin-left: 9px;\n}\n@media all and (max-width: 700px) {\n  .hero-spine.has-gap {\n    margin-left: 5px;\n  }\n}\n.hero-spine::after {\n  content: "";\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 100%;\n  height: var(--lift);\n}\n.hero-spine.is-new {\n  background: var(--secondary);\n  color: var(--light);\n  border-color: var(--tertiary);\n  box-shadow: inset -3px 0 3px -2px color-mix(in srgb, var(--light) 28%, transparent);\n}\n.hero-spine:hover, .hero-spine:focus-visible {\n  color: var(--ink);\n}\n.hero-spine.is-new:hover, .hero-spine.is-new:focus-visible {\n  color: var(--light);\n}\n.hero-spine:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 3px;\n}\n@media (hover: hover) {\n  .hero-spine:hover {\n    transform: translateY(calc(-1 * var(--lift)));\n  }\n}\n.hero-spine:focus-visible {\n  transform: translateY(calc(-1 * var(--lift)));\n}\n@media all and (max-width: 700px) {\n  .hero-spine {\n    min-width: 24px;\n  }\n}\n\n.hero-spine-t {\n  max-height: calc(100% - 20px);\n  overflow: hidden;\n  writing-mode: vertical-rl;\n  font: 700 12px/1.2 var(--headerFont);\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  pointer-events: none;\n}\n@media all and (max-width: 700px) {\n  .hero-spine-t {\n    font-size: 11px;\n  }\n}\n\n.hero-tip {\n  position: absolute;\n  z-index: 3;\n  left: 0;\n  top: 0;\n  width: max-content;\n  max-width: 100%;\n  box-sizing: border-box;\n  padding: 5px 10px;\n  font: 600 12px/1.4 var(--bodyFont);\n  color: var(--light);\n  background: var(--dark);\n  border-radius: 4px;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transition: opacity var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)), visibility var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1));\n}\n.hero-tip.is-on {\n  opacity: 1;\n  visibility: visible;\n}\n.hero-tip small {\n  display: block;\n  font: 400 10px var(--codeFont);\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n  color: color-mix(in srgb, var(--light) 82%, var(--dark));\n}\n\n.hero-card {\n  width: min(520px, 100vw - 32px);\n  max-height: min(80dvh, 640px);\n  padding: 0;\n  color: var(--darkgray);\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 14px;\n}\n.hero-card::backdrop {\n  background: rgba(10, 16, 28, 0.42);\n}\n.hero-card[open] {\n  animation: hero-card-in var(--dur-fast) var(--ease, cubic-bezier(0.22, 1, 0.36, 1));\n}\n.hero-card.is-sheet {\n  width: 100%;\n  max-width: 100%;\n  margin: auto 0 0;\n  max-height: 75dvh;\n  border-bottom: 0;\n  border-radius: 16px 16px 0 0;\n}\n.hero-card.is-sheet .hero-card-in {\n  padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px));\n}\n.hero-card.is-sheet .hero-card-handle {\n  display: block;\n}\n.hero-card.is-sheet .hero-card-actions {\n  flex-wrap: wrap;\n}\n.hero-card.is-sheet .hero-card-dive {\n  order: -1;\n  flex: 1 0 100%;\n  justify-content: center;\n  min-height: 48px;\n}\n\n.hero-card-in {\n  display: grid;\n  gap: 10px;\n  padding: 22px 22px 18px;\n}\n\n.hero-card-handle {\n  display: none;\n  width: 44px;\n  height: 5px;\n  margin: 0 auto 2px;\n  border-radius: 3px;\n  background: var(--lightgray);\n  cursor: grab;\n  touch-action: none;\n}\n\n.hero-card-eyebrow,\n.hero-card-meta {\n  margin: 0;\n  font: 400 12px var(--codeFont);\n  letter-spacing: 0.04em;\n  color: var(--gray);\n}\n\n.hero-card-title {\n  margin: 0;\n  font-family: var(--headerFont);\n  font-size: 1.35rem;\n  font-weight: 700;\n  color: var(--dark);\n  outline: none;\n}\n\n.hero-card-desc {\n  margin: 0;\n  font-size: 15px;\n  line-height: 1.75;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n\n.hero-card-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 6px;\n}\n.hero-card-actions button {\n  min-height: 40px;\n  padding: 0 12px;\n  font: 500 13px var(--bodyFont);\n  color: var(--darkgray);\n  background: none;\n  border: 1px solid var(--lightgray);\n  border-radius: 9px;\n  cursor: pointer;\n}\n.hero-card-actions button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.hero-card-gap {\n  flex: 1 1 auto;\n}\n\n.hero-card-dive {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  min-height: 40px;\n  padding: 0 18px;\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  color: var(--light);\n  text-decoration: none;\n  background: var(--accent-action);\n  border-radius: 9px;\n}\n\n:root.hero-locked {\n  overflow: hidden;\n  scrollbar-gutter: stable;\n}\n\n@keyframes hero-card-in {\n  from {\n    opacity: 0;\n    transform: translateY(6px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .hero-spine,\n  .hero-tip,\n  .hero-card[open] {\n    transition: none;\n    animation: none;\n  }\n}';

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

// ../_shared/series.ts
function seriesOf(file) {
  const raw = file.frontmatter?.series;
  return raw == null ? "" : String(raw).trim();
}
function seriesIndexOf(file) {
  const raw = file.frontmatter?.series_index;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : void 0;
  if (typeof raw === "string" && raw.trim() !== "") {
    const index = Number(raw);
    return Number.isFinite(index) ? index : void 0;
  }
  return void 0;
}
function episodeLabel(index) {
  return index === 0 ? "\uC11C\uBB38" : `${index}\uD3B8`;
}
function seriesLabel(file) {
  const index = seriesIndexOf(file);
  return seriesOf(file) && index !== void 0 ? episodeLabel(index) : void 0;
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
var heroScript = `
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

function initHero() {
  if (document.querySelector(".home-hero")) heroClient()
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  initHero()
})
`;
var defaultOptions = {
  headline: "",
  author: "",
  description: "",
  links: []
};
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
    const cands = files.map((f3) => {
      const fm = f3.frontmatter ?? {};
      const text = f3.text ?? "";
      const p2 = ymd(getListDate(f3));
      const c2 = ymd(getNoteDates(f3).created);
      return {
        slug: f3.slug ?? "",
        topic: topicKey(f3),
        date: p2 || c2,
        t: fm.title ?? f3.slug ?? "",
        tl: topicName(topicKey(f3)),
        h: resolveRelative(fileData.slug, f3.slug),
        p: p2,
        c: c2,
        m: readingMinutes(text),
        d: fm.description ?? "",
        sl: seriesLabel(f3) ?? ""
      };
    });
    const shelfRows = pickShelf(cands);
    const shelfCount = shelfRows.reduce((s2, r2) => s2 + r2.length, 0);
    const json = JSON.stringify({
      notes: shelfRows.flat().map((n2) => ({ t: n2.t, tl: n2.tl, h: n2.h, p: n2.p, c: n2.c, m: n2.m, d: n2.d, sl: n2.sl, isNew: n2.isNew }))
    }).replace(/</g, "\\u003c");
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      /* @__PURE__ */ u2("div", { class: "hero-text", children: [
        /* @__PURE__ */ u2("h1", { class: "hero-headline", children: opts.headline }),
        opts.author && /* @__PURE__ */ u2("p", { class: "hero-author", children: opts.author }),
        description && /* @__PURE__ */ u2("p", { class: "hero-description", children: description }),
        /* @__PURE__ */ u2("div", { children: [
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
      /* @__PURE__ */ u2("div", { class: "hero-shelf", role: "group", "aria-label": `\uB178\uD2B8 ${shelfCount}\uD3B8`, children: [
        shelfRows.map((row) => /* @__PURE__ */ u2("div", { class: "hero-row", children: row.map((n2) => /* @__PURE__ */ u2(
          "a",
          {
            class: classNames("hero-spine", n2.isNew && "is-new", n2.gap && "has-gap"),
            href: n2.h,
            "data-k": n2.k,
            "aria-label": `${n2.t} \u2014 ${n2.tl}`,
            style: `height:${n2.hp}%`,
            children: /* @__PURE__ */ u2("span", { class: "hero-spine-t", children: n2.t })
          }
        )) })),
        /* @__PURE__ */ u2("div", { class: "hero-tip", "aria-hidden": "true" })
      ] }),
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
  HomeHero.afterDOMLoaded = heroScript;
  return HomeHero;
});

export { HomeHero_default as HomeHero };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map