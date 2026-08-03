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
var topicGrid_default = ".topic-grid-section {\n  margin: 1.5rem 0 2rem 0;\n}\n\n.topic-grid-header {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  margin-bottom: 0.9rem;\n}\n.topic-grid-header h2 {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 720;\n}\n\n.topic-grid-total {\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  color: var(--text-3);\n}\n\n.topic-grid {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 12px;\n}\n@media all and (max-width: 1080px) {\n  .topic-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n@media all and (max-width: 480px) {\n  .topic-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n.topic-card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n  padding: 1rem 1rem 0.9rem 1.1rem;\n  border: 1px solid var(--border);\n  border-radius: var(--radius, 10px);\n  background: var(--surface);\n  text-decoration: none;\n  overflow: hidden;\n  transition: border-color 0.15s, transform 0.15s;\n  min-height: 108px;\n}\n.topic-card:hover {\n  border-color: var(--topic-color);\n}\n\n.topic-card-bar {\n  position: absolute;\n  left: 0;\n  top: 0;\n  bottom: 0;\n  width: 3px;\n  background: var(--topic-color);\n}\n\n.topic-card-emoji {\n  font-size: 19px;\n  line-height: 1;\n  margin-bottom: 0.3rem;\n}\n\n.topic-card-label {\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 670;\n  color: var(--text);\n}\n\n.topic-card-subtext {\n  font-size: 0.76rem;\n  color: var(--text-2);\n  line-height: 1.4;\n}\n\n.topic-card-count {\n  margin-top: 0.5rem;\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  color: var(--text-3);\n}\n\n.topic-card-share {\n  margin-top: 0.35rem;\n  height: 3px;\n  border-radius: 2px;\n  background: var(--surface-2);\n  overflow: hidden;\n}\n\n.topic-card-share-fill {\n  height: 100%;\n  background: var(--topic-color);\n  opacity: 0.75;\n  border-radius: 2px;\n}";
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
    emoji: "\u{1F4BB}",
    label: "Computer Science",
    subtext: "\uC54C\uACE0\uB9AC\uC998 \xB7 \uC790\uB8CC\uAD6C\uC870",
    colorVar: "--c-cs"
  },
  {
    key: "data-engineering",
    emoji: "\u{1F6E2}",
    label: "Data Engineering",
    subtext: "Airflow \xB7 Docker \xB7 PostgreSQL",
    colorVar: "--c-de"
  },
  {
    key: "data-science",
    emoji: "\u{1F4CA}",
    label: "Data Science",
    subtext: "DL \xB7 ML \xB7 \uD1B5\uACC4 \xB7 \uC2DC\uAC01\uD654",
    colorVar: "--c-ds"
  },
  { key: "gis", emoji: "\u{1F5FA}", label: "GIS", subtext: "\uACF5\uAC04 \uB370\uC774\uD130 \uBD84\uC11D", colorVar: "--c-gis" },
  {
    key: "programming",
    emoji: "\u{1F40D}",
    label: "Programming",
    subtext: "Python \xB7 SQL",
    colorVar: "--c-prog"
  },
  {
    key: "finance-property",
    emoji: "\u{1F3E0}",
    label: "Finance & Property",
    subtext: "\uBD80\uB3D9\uC0B0 \xB7 \uAE08\uC735",
    colorVar: "--c-fin"
  },
  {
    key: "tools",
    emoji: "\u{1F527}",
    label: "Tools",
    subtext: "Obsidian \xB7 \uC6CC\uD06C\uD50C\uB85C\uC6B0",
    colorVar: "--c-tool"
  }
];
function isRealNote(slug) {
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
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
    const maxCount = Math.max(1, ...topicsWithCounts.map((t2) => t2.count));
    const totalCount = topicsWithCounts.reduce((sum, t2) => sum + t2.count, 0);
    return /* @__PURE__ */ u2("section", { class: `${displayClass ?? ""} topic-grid-section`, children: [
      opts.showHeader && /* @__PURE__ */ u2("div", { class: "topic-grid-header", children: [
        /* @__PURE__ */ u2("h2", { children: "Topics" }),
        /* @__PURE__ */ u2("span", { class: "topic-grid-total", children: [
          "\uC804\uCCB4 ",
          totalCount,
          "\uAC1C \uB178\uD2B8 \xB7 ",
          topicsWithCounts.length,
          "\uAC1C \uD1A0\uD53D"
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "topic-grid", children: topicsWithCounts.map((t2) => /* @__PURE__ */ u2(
        "a",
        {
          class: "topic-card",
          href: resolveRelative(fileData.slug, t2.key),
          style: `--topic-color: var(${t2.colorVar});`,
          children: [
            /* @__PURE__ */ u2("i", { class: "topic-card-bar", "aria-hidden": "true" }),
            /* @__PURE__ */ u2("div", { class: "topic-card-emoji", "aria-hidden": "true", children: t2.emoji }),
            /* @__PURE__ */ u2("b", { class: "topic-card-label", children: t2.label }),
            /* @__PURE__ */ u2("span", { class: "topic-card-subtext", children: t2.subtext }),
            /* @__PURE__ */ u2("div", { class: "topic-card-count", children: [
              t2.count,
              "\uAC1C \uB178\uD2B8"
            ] }),
            /* @__PURE__ */ u2("div", { class: "topic-card-share", "aria-hidden": "true", children: /* @__PURE__ */ u2("div", { class: "topic-card-share-fill", style: `width:${t2.count / maxCount * 100}%` }) })
          ]
        }
      )) })
    ] });
  };
  TopicGrid.css = topicGrid_default;
  return TopicGrid;
});

export { TopicGrid_default as TopicGrid };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map