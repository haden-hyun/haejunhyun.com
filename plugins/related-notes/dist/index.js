// ../_shared/path.ts
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

// src/components/styles/relatedNotes.scss
var relatedNotes_default = ".related-notes {\n  display: flex;\n  flex-direction: column;\n}\n.related-notes > h3 {\n  margin: 0;\n}\n.related-notes > ul {\n  list-style: none;\n  padding: 0;\n  margin: 0.5rem 0;\n}\n.related-notes > ul > li > a {\n  background-color: transparent;\n}";

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
function isListedNote(file) {
  return isRealNote(file.slug) && file.unlisted !== true && file.frontmatter?.unlisted !== true;
}

// ../_shared/series.ts
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

// src/components/score.ts
var LINK = 100;
var SERIES = 50;
var SERIES_STEP = 10;
var SERIES_FLOOR = 20;
var TAG = 10;
var MIN_SCORE = 10;
var dirOf = (slug) => slug.split("/").slice(0, -1).join("/");
function isFolderMirrorTag(slug, tag) {
  const dir = dirOf(slug);
  return dir === tag || dir.startsWith(tag + "/");
}
function commonDepth(a2, b2) {
  const pa = a2.split("/");
  const pb = b2.split("/");
  let i2 = 0;
  while (i2 < pa.length - 1 && i2 < pb.length - 1 && pa[i2] === pb[i2]) i2++;
  return i2;
}
function scoreRelated(self, notes, backlinkSlugs) {
  const df = /* @__PURE__ */ new Map();
  for (const n2 of notes) for (const t2 of new Set(n2.tags)) df.set(t2, (df.get(t2) ?? 0) + 1);
  const conceptTags = new Set(self.tags.filter((t2) => !isFolderMirrorTag(self.slug, t2)));
  const outgoing = new Set(self.links);
  const selfDir = dirOf(self.slug);
  const seriesRank = new Map(
    notes.filter((n2) => self.series && n2.series === self.series && n2.seriesIndex !== void 0).sort((a2, b2) => a2.seriesIndex - b2.seriesIndex).map((n2, i2) => [n2.slug, i2])
  );
  const scored = [];
  for (const n2 of notes) {
    if (n2.slug === self.slug) continue;
    let score = 0;
    if (outgoing.has(n2.slug) || backlinkSlugs.has(n2.slug)) score += LINK;
    if (self.series && n2.series === self.series) {
      const a2 = seriesRank.get(self.slug);
      const b2 = seriesRank.get(n2.slug);
      const dist = a2 !== void 0 && b2 !== void 0 ? Math.abs(a2 - b2) : Number.POSITIVE_INFINITY;
      score += Math.max(SERIES - SERIES_STEP * (dist - 1), SERIES_FLOOR);
    }
    for (const t2 of new Set(n2.tags)) {
      if (conceptTags.has(t2)) score += TAG * Math.log2(notes.length / (df.get(t2) ?? 1));
    }
    if (score >= MIN_SCORE) scored.push({ note: n2, score });
  }
  const sibling = (n2) => dirOf(n2.slug) === selfDir ? 1 : 0;
  return scored.sort(
    (a2, b2) => b2.score - a2.score || sibling(a2.note) - sibling(b2.note) || commonDepth(b2.note.slug, self.slug) - commonDepth(a2.note.slug, self.slug) || a2.note.title.localeCompare(b2.note.title, "ko", { numeric: true })
  );
}
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

// src/components/RelatedNotes.tsx
var defaultOptions = {
  limit: 5,
  excludeBacklinks: true
};
var tagsOf = (f3) => {
  const raw = f3.frontmatter?.tags;
  return Array.isArray(raw) ? raw.map(String) : [];
};
var RelatedNotes_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const RelatedNotes = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    const current = fileData;
    const currentSlug = current.slug;
    if (!currentSlug || !isListedNote(current)) return null;
    const files = allFiles;
    const notes = files.filter((f3) => isListedNote(f3)).map((f3) => ({
      slug: f3.slug,
      links: f3.links ?? [],
      tags: tagsOf(f3),
      series: seriesOf(f3),
      seriesIndex: seriesIndexOf(f3),
      title: String(f3.frontmatter?.title ?? f3.slug)
    }));
    const self = notes.find((n2) => n2.slug === currentSlug);
    if (!self) return null;
    const backlinkSlugs = new Set(
      files.filter((f3) => f3.unlisted !== true && f3.links?.includes(currentSlug)).map((f3) => f3.slug)
    );
    const related = scoreRelated(self, notes, backlinkSlugs).filter((r2) => !(opts.excludeBacklinks && backlinkSlugs.has(r2.note.slug))).slice(0, opts.limit);
    if (related.length === 0) return null;
    return /* @__PURE__ */ u2("div", { class: `${displayClass ?? ""} related-notes`, children: [
      /* @__PURE__ */ u2("h3", { children: "Related" }),
      /* @__PURE__ */ u2("ul", { children: related.map(({ note }) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { class: "internal", href: resolveRelative(currentSlug, note.slug), children: note.title }) })) })
    ] });
  };
  RelatedNotes.css = relatedNotes_default;
  return RelatedNotes;
});

export { RelatedNotes_default as RelatedNotes };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map