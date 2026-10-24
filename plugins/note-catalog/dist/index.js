// src/util/path.ts
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

// src/components/styles/noteCatalog.scss
var noteCatalog_default = ".note-catalog {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n.note-catalog .note-catalog-title {\n  margin: 0;\n}\n.note-catalog .note-catalog-path {\n  margin-top: 0.5rem;\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  letter-spacing: 0.06em;\n  color: var(--gray);\n  word-break: break-all;\n}\n.note-catalog .note-catalog-path:hover {\n  color: var(--secondary);\n}\n.note-catalog .note-catalog-list {\n  margin: 0.7rem 0 0;\n  padding: 0;\n  list-style: none;\n  min-height: 0;\n  overflow-y: auto;\n}\n.note-catalog .note-catalog-link {\n  display: block;\n  padding: 4px 0 4px 0.6rem;\n  border-left: 2px solid transparent;\n  line-height: 1.45;\n  word-break: keep-all;\n  transition: color var(--dur-fast) var(--ease);\n}\n.note-catalog .note-catalog-link.active {\n  color: var(--secondary);\n  font-weight: 600;\n  border-left-color: var(--secondary);\n}\n.note-catalog .note-catalog-all {\n  margin-top: 0.4rem;\n  padding-left: calc(0.6rem + 2px);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  letter-spacing: 0.06em;\n  color: var(--gray);\n}\n.note-catalog .note-catalog-all:hover {\n  color: var(--secondary);\n}\n.note-catalog .note-catalog-index {\n  margin-right: 0.4em;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n.note-catalog .note-catalog-more {\n  margin-top: 0.9rem;\n  padding-top: 0.7rem;\n  border-top: 1px solid var(--lightgray);\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-catalog .note-catalog-more:hover {\n  color: var(--secondary);\n}";

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
var topicAnchor = (key) => `topic-${key}`;

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
function groupBySeries(sorted) {
  const groups = [];
  const bySeries = /* @__PURE__ */ new Map();
  for (const file of sorted) {
    const series = seriesOf(file);
    if (!series) {
      groups.push({ series: "", items: [file] });
      continue;
    }
    let group = bySeries.get(series);
    if (!group) {
      group = { series, items: [] };
      bySeries.set(series, group);
      groups.push(group);
    }
    group.items.push(file);
  }
  const rank = (f3) => seriesIndexOf(f3) ?? Number.POSITIVE_INFINITY;
  for (const group of bySeries.values()) {
    group.items.sort((a2, b2) => rank(a2) === rank(b2) ? 0 : rank(a2) < rank(b2) ? -1 : 1);
  }
  return groups;
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

// src/components/NoteCatalog.tsx
var defaultOptions = {
  title: "CATALOG",
  moreHref: "topics",
  moreLabel: "\u2190 All topics",
  radius: 2
};
var NoteCatalog_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const NoteCatalog = ({ fileData, allFiles }) => {
    const currentSlug = fileData.slug;
    if (!currentSlug || !isRealNote(currentSlug)) return /* @__PURE__ */ u2(S, {});
    const parentDir = currentSlug.split("/").slice(0, -1).join("/");
    const sorted = allFiles.filter((f3) => {
      if (!f3.slug || !isListedNote(f3)) return false;
      return f3.slug.split("/").slice(0, -1).join("/") === parentDir;
    }).sort(
      (a2, b2) => (a2.frontmatter?.title ?? a2.slug).localeCompare(b2.frontmatter?.title ?? b2.slug, void 0, {
        numeric: true,
        sensitivity: "base"
      })
    );
    const siblings = groupBySeries(sorted).flatMap((g2) => g2.items);
    if (siblings.length === 0) return /* @__PURE__ */ u2(S, {});
    const at = siblings.findIndex((f3) => f3.slug === currentSlug);
    const size = Math.min(siblings.length, 2 * opts.radius + 1);
    const start = Math.max(0, Math.min(siblings.length - size, at - opts.radius));
    const shown = siblings.slice(start, start + size);
    const folderHref = parentDir ? resolveRelative(currentSlug, `${parentDir}/index`) : void 0;
    return /* @__PURE__ */ u2("nav", { class: "note-catalog", "aria-label": opts.title, children: [
      /* @__PURE__ */ u2("h2", { class: "note-catalog-title", children: opts.title }),
      folderHref && /* @__PURE__ */ u2("a", { class: "note-catalog-path", href: folderHref, children: parentDir.split("/").join(" / ") }),
      /* @__PURE__ */ u2("ul", { class: "note-catalog-list", children: shown.map((f3) => {
        const isCurrent = f3.slug === currentSlug;
        const label = seriesLabel(f3);
        return /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2(
          "a",
          {
            class: isCurrent ? "note-catalog-link active" : "note-catalog-link",
            href: resolveRelative(currentSlug, f3.slug),
            "aria-current": isCurrent ? "page" : void 0,
            children: [
              label && /* @__PURE__ */ u2("span", { class: "note-catalog-index", children: label }),
              f3.frontmatter?.title ?? f3.slug.split("/").pop()
            ]
          }
        ) }, f3.slug);
      }) }),
      folderHref && shown.length < siblings.length && /* @__PURE__ */ u2("a", { class: "note-catalog-all", href: folderHref, children: [
        "All ",
        siblings.length,
        " notes \u2192"
      ] }),
      /* @__PURE__ */ u2(
        "a",
        {
          class: "note-catalog-more",
          href: `${resolveRelative(currentSlug, opts.moreHref)}${opts.moreHref === "topics" ? `#${topicAnchor(currentSlug.split("/")[0])}` : ""}`,
          children: opts.moreLabel
        }
      )
    ] });
  };
  NoteCatalog.css = noteCatalog_default;
  return NoteCatalog;
});

export { NoteCatalog_default as NoteCatalog };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map