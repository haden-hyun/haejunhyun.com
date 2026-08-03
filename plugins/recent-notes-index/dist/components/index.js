// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// node_modules/@quartz-community/utils/dist/date.js
function formatDate(d2, locale = "en-US") {
  return d2.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
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

// node_modules/@quartz-community/utils/dist/index.js
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  if (endsWith(s2, suffix)) {
    s2 = s2.slice(0, -suffix.length);
  }
  return s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) {
    s2 = s2.substring(1);
  }
  if (!onlyStripPrefix && s2.endsWith("/")) {
    s2 = s2.slice(0, -1);
  }
  return s2;
}

// src/util/path.ts
function simplifySlug2(fp) {
  return simplifySlug(fp);
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const simplified = simplifySlug2(target);
  const rootPath = pathToRoot(current);
  return joinSegments(rootPath, simplified);
}

// src/components/styles/recentNotes.scss
var recentNotes_default = "/**\n * Layout breakpoints\n * $mobile: screen width below this value will use mobile styles\n * $desktop: screen width above this value will use desktop styles\n * Screen width between $mobile and $desktop width will use the tablet layout.\n * assuming mobile < desktop\n */\n.note-card[data-category=computer-science] {\n  --cat-color: #3d6b8e;\n}\n.note-card[data-category=data-engineering] {\n  --cat-color: #2e7d62;\n}\n.note-card[data-category=data-science] {\n  --cat-color: #6b5ea8;\n}\n.note-card[data-category=gis] {\n  --cat-color: #b5722a;\n}\n.note-card[data-category=programming] {\n  --cat-color: #c0554a;\n}\n.note-card[data-category=finance-property] {\n  --cat-color: #3a7a5a;\n}\n.note-card[data-category=tools] {\n  --cat-color: #7a8090;\n}\n\n.recent-notes {\n  margin-top: 2rem;\n}\n.recent-notes > h2 {\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--dark);\n  margin: 0 0 1.2rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 1.5px solid var(--lightgray);\n  letter-spacing: -0.01em;\n}\n\n.notes-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 0.9rem;\n}\n@media all and ((min-width: 800px) and (max-width: 1200px)) {\n  .notes-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n@media all and ((max-width: 800px)) {\n  .notes-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n.note-card {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n  padding: 1rem 1.1rem;\n  border: 1px solid var(--lightgray);\n  border-top: 3px solid var(--cat-color, var(--lightgray));\n  border-radius: 8px;\n  text-decoration: none;\n  border-bottom: 1px solid var(--lightgray) !important;\n  transition: border-color 0.15s, background 0.15s, transform 0.18s, box-shadow 0.18s;\n  color: inherit;\n}\n.note-card:hover {\n  border-color: var(--cat-color, var(--secondary)) !important;\n  border-top-color: var(--cat-color, var(--secondary)) !important;\n  background: color-mix(in srgb, var(--cat-color, var(--secondary)) 4%, transparent);\n  transform: translateY(-3px);\n  box-shadow: 0 6px 16px color-mix(in srgb, var(--cat-color, var(--secondary)) 15%, transparent);\n}\n.note-card .card-category {\n  display: inline-block;\n  font-size: 0.72rem;\n  font-weight: 800;\n  color: var(--cat-color, var(--secondary));\n  background: color-mix(in srgb, var(--cat-color, var(--secondary)) 12%, transparent);\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  padding: 0.18rem 0.55rem;\n  border-radius: 4px;\n  margin-bottom: 0.3rem;\n}\n.note-card .card-meta {\n  font-size: 0.71rem;\n  color: var(--gray);\n  font-family: var(--bodyFont);\n}\n.note-card .card-title {\n  font-size: 0.92rem;\n  font-weight: 700;\n  color: var(--dark);\n  margin: 0.1rem 0 0;\n  line-height: 1.4;\n  font-family: var(--headerFont);\n  letter-spacing: -0.01em;\n}\n.note-card .card-desc {\n  font-size: 0.78rem;\n  color: var(--gray);\n  line-height: 1.6;\n  margin: 0.15rem 0 0;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  font-family: var(--bodyFont);\n  flex: 1;\n}\n.note-card .card-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-top: 0.5rem;\n}\n.note-card .card-tags .tag-chip {\n  font-size: 0.65rem;\n  font-weight: 500;\n  color: var(--secondary);\n  background: rgba(61, 107, 142, 0.08);\n  padding: 2px 7px;\n  border-radius: 4px;\n  border: 1px solid rgba(61, 107, 142, 0.15);\n  letter-spacing: 0.01em;\n}\n\n.see-more {\n  display: inline-block;\n  margin-top: 1rem;\n  font-size: 0.82rem;\n  color: var(--secondary);\n  text-decoration: none;\n  border-bottom: 1px solid transparent;\n  transition: border-color 0.15s;\n}\n.see-more:hover {\n  border-bottom-color: var(--secondary);\n}";

// src/components/RecentNotesForIndex.tsx
function isAutoGeneratedPage(slug2) {
  return slug2.startsWith("tags/") || slug2 === "index" || slug2.endsWith("/index") || slug2 === "404" || slug2 === "topics" || slug2 === "archive";
}
function getSortTime(f3) {
  return f3.dates?.modified?.getTime() ?? f3.dates?.created?.getTime() ?? 0;
}
function getDisplayDate(f3) {
  return f3.dates?.modified ?? f3.dates?.created ?? f3.dates?.published;
}
var defaultOptions = {
  limit: 6,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: (f1, f22) => getSortTime(f22) - getSortTime(f1)
};
var CATEGORY_NAMES = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools"
};
function getCategory(slug2) {
  const key = slug2.split("/")[0] ?? "";
  const name = CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
  return { key, name };
}
var RecentNotesForIndex_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const RecentNotesForIndex = ({
    allFiles,
    fileData,
    displayClass,
    cfg
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles;
    const pages = files.filter(opts.filter).filter(
      (f3) => f3.slug !== fileData.slug && f3.frontmatter?.title && !isAutoGeneratedPage(f3.slug ?? "")
    ).sort(opts.sort).slice(0, opts.limit);
    const locale = cfg.locale ?? "en-US";
    return (
      // [2026-08-03] id="recent" — home-hero의 "노트 둘러보기" CTA(href="#recent")가
      // 스크롤 대상으로 참조한다.
      /* @__PURE__ */ u2("div", { id: "recent", class: classNames(displayClass, "recent-notes"), children: [
        /* @__PURE__ */ u2("h2", { children: opts.title ?? "Recent Posts" }),
        /* @__PURE__ */ u2("div", { class: "notes-grid", children: pages.map((page) => {
          const title = page.frontmatter?.title ?? "Untitled";
          const tags = page.frontmatter?.tags ?? [];
          const description = page.description ?? "";
          const { key: catKey, name: catName } = getCategory(page.slug ?? "");
          const displayDate = getDisplayDate(page);
          return /* @__PURE__ */ u2(
            "a",
            {
              class: "note-card",
              "data-category": catKey,
              href: resolveRelative(fileData.slug, page.slug),
              children: [
                /* @__PURE__ */ u2("div", { class: "card-category", children: catName }),
                displayDate && /* @__PURE__ */ u2("div", { class: "card-meta", children: /* @__PURE__ */ u2("time", { dateTime: displayDate.toISOString(), children: formatDate(displayDate, locale) }) }),
                /* @__PURE__ */ u2("h3", { class: "card-title", children: title }),
                description && /* @__PURE__ */ u2("p", { class: "card-desc", children: description }),
                opts.showTags && tags.length > 0 && /* @__PURE__ */ u2("div", { class: "card-tags", children: tags.slice(0, 3).map((tag) => /* @__PURE__ */ u2("span", { class: "tag-chip", children: [
                  "#",
                  tag
                ] })) })
              ]
            }
          );
        }) }),
        opts.linkToMore && /* @__PURE__ */ u2("a", { href: resolveRelative(fileData.slug, opts.linkToMore), class: "see-more", children: `See ${Math.max(0, files.length - opts.limit)} more` })
      ] })
    );
  };
  RecentNotesForIndex.css = recentNotes_default;
  return RecentNotesForIndex;
});

export { RecentNotesForIndex_default as RecentNotesForIndex };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map