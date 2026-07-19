// src/components/styles/readingProgress.scss
var readingProgress_default = "#reading-progress-bar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  height: 2px;\n  width: 0%;\n  background: var(--secondary);\n  z-index: 9999;\n  transition: width 0.08s ease-out;\n  pointer-events: none;\n}";

// src/components/scripts/readingProgress.inline.ts
var readingProgress_inline_default = 'document.addEventListener("nav",()=>{let n=document.getElementById("reading-progress-bar");if(!n)return;let e=()=>{let o=window.scrollY,t=document.documentElement.scrollHeight-window.innerHeight;n.style.width=t>0?`${Math.min(o/t*100,100)}%`:"0%"};window.addEventListener("scroll",e,{passive:!0}),window.addCleanup(()=>window.removeEventListener("scroll",e)),e()});\n';
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
  return l.vnode && l.vnode(l2), l2;
}

// src/components/ReadingProgress.tsx
var ReadingProgress = () => {
  return /* @__PURE__ */ u2("div", { id: "reading-progress-bar" });
};
ReadingProgress.css = readingProgress_default;
ReadingProgress.beforeDOMLoaded = readingProgress_inline_default;
var ReadingProgress_default = (() => ReadingProgress);

export { ReadingProgress_default as ReadingProgress };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map