// ../visitor-counter/dist/components/index.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
var visitorCounter_inline_default = 'var c="haejunhyun",s="fnmzzot0m9xa23gw3qwdgjm6b12vqwp1dpka7r1g0efk22pxtnc";async function i(){let o=document.getElementById("visitor-today"),n=document.getElementById("visitor-total");if(!o&&!n)return;let e=new Date().toISOString().split("T")[0];if(o)try{let t=await fetch(`https://${c}.goatcounter.com/api/v0/stats/total?start=${e}&end=${e}`,{headers:{Authorization:`Bearer ${s}`}});if(t.ok){let a=await t.json();o.textContent=String(a.total??0)}}catch{}if(n)try{let t=await fetch(`https://${c}.goatcounter.com/counter/TOTAL.json`);if(t.ok){let a=await t.json();n.textContent=a.count??"0"}}catch{}}document.addEventListener("nav",()=>{i()});\n';
var l;
l = { __e: function(n2, l22, u32, t2) {
  for (var i2, r2, o2; l22 = l22.__; ) if ((i2 = l22.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u32) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l22 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u32 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l22), l22;
}
var VisitorCounter = ({ displayClass }) => {
  return /* @__PURE__ */ u2("div", { class: classNames(displayClass, "visitor-counter"), children: [
    /* @__PURE__ */ u2("span", { class: "visitor-item", children: [
      /* @__PURE__ */ u2("span", { class: "visitor-label", children: "Today" }),
      /* @__PURE__ */ u2("span", { id: "visitor-today", class: "visitor-count", children: "-" })
    ] }),
    /* @__PURE__ */ u2("span", { class: "visitor-sep", children: "\xB7" }),
    /* @__PURE__ */ u2("span", { class: "visitor-item", children: [
      /* @__PURE__ */ u2("span", { class: "visitor-label", children: "Total" }),
      /* @__PURE__ */ u2("span", { id: "visitor-total", class: "visitor-count", children: "-" })
    ] })
  ] });
};
VisitorCounter.afterDOMLoaded = visitorCounter_inline_default;
VisitorCounter.css = `
.visitor-counter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--gray);
  margin: 0.1rem 0 0.6rem 0;
}

.visitor-item {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.visitor-label {
  opacity: 0.65;
}

.visitor-count {
  font-weight: 600;
  color: var(--secondary);
}

.visitor-sep {
  opacity: 0.35;
}
`;
var VisitorCounter_default = (() => VisitorCounter);

// src/components/styles/hero.scss
var hero_default = ".home-hero {\n  display: grid;\n  grid-template-columns: 1fr auto;\n  gap: 48px;\n  align-items: center;\n  padding: 2.5rem 0 2rem 0;\n  margin-bottom: 1rem;\n  border-bottom: 1px solid var(--border);\n}\n@media all and (max-width: 800px) {\n  .home-hero {\n    grid-template-columns: 1fr;\n    gap: 20px;\n    padding: 1.5rem 0 1.5rem 0;\n    text-align: left;\n  }\n}\n\n@media all and (max-width: 1000px) {\n  .flex-component:has(.home-hero) {\n    flex-wrap: wrap !important;\n  }\n  .flex-component:has(.home-hero) > div {\n    flex-basis: 100% !important;\n    flex-grow: 1 !important;\n  }\n}\n:root .home-hero.has-backdrop {\n  position: relative;\n  overflow: hidden;\n  isolation: isolate;\n  grid-template-columns: 1fr;\n  align-items: end;\n  height: 700px;\n  padding: 0;\n  border: none;\n  border-radius: 10px;\n  margin-bottom: 0;\n}\n@media all and (max-width: 1000px) {\n  :root .home-hero.has-backdrop {\n    height: auto;\n    min-height: 420px;\n    margin-bottom: 1.5rem;\n  }\n}\n@media all and (max-width: 800px) {\n  :root .home-hero.has-backdrop {\n    min-height: 0;\n    padding: 1.75rem 0;\n    border-radius: 8px;\n  }\n}\n:root .hero-backdrop {\n  display: block;\n  position: absolute;\n  inset: -16px;\n  z-index: 0;\n  background-position: center bottom;\n  background-size: cover;\n  background-repeat: no-repeat;\n  filter: blur(5px);\n}\n:root .hero-veil {\n  display: block;\n  position: absolute;\n  inset: 0;\n  z-index: 1;\n  background: rgba(14, 20, 32, 0.64);\n  -webkit-backdrop-filter: blur(14px);\n  backdrop-filter: blur(14px);\n  -webkit-mask-image: linear-gradient(180deg, #000 0 9%, transparent 21% 30%, #000 44% 100%);\n  mask-image: linear-gradient(180deg, #000 0 9%, transparent 21% 30%, #000 44% 100%);\n}\n@media all and (max-width: 800px) {\n  :root .hero-veil {\n    -webkit-mask-image: none;\n    mask-image: none;\n    background: rgba(14, 20, 32, 0.72);\n  }\n}\n:root .has-backdrop .hero-main {\n  position: relative;\n  z-index: 3;\n  max-width: 100%;\n  padding: 0 1.75rem 2.5rem;\n}\n@media all and (max-width: 800px) {\n  :root .has-backdrop .hero-main {\n    padding: 0 1.25rem;\n  }\n}\n:root .has-backdrop .hero-headline {\n  color: var(--stage-text);\n}\n:root .has-backdrop .hero-eyebrow {\n  color: var(--stage-accent-2);\n}\n:root .has-backdrop .hero-description {\n  color: var(--stage-text-2);\n}\n:root .has-backdrop .hero-topbar {\n  position: absolute;\n  z-index: 3;\n  top: 0;\n  left: 0;\n  right: 0;\n  padding: 1.1rem 1.75rem;\n}\n@media all and (max-width: 800px) {\n  :root .has-backdrop .hero-topbar {\n    position: static;\n    padding: 0 1.25rem 1.25rem;\n  }\n}\n:root .has-backdrop .hero-stats {\n  gap: 1.4rem;\n  align-items: baseline;\n}\n:root .has-backdrop .hero-stats .hero-stat {\n  display: flex;\n  align-items: baseline;\n  gap: 0.4rem;\n}\n:root .has-backdrop .hero-stats b {\n  display: inline;\n  font-size: 0.86rem;\n  color: var(--stage-text);\n}\n:root .has-backdrop .hero-stats span {\n  font-size: 0.68rem;\n  color: var(--stage-text-2);\n}\n:root .has-backdrop .hero-btn {\n  color: var(--stage-text);\n  border-color: rgba(233, 239, 247, 0.55);\n}\n:root .has-backdrop .hero-btn:hover {\n  border-color: var(--stage-text);\n  background: rgba(233, 239, 247, 0.1);\n}\n:root .has-backdrop .hero-btn-primary {\n  background: #b8442a;\n  border-color: #b8442a;\n  color: #fff;\n}\n:root .has-backdrop .hero-btn-primary:hover {\n  background: #b8442a;\n}\n:root .has-backdrop .hero-avatar-col {\n  position: absolute;\n  right: 1.75rem;\n  bottom: 1.25rem;\n  z-index: 3;\n}\n@media all and (max-width: 800px) {\n  :root .has-backdrop .hero-avatar-col {\n    position: static;\n    align-items: flex-start;\n    padding: 1rem 1.25rem 0;\n  }\n}\n:root .has-backdrop .hero-visitor-counter .visitor-counter {\n  color: var(--stage-text-2);\n}\n\n.hero-eyebrow {\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 600;\n  letter-spacing: 0.02em;\n  color: var(--accent);\n  margin-bottom: 0.6rem;\n}\n\n.hero-headline {\n  font-family: var(--headerFont);\n  font-weight: 780;\n  font-size: 2.1rem;\n  line-height: 1.28;\n  letter-spacing: -0.03em;\n  color: var(--text);\n  margin: 0 0 0.9rem 0;\n  border: none;\n  padding: 0;\n}\n@media all and (max-width: 800px) {\n  .hero-headline {\n    font-size: 1.6rem;\n  }\n}\n\n.hero-description {\n  font-family: var(--headerFont);\n  font-size: 1.02rem;\n  line-height: 1.7;\n  color: var(--text-2);\n  max-width: 640px;\n  margin: 0 0 1.3rem 0;\n}\n\n.hero-cta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.6rem;\n  margin-bottom: 1.6rem;\n}\n\n.hero-btn {\n  display: inline-flex;\n  align-items: center;\n  font-family: var(--headerFont);\n  font-size: 0.9rem;\n  font-weight: 600;\n  padding: 0.55rem 1.1rem;\n  border-radius: var(--radius, 10px);\n  border: 1px solid var(--border);\n  color: var(--text);\n  text-decoration: none;\n  transition: border-color 0.15s, background-color 0.15s;\n  min-height: 44px;\n  box-sizing: border-box;\n}\n.hero-btn:hover {\n  border-color: var(--accent);\n  background: var(--surface-2);\n}\n\n.hero-btn-primary {\n  background: var(--accent-action);\n  border-color: var(--accent-action);\n  color: var(--surface);\n}\n.hero-btn-primary:hover {\n  opacity: 0.9;\n  background: var(--accent-action);\n}\n\n.hero-stats {\n  display: flex;\n  gap: 2rem;\n  flex-wrap: wrap;\n}\n.hero-stats b {\n  display: block;\n  font-family: var(--codeFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  color: var(--text);\n}\n.hero-stats span {\n  font-size: 0.72rem;\n  color: var(--text-3);\n}\n\n.hero-avatar-col {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.5rem;\n  flex-shrink: 0;\n}\n\n.hero-avatar {\n  width: 104px;\n  height: 104px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: var(--headerFont);\n  font-size: 2.4rem;\n  font-weight: 700;\n  color: #fff;\n  background: linear-gradient(140deg, var(--tertiary, var(--accent)) 0%, var(--accent) 60%, var(--dark) 130%);\n  flex-shrink: 0;\n  user-select: none;\n}\n@media all and (max-width: 800px) {\n  .hero-avatar {\n    width: 72px;\n    height: 72px;\n    font-size: 1.7rem;\n  }\n}\n\n.hero-avatar-img {\n  height: 220px;\n  width: auto;\n  object-fit: contain;\n  user-select: none;\n  -webkit-user-drag: none;\n}\n@media all and (max-width: 800px) {\n  .hero-avatar-img {\n    height: 140px;\n  }\n}\n\n.hero-visitor-counter .visitor-counter {\n  margin: 0;\n  justify-content: center;\n}";
var l2;
function S(n2) {
  return n2.children;
}
l2 = { __e: function(n2, l3, u4, t2) {
  for (var i2, r2, o2; l3 = l3.__; ) if ((i2 = l3.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l4) {
    n2 = l4;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f3 = 0;
function u3(e2, t2, n2, o2, i2, u4) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l3 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i2, __self: u4 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l2.vnode && l2.vnode(l3), l3;
}

// src/components/HomeHero.tsx
function concatenateResources(...resources) {
  return resources.filter((r2) => r2 !== void 0).flat();
}
function classNames2(...classes) {
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
function isRealNote(f4) {
  const slug = f4.slug ?? "";
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
function getTime(f4) {
  return f4.dates?.modified?.getTime() ?? f4.dates?.created?.getTime() ?? 0;
}
var HomeHero_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const VisitorCounter2 = VisitorCounter_default();
  const HomeHero = (props) => {
    const { fileData, allFiles, displayClass, cfg } = props;
    if (fileData.slug !== "index") return /* @__PURE__ */ u3(S, {});
    const files = allFiles.filter(
      (f4) => f4.slug !== fileData.slug && isRealNote(f4)
    );
    const noteCount = files.length;
    const topicCount = new Set(files.map((f4) => (f4.slug ?? "").split("/")[0]).filter(Boolean)).size;
    const lastUpdateTime = files.reduce((max, f4) => Math.max(max, getTime(f4)), 0);
    const locale = cfg.locale ?? "en-US";
    const backdrop = opts.backgroundImage;
    const stats = /* @__PURE__ */ u3("div", { class: "hero-stats", children: [
      /* @__PURE__ */ u3("div", { class: "hero-stat", children: [
        /* @__PURE__ */ u3("b", { children: noteCount }),
        /* @__PURE__ */ u3("span", { children: "\uB178\uD2B8" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "hero-stat", children: [
        /* @__PURE__ */ u3("b", { children: topicCount }),
        /* @__PURE__ */ u3("span", { children: "\uD1A0\uD53D" })
      ] }),
      lastUpdateTime > 0 && /* @__PURE__ */ u3("div", { class: "hero-stat", children: [
        /* @__PURE__ */ u3("b", { children: formatDate(new Date(lastUpdateTime), locale) }),
        /* @__PURE__ */ u3("span", { children: "\uCD5C\uADFC \uC5C5\uB370\uC774\uD2B8" })
      ] })
    ] });
    return /* @__PURE__ */ u3("section", { class: classNames2(displayClass, "home-hero", backdrop ? "has-backdrop" : ""), children: [
      backdrop && /* @__PURE__ */ u3(S, { children: [
        /* @__PURE__ */ u3(
          "div",
          {
            class: "hero-backdrop",
            style: `background-image:url("${backdrop}")`,
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ u3("div", { class: "hero-veil", "aria-hidden": "true" }),
        /* @__PURE__ */ u3("div", { class: "hero-topbar", children: stats })
      ] }),
      /* @__PURE__ */ u3("div", { class: "hero-main", children: [
        opts.eyebrow && /* @__PURE__ */ u3("div", { class: "hero-eyebrow", children: opts.eyebrow }),
        /* @__PURE__ */ u3("h1", { class: "hero-headline", children: opts.headline.split("\n").map((line, i2, arr) => /* @__PURE__ */ u3(S, { children: [
          line,
          i2 < arr.length - 1 && /* @__PURE__ */ u3("br", {})
        ] })) }),
        opts.description && /* @__PURE__ */ u3("p", { class: "hero-description", children: opts.description }),
        opts.links.length > 0 && /* @__PURE__ */ u3("div", { class: "hero-cta", children: opts.links.map((link) => /* @__PURE__ */ u3(
          "a",
          {
            class: classNames2(void 0, "hero-btn", link.primary ? "hero-btn-primary" : ""),
            href: link.href,
            children: link.label
          }
        )) }),
        !backdrop && stats
      ] }),
      /* @__PURE__ */ u3("div", { class: "hero-avatar-col", children: [
        !backdrop && (opts.avatarImage ? /* @__PURE__ */ u3("img", { class: "hero-avatar-img", src: opts.avatarImage, alt: "", "aria-hidden": "true" }) : /* @__PURE__ */ u3("div", { class: "hero-avatar", "aria-hidden": "true", children: opts.avatarInitial })),
        /* @__PURE__ */ u3("div", { class: "hero-visitor-counter", children: VisitorCounter2(props) })
      ] })
    ] });
  };
  HomeHero.css = concatenateResources(hero_default, VisitorCounter2.css);
  HomeHero.afterDOMLoaded = VisitorCounter2.afterDOMLoaded;
  return HomeHero;
});

export { HomeHero_default as HomeHero };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map