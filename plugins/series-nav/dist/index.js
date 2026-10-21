// src/util/path.ts
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  return endsWith(s2, suffix) ? s2.slice(0, -suffix.length) : s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) s2 = s2.substring(1);
  if (!onlyStripPrefix && s2.endsWith("/")) s2 = s2.slice(0, -1);
  return s2;
}
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) return "";
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) joined = "/" + joined;
  if (last?.endsWith("/")) joined = joined + "/";
  return joined;
}
function pathToRoot(slug) {
  const rootPath = slug.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  return rootPath.length === 0 ? "." : rootPath;
}
function resolveRelative(current, target) {
  return joinSegments(pathToRoot(current), simplifySlug(target));
}

// ../_shared/notes.ts
function isRealNote(slug) {
  if (!slug) return false;
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
function isListedNote(file) {
  return isRealNote(file.slug) && file.unlisted !== true && file.frontmatter?.unlisted !== true;
}

// src/components/series.ts
var defaultOptions = {
  seriesTitles: {}
};
function seriesOf(file) {
  const raw = file.frontmatter?.series;
  return raw == null ? "" : String(raw).trim();
}
function seriesIndexOf(file) {
  const raw = file.frontmatter?.series_index;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : void 0;
  if (typeof raw === "string" && raw.trim() !== "") {
    const index = Number(raw);
    return Number.isFinite(index) ? index : void 0;
  }
  return void 0;
}
function toEntry(file) {
  const index = seriesIndexOf(file);
  if (index === void 0 || !isListedNote(file)) return void 0;
  const question = file.frontmatter?.series_question;
  return {
    file,
    index,
    title: String(file.frontmatter?.title ?? file.slug),
    question: question == null || String(question).trim() === "" ? void 0 : String(question).trim()
  };
}
function getSeriesContext(fileData, allFiles, opts) {
  const series = seriesOf(fileData);
  if (!series || !fileData.slug) return void 0;
  const entries = allFiles.filter((f3) => seriesOf(f3) === series).map(toEntry).filter((e2) => e2 !== void 0).sort(
    (a2, b2) => a2.index - b2.index || a2.title.localeCompare(b2.title, "ko", { numeric: true })
  );
  const current = entries.findIndex((e2) => e2.file.slug === fileData.slug);
  if (current === -1) return void 0;
  return {
    title: opts.seriesTitles[series] ?? series,
    entries,
    current,
    prev: entries[current - 1],
    next: entries[current + 1]
  };
}

// src/components/styles/seriesBox.scss
var seriesBox_default = ".series-box {\n  margin: 1rem 0 1.5rem;\n  padding: 0.7rem 1rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 6px;\n  font-size: 0.85rem;\n  min-width: 0;\n}\n.series-box .series-box-header {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 0.2rem 0.8rem;\n}\n.series-box .series-box-title {\n  font-weight: 600;\n  color: var(--dark);\n}\n.series-box .series-box-position {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--secondary);\n  font-variant-numeric: tabular-nums;\n}\n.series-box .series-box-adjacent {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.8rem;\n  margin-top: 0.5rem;\n}\n.series-box .series-box-link {\n  min-width: 0;\n  color: var(--darkgray);\n  line-height: 1.4;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.series-box .series-box-link:hover {\n  color: var(--tertiary);\n}\n.series-box .series-box-link.next {\n  text-align: right;\n}\n.series-box .series-box-details {\n  margin-top: 0.5rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid var(--lightgray);\n}\n.series-box .series-box-details summary {\n  cursor: pointer;\n  width: fit-content;\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.series-box .series-box-details summary:hover {\n  color: var(--secondary);\n}\n.series-box .series-box-list {\n  list-style: none;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n}\n.series-box .series-box-list li {\n  display: flex;\n  flex-direction: column;\n  gap: 0.1rem;\n  margin: 0;\n  min-width: 0;\n}\n.series-box .series-box-entry {\n  line-height: 1.4;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.series-box strong.series-box-entry {\n  color: var(--dark);\n}\n.series-box .series-box-question {\n  font-size: 0.75rem;\n  color: var(--gray);\n  line-height: 1.4;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}";
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

// src/components/SeriesBox.tsx
var SeriesBox_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const SeriesBox = ({ fileData, allFiles }) => {
    const ctx = getSeriesContext(fileData, allFiles, opts);
    if (!ctx) return /* @__PURE__ */ u2(S, {});
    const slug = fileData.slug;
    const { title, entries, current, prev, next } = ctx;
    return /* @__PURE__ */ u2("nav", { class: "series-box", "aria-label": title, children: [
      /* @__PURE__ */ u2("div", { class: "series-box-header", children: [
        /* @__PURE__ */ u2("span", { class: "series-box-title", children: title }),
        /* @__PURE__ */ u2("span", { class: "series-box-position", children: [
          entries[current].index,
          "\uD3B8"
        ] })
      ] }),
      (prev || next) && /* @__PURE__ */ u2("div", { class: "series-box-adjacent", children: [
        prev ? /* @__PURE__ */ u2("a", { class: "series-box-link prev", href: resolveRelative(slug, prev.file.slug), children: [
          "\u2190 ",
          prev.index,
          ". ",
          prev.title
        ] }) : /* @__PURE__ */ u2("span", {}),
        next ? /* @__PURE__ */ u2("a", { class: "series-box-link next", href: resolveRelative(slug, next.file.slug), children: [
          next.index,
          ". ",
          next.title,
          " \u2192"
        ] }) : /* @__PURE__ */ u2("span", {})
      ] }),
      /* @__PURE__ */ u2("details", { class: "series-box-details", children: [
        /* @__PURE__ */ u2("summary", { children: "\uBAA9\uB85D \uBCF4\uAE30" }),
        /* @__PURE__ */ u2("ol", { class: "series-box-list", children: entries.map((e2, i2) => /* @__PURE__ */ u2("li", { class: i2 === current ? "current" : void 0, children: [
          i2 === current ? /* @__PURE__ */ u2("strong", { class: "series-box-entry", "aria-current": "page", children: [
            e2.index,
            ". ",
            e2.title
          ] }) : /* @__PURE__ */ u2("a", { class: "series-box-entry", href: resolveRelative(slug, e2.file.slug), children: [
            e2.index,
            ". ",
            e2.title
          ] }),
          e2.question && /* @__PURE__ */ u2("span", { class: "series-box-question", children: e2.question })
        ] })) })
      ] })
    ] });
  };
  SeriesBox.css = seriesBox_default;
  return SeriesBox;
});

// src/components/styles/seriesPager.scss
var seriesPager_default = ".series-pager {\n  margin-top: 3rem;\n  padding-top: 2rem;\n  border-top: 1px solid var(--lightgray);\n}\n.series-pager .series-pager-inner {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.8rem;\n}\n.series-pager .series-pager-link {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  min-width: 0;\n  padding: 0.8rem 1rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 6px;\n  transition: border-color var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease);\n}\n.series-pager .series-pager-link:hover {\n  border-color: var(--secondary);\n  background: rgba(var(--accent-rgb), 0.04);\n}\n.series-pager .series-pager-link.next {\n  text-align: right;\n}\n.series-pager .series-pager-link .direction {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--secondary);\n  letter-spacing: 0.06em;\n}\n.series-pager .series-pager-link .ptitle {\n  font-size: 0.85rem;\n  color: var(--darkgray);\n  font-weight: 500;\n  line-height: 1.4;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}";

// src/components/SeriesPager.tsx
var SeriesPager_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const SeriesPager = ({ fileData, allFiles }) => {
    const ctx = getSeriesContext(fileData, allFiles, opts);
    if (!ctx || !ctx.prev && !ctx.next) return /* @__PURE__ */ u2(S, {});
    const slug = fileData.slug;
    const { title, prev, next } = ctx;
    return /* @__PURE__ */ u2("nav", { class: "series-pager", "aria-label": `${title} \uC774\uC804\xB7\uB2E4\uC74C \uD3B8`, children: /* @__PURE__ */ u2("div", { class: "series-pager-inner", children: [
      prev ? /* @__PURE__ */ u2("a", { class: "series-pager-link prev", href: resolveRelative(slug, prev.file.slug), children: [
        /* @__PURE__ */ u2("span", { class: "direction", children: "\u2190 \uC774\uC804 \uD3B8" }),
        /* @__PURE__ */ u2("span", { class: "ptitle", children: [
          prev.index,
          ". ",
          prev.title
        ] })
      ] }) : /* @__PURE__ */ u2("div", {}),
      next ? /* @__PURE__ */ u2("a", { class: "series-pager-link next", href: resolveRelative(slug, next.file.slug), children: [
        /* @__PURE__ */ u2("span", { class: "direction", children: "\uB2E4\uC74C \uD3B8 \u2192" }),
        /* @__PURE__ */ u2("span", { class: "ptitle", children: [
          next.index,
          ". ",
          next.title
        ] })
      ] }) : /* @__PURE__ */ u2("div", {})
    ] }) });
  };
  SeriesPager.css = seriesPager_default;
  return SeriesPager;
});

export { SeriesBox_default as SeriesBox, SeriesPager_default as SeriesPager };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map