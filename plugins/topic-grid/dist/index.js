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
var topicGrid_default = ".topic-grid-section {\n  padding: 2.25rem 0 2.5rem;\n  border-top: 1px solid var(--border);\n}\n\n.topic-grid-header {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  margin-bottom: 1.1rem;\n}\n.topic-grid-header h2 {\n  margin: 0;\n  padding: 0;\n  border: none;\n}\n\n.topic-grid-more {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--accent);\n  text-decoration: none;\n}\n.topic-grid-more:hover {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n\n.topic-index {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 0.25rem 2.25rem;\n}\n.topic-index li {\n  margin: 0;\n}\n\n.topic-entry {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n  padding: 0.45rem 0;\n  min-height: 44px;\n  box-sizing: border-box;\n  text-decoration: none;\n}\n.topic-entry:hover .topic-entry-name {\n  color: var(--accent);\n}\n\n.topic-entry-name {\n  font-size: 0.95rem;\n  font-weight: 600;\n  color: var(--text);\n  transition: color 0.12s;\n}\n.topic-entry-name small {\n  display: block;\n  margin-top: 0.1rem;\n  font-size: 0.78rem;\n  font-weight: 400;\n  color: var(--text-3);\n}\n\n.topic-entry-leader {\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 1px dotted var(--border-strong);\n  opacity: 0.6;\n  transform: translateY(-0.3em);\n}\n\n.topic-entry-count {\n  font-family: var(--codeFont);\n  font-size: 0.82rem;\n  color: var(--text-2);\n  font-variant-numeric: tabular-nums;\n}";
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
var TOPICS = [
  {
    key: "computer-science",
    label: "Computer Science",
    subtext: "\uC54C\uACE0\uB9AC\uC998 \xB7 \uC790\uB8CC\uAD6C\uC870"
  },
  {
    key: "data-engineering",
    label: "Data Engineering",
    subtext: "Airflow \xB7 Docker \xB7 PostgreSQL"
  },
  {
    key: "data-science",
    label: "Data Science",
    subtext: "DL \xB7 ML \xB7 \uD1B5\uACC4 \xB7 \uC2DC\uAC01\uD654"
  },
  { key: "gis", label: "GIS", subtext: "\uACF5\uAC04 \uB370\uC774\uD130 \uBD84\uC11D" },
  {
    key: "programming",
    label: "Programming",
    subtext: "Python \xB7 SQL"
  },
  {
    key: "finance-property",
    label: "Finance & Property",
    subtext: "\uBD80\uB3D9\uC0B0 \xB7 \uAE08\uC735"
  },
  {
    key: "tools",
    label: "Tools",
    subtext: "Obsidian \xB7 \uC6CC\uD06C\uD50C\uB85C\uC6B0"
  }
];
function isRealNote(slug) {
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
var defaultOptions = {
  showHeader: true
};
var TopicGrid_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const TopicGrid = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles;
    const counts = /* @__PURE__ */ new Map();
    for (const f3 of files) {
      const slug = f3.slug ?? "";
      if (!isRealNote(slug)) continue;
      const key = slug.split("/")[0];
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const topicsWithCounts = TOPICS.map((t2) => ({ ...t2, count: counts.get(t2.key) ?? 0 })).sort(
      (a2, b2) => b2.count - a2.count
    );
    return /* @__PURE__ */ u2("section", { class: `${displayClass ?? ""} topic-grid-section`, children: [
      opts.showHeader && /* @__PURE__ */ u2("div", { class: "topic-grid-header", children: [
        /* @__PURE__ */ u2("h2", { children: "Index by Topic" }),
        /* @__PURE__ */ u2("a", { class: "topic-grid-more", href: resolveRelative(fileData.slug, "topics"), children: "\uC804\uCCB4 \u2192" })
      ] }),
      /* @__PURE__ */ u2("ul", { class: "topic-index", children: topicsWithCounts.map((t2) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { class: "topic-entry", href: resolveRelative(fileData.slug, t2.key), children: [
        /* @__PURE__ */ u2("span", { class: "topic-entry-name", children: [
          t2.label,
          /* @__PURE__ */ u2("small", { children: t2.subtext })
        ] }),
        /* @__PURE__ */ u2("span", { class: "topic-entry-leader", "aria-hidden": "true" }),
        /* @__PURE__ */ u2("span", { class: "topic-entry-count", children: t2.count })
      ] }) })) })
    ] });
  };
  TopicGrid.css = topicGrid_default;
  return TopicGrid;
});

export { TopicGrid_default as TopicGrid };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map