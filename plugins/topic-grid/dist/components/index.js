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

// src/components/styles/topicGrid.scss
var topicGrid_default = ".topic-grid-section {\n  margin: 0;\n  padding: 0 0 96px;\n}\n@media all and (max-width: 800px) {\n  .topic-grid-section {\n    padding-bottom: 48px;\n  }\n}\n\n.topic-grid-label {\n  display: flex;\n  align-items: center;\n  min-height: 37px;\n  margin: 0;\n  padding: 0 0 14px;\n  border: none;\n  border-bottom: 1px solid var(--lightgray);\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  letter-spacing: 0;\n  color: var(--secondary);\n}\n@media all and (max-width: 800px) {\n  .topic-grid-label {\n    padding-bottom: 10px;\n  }\n}\n\n.topic-index {\n  list-style: none;\n  margin: 0;\n  padding: 6px 0 0;\n}\n.topic-index li {\n  margin: 0;\n}\n@media all and (max-width: 800px) {\n  .topic-index {\n    padding-top: 0;\n  }\n}\n\n.topic-entry {\n  display: flex;\n  align-items: baseline;\n  gap: 10px;\n  padding: 9px 10px;\n  min-height: 44px;\n  box-sizing: border-box;\n  color: inherit;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.topic-entry:hover {\n  background: rgba(var(--accent-rgb), 0.1);\n}\n.topic-entry:hover .topic-entry-name {\n  color: var(--secondary);\n}\n@media all and (max-width: 800px) {\n  .topic-entry {\n    padding: 10px;\n  }\n}\n\n.topic-index > li:nth-child(even) > .topic-entry:not(:hover) {\n  background: rgba(var(--accent-rgb), 0.035);\n}\n\n.topic-entry-name {\n  font-family: var(--headerFont);\n  font-weight: 600;\n  color: var(--dark);\n}\n.topic-entry-name small {\n  display: block;\n  margin-top: 0.1rem;\n  font-family: var(--bodyFont);\n  font-size: 0.78rem;\n  font-weight: 400;\n  color: var(--gray);\n}\n\n.topic-entry-leader {\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 1px dotted var(--lightgray);\n  transform: translateY(-4px);\n}\n\n.topic-entry-count {\n  font-family: var(--codeFont);\n  font-size: 12px;\n  color: var(--darkgray);\n  font-variant-numeric: tabular-nums;\n}";

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
function folderTitle(path, overrides = {}) {
  const segment = path.split("/").pop() ?? path;
  return overrides[path] ?? overrides[segment] ?? TOPIC_NAMES[segment] ?? titleCase(segment);
}
var byListDateDesc = (a2, b2) => (getListDate(b2)?.getTime() ?? 0) - (getListDate(a2)?.getTime() ?? 0);

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
function toEntry(file) {
  const index = seriesIndexOf(file);
  if (index === void 0 || !isListedNote(file)) return void 0;
  const question = file.frontmatter?.series_question;
  return {
    file,
    index,
    title: String(file.frontmatter?.title ?? file.slug),
    question: question == null || String(question).trim() === "" ? void 0 : String(question).trim()
  };
}
function getSeriesEntries(series, allFiles) {
  return allFiles.filter((f3) => seriesOf(f3) === series).map(toEntry).filter((e2) => e2 !== void 0).sort(
    (a2, b2) => a2.index - b2.index || a2.title.localeCompare(b2.title, "ko", { numeric: true })
  );
}

// ../_shared/topicIndex.ts
function folderNameResolver(trie) {
  const t2 = trie;
  return (path) => {
    const node = typeof t2?.findNode === "function" ? t2.findNode(path.split("/")) : void 0;
    return node?.isFolder && node.displayName ? node.displayName : folderTitle(path);
  };
}
var latestOf = (notes) => notes.reduce((acc, f3) => {
  const d2 = getListDate(f3);
  return d2 && (!acc || d2 > acc) ? d2 : acc;
}, void 0);
function subFolders(base, notes, nameOf) {
  const depth = base.split("/").length;
  const byChild = /* @__PURE__ */ new Map();
  for (const f3 of notes) {
    const parts = f3.slug.split("/");
    if (parts.length <= depth + 1) continue;
    const child = parts.slice(0, depth + 1).join("/");
    byChild.set(child, [...byChild.get(child) ?? [], f3]);
  }
  return [...byChild.entries()].map(([path, members]) => {
    let cur = path;
    const names = [nameOf(cur)];
    for (; ; ) {
      const d2 = cur.split("/").length;
      const direct = members.some((f3) => f3.slug.split("/").length === d2 + 1);
      const next = new Set(members.map((f3) => f3.slug.split("/").slice(0, d2 + 1).join("/")));
      if (direct || next.size !== 1) break;
      cur = [...next][0];
      names.push(nameOf(cur));
    }
    return { title: names.join(" / "), count: members.length };
  }).sort((a2, b2) => b2.count - a2.count || a2.title.localeCompare(b2.title, "ko"));
}
function buildTopicIndex(allFiles, nameOf) {
  const listed = allFiles.filter((f3) => isListedNote(f3)).sort(byListDateDesc);
  return TOPICS.map(({ key, label }) => {
    const notes = listed.filter((f3) => f3.slug.split("/")[0] === key);
    const direct = notes.filter((f3) => f3.slug.split("/").length === 2);
    const byFolder = /* @__PURE__ */ new Map();
    for (const f3 of notes) {
      const parts = f3.slug.split("/");
      if (parts.length < 3) continue;
      const path = parts.slice(0, 2).join("/");
      byFolder.set(path, [...byFolder.get(path) ?? [], f3]);
    }
    const folders = [...byFolder.entries()].map(([path, members]) => ({
      path,
      title: nameOf(path),
      count: members.length,
      latest: latestOf(members),
      subs: subFolders(path, members, nameOf),
      notes: members
    })).sort((a2, b2) => b2.count - a2.count || (b2.latest?.getTime() ?? 0) - (a2.latest?.getTime() ?? 0));
    const seriesKeys = [...new Set(notes.map(seriesOf).filter(Boolean))];
    const series = seriesKeys.map((s2) => ({ key: s2, entries: getSeriesEntries(s2, allFiles) })).filter((s2) => s2.entries.length > 0);
    return { key, label, count: notes.length, direct, folders, series };
  }).sort((a2, b2) => b2.count - a2.count);
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

// src/components/TopicGrid.tsx
var defaultOptions = {
  showHeader: true
};
var TopicGrid_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const TopicGrid = ({
    ctx,
    fileData,
    allFiles,
    displayClass
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const topics = buildTopicIndex(
      allFiles,
      folderNameResolver(ctx?.trie)
    );
    return /* @__PURE__ */ u2(
      "section",
      {
        class: `${displayClass ?? ""} topic-grid-section`,
        "aria-labelledby": opts.showHeader ? "topic-grid-h" : void 0,
        children: [
          opts.showHeader && /* @__PURE__ */ u2("h2", { id: "topic-grid-h", class: "topic-grid-label", children: "Topics" }),
          /* @__PURE__ */ u2("ul", { class: "topic-index", children: topics.map((t2) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { class: "topic-entry", href: resolveRelative(fileData.slug, t2.key), children: [
            /* @__PURE__ */ u2("span", { class: "topic-entry-name", children: [
              t2.label,
              /* @__PURE__ */ u2("small", { children: t2.folders.map((f3) => f3.title).join(" \xB7 ") })
            ] }),
            /* @__PURE__ */ u2("span", { class: "topic-entry-leader", "aria-hidden": "true" }),
            /* @__PURE__ */ u2("span", { class: "topic-entry-count", children: t2.count })
          ] }) })) })
        ]
      }
    );
  };
  TopicGrid.css = topicGrid_default;
  return TopicGrid;
});

export { TopicGrid_default as TopicGrid };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map