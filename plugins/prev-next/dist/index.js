// node_modules/@quartz-community/utils/dist/sort.js
function getDate(data) {
  const defaultDateType = data.defaultDateType;
  if (!defaultDateType) {
    return void 0;
  }
  const dates = data.dates;
  return dates?.[defaultDateType];
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

// src/components/styles/prevNext.scss
var prevNext_default = ".prev-next-nav {\n  margin-top: 3rem;\n  padding-top: 2rem;\n  border-top: 1px solid var(--lightgray);\n}\n.prev-next-nav .prev-next-inner {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.8rem;\n}\n.prev-next-nav .prev-next-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  padding: 0.8rem 1rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 6px;\n  text-decoration: none;\n  border-bottom: 1px solid var(--lightgray) !important;\n  transition: border-color 0.15s, background 0.15s;\n}\n.prev-next-nav .prev-next-link:hover {\n  border-color: var(--secondary) !important;\n  background: rgba(var(--accent-rgb), 0.04);\n}\n.prev-next-nav .prev-next-link.next {\n  text-align: right;\n}\n.prev-next-nav .prev-next-link .direction {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--secondary);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n.prev-next-nav .prev-next-link .ptitle {\n  font-size: 0.85rem;\n  color: var(--darkgray);\n  font-weight: 500;\n  line-height: 1.4;\n}";

// src/components/PrevNext.tsx
var PrevNext = ({ fileData, allFiles }) => {
  if (!fileData.slug || fileData.slug === "index") return /* @__PURE__ */ u2(S, {});
  const slugParts = fileData.slug.split("/");
  const parentDir = slugParts.slice(0, -1).join("/");
  const files = allFiles;
  const siblings = files.filter((f3) => {
    if (!f3.slug || !f3.dates || !f3.frontmatter?.title) return false;
    const fParentDir = f3.slug.split("/").slice(0, -1).join("/");
    return fParentDir === parentDir;
  }).sort((a2, b2) => getDate(a2).getTime() - getDate(b2).getTime());
  const currentIdx = siblings.findIndex((f3) => f3.slug === fileData.slug);
  if (currentIdx === -1) return /* @__PURE__ */ u2(S, {});
  const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const next = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;
  if (!prev && !next) return /* @__PURE__ */ u2(S, {});
  return /* @__PURE__ */ u2("nav", { class: "prev-next-nav", children: /* @__PURE__ */ u2("div", { class: "prev-next-inner", children: [
    prev ? /* @__PURE__ */ u2("a", { class: "prev-next-link prev", href: resolveRelative(fileData.slug, prev.slug), children: [
      /* @__PURE__ */ u2("span", { class: "direction", children: "\u2190 Prev" }),
      /* @__PURE__ */ u2("span", { class: "ptitle", children: prev.frontmatter.title })
    ] }) : /* @__PURE__ */ u2("div", {}),
    next ? /* @__PURE__ */ u2("a", { class: "prev-next-link next", href: resolveRelative(fileData.slug, next.slug), children: [
      /* @__PURE__ */ u2("span", { class: "direction", children: "Next \u2192" }),
      /* @__PURE__ */ u2("span", { class: "ptitle", children: next.frontmatter.title })
    ] }) : /* @__PURE__ */ u2("div", {})
  ] }) });
};
PrevNext.css = prevNext_default;
var PrevNext_default = (() => PrevNext);

export { PrevNext_default as PrevNext };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map