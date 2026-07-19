// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/scripts/visitorCounter.inline.ts
var visitorCounter_inline_default = 'var c="haejunhyun",s="fnmzzot0m9xa23gw3qwdgjm6b12vqwp1dpka7r1g0efk22pxtnc";async function i(){let o=document.getElementById("visitor-today"),n=document.getElementById("visitor-total");if(!o&&!n)return;let e=new Date().toISOString().split("T")[0];if(o)try{let t=await fetch(`https://${c}.goatcounter.com/api/v0/stats/total?start=${e}&end=${e}`,{headers:{Authorization:`Bearer ${s}`}});if(t.ok){let a=await t.json();o.textContent=String(a.total??0)}}catch{}if(n)try{let t=await fetch(`https://${c}.goatcounter.com/counter/TOTAL.json`);if(t.ok){let a=await t.json();n.textContent=a.count??"0"}}catch{}}document.addEventListener("nav",()=>{i()});\n';
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

// src/components/VisitorCounter.tsx
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

export { VisitorCounter_default as VisitorCounter };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map