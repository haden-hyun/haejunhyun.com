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

// src/components/styles/footer.scss
var footer_default = "footer {\n  text-align: left;\n  margin-bottom: 4rem;\n  opacity: 0.7;\n}\nfooter .footer-row {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n}\nfooter .footer-row p {\n  margin: 0;\n}\nfooter .footer-row .visitor-counter {\n  margin: 0;\n}\nfooter ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: row;\n  gap: 1rem;\n  margin-top: -1rem;\n}";
var l2;
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

// src/components/Footer.tsx
function concatenateResources(...resources) {
  return resources.filter((r2) => r2 !== void 0).flat();
}
var Footer_default = ((opts) => {
  const VisitorCounter2 = VisitorCounter_default();
  const Footer = (props) => {
    const { displayClass } = props;
    const links = opts?.links ?? {};
    return /* @__PURE__ */ u3("footer", { class: `${displayClass ?? ""}`, children: [
      /* @__PURE__ */ u3("hr", {}),
      /* @__PURE__ */ u3("div", { class: "footer-row", children: [
        /* @__PURE__ */ u3("p", { style: "text-align: left;", children: [
          "Created by ",
          /* @__PURE__ */ u3("a", { href: "https://github.com/haden-hyun", children: "haejun" })
        ] }),
        VisitorCounter2(props)
      ] }),
      /* @__PURE__ */ u3("ul", { children: Object.entries(links).map(([text, link]) => /* @__PURE__ */ u3("li", { children: /* @__PURE__ */ u3("a", { href: link, children: text }) })) })
    ] });
  };
  Footer.css = concatenateResources(footer_default, VisitorCounter2.css);
  Footer.afterDOMLoaded = VisitorCounter2.afterDOMLoaded;
  return Footer;
});

export { Footer_default as Footer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map