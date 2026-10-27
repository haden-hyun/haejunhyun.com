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

// src/components/styles/noteSpecs.scss
var noteSpecs_default = '@charset "UTF-8";\n.note-specs {\n  margin: 0.6rem 0 0;\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  line-height: 1.6;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n.note-specs > span {\n  white-space: nowrap;\n}\n.note-specs > * + *::before {\n  content: "\xB7";\n  margin-inline: 0.5em;\n}\n.note-specs .note-specs-tags {\n  white-space: normal;\n}\n.note-specs .note-specs-tags a {\n  color: var(--secondary);\n}\n.note-specs .note-specs-tags a:hover {\n  color: var(--tertiary);\n}\n.note-specs .note-specs-tags a + a {\n  margin-inline-start: 0.5em;\n}\n.note-specs .note-specs-readers {\n  display: inline-block;\n  min-width: 13ch;\n  visibility: hidden;\n  opacity: 0;\n}\n.note-specs .note-specs-readers[hidden] {\n  display: none;\n}\n.note-specs .note-specs-readers.ready {\n  visibility: visible;\n  opacity: 1;\n  transition: opacity 0.2s;\n}';

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
function isFolderMirrorTag(slug, tag) {
  const dir = slug.split("/").slice(0, -1).join("/");
  return dir === tag || dir.startsWith(tag + "/");
}

// src/components/scripts/specsReaders.inline.ts
var specsReaders_inline_default = 'var a;function c(){return a??(a=fetch("/api/stats").then(e=>e.ok?e.json():null).then(e=>e&&typeof e.views=="object"&&e.views?e.views:null).catch(()=>null)),a}function l(){let e=location.pathname;try{e=decodeURIComponent(e)}catch{}return e.length>1?e.replace(/\\/+$/,""):"/"}document.addEventListener("nav",()=>{let e=document.querySelector(".note-specs-readers"),n=e?.querySelector(".note-specs-readers-count");if(!e||!n)return;let r=l(),o=!0;window.addCleanup(()=>{o=!1}),c().then(t=>{if(!o)return;if(!t){e.hidden=!0;return}let s=Number.isFinite(t[r])?t[r]:0;n.textContent=`${s.toLocaleString("en-US")} reader${s===1?"":"s"}`,e.classList.add("ready")})});\n';

// src/components/scripts/backlinkPaths.inline.ts
var backlinkPaths_inline_default = 'document.addEventListener("nav",()=>{for(let e of document.querySelectorAll(".page-footer .backlinks li > a")){if(e.nextElementSibling?.classList.contains("backlink-path"))continue;let t=e.getAttribute("href")??"";try{t=decodeURIComponent(t)}catch{}let c=t.replace(/[?#].*$/,"").replace(/^(\\.\\.?\\/)+/,"").split("/").slice(0,-1);if(!c.length)continue;let n=document.createElement("span");n.className="backlink-path",n.textContent=c.join(" / "),e.after(n)}});\n';
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

// src/components/NoteSpecs.tsx
var defaultOptions = {
  labels: { created: "Created", revised: "Revised", updated: "Updated", runtime: "min read" }
};
var NoteSpecs_default = ((userOpts) => {
  const opts = { labels: { ...defaultOptions.labels, ...userOpts?.labels } };
  const NoteSpecs = ({ fileData }) => {
    const slug = fileData.slug;
    if (!slug || !isRealNote(slug)) return /* @__PURE__ */ u2(S, {});
    const { created, revised, updated } = getNoteDates(fileData);
    const minutes = readingMinutes(fileData.text);
    const tags = (fileData.frontmatter?.tags ?? []).filter((tag) => !isFolderMirrorTag(slug, tag));
    if (!created && !minutes && tags.length === 0) return /* @__PURE__ */ u2(S, {});
    const dates = [
      [opts.labels.created, created],
      [opts.labels.revised, revised],
      [opts.labels.updated, updated]
    ];
    return /* @__PURE__ */ u2("p", { class: "note-specs", children: [
      dates.map(
        ([label, date]) => date && /* @__PURE__ */ u2("span", { children: [
          label,
          " ",
          /* @__PURE__ */ u2("time", { datetime: date.toISOString(), children: formatYmd(date) })
        ] })
      ),
      minutes > 0 && /* @__PURE__ */ u2("span", { children: [
        minutes,
        " ",
        opts.labels.runtime
      ] }),
      /* @__PURE__ */ u2("span", { class: "note-specs-readers", children: /* @__PURE__ */ u2("span", { class: "note-specs-readers-count", children: "\xA0" }) }),
      tags.length > 0 && /* @__PURE__ */ u2("span", { class: "note-specs-tags", children: tags.map((tag) => /* @__PURE__ */ u2("a", { href: resolveRelative(slug, `tags/${tag}`), children: [
        "#",
        tag
      ] }, tag)) })
    ] });
  };
  NoteSpecs.css = noteSpecs_default;
  NoteSpecs.beforeDOMLoaded = specsReaders_inline_default;
  NoteSpecs.afterDOMLoaded = backlinkPaths_inline_default;
  return NoteSpecs;
});

export { NoteSpecs_default as NoteSpecs };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map