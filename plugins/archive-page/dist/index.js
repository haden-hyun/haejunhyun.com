// src/util/path.ts
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  return endsWith(s2, suffix) ? s2.slice(0, -suffix.length) : s2;
}
function stripSlashes(s2, onlyStripPrefix = false) {
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
  let rootPath = slug.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  if (rootPath.length === 0) rootPath = ".";
  return rootPath;
}
function resolveRelative(current, target) {
  const simplified = simplifySlug(target);
  const rootPath = pathToRoot(current);
  return joinSegments(rootPath, simplified);
}

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
  const revised = differs(toDate(file.frontmatter?.revised), created);
  const updated = differs(file.dates?.modified, created, revised);
  return { created, revised, updated };
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

// src/components/styles/archiveContent.scss
var archiveContent_default = ".archive-page-sub {\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--text-3);\n  margin: 0 0 1.8rem;\n}\n\n.archive-page-year {\n  margin-bottom: 1.6rem;\n}\n.archive-page-year h2 {\n  margin: 0 0 0.6rem;\n  padding: 0;\n  border: none;\n  font-family: var(--codeFont);\n  font-size: 0.95rem;\n  font-weight: 700;\n  color: var(--text-3);\n}\n\n.archive-page-rows {\n  display: flex;\n  flex-direction: column;\n}\n\n.archive-page-row {\n  display: grid;\n  grid-template-columns: 6rem 1fr auto;\n  align-items: baseline;\n  gap: 14px;\n  padding: 0.6rem 0.3rem;\n  border-bottom: 1px solid var(--border) !important;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.archive-page-row:nth-child(even) {\n  background: rgba(var(--accent-rgb), 0.035);\n}\n.archive-page-row:hover {\n  background: rgba(var(--accent-rgb), 0.1);\n}\n.archive-page-row:hover .archive-page-title {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n@media all and (max-width: 600px) {\n  .archive-page-row {\n    grid-template-columns: 6rem 1fr;\n  }\n  .archive-page-row .archive-page-cat {\n    display: none;\n  }\n}\n\n.archive-page-date {\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  font-variant-numeric: tabular-nums;\n  color: var(--text-3);\n}\n\n.archive-page-title {\n  font-family: var(--headerFont);\n  font-size: 0.92rem;\n  font-weight: 620;\n  color: var(--text);\n  line-height: 1.4;\n  word-break: keep-all;\n}\n\n.archive-page-rev {\n  margin-left: 0.5rem;\n  font-family: var(--codeFont);\n  font-size: 0.7rem;\n  font-weight: 400;\n  color: var(--text-3);\n  white-space: nowrap;\n}\n\n.archive-page-cat {\n  font-family: var(--codeFont);\n  font-size: 0.7rem;\n  color: var(--text-3);\n  white-space: nowrap;\n}";
var l;
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

// src/components/ArchiveContent.tsx
function getCreated(f3) {
  return getNoteDates(f3).created;
}
var ArchiveContent_default = (() => {
  const ArchiveContent = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    const currentSlug = fileData.slug ?? "archive";
    const files = allFiles.filter((f3) => isRealNote(f3.slug)).filter((f3) => getCreated(f3)).sort((a2, b2) => getCreated(b2).getTime() - getCreated(a2).getTime());
    const byYear = /* @__PURE__ */ new Map();
    for (const f3 of files) {
      const year = Number(formatYmd(getCreated(f3)).slice(0, 4));
      const list = byYear.get(year) ?? [];
      list.push(f3);
      byYear.set(year, list);
    }
    const years = [...byYear.keys()].sort((a2, b2) => b2 - a2);
    return (
      // 주의: <h1>은 article-title이 렌더한다 — 여기서 중복 렌더 금지.
      /* @__PURE__ */ u2("article", { class: `${displayClass ?? ""} archive-page-content popover-hint`, children: [
        /* @__PURE__ */ u2("p", { class: "archive-page-sub", children: [
          files.length,
          " notes \xB7 ",
          years.length,
          " years"
        ] }),
        years.map((year) => /* @__PURE__ */ u2("section", { class: "archive-page-year", children: [
          /* @__PURE__ */ u2("h2", { children: year }),
          /* @__PURE__ */ u2("div", { class: "archive-page-rows", children: byYear.get(year).map((f3) => {
            const { created, revised } = getNoteDates(f3);
            return /* @__PURE__ */ u2("a", { class: "archive-page-row", href: resolveRelative(currentSlug, f3.slug), children: [
              /* @__PURE__ */ u2("time", { class: "archive-page-date", datetime: created.toISOString(), children: formatYmd(created) }),
              /* @__PURE__ */ u2("span", { class: "archive-page-title", children: [
                f3.frontmatter?.title ?? "Untitled",
                revised && /* @__PURE__ */ u2("span", { class: "archive-page-rev", children: [
                  "Revised ",
                  /* @__PURE__ */ u2("time", { datetime: revised.toISOString(), children: formatYmd(revised) })
                ] })
              ] }),
              /* @__PURE__ */ u2("span", { class: "archive-page-cat", children: topicName(f3.slug ?? "") })
            ] });
          }) })
        ] }))
      ] })
    );
  };
  ArchiveContent.css = archiveContent_default;
  return ArchiveContent;
});

// src/pageType.ts
var neverMatch = () => false;
var ArchivePage = () => ({
  name: "ArchivePage",
  priority: 5,
  match: neverMatch,
  generate() {
    const virtualPages = [
      {
        slug: "archive",
        title: "Archive",
        data: {}
      }
    ];
    return virtualPages;
  },
  layout: "archive",
  body: ArchiveContent_default
});

export { ArchivePage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map