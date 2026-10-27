// src/components/styles/focusMode.scss
var focusMode_default = ".focus-toggle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  width: 2rem;\n  height: 2rem;\n  margin: 0;\n  padding: 0;\n  border: none;\n  border-radius: var(--radius-s);\n  background: none;\n  color: var(--darkgray);\n  cursor: pointer;\n  transition: color var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease);\n}\n.focus-toggle svg {\n  width: 20px;\n  height: 20px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n.focus-toggle:hover {\n  background-color: var(--surface-2);\n}\n.focus-toggle:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 1px;\n}\n@media not all and (min-width: 1201px) {\n  .focus-toggle {\n    display: none;\n  }\n}\n\n:root[focus-mode] .focus-toggle {\n  color: var(--secondary);\n  background-color: var(--surface-2);\n}\n\n.focus-rail {\n  display: none;\n  flex-direction: column;\n  gap: 10px;\n  align-self: flex-start;\n  box-sizing: border-box;\n  max-height: calc(100vh - var(--topbar-h) - var(--island-inset) * 2 - 4.75rem);\n  overflow-y: auto;\n  padding: 12px 10px;\n  border: 1px solid transparent;\n  border-radius: var(--radius-m);\n  transition: background-color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);\n}\n.focus-rail ol {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  min-width: 30px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n.focus-rail li {\n  margin: 0;\n}\n.focus-rail a {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-height: 12px;\n  padding: 0;\n  background: none;\n  color: var(--gray);\n  font-weight: 400;\n  text-decoration: none;\n}\n.focus-rail a:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 2px;\n}\n\n.focus-rail-caption {\n  font-family: var(--codeFont);\n  font-size: 0.6875rem;\n  font-weight: 500;\n  letter-spacing: 0.06em;\n  line-height: 1;\n  color: var(--gray);\n  transition: color var(--dur-fast) var(--ease);\n}\n\n.focus-rail-tick {\n  flex-shrink: 0;\n  width: 16px;\n  height: 2px;\n  border-radius: 1px;\n  background: var(--gray);\n  transition: width var(--dur-fast) var(--ease), height var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease);\n}\n\n.focus-rail li:not(.depth-0) .focus-rail-tick {\n  width: 10px;\n  margin-left: 6px;\n}\n\n@media (hover: hover) {\n  .focus-rail:hover {\n    cursor: pointer;\n  }\n  .focus-rail:hover .focus-rail-caption {\n    color: var(--darkgray);\n  }\n  .focus-rail:hover .focus-rail-tick {\n    width: 20px;\n    background: var(--darkgray);\n  }\n  .focus-rail:hover li:not(.depth-0) .focus-rail-tick {\n    width: 14px;\n  }\n}\n.focus-rail.open .focus-rail-caption {\n  color: var(--darkgray);\n}\n.focus-rail.open .focus-rail-tick {\n  width: 20px;\n  background: var(--darkgray);\n}\n.focus-rail.open li:not(.depth-0) .focus-rail-tick {\n  width: 14px;\n}\n\n.focus-rail li:has(> a.in-view):not(:has(~ li > a.in-view)) .focus-rail-tick {\n  width: 24px;\n  height: 3px;\n  background: var(--secondary);\n}\n.focus-rail li:has(> a.in-view):not(:has(~ li > a.in-view)) .focus-rail-label {\n  color: var(--secondary);\n  font-weight: 600;\n}\n\n.focus-rail-label {\n  font-family: var(--headerFont);\n  font-size: 0.8rem;\n  line-height: 1.4;\n}\n\n.focus-rail li:not(.depth-0) .focus-rail-label {\n  font-size: 0.75rem;\n}\n\n.focus-rail:not(.open) .focus-rail-label {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n}\n\n.focus-rail.open {\n  width: min(250px, 100% + var(--page-gutter) - 0.5rem);\n  padding: 16px 18px;\n  background: var(--light);\n  border-color: var(--lightgray);\n  box-shadow: var(--code-shadow);\n}\n.focus-rail.open ol {\n  gap: 8px;\n}\n.focus-rail.open a:hover .focus-rail-label {\n  color: var(--secondary);\n}\n\n@media (min-width: 1201px) {\n  :root[focus-mode] .focus-rail {\n    display: flex;\n  }\n}\n.focus-toast {\n  position: fixed;\n  left: 50%;\n  bottom: 2rem;\n  z-index: 10;\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.6rem 1rem;\n  border: 1px solid var(--lightgray);\n  border-radius: var(--radius-m);\n  background: var(--light);\n  box-shadow: var(--code-shadow);\n  color: var(--dark);\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  opacity: 0;\n  pointer-events: none;\n  transform: translateX(-50%);\n  transition: opacity var(--dur-fast) var(--ease);\n}\n.focus-toast.show {\n  opacity: 1;\n}\n.focus-toast kbd {\n  padding: 1px 6px;\n  border: 1px solid var(--gray);\n  border-radius: 5px;\n  font-family: inherit;\n}\n\n.focus-toast-sep {\n  color: var(--gray);\n}";

// src/components/scripts/focusMode.inline.ts
var focusMode_inline_default = `var m="focus-mode",E="(min-width: 1201px)",w=".center > article :is(h1, h2, h3, h4, h5, h6, p, li, pre, blockquote, table, figure)",T='<span>Panels hidden</span><span class="focus-toast-sep" aria-hidden="true">\\xB7</span><span><kbd>\\u2318\\\\</kbd> to show</span>',r=document.documentElement,f=n=>{try{return n()}catch{return null}};r.toggleAttribute("focus-mode",f(()=>localStorage.getItem(m))==="on");var p=0,v=!1,g=()=>{};function y(){let n=document.querySelector(".focus-toast");return n||(n=document.createElement("div"),n.className="focus-toast",n.setAttribute("role","status"),document.body.append(n)),n}function L(n){let o=y();clearTimeout(p),o.classList.remove("show"),o.textContent="",n&&(p=window.setTimeout(()=>{r.hasAttribute("focus-mode")&&(o.innerHTML=T,o.classList.add("show"),p=window.setTimeout(()=>o.classList.remove("show"),2500))},100))}function A(){let n=document.querySelector(".topbar")?.getBoundingClientRect().bottom??0,o=null;for(let t of document.querySelectorAll(w)){if(o&&!o.contains(t))break;t.getBoundingClientRect().bottom>n&&(o=t)}return o&&{el:o,top:o.getBoundingClientRect().top}}function S(n){let o=A();n&&document.activeElement?.closest(".sidebar.left")&&document.querySelector(".focus-toggle")?.focus(),r.toggleAttribute("focus-mode",n),f(()=>localStorage.setItem(m,n?"on":"off"));for(let t of document.querySelectorAll(".focus-toggle"))t.setAttribute("aria-pressed",String(n));g(),o&&window.scrollBy({top:o.el.getBoundingClientRect().top-o.top,behavior:"instant"}),L(n)}function k(){let n=document.querySelectorAll(".sidebar.right .toc-content a"),o=n[0]?.closest(".sidebar");if(!o)return;let t=document.createElement("nav");t.className="focus-rail",t.setAttribute("aria-labelledby","focus-rail-caption"),t.innerHTML='<span id="focus-rail-caption" class="focus-rail-caption">TOC</span><ol></ol>';let l=t.lastElementChild;for(let e of n){let a=document.createElement("li");a.className=e.parentElement?.className??"",a.innerHTML='<a><span class="focus-rail-tick" aria-hidden="true"></span><span class="focus-rail-label"></span></a>';let d=a.firstElementChild;d.setAttribute("href",e.getAttribute("href")??""),d.dataset.for=e.dataset.for??"",d.className=e.className,d.lastElementChild.textContent=e.textContent,l.append(a)}o.prepend(t);let i=0,s=(e,a=!1)=>{clearTimeout(i),t.classList.toggle("open",e),t.classList.toggle("pinned",e&&a)},c=(e,a)=>{clearTimeout(i),i=window.setTimeout(()=>s(a),e)},u=()=>t.classList.contains("pinned");g=()=>s(!1),t.addEventListener("pointerenter",e=>{e.pointerType!=="touch"&&(t.classList.contains("open")?clearTimeout(i):c(300,!0))}),t.addEventListener("pointerleave",e=>{e.pointerType!=="touch"&&!u()&&c(500,!1)}),t.addEventListener("click",e=>{let a=e.target.closest("a");u()||a&&(e.detail===0||e.metaKey||e.ctrlKey||e.shiftKey)?s(!1):(e.preventDefault(),s(!0,!0))}),t.addEventListener("focusin",e=>{e.target.matches(":focus-visible")&&s(!0,u())}),t.addEventListener("focusout",e=>{!u()&&!t.contains(e.relatedTarget)&&s(!1)});let b=e=>{t.contains(e.target)||s(!1)},h=e=>{e.key==="Escape"&&t.classList.contains("open")&&s(!1)};document.addEventListener("pointerdown",b),document.addEventListener("keydown",h),window.addCleanup(()=>{clearTimeout(i),document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",h),g=()=>{},t.remove()})}document.addEventListener("nav",()=>{let n=document.querySelectorAll(".focus-toggle");if(!n.length)return;let o=r.hasAttribute("focus-mode"),t=()=>S(!r.hasAttribute("focus-mode"));for(let s of n)s.setAttribute("aria-pressed",String(o)),s.addEventListener("click",t),window.addCleanup(()=>s.removeEventListener("click",t));document.querySelector(".focus-rail")?.remove(),k(),y();let l=s=>{if(s.code!=="Backslash"||!(s.metaKey||s.ctrlKey)||s.shiftKey||s.altKey||s.isComposing||s.repeat)return;let c=document.activeElement;c instanceof HTMLElement&&(c.isContentEditable||c.matches("input, textarea, select"))||document.querySelector("dialog[open], .search-container.active")||!matchMedia(E).matches||(s.preventDefault(),t())};document.addEventListener("keydown",l),window.addCleanup(()=>document.removeEventListener("keydown",l));let i=!v&&f(()=>sessionStorage.getItem(m))===null;v=!0,f(()=>sessionStorage.setItem(m,"seen")),i&&o&&matchMedia(E).matches&&L(!0)});
`;

// ../_shared/topics.ts
var TOPICS = [
  { key: "computer-science", label: "Computer Science" },
  { key: "data-engineering", label: "Data Engineering" },
  { key: "data-science", label: "Data Science" },
  { key: "gis", label: "GIS" },
  { key: "programming", label: "Programming" },
  { key: "finance-property", label: "Finance & Property" },
  { key: "tools", label: "Tools" }
];
Object.fromEntries(TOPICS.map((t2) => [t2.key, t2.label]));

// ../_shared/notes.ts
function isRealNote(slug) {
  if (!slug) return false;
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
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

// src/components/FocusMode.tsx
var FocusMode = ({ fileData }) => isRealNote(fileData.slug) ? /* @__PURE__ */ u2(
  "button",
  {
    type: "button",
    class: "focus-toggle",
    "aria-pressed": "false",
    "aria-label": "Focus mode",
    "aria-keyshortcuts": "Meta+\\ Control+\\",
    title: "Focus mode \u2318\\",
    children: /* @__PURE__ */ u2("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", children: [
      /* @__PURE__ */ u2("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }),
      /* @__PURE__ */ u2("path", { d: "M9 4v16M15 4v16" })
    ] })
  }
) : /* @__PURE__ */ u2(S, {});
FocusMode.css = focusMode_default;
FocusMode.beforeDOMLoaded = focusMode_inline_default;
var FocusMode_default = (() => FocusMode);

export { FocusMode_default as FocusMode };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map