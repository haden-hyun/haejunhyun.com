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

// src/components/styles/globalNav.scss
var globalNav_default = ".global-nav {\n  display: flex;\n  align-items: center;\n  gap: 1.4rem;\n  flex-wrap: wrap;\n}\n\n.global-nav-link {\n  font-family: var(--codeFont);\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: var(--text-2);\n  text-decoration: none;\n  padding: 0.3rem 0;\n  border-bottom: 2px solid transparent;\n  transition: color 0.15s, border-color 0.15s;\n}\n.global-nav-link:hover {\n  color: var(--text);\n}\n.global-nav-link.active {\n  color: var(--accent);\n  border-bottom-color: var(--accent);\n}";
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

// src/components/GlobalNav.tsx
var NAV_ITEMS = [
  { label: "Home", slug: "index" },
  { label: "Topics", slug: "topics" },
  { label: "Archive", slug: "archive" }
];
var GlobalNav_default = (() => {
  const GlobalNav = ({ fileData, displayClass }) => {
    const currentSlug = fileData.slug ?? "index";
    return /* @__PURE__ */ u2("nav", { class: `${displayClass ?? ""} global-nav`, children: NAV_ITEMS.map((item) => {
      const isActive = currentSlug === item.slug || item.slug === "index" && currentSlug === "";
      return /* @__PURE__ */ u2(
        "a",
        {
          class: `global-nav-link${isActive ? " active" : ""}`,
          href: resolveRelative(currentSlug, item.slug),
          children: item.label
        }
      );
    }) });
  };
  GlobalNav.css = globalNav_default;
  return GlobalNav;
});

export { GlobalNav_default as GlobalNav };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map