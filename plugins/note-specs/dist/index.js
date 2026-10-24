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
var noteSpecs_default = ".note-specs {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n.note-specs .note-specs-list {\n  margin: 0.5rem 0 0;\n  padding: 0.6rem 0;\n  border-block: 1px solid var(--lightgray);\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.note-specs .note-specs-row {\n  display: grid;\n  grid-template-columns: 4.6rem 1fr;\n  gap: 0.4rem;\n  align-items: baseline;\n}\n.note-specs dt {\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-specs dd {\n  margin: 0;\n  font-size: 0.8rem;\n  color: var(--dark);\n  min-width: 0;\n  overflow-wrap: anywhere;\n}\n.note-specs .note-specs-date {\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  font-variant-numeric: tabular-nums;\n}\n.note-specs .note-specs-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n}\n.note-specs .note-specs-tags a {\n  color: var(--secondary);\n}\n.note-specs .note-specs-tags a:hover {\n  color: var(--tertiary);\n}";

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
  title: "SPECS",
  labels: { created: "Created", revised: "Revised", updated: "Updated", runtime: "Read time", topic: "Topic" }
};
var NoteSpecs_default = ((userOpts) => {
  const opts = {
    ...defaultOptions,
    ...userOpts,
    labels: { ...defaultOptions.labels, ...userOpts?.labels }
  };
  const NoteSpecs = ({ fileData }) => {
    const slug = fileData.slug;
    if (!slug || !isRealNote(slug)) return /* @__PURE__ */ u2(S, {});
    const { created, revised, updated } = getNoteDates(fileData);
    const minutes = readingMinutes(fileData.text);
    const tags = fileData.frontmatter?.tags ?? [];
    if (!created && !minutes && tags.length === 0) return /* @__PURE__ */ u2(S, {});
    const dateRows = [
      [opts.labels.created, created],
      [opts.labels.revised, revised],
      [opts.labels.updated, updated]
    ];
    return /* @__PURE__ */ u2("aside", { class: "note-specs", children: [
      /* @__PURE__ */ u2("h3", { class: "note-specs-title", children: opts.title }),
      /* @__PURE__ */ u2("dl", { class: "note-specs-list", children: [
        dateRows.map(
          ([label, date]) => date && /* @__PURE__ */ u2("div", { class: "note-specs-row", children: [
            /* @__PURE__ */ u2("dt", { children: label }),
            /* @__PURE__ */ u2("dd", { class: "note-specs-date", children: /* @__PURE__ */ u2("time", { datetime: date.toISOString(), children: formatYmd(date) }) })
          ] })
        ),
        minutes > 0 && /* @__PURE__ */ u2("div", { class: "note-specs-row", children: [
          /* @__PURE__ */ u2("dt", { children: opts.labels.runtime }),
          /* @__PURE__ */ u2("dd", { children: [
            minutes,
            " min"
          ] })
        ] }),
        tags.length > 0 && /* @__PURE__ */ u2("div", { class: "note-specs-row", children: [
          /* @__PURE__ */ u2("dt", { children: opts.labels.topic }),
          /* @__PURE__ */ u2("dd", { class: "note-specs-tags", children: tags.map((tag) => /* @__PURE__ */ u2("a", { href: resolveRelative(slug, `tags/${tag}`), children: tag }, tag)) })
        ] })
      ] })
    ] });
  };
  NoteSpecs.css = noteSpecs_default;
  return NoteSpecs;
});

export { NoteSpecs_default as NoteSpecs };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map