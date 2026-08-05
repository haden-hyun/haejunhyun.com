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

// src/components/styles/topicsContent.scss
var topicsContent_default = ".topics-page-content h1 {\n  margin-bottom: 0.3rem;\n}\n\n.topics-page-sub {\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--text-3);\n  margin: 0 0 1.5rem 0;\n}\n\n.topics-page-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 14px;\n}\n@media all and (max-width: 1080px) {\n  .topics-page-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n@media all and (max-width: 480px) {\n  .topics-page-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n.topics-page-card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n  padding: 1.1rem 1.1rem 1rem 1.2rem;\n  border: 1px solid var(--border);\n  border-radius: var(--radius, 10px);\n  background: var(--surface);\n  text-decoration: none;\n  overflow: hidden;\n  transition: border-color 0.15s, transform 0.15s;\n  min-height: 116px;\n}\n.topics-page-card:hover {\n  border-color: var(--border-strong);\n}\n\n.topics-page-label {\n  font-family: var(--headerFont);\n  font-size: 1.2rem;\n  font-weight: 670;\n  color: var(--text);\n  margin-top: 0.2rem;\n}\n\n.topics-page-subtext {\n  font-size: 0.8rem;\n  color: var(--text-2);\n  line-height: 1.4;\n}\n\n.topics-page-count {\n  margin-top: 0.55rem;\n  font-family: var(--codeFont);\n  font-size: 0.7rem;\n  color: var(--text-3);\n}\n\n.topics-page-share {\n  margin-top: 0.4rem;\n  height: 3px;\n  border-radius: 2px;\n  background: var(--surface-2);\n  overflow: hidden;\n}\n\n.topics-page-share-fill {\n  height: 100%;\n  background: var(--text-3);\n  opacity: 0.55;\n  border-radius: 2px;\n}";
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

// src/components/TopicsContent.tsx
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
var TopicsContent_default = (() => {
  const TopicsContent = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    const currentSlug = fileData.slug ?? "topics";
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
    return (
      // <h1>은 여기서 렌더하지 않는다 — article-title 플러그인이 이미
      // frontmatter.title("Topics", pageType.ts의 VirtualPage.title)로 페이지
      // 상단에 렌더한다(folder-page의 FolderContent와 동일 패턴, h1 중복 방지).
      /* @__PURE__ */ u2("article", { class: `${displayClass ?? ""} topics-page-content popover-hint`, children: [
        /* @__PURE__ */ u2("p", { class: "topics-page-sub", children: [
          "\uC804\uCCB4 ",
          totalCount,
          "\uAC1C \uB178\uD2B8 \xB7 ",
          topicsWithCounts.length,
          "\uAC1C \uD1A0\uD53D"
        ] }),
        /* @__PURE__ */ u2("div", { class: "topics-page-grid", children: topicsWithCounts.map((t2) => /* @__PURE__ */ u2(
          "a",
          {
            class: "topics-page-card",
            href: resolveRelative(currentSlug, t2.key),
            children: [
              /* @__PURE__ */ u2("b", { class: "topics-page-label", children: t2.label }),
              /* @__PURE__ */ u2("span", { class: "topics-page-subtext", children: t2.subtext }),
              /* @__PURE__ */ u2("div", { class: "topics-page-count", children: [
                t2.count,
                "\uAC1C \uB178\uD2B8"
              ] }),
              /* @__PURE__ */ u2("div", { class: "topics-page-share", "aria-hidden": "true", children: /* @__PURE__ */ u2(
                "div",
                {
                  class: "topics-page-share-fill",
                  style: `width:${t2.count / maxCount * 100}%`
                }
              ) })
            ]
          }
        )) })
      ] })
    );
  };
  TopicsContent.css = topicsContent_default;
  return TopicsContent;
});

// src/pageType.ts
var neverMatch = () => false;
var TopicsPage = () => ({
  name: "TopicsPage",
  priority: 5,
  match: neverMatch,
  generate() {
    const virtualPages = [
      {
        slug: "topics",
        title: "Topics",
        data: {}
      }
    ];
    return virtualPages;
  },
  layout: "topics",
  body: TopicsContent_default
});

export { TopicsPage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map