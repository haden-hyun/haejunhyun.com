// src/components/styles/footer.scss
var footer_default = ".site-footer {\n  margin: 0;\n  padding: 28px 0 48px;\n  border-top: 1px solid var(--lightgray);\n}\n@media all and (max-width: 800px) {\n  .site-footer {\n    padding: 20px 0 40px;\n  }\n}\n\n.sf-cols {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));\n  gap: 1.5rem 2.25rem;\n  margin-bottom: 1.75rem;\n}\n\n.sf-col-title {\n  font-family: var(--titleFont);\n  font-size: 1.1rem;\n  letter-spacing: 0.02em;\n  color: var(--dark);\n  margin-bottom: 0.7rem;\n}\n\n.sf-links {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 14px;\n  font-size: 13px;\n}\n.sf-links a {\n  color: var(--gray);\n  text-decoration: none;\n}\n.sf-links a:hover {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n\n.sf-text {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.7;\n  color: var(--darkgray);\n}\n\n.sf-fine {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 12px;\n  font-size: 13px;\n  color: var(--gray);\n}\n.sf-fine > span + span {\n  font-family: var(--codeFont);\n  font-size: 11px;\n  letter-spacing: 0.04em;\n}";
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
var Footer_default = ((opts) => {
  const Footer = (props) => {
    const { displayClass } = props;
    const columns = opts?.columns ?? [];
    return /* @__PURE__ */ u2("footer", { class: `${displayClass ?? ""} site-footer`, children: [
      columns.length > 0 && /* @__PURE__ */ u2("div", { class: "sf-cols", children: columns.map((col) => /* @__PURE__ */ u2("div", { class: "sf-col", children: [
        /* @__PURE__ */ u2("div", { class: "sf-col-title", children: col.title }),
        col.links && /* @__PURE__ */ u2("ul", { class: "sf-links", children: Object.entries(col.links).map(([text, link]) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { href: link, children: text }) })) }),
        col.text && /* @__PURE__ */ u2("p", { class: "sf-text", children: col.text })
      ] })) }),
      (opts?.brand || opts?.meta) && /* @__PURE__ */ u2("div", { class: "sf-fine", children: [
        opts?.brand && /* @__PURE__ */ u2("span", { children: opts.brand }),
        opts?.meta && /* @__PURE__ */ u2("span", { children: opts.meta })
      ] })
    ] });
  };
  Footer.css = footer_default;
  return Footer;
});

export { Footer_default as Footer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map