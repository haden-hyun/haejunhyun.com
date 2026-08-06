// src/components/styles/imageLightbox.scss
var imageLightbox_default = "#lightbox-overlay {\n  display: none;\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.88);\n  z-index: 10000;\n  align-items: center;\n  justify-content: center;\n  cursor: zoom-out;\n}\n#lightbox-overlay.active {\n  display: flex;\n}\n\n#lightbox-img {\n  max-width: 92vw;\n  max-height: 92vh;\n  object-fit: contain;\n  border-radius: 4px;\n  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);\n}";

// src/components/scripts/imageLightbox.inline.ts
var imageLightbox_inline_default = 'document.addEventListener("nav",()=>{let e=document.getElementById("lightbox-overlay");if(!e){e=document.createElement("div"),e.id="lightbox-overlay";let o=document.createElement("img");o.id="lightbox-img",e.appendChild(o),document.body.appendChild(e)}let n=()=>{e.classList.remove("active"),document.body.style.overflow=""};e.addEventListener("click",n),window.addCleanup(()=>e.removeEventListener("click",n));for(let o of document.querySelectorAll("article img")){let t=o;if(t.closest(".il-thumb"))continue;t.style.cursor="zoom-in";let l=()=>{let i=document.getElementById("lightbox-img");i.src=t.src,i.alt=t.alt,e.classList.add("active"),document.body.style.overflow="hidden"};t.addEventListener("click",l),window.addCleanup(()=>t.removeEventListener("click",l))}});\n';
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

// src/components/ImageLightbox.tsx
var ImageLightbox = () => /* @__PURE__ */ u2(S, {});
ImageLightbox.css = imageLightbox_default;
ImageLightbox.beforeDOMLoaded = imageLightbox_inline_default;
var ImageLightbox_default = (() => ImageLightbox);

export { ImageLightbox_default as ImageLightbox };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map