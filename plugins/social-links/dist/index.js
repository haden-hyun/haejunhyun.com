// src/components/styles/socialLinks.scss
var socialLinks_default = ".social-links {\n  margin-top: 0.5rem;\n  margin-bottom: 1rem;\n  padding: 0.5rem 0;\n}\n.social-links h3 {\n  display: none;\n}\n.social-links ul {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  display: flex;\n  gap: 0.5rem;\n}\n.social-links ul li {\n  margin: 0;\n}\n.social-links ul li a {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 2rem;\n  height: 2rem;\n  border-radius: 6px;\n  transition: all 0.2s ease;\n  text-decoration: none;\n}\n.social-links ul li a:hover {\n  transform: translateY(-2px);\n}\n.social-links ul li a svg {\n  width: 1.25rem;\n  height: 1.25rem;\n  fill: var(--secondary);\n  flex-shrink: 0;\n  transition: all 0.2s ease;\n}\n.social-links ul li a:hover svg {\n  fill: var(--tertiary);\n  transform: scale(1.1);\n}\n.social-links ul li a .link-text {\n  display: none;\n}\n\n@media (prefers-color-scheme: dark) {\n  .social-links ul li a svg {\n    fill: var(--tertiary);\n  }\n  .social-links ul li a:hover svg {\n    fill: var(--secondary);\n  }\n}";
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

// src/components/SocialLinks.tsx
var defaultOptions = {
  links: []
};
var SocialLinks_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const SocialLinks = ({ displayClass }) => {
    const links = opts.links ?? [];
    if (links.length === 0) {
      return /* @__PURE__ */ u2(S, {});
    }
    return /* @__PURE__ */ u2("div", { class: `${displayClass ?? ""} social-links`, children: /* @__PURE__ */ u2("ul", { children: links.map((link) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2(
      "a",
      {
        href: link.url,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": link.name,
        title: link.name,
        children: /* @__PURE__ */ u2("span", { dangerouslySetInnerHTML: { __html: link.icon } })
      }
    ) })) }) });
  };
  SocialLinks.css = socialLinks_default;
  return SocialLinks;
});

export { SocialLinks_default as SocialLinks };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map