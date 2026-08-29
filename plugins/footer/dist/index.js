// src/components/styles/footer.scss
var footer_default = '.site-footer {\n  margin-bottom: 2rem;\n}\n\n.sf-stage {\n  position: relative;\n  overflow: hidden;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  align-items: end;\n  gap: 2rem;\n  padding: 3.5rem 1.75rem 0;\n  border-radius: 10px;\n  background: var(--stage);\n  border: 1px solid var(--stage-edge);\n  color: var(--stage-text-2);\n  background-image: var(--stage-image, none);\n  background-position: center 42%;\n  background-size: cover;\n}\n.sf-stage::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: rgba(20, 29, 40, 0.86);\n  pointer-events: none;\n}\n.sf-stage::before {\n  content: "";\n  position: absolute;\n  inset: 0 0 auto 0;\n  z-index: 2;\n  height: 48px;\n  background: linear-gradient(180deg, var(--bg), transparent);\n  opacity: var(--stage-fade);\n  pointer-events: none;\n}\n.sf-stage > * {\n  position: relative;\n  z-index: 1;\n}\n@media all and (max-width: 800px) {\n  .sf-stage {\n    grid-template-columns: 1fr;\n    gap: 1rem;\n    padding: 2.75rem 1.25rem 0;\n  }\n}\n\n.sf-body {\n  padding-bottom: 2.25rem;\n}\n\n.sf-eyebrow {\n  font-family: var(--codeFont);\n  font-size: 0.66rem;\n  letter-spacing: 0.13em;\n  text-transform: uppercase;\n  color: var(--stage-text-3);\n  margin-bottom: 0.5rem;\n}\n\n.sf-headline {\n  font-family: var(--headerFont);\n  font-size: 1.25rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  color: var(--stage-text);\n  margin: 0 0 0.5rem;\n}\n.sf-headline a {\n  color: var(--stage-accent);\n}\n\n.sf-description {\n  font-size: 0.86rem;\n  line-height: 1.7;\n  color: var(--stage-text-2);\n  max-width: 44ch;\n  margin: 0 0 1rem;\n}\n\n.sf-links {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.1rem;\n  font-size: 0.82rem;\n}\n.sf-links a {\n  color: var(--stage-text-2);\n  text-decoration: none;\n}\n.sf-links a:hover {\n  color: var(--stage-accent);\n}\n\n.sf-meta {\n  margin-top: 1.1rem;\n  font-size: 0.72rem;\n  color: var(--stage-text-3);\n}\n\n.sf-figure {\n  display: block;\n  height: 190px;\n  width: auto;\n  align-self: end;\n  user-select: none;\n  -webkit-user-drag: none;\n  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.5));\n}\n@media all and (max-width: 800px) {\n  .sf-figure {\n    height: 132px;\n    justify-self: end;\n  }\n}';
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

// src/components/Footer.tsx
function resolveFromRoot(path, slug) {
  if (!path.startsWith("./")) return path;
  const depth = slug.split("/").length - 1;
  const prefix = depth === 0 ? "." : Array(depth).fill("..").join("/");
  return `${prefix}/${path.slice(2)}`;
}
var Footer_default = ((opts) => {
  const Footer = (props) => {
    const { displayClass, fileData } = props;
    const links = opts?.links ?? {};
    const slug = fileData.slug ?? "";
    const figureSrc = opts?.figureImage ? resolveFromRoot(opts.figureImage, slug) : void 0;
    const bgSrc = opts?.backgroundImage ? resolveFromRoot(opts.backgroundImage, slug) : void 0;
    const hasText = Boolean(opts?.eyebrow || opts?.headline || opts?.description);
    return /* @__PURE__ */ u2("footer", { class: `${displayClass ?? ""} site-footer`, children: /* @__PURE__ */ u2("div", { class: "sf-stage", style: bgSrc ? `--stage-image:url("${bgSrc}")` : void 0, children: [
      /* @__PURE__ */ u2("div", { class: "sf-body", children: [
        opts?.eyebrow && /* @__PURE__ */ u2("div", { class: "sf-eyebrow", children: opts.eyebrow }),
        opts?.headline && /* @__PURE__ */ u2("p", { class: "sf-headline", children: opts.headline }),
        opts?.description && /* @__PURE__ */ u2("p", { class: "sf-description", children: opts.description }),
        !hasText && /* @__PURE__ */ u2("p", { class: "sf-headline", children: [
          "Created by ",
          /* @__PURE__ */ u2("a", { href: "https://github.com/haden-hyun", children: "haejun" })
        ] }),
        Object.keys(links).length > 0 && /* @__PURE__ */ u2("ul", { class: "sf-links", children: Object.entries(links).map(([text, link]) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { href: link, children: text }) })) }),
        opts?.meta && /* @__PURE__ */ u2("div", { class: "sf-meta", children: opts.meta })
      ] }),
      figureSrc && /* @__PURE__ */ u2("img", { class: "sf-figure", src: figureSrc, alt: "", "aria-hidden": "true" })
    ] }) });
  };
  Footer.css = footer_default;
  return Footer;
});

export { Footer_default as Footer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map