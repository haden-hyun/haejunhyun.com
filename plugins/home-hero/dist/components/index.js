// src/components/styles/hero.scss
var hero_default = ".home-hero {\n  display: flex;\n  flex-direction: column;\n  gap: 1.1rem;\n  padding: 3.5rem 0 3rem;\n}\n@media all and (max-width: 800px) {\n  .home-hero {\n    padding: 2.25rem 0 2rem;\n  }\n}\n\n.hero-meta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 1rem;\n  font-family: var(--codeFont);\n  font-size: 0.78rem;\n  letter-spacing: 0.06em;\n  color: var(--text-3);\n  font-variant-numeric: tabular-nums;\n}\n.hero-meta b {\n  font-weight: 600;\n  color: var(--text);\n}\n\n.hero-headline {\n  font-family: var(--headerFont);\n  font-weight: 900;\n  font-size: clamp(2.5rem, 6vw, 3.75rem);\n  line-height: 1.1;\n  letter-spacing: -0.02em;\n  color: var(--text);\n  margin: 0;\n  border: none;\n  padding: 0;\n  text-wrap: balance;\n}\n\n.hero-description {\n  font-size: 1.08rem;\n  line-height: 1.7;\n  color: var(--text-2);\n  max-width: 38em;\n  margin: 0;\n}\n\n.hero-cta {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.6rem 1.4rem;\n  margin-top: 0.4rem;\n  font-size: 0.95rem;\n}\n\n.hero-btn-primary {\n  display: inline-flex;\n  align-items: center;\n  min-height: 44px;\n  padding: 0 1.1rem;\n  box-sizing: border-box;\n  border-radius: var(--radius, 10px);\n  background: var(--accent-action);\n  color: var(--surface);\n  font-weight: 700;\n  text-decoration: none;\n  transition: filter 0.15s;\n}\n.hero-btn-primary:hover {\n  filter: brightness(1.06);\n}\n\n.hero-link {\n  color: var(--accent);\n  font-weight: 600;\n  text-decoration: none;\n}\n.hero-link:hover {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}";
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

// src/components/HomeHero.tsx
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function formatDate(d2) {
  const pad = (n2) => String(n2).padStart(2, "0");
  return `${d2.getFullYear()}.${pad(d2.getMonth() + 1)}.${pad(d2.getDate())}`;
}
var defaultOptions = {
  headline: "",
  description: "",
  links: []
};
function isRealNote(f3) {
  const slug = f3.slug ?? "";
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
function getTime(f3) {
  return f3.dates?.modified?.getTime() ?? f3.dates?.created?.getTime() ?? 0;
}
var HomeHero_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const HomeHero = (props) => {
    const { fileData, allFiles, displayClass } = props;
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles.filter(
      (f3) => f3.slug !== fileData.slug && isRealNote(f3) && (f3.slug ?? "").includes("/")
    );
    const noteCount = files.length;
    const topicCount = new Set(files.map((f3) => (f3.slug ?? "").split("/")[0]).filter(Boolean)).size;
    const lastUpdateTime = files.reduce((max, f3) => Math.max(max, getTime(f3)), 0);
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      /* @__PURE__ */ u2("div", { class: "hero-meta", children: [
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("b", { children: noteCount }),
          " NOTES"
        ] }),
        /* @__PURE__ */ u2("span", { children: [
          /* @__PURE__ */ u2("b", { children: topicCount }),
          " TOPICS"
        ] }),
        lastUpdateTime > 0 && /* @__PURE__ */ u2("span", { children: [
          "UPDATED ",
          /* @__PURE__ */ u2("b", { children: formatDate(new Date(lastUpdateTime)) })
        ] })
      ] }),
      /* @__PURE__ */ u2("h1", { class: "hero-headline", children: opts.headline.split("\n").map((line, i2, arr) => /* @__PURE__ */ u2(S, { children: [
        line,
        i2 < arr.length - 1 && /* @__PURE__ */ u2("br", {})
      ] })) }),
      opts.description && /* @__PURE__ */ u2("p", { class: "hero-description", children: opts.description }),
      opts.links.length > 0 && /* @__PURE__ */ u2("div", { class: "hero-cta", children: opts.links.map((link) => /* @__PURE__ */ u2(
        "a",
        {
          class: classNames(void 0, link.primary ? "hero-btn-primary" : "hero-link"),
          href: link.href,
          children: link.label
        }
      )) })
    ] });
  };
  HomeHero.css = hero_default;
  return HomeHero;
});

export { HomeHero_default as HomeHero };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map