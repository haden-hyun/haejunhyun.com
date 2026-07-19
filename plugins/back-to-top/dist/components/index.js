// src/components/styles/backToTop.scss
var backToTop_default = "#back-to-top {\n  position: fixed;\n  bottom: 2rem;\n  right: 2rem;\n  width: 2.4rem;\n  height: 2.4rem;\n  border-radius: 50%;\n  background: var(--secondary);\n  border: none;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transform: translateY(8px);\n  transition: opacity 0.2s, transform 0.2s, background 0.15s;\n  z-index: 1000;\n  pointer-events: none;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n}\n#back-to-top.visible {\n  opacity: 1;\n  transform: translateY(0);\n  pointer-events: auto;\n}\n#back-to-top:hover {\n  background: var(--tertiary);\n}\n#back-to-top svg {\n  width: 1rem;\n  height: 1rem;\n  fill: #fff;\n}";

// src/components/scripts/backToTop.inline.ts
var backToTop_inline_default = 'document.addEventListener("nav",()=>{let e=document.getElementById("back-to-top");if(!e)return;let n=()=>e.classList.toggle("visible",window.scrollY>300),o=()=>window.scrollTo({top:0,behavior:"smooth"});window.addEventListener("scroll",n,{passive:!0}),e.addEventListener("click",o),window.addCleanup(()=>{window.removeEventListener("scroll",n),e.removeEventListener("click",o)}),n()});\n';
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

// src/components/BackToTop.tsx
var BackToTop = () => /* @__PURE__ */ u2("button", { id: "back-to-top", "aria-label": "Back to top", children: /* @__PURE__ */ u2("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ u2("path", { d: "M12 4l-8 8h5v8h6v-8h5z" }) }) });
BackToTop.css = backToTop_default;
BackToTop.beforeDOMLoaded = backToTop_inline_default;
var BackToTop_default = (() => BackToTop);

export { BackToTop_default as BackToTop };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map