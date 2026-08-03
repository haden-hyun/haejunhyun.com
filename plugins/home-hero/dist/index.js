// src/components/styles/hero.scss
var hero_default = ".home-hero {\n  display: grid;\n  grid-template-columns: 1fr auto;\n  gap: 48px;\n  align-items: center;\n  padding: 2.5rem 0 2rem 0;\n  margin-bottom: 1rem;\n  border-bottom: 1px solid var(--border);\n}\n@media all and (max-width: 800px) {\n  .home-hero {\n    grid-template-columns: 1fr;\n    gap: 20px;\n    padding: 1.5rem 0 1.5rem 0;\n    text-align: left;\n  }\n}\n\n.hero-eyebrow {\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  font-weight: 600;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: var(--accent);\n  margin-bottom: 0.6rem;\n}\n\n.hero-headline {\n  font-family: var(--headerFont);\n  font-weight: 780;\n  font-size: 2.1rem;\n  line-height: 1.28;\n  letter-spacing: -0.03em;\n  color: var(--text);\n  margin: 0 0 0.9rem 0;\n  border: none;\n  padding: 0;\n}\n@media all and (max-width: 800px) {\n  .hero-headline {\n    font-size: 1.6rem;\n  }\n}\n\n.hero-description {\n  font-family: var(--bodyFont);\n  font-size: 1.02rem;\n  line-height: 1.7;\n  color: var(--text-2);\n  max-width: 640px;\n  margin: 0 0 1.3rem 0;\n}\n\n.hero-cta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.6rem;\n  margin-bottom: 1.6rem;\n}\n\n.hero-btn {\n  display: inline-flex;\n  align-items: center;\n  font-size: 0.85rem;\n  font-weight: 600;\n  padding: 0.55rem 1.1rem;\n  border-radius: var(--radius, 10px);\n  border: 1px solid var(--border);\n  color: var(--text);\n  text-decoration: none;\n  transition: border-color 0.15s, background-color 0.15s;\n  min-height: 44px;\n  box-sizing: border-box;\n}\n.hero-btn:hover {\n  border-color: var(--accent);\n  background: var(--surface-2);\n}\n\n.hero-btn-primary {\n  background: var(--accent);\n  border-color: var(--accent);\n  color: var(--surface);\n}\n.hero-btn-primary:hover {\n  opacity: 0.9;\n  background: var(--accent);\n}\n\n.hero-stats {\n  display: flex;\n  gap: 2rem;\n  flex-wrap: wrap;\n}\n.hero-stats b {\n  display: block;\n  font-family: var(--codeFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  color: var(--text);\n}\n.hero-stats span {\n  font-size: 0.72rem;\n  color: var(--text-3);\n}\n\n.hero-avatar {\n  width: 104px;\n  height: 104px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: var(--headerFont);\n  font-size: 2.4rem;\n  font-weight: 700;\n  color: #fff;\n  background: linear-gradient(140deg, var(--tertiary, var(--accent)) 0%, var(--accent) 60%, var(--dark) 130%);\n  flex-shrink: 0;\n  user-select: none;\n}\n@media all and (max-width: 800px) {\n  .hero-avatar {\n    width: 72px;\n    height: 72px;\n    font-size: 1.7rem;\n  }\n}";
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
function formatDate(d2, locale = "en-US") {
  return d2.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}
var defaultOptions = {
  eyebrow: "",
  headline: "",
  description: "",
  links: [],
  avatarInitial: "?"
};
function isRealNote(f3) {
  const slug = f3.slug ?? "";
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  return true;
}
function getTime(f3) {
  return f3.dates?.modified?.getTime() ?? f3.dates?.created?.getTime() ?? 0;
}
var HomeHero_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const HomeHero = ({
    fileData,
    allFiles,
    displayClass,
    cfg
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles.filter(
      (f3) => f3.slug !== fileData.slug && isRealNote(f3)
    );
    const noteCount = files.length;
    const topicCount = new Set(files.map((f3) => (f3.slug ?? "").split("/")[0]).filter(Boolean)).size;
    const lastUpdateTime = files.reduce((max, f3) => Math.max(max, getTime(f3)), 0);
    const locale = cfg.locale ?? "en-US";
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "home-hero"), children: [
      /* @__PURE__ */ u2("div", { class: "hero-main", children: [
        opts.eyebrow && /* @__PURE__ */ u2("div", { class: "hero-eyebrow", children: opts.eyebrow }),
        /* @__PURE__ */ u2("h1", { class: "hero-headline", children: opts.headline.split("\n").map((line, i2, arr) => /* @__PURE__ */ u2(S, { children: [
          line,
          i2 < arr.length - 1 && /* @__PURE__ */ u2("br", {})
        ] })) }),
        opts.description && /* @__PURE__ */ u2("p", { class: "hero-description", children: opts.description }),
        opts.links.length > 0 && /* @__PURE__ */ u2("div", { class: "hero-cta", children: opts.links.map((link) => /* @__PURE__ */ u2(
          "a",
          {
            class: classNames(void 0, "hero-btn", link.primary ? "hero-btn-primary" : ""),
            href: link.href,
            children: link.label
          }
        )) }),
        /* @__PURE__ */ u2("div", { class: "hero-stats", children: [
          /* @__PURE__ */ u2("div", { class: "hero-stat", children: [
            /* @__PURE__ */ u2("b", { children: noteCount }),
            /* @__PURE__ */ u2("span", { children: "\uB178\uD2B8" })
          ] }),
          /* @__PURE__ */ u2("div", { class: "hero-stat", children: [
            /* @__PURE__ */ u2("b", { children: topicCount }),
            /* @__PURE__ */ u2("span", { children: "\uD1A0\uD53D" })
          ] }),
          lastUpdateTime > 0 && /* @__PURE__ */ u2("div", { class: "hero-stat", children: [
            /* @__PURE__ */ u2("b", { children: formatDate(new Date(lastUpdateTime), locale) }),
            /* @__PURE__ */ u2("span", { children: "\uCD5C\uADFC \uC5C5\uB370\uC774\uD2B8" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u2("div", { class: "hero-avatar", "aria-hidden": "true", children: opts.avatarInitial })
    ] });
  };
  HomeHero.css = hero_default;
  return HomeHero;
});

export { HomeHero_default as HomeHero };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map