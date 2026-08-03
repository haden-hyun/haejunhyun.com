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

// src/components/styles/relatedNotes.scss
var relatedNotes_default = ".related-notes {\n  margin: 2rem 0;\n}\n.related-notes h3 {\n  margin: 0 0 0.8rem 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  font-weight: 700;\n}\n\n.related-notes-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n}\n@media all and (max-width: 600px) {\n  .related-notes-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n.related-note-card {\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n  padding: 0.85rem 1rem;\n  border: 1px solid var(--border);\n  border-radius: var(--radius, 10px);\n  background: var(--surface);\n  text-decoration: none;\n  transition: border-color 0.15s;\n}\n.related-note-card:hover {\n  border-color: var(--accent);\n}\n\n.related-note-cat {\n  font-family: var(--codeFont);\n  font-size: 0.66rem;\n  font-weight: 600;\n  letter-spacing: 0.03em;\n  color: var(--text-3);\n}\n\n.related-note-title {\n  font-family: var(--headerFont);\n  font-size: 0.92rem;\n  font-weight: 630;\n  line-height: 1.4;\n  color: var(--text);\n}";
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

// src/components/RelatedNotes.tsx
var CATEGORY_NAMES = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools"
};
function getCategoryName(slug) {
  const key = slug.split("/")[0] ?? "";
  return CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function isRealNote(slug) {
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
var RelatedNotes_default = (() => {
  const RelatedNotes = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    const currentSlug = fileData.slug;
    if (currentSlug === "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles;
    const backlinks = files.filter(
      (f3) => f3.unlisted !== true && f3.links?.includes(currentSlug) && isRealNote(f3.slug ?? "")
    );
    const outgoingTargets = fileData.links ?? [];
    const outgoing = outgoingTargets.map((target) => files.find((f3) => f3.slug === target)).filter((f3) => f3 !== void 0 && isRealNote(f3.slug ?? ""));
    const seen = /* @__PURE__ */ new Set([currentSlug]);
    const related = [];
    for (const f3 of [...outgoing, ...backlinks]) {
      const slug = f3.slug;
      if (seen.has(slug)) continue;
      seen.add(slug);
      related.push(f3);
      if (related.length >= 4) break;
    }
    if (related.length === 0) return /* @__PURE__ */ u2(S, {});
    return /* @__PURE__ */ u2("div", { class: `${displayClass ?? ""} related-notes`, children: [
      /* @__PURE__ */ u2("h3", { children: "\uC5F0\uACB0\uB41C \uB178\uD2B8" }),
      /* @__PURE__ */ u2("div", { class: "related-notes-grid", children: related.map((f3) => /* @__PURE__ */ u2("a", { class: "related-note-card", href: resolveRelative(currentSlug, f3.slug), children: [
        /* @__PURE__ */ u2("span", { class: "related-note-cat", children: getCategoryName(f3.slug ?? "") }),
        /* @__PURE__ */ u2("span", { class: "related-note-title", children: f3.frontmatter?.title ?? "Untitled" })
      ] })) })
    ] });
  };
  RelatedNotes.css = relatedNotes_default;
  return RelatedNotes;
});

export { RelatedNotes_default as RelatedNotes };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map