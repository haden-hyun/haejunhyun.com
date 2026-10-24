// ../_shared/noteMeta.ts
function inRanges(code, ranges) {
  return ranges.some(([lo, hi]) => lo <= code && code <= hi);
}
var isCJK = (c2) => typeof c2 === "string" && inRanges(c2.charCodeAt(0), [
  [12352, 12447],
  [19968, 40959],
  [44032, 55203],
  [131072, 191456]
]);
var isWordBound = (c2) => typeof c2 === "string" && " \n\r	".includes(c2);
var isPunctuation = (c2) => typeof c2 === "string" && inRanges(c2.charCodeAt(0), [
  [33, 47],
  [58, 64],
  [91, 96],
  [123, 126],
  [12288, 12351],
  [65280, 65519]
]);
function countWords(text) {
  let words = 0;
  let start = 0;
  let end = text.length - 1;
  while (isWordBound(text[start])) start++;
  while (end >= 0 && isWordBound(text[end])) end--;
  const t2 = `${text}
`;
  for (let i2 = start; i2 <= end; i2++) {
    if (isCJK(t2[i2]) || !isWordBound(t2[i2]) && (isWordBound(t2[i2 + 1]) || isCJK(t2[i2 + 1]))) {
      words++;
    }
    if (isCJK(t2[i2])) {
      while (i2 <= end && (isPunctuation(t2[i2 + 1]) || isWordBound(t2[i2 + 1]))) i2++;
    }
  }
  return words;
}
function readingMinutes(text) {
  return text ? Math.ceil(countWords(text) / 200) : 0;
}
function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? void 0 : value;
  if (typeof value !== "string" && typeof value !== "number") return void 0;
  const d2 = new Date(value);
  return Number.isNaN(d2.getTime()) ? void 0 : d2;
}
function formatYmd(date) {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}
function getNoteDates(file) {
  const created = file.dates?.created ?? file.dates?.published;
  const differs = (d2, ...others) => d2 && !others.some((o2) => o2 && formatYmd(o2) === formatYmd(d2)) ? d2 : void 0;
  const revised = differs(toDate(file.frontmatter?.posted), created);
  const updated = differs(file.dates?.modified, created, revised);
  return { created, revised, updated };
}
function getListDate(file) {
  const { created, revised } = getNoteDates(file);
  return revised ?? created;
}

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
var TOPIC_NAMES = Object.fromEntries(TOPICS.map((t2) => [t2.key, t2.label]));

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
function titleCase(key) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function topicName(slug) {
  const key = slug.split("/")[0] ?? "";
  return TOPIC_NAMES[key] ?? titleCase(key);
}
var byListDateDesc = (a2, b2) => (getListDate(b2)?.getTime() ?? 0) - (getListDate(a2)?.getTime() ?? 0);
var GROUP_MIN = 3;
function buildRecentRows(sorted, limit) {
  const keyOf = (f3) => {
    const parts = (f3.slug ?? "").split("/");
    const d2 = getListDate(f3);
    if (parts.length < 3 || !d2) return void 0;
    return `${formatYmd(d2)}|${parts.slice(0, -1).join("/")}`;
  };
  const members = /* @__PURE__ */ new Map();
  for (const f3 of sorted) {
    const key = keyOf(f3);
    if (key) members.set(key, [...members.get(key) ?? [], f3]);
  }
  const rows = [];
  const emitted = /* @__PURE__ */ new Set();
  for (const f3 of sorted) {
    if (rows.length >= limit) break;
    const key = keyOf(f3);
    const group = key ? members.get(key) : void 0;
    if (key && group && group.length >= GROUP_MIN) {
      if (emitted.has(key)) continue;
      emitted.add(key);
      rows.push({ kind: "group", folder: key.split("|")[1], files: group });
    } else {
      rows.push({ kind: "note", file: f3 });
    }
  }
  return rows;
}

// src/util/path.ts
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  return endsWith(s2, suffix) ? s2.slice(0, -suffix.length) : s2;
}
function stripSlashes(s2, onlyStripPrefix = false) {
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
  let rootPath = slug.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  if (rootPath.length === 0) rootPath = ".";
  return rootPath;
}
function resolveRelative(current, target) {
  const simplified = simplifySlug(target);
  const rootPath = pathToRoot(current);
  return joinSegments(rootPath, simplified);
}

// src/components/styles/featured.scss
var featured_default = ".page-header > .popover-hint:has(> .featured-section) {\n  display: grid;\n  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);\n  column-gap: 56px;\n  align-items: start;\n}\n.page-header > .popover-hint:has(> .featured-section) > * {\n  grid-column: 1/-1;\n}\n.page-header > .popover-hint:has(> .featured-section) > .recent-notes {\n  grid-column: 1;\n}\n.page-header > .popover-hint:has(> .featured-section) > .topic-grid-section {\n  grid-column: 2;\n}\n@media all and (max-width: 800px) {\n  .page-header > .popover-hint:has(> .featured-section) {\n    grid-template-columns: minmax(0, 1fr);\n  }\n  .page-header > .popover-hint:has(> .featured-section) > .recent-notes,\n  .page-header > .popover-hint:has(> .featured-section) > .topic-grid-section {\n    grid-column: 1;\n  }\n}\n\n.featured-section {\n  margin: 0;\n  padding: 0 0 96px;\n}\n@media all and (max-width: 800px) {\n  .featured-section {\n    padding-bottom: 48px;\n  }\n}\n\n.featured-label {\n  margin: 0;\n  padding: 0 0 14px;\n  border: none;\n  border-bottom: 1px solid var(--lightgray);\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  letter-spacing: 0;\n  color: var(--secondary);\n}\n@media all and (max-width: 800px) {\n  .featured-label {\n    padding-bottom: 10px;\n  }\n}\n\n.featured-tracks {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.featured-tracks li {\n  margin: 0;\n}\n\n.featured-row {\n  display: grid;\n  grid-template-columns: 32px minmax(0, 1fr);\n  gap: 12px;\n  align-items: baseline;\n  padding: 14px 10px;\n  border-bottom: 1px solid var(--lightgray);\n  color: inherit;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.featured-row:hover {\n  background: rgba(var(--accent-rgb), 0.1);\n}\n.featured-row:hover .featured-title {\n  color: var(--secondary);\n}\n\n.featured-tracks > li:nth-child(even) > .featured-row:not(:hover) {\n  background: rgba(var(--accent-rgb), 0.035);\n}\n\n.featured-no {\n  font-family: var(--codeFont);\n  font-size: 12px;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n}\n\n.featured-body {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n\n.featured-title {\n  font-family: var(--headerFont);\n  font-size: 1.06rem;\n  font-weight: 700;\n  line-height: 1.4;\n  color: var(--dark);\n  word-break: keep-all;\n}\n\n.featured-desc {\n  display: -webkit-box;\n  margin-top: 0.2rem;\n  max-width: 46em;\n  overflow: hidden;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 1;\n  font-size: 0.92rem;\n  line-height: 1.6;\n  color: var(--darkgray);\n  word-break: keep-all;\n}\n\n.is-lead > .featured-row {\n  padding-block: 1.25rem;\n}\n.is-lead > .featured-row .featured-title {\n  font-size: clamp(1.35rem, 3vw, 1.75rem);\n  font-weight: 900;\n  line-height: 1.3;\n}\n.is-lead > .featured-row .featured-desc {\n  margin-top: 0.35rem;\n  -webkit-line-clamp: 2;\n  font-size: 0.97rem;\n  line-height: 1.65;\n}\n\n.featured-meta {\n  margin-top: 0.3rem;\n  font-size: 13px;\n  color: var(--gray);\n}";
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

// src/components/FeaturedNotes.tsx
var MAX_SLOTS = 4;
function getTime(f3) {
  return getListDate(f3)?.getTime() ?? 0;
}
function getRecentSlugs(files, limit) {
  const sorted = files.filter((f3) => f3.frontmatter?.title).sort(byListDateDesc);
  const rows = buildRecentRows(sorted, limit);
  return new Set(rows.flatMap((r2) => r2.kind === "note" ? [r2.file] : r2.files).map((f3) => f3.slug));
}
function pickRoundRobin(files, count, exclude) {
  const byTopic = /* @__PURE__ */ new Map();
  for (const f3 of files) {
    const slug = f3.slug ?? "";
    if (exclude.has(slug)) continue;
    const topic = slug.split("/")[0];
    if (!topic) continue;
    const list = byTopic.get(topic) ?? [];
    list.push(f3);
    byTopic.set(topic, list);
  }
  for (const list of byTopic.values()) list.sort((a2, b2) => getTime(b2) - getTime(a2));
  const topicOrder = [...byTopic.keys()].sort(
    (a2, b2) => getTime(byTopic.get(b2)[0]) - getTime(byTopic.get(a2)[0])
  );
  const picked = [];
  let round = 0;
  while (picked.length < count) {
    let addedThisRound = false;
    for (const topic of topicOrder) {
      if (picked.length >= count) break;
      const list = byTopic.get(topic);
      if (round < list.length) {
        picked.push(list[round]);
        addedThisRound = true;
      }
    }
    round++;
    if (!addedThisRound) break;
  }
  return picked;
}
var defaultOptions = {
  recentExcludeCount: 5,
  slugs: []
};
function resolveSlugs(slugs, files, recent) {
  const bySlug = new Map(files.map((f3) => [f3.slug, f3]));
  const resolved = [];
  const seen = /* @__PURE__ */ new Set();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      console.warn(`[featured-notes] \uC911\uBCF5\uB41C \uC2AC\uB7EC\uADF8\uB97C \uAC74\uB108\uB701\uB2C8\uB2E4: "${slug}"`);
      continue;
    }
    seen.add(slug);
    const file = bySlug.get(slug);
    if (!file) {
      console.warn(`[featured-notes] \uC2AC\uB7EC\uADF8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC5B4 \uAC74\uB108\uB701\uB2C8\uB2E4: "${slug}"`);
      continue;
    }
    if (recent.has(slug)) {
      console.warn(`[featured-notes] Recent Notes\uC5D0 \uC774\uBBF8 \uB098\uC640 \uAC74\uB108\uB701\uB2C8\uB2E4: "${slug}"`);
      continue;
    }
    resolved.push(file);
  }
  if (resolved.length > MAX_SLOTS) {
    console.warn(
      `[featured-notes] \uC2AC\uB86F\uC740 ${MAX_SLOTS}\uAC1C\uC778\uB370 ${resolved.length}\uAC1C\uAC00 \uC9C0\uC815\uB410\uC2B5\uB2C8\uB2E4. \uB4A4 ${resolved.length - MAX_SLOTS}\uAC1C\uB294 \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`
    );
  }
  return resolved.slice(0, MAX_SLOTS);
}
var FeaturedNotes_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const FeaturedNotes = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles.filter((f3) => isListedNote(f3));
    const recent = getRecentSlugs(files, opts.recentExcludeCount);
    const curated = resolveSlugs(opts.slugs, files, recent);
    const exclude = /* @__PURE__ */ new Set([...curated.map((f3) => f3.slug), ...recent]);
    const needed = MAX_SLOTS - curated.length;
    const autoFilled = needed > 0 ? pickRoundRobin(files, needed, exclude).sort((a2, b2) => getTime(b2) - getTime(a2)) : [];
    const selected = [...curated, ...autoFilled];
    if (selected.length === 0) return /* @__PURE__ */ u2(S, {});
    const pad = (n2) => String(n2).padStart(2, "0");
    const titleOf = (f3) => f3.frontmatter?.title ?? "Untitled";
    const descOf = (f3) => f3.frontmatter?.description ?? "";
    return /* @__PURE__ */ u2("section", { class: `${displayClass ?? ""} featured-section`, "aria-labelledby": "featured-h", children: [
      /* @__PURE__ */ u2("h2", { id: "featured-h", class: "featured-label", children: "Featured" }),
      /* @__PURE__ */ u2("ol", { class: "featured-tracks", children: selected.map((item, i2) => {
        const minutes = readingMinutes(item.text);
        const meta = [topicName(item.slug ?? ""), minutes ? `${minutes} min` : ""].filter(Boolean).join(" \xB7 ");
        const desc = descOf(item);
        return /* @__PURE__ */ u2("li", { class: i2 === 0 ? "is-lead" : void 0, children: /* @__PURE__ */ u2("a", { class: "featured-row", href: resolveRelative(fileData.slug, item.slug), children: [
          /* @__PURE__ */ u2("span", { class: "featured-no", children: pad(i2 + 1) }),
          /* @__PURE__ */ u2("span", { class: "featured-body", children: [
            /* @__PURE__ */ u2("span", { class: "featured-title", children: titleOf(item) }),
            desc && /* @__PURE__ */ u2("span", { class: "featured-desc", children: desc }),
            /* @__PURE__ */ u2("span", { class: "featured-meta", children: meta })
          ] })
        ] }) });
      }) })
    ] });
  };
  FeaturedNotes.css = featured_default;
  return FeaturedNotes;
});

export { FeaturedNotes_default as FeaturedNotes };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map