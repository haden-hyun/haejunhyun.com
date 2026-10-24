// src/components/styles/topicsContent.scss
var topicsContent_default = ".topics-index {\n  container-type: inline-size;\n}\n.topics-index ul.tp-rows {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n.topics-index ul.tp-rows > li {\n  margin: 0;\n}\n\n.topics-index .tp-meta {\n  margin: 1.5rem 0 0;\n  font-size: 0.85rem;\n  line-height: 1.5;\n  color: var(--gray);\n}\n\n.topics-index .tp-jump ul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin: 0.75rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n.topics-index .tp-jump ul a {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  min-height: 2.25rem;\n  padding: 0 0.85rem;\n  border-radius: var(--radius-s);\n  background: rgba(var(--accent-rgb), 0.08);\n  font-family: var(--headerFont);\n  font-size: 0.9rem;\n  font-weight: 700;\n  color: var(--secondary);\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n@media (hover: hover) and (pointer: fine) {\n  .topics-index .tp-jump ul a:hover {\n    background: rgba(var(--accent-rgb), 0.16);\n  }\n  .topics-index .tp-jump ul a:hover .tp-jump-count {\n    color: var(--darkgray);\n  }\n}\n.topics-index .tp-jump ul a:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}\n@media all and (max-width: 600px) {\n  .topics-index .tp-jump ul a {\n    min-height: 2.75rem;\n  }\n}\n.topics-index .tp-jump ul .tp-jump-count {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  color: var(--gray);\n}\n\n.topics-index .tp-section {\n  margin-top: 2.5rem;\n}\n\n.topics-index .tp-label {\n  display: flex;\n  align-items: baseline;\n  gap: 0.75rem;\n  padding-bottom: 10px;\n  border-bottom: 1px solid var(--lightgray);\n}\n.topics-index .tp-label h2 {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  line-height: 1.3;\n  color: var(--secondary);\n  scroll-margin-top: 1.5rem;\n}\n\n.topics-index .tp-count {\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  line-height: 1.3;\n  font-variant-numeric: tabular-nums;\n  color: var(--gray);\n}\n\n.topics-index .tp-open {\n  display: inline-flex;\n  align-items: center;\n  min-height: 2.75rem;\n  margin: -0.75rem 0 -0.75rem auto;\n  font-family: var(--headerFont);\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--secondary);\n  text-decoration: none;\n  white-space: nowrap;\n}\n@media (hover: hover) and (pointer: fine) {\n  .topics-index .tp-open:hover {\n    text-decoration: underline;\n    text-underline-offset: 3px;\n  }\n}\n.topics-index .tp-open:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}\n\n.topics-index .tp-row {\n  display: grid;\n  grid-template-columns: 6.25rem minmax(0, 1fr) auto;\n  column-gap: 14px;\n  align-items: baseline;\n  box-sizing: border-box;\n  min-height: 44px;\n  padding: 0.6rem 0.4rem;\n  border-bottom: 1px solid var(--lightgray);\n  font-weight: 400;\n  color: var(--darkgray);\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.topics-index .tp-row:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: -2px;\n}\n\n.topics-index li:nth-child(even) > .tp-row {\n  background: rgba(var(--accent-rgb), 0.035);\n}\n\n@media (hover: hover) and (pointer: fine) {\n  .topics-index li > .tp-row:hover {\n    background: rgba(var(--accent-rgb), 0.1);\n  }\n  .topics-index li > .tp-row:hover .tp-title {\n    text-decoration: underline;\n    text-underline-offset: 3px;\n  }\n}\n.topics-index li > .tp-row:active {\n  background: rgba(var(--accent-rgb), 0.1);\n}\n\n.topics-index .tp-kind,\n.topics-index .tp-date {\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  font-weight: 400;\n  line-height: 1.3;\n  font-variant-numeric: tabular-nums;\n  color: var(--gray);\n  white-space: nowrap;\n}\n\n.topics-index .tp-end {\n  justify-self: end;\n}\n\n.topics-index .tp-go {\n  font-family: var(--headerFont);\n  font-size: 0.82rem;\n  font-weight: 600;\n  line-height: 1.3;\n  color: var(--secondary);\n  white-space: nowrap;\n}\n\n.topics-index .tp-title {\n  font-family: var(--headerFont);\n  font-size: 0.95rem;\n  font-weight: 620;\n  line-height: 1.45;\n  color: var(--dark);\n  word-break: keep-all;\n}\n\n.topics-index .tp-row.is-series .tp-title {\n  font-weight: 700;\n}\n\n.topics-index .tp-desc {\n  grid-column: 2/-1;\n  margin-top: 0.15rem;\n  overflow: hidden;\n  font-size: 0.82rem;\n  line-height: 1.55;\n  color: var(--darkgray);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n@container (max-width: 600px) {\n  .topics-index .tp-open-word {\n    display: none;\n  }\n  .topics-index .tp-row {\n    grid-template-columns: minmax(0, 1fr) auto;\n    row-gap: 2px;\n    padding: 0.7rem 0.25rem;\n  }\n  .topics-index .tp-row .tp-kind {\n    grid-column: 1/-1;\n  }\n  .topics-index .tp-row .tp-desc {\n    grid-column: 1/-1;\n  }\n}";

// ../_shared/noteMeta.ts
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
var topicAnchor = (key) => `topic-${key}`;

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
function folderTitle(path, overrides = {}) {
  const segment = path.split("/").pop() ?? path;
  return overrides[path] ?? overrides[segment] ?? TOPIC_NAMES[segment] ?? titleCase(segment);
}
var plural = (n2, word) => `${n2} ${word}${n2 === 1 ? "" : "s"}`;
var byListDateDesc = (a2, b2) => (getListDate(b2)?.getTime() ?? 0) - (getListDate(a2)?.getTime() ?? 0);

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
function getSeriesEntries(series, allFiles) {
  return allFiles.filter((f3) => seriesOf(f3) === series).map(toEntry).filter((e2) => e2 !== void 0).sort(
    (a2, b2) => a2.index - b2.index || a2.title.localeCompare(b2.title, "ko", { numeric: true })
  );
}
function episodeLabel(index) {
  return index === 0 ? "\uC11C\uBB38" : `${index}\uD3B8`;
}

// ../_shared/topicIndex.ts
function folderNameResolver(trie) {
  const t2 = trie;
  return (path) => {
    const node = typeof t2?.findNode === "function" ? t2.findNode(path.split("/")) : void 0;
    return node?.isFolder && node.displayName ? node.displayName : folderTitle(path);
  };
}
var latestOf = (notes) => notes.reduce((acc, f3) => {
  const d2 = getListDate(f3);
  return d2 && (!acc || d2 > acc) ? d2 : acc;
}, void 0);
function subFolders(base, notes, nameOf) {
  const depth = base.split("/").length;
  const byChild = /* @__PURE__ */ new Map();
  for (const f3 of notes) {
    const parts = f3.slug.split("/");
    if (parts.length <= depth + 1) continue;
    const child = parts.slice(0, depth + 1).join("/");
    byChild.set(child, [...byChild.get(child) ?? [], f3]);
  }
  return [...byChild.entries()].map(([path, members]) => {
    let cur = path;
    const names = [nameOf(cur)];
    for (; ; ) {
      const d2 = cur.split("/").length;
      const direct = members.some((f3) => f3.slug.split("/").length === d2 + 1);
      const next = new Set(members.map((f3) => f3.slug.split("/").slice(0, d2 + 1).join("/")));
      if (direct || next.size !== 1) break;
      cur = [...next][0];
      names.push(nameOf(cur));
    }
    return { title: names.join(" / "), count: members.length };
  }).sort((a2, b2) => b2.count - a2.count || a2.title.localeCompare(b2.title, "ko"));
}
function buildTopicIndex(allFiles, nameOf) {
  const listed = allFiles.filter((f3) => isListedNote(f3)).sort(byListDateDesc);
  return TOPICS.map(({ key, label }) => {
    const notes = listed.filter((f3) => f3.slug.split("/")[0] === key);
    const direct = notes.filter((f3) => f3.slug.split("/").length === 2);
    const byFolder = /* @__PURE__ */ new Map();
    for (const f3 of notes) {
      const parts = f3.slug.split("/");
      if (parts.length < 3) continue;
      const path = parts.slice(0, 2).join("/");
      byFolder.set(path, [...byFolder.get(path) ?? [], f3]);
    }
    const folders = [...byFolder.entries()].map(([path, members]) => ({
      path,
      title: nameOf(path),
      count: members.length,
      latest: latestOf(members),
      subs: subFolders(path, members, nameOf),
      notes: members
    })).sort((a2, b2) => b2.count - a2.count || (b2.latest?.getTime() ?? 0) - (a2.latest?.getTime() ?? 0));
    const seriesKeys = [...new Set(notes.map(seriesOf).filter(Boolean))];
    const series = seriesKeys.map((s2) => ({ key: s2, entries: getSeriesEntries(s2, allFiles) })).filter((s2) => s2.entries.length > 0);
    return { key, label, count: notes.length, direct, folders, series };
  }).sort((a2, b2) => b2.count - a2.count);
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

// src/components/TopicsContent.tsx
function Ymd({ date }) {
  return date ? /* @__PURE__ */ u2("time", { class: "tp-end tp-date", dateTime: formatYmd(date), children: formatYmd(date) }) : /* @__PURE__ */ u2("span", { class: "tp-end" });
}
function SeriesRow(props) {
  const first = props.series.entries[0];
  return /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { class: "tp-row is-series", href: resolveRelative(props.slug, first.file.slug), "data-no-popover": "true", children: [
    /* @__PURE__ */ u2("span", { class: "tp-kind", children: [
      "\uC2DC\uB9AC\uC988 \xB7 ",
      props.series.entries.length,
      "\uD3B8"
    ] }),
    /* @__PURE__ */ u2("span", { class: "tp-title", children: props.title }),
    /* @__PURE__ */ u2("span", { class: "tp-end tp-go", children: [
      episodeLabel(first.index),
      "\uBD80\uD130 \u2192"
    ] }),
    /* @__PURE__ */ u2("span", { class: "tp-desc", children: [
      episodeLabel(first.index),
      " ",
      first.title
    ] })
  ] }) });
}
var folderLine = (f3) => f3.subs.length > 0 ? f3.subs.map((s2) => s2.title).join(" \xB7 ") : f3.notes.slice(0, 2).map((n2) => String(n2.frontmatter?.title ?? "")).join(" \xB7 ");
function FolderRow(props) {
  const { folder } = props;
  return /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { class: "tp-row", href: resolveRelative(props.slug, `${folder.path}/index`), "data-no-popover": "true", children: [
    /* @__PURE__ */ u2("span", { class: "tp-kind", children: plural(folder.count, "note") }),
    /* @__PURE__ */ u2("span", { class: "tp-title", children: folder.title }),
    /* @__PURE__ */ u2(Ymd, { date: folder.latest }),
    /* @__PURE__ */ u2("span", { class: "tp-desc", children: folderLine(folder) })
  ] }) });
}
function NoteRow(props) {
  return /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { class: "tp-row", href: resolveRelative(props.slug, props.file.slug), "data-no-popover": "true", children: [
    /* @__PURE__ */ u2("span", { class: "tp-kind", children: "\uB178\uD2B8" }),
    /* @__PURE__ */ u2("span", { class: "tp-title", children: props.file.frontmatter?.title }),
    /* @__PURE__ */ u2(Ymd, { date: getListDate(props.file) })
  ] }) });
}
var TopicsContent_default = ((opts) => {
  const seriesTitles = opts?.seriesTitles ?? {};
  const TopicsContent = ({ ctx, fileData, allFiles, displayClass }) => {
    const slug = fileData.slug ?? "topics";
    const topics = buildTopicIndex(
      allFiles,
      folderNameResolver(ctx?.trie)
    ).filter((t2) => t2.count > 0);
    const total = topics.reduce((n2, t2) => n2 + t2.count, 0);
    const folders = topics.reduce((n2, t2) => n2 + t2.folders.length, 0);
    const series = topics.reduce((n2, t2) => n2 + t2.series.length, 0);
    return (
      // 주의: <h1>은 article-title이 frontmatter.title로 렌더한다. <article>로 감싸면 custom.scss `article a`가 행에 붙는다.
      /* @__PURE__ */ u2("div", { class: `${displayClass ?? ""} topics-index popover-hint`, children: [
        /* @__PURE__ */ u2("p", { class: "tp-meta", children: [
          plural(total, "note"),
          " \xB7 ",
          plural(topics.length, "topic"),
          " \xB7 ",
          plural(folders, "folder"),
          " \xB7",
          " ",
          series,
          " series"
        ] }),
        /* @__PURE__ */ u2("nav", { class: "tp-jump", "aria-label": "\uD1A0\uD53D \uBC14\uB85C\uAC00\uAE30", children: /* @__PURE__ */ u2("ul", { children: topics.map((t2) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2("a", { href: `#${topicAnchor(t2.key)}`, "data-no-popover": "true", children: [
          t2.label,
          /* @__PURE__ */ u2("span", { class: "tp-jump-count", children: t2.count })
        ] }) })) }) }),
        topics.map((t2) => /* @__PURE__ */ u2("section", { class: "tp-section", "aria-labelledby": topicAnchor(t2.key), children: [
          /* @__PURE__ */ u2("div", { class: "tp-label", children: [
            /* @__PURE__ */ u2("h2", { id: topicAnchor(t2.key), children: t2.label }),
            /* @__PURE__ */ u2("span", { class: "tp-count", children: plural(t2.count, "note") }),
            /* @__PURE__ */ u2(
              "a",
              {
                class: "tp-open",
                href: resolveRelative(slug, `${t2.key}/index`),
                "aria-label": `${t2.label} \uC8FC\uC81C \uC5F4\uAE30`,
                "data-no-popover": "true",
                children: [
                  /* @__PURE__ */ u2("span", { class: "tp-open-word", children: "\uC8FC\uC81C\xA0" }),
                  "\uC5F4\uAE30 \u2192"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ u2("ul", { class: "tp-rows", children: [
            t2.series.map((s2) => /* @__PURE__ */ u2(SeriesRow, { series: s2, title: seriesTitles[s2.key] ?? s2.key, slug })),
            t2.direct.map((f3) => /* @__PURE__ */ u2(NoteRow, { file: f3, slug })),
            t2.folders.map((f3) => /* @__PURE__ */ u2(FolderRow, { folder: f3, slug }))
          ] })
        ] }))
      ] })
    );
  };
  TopicsContent.css = topicsContent_default;
  return TopicsContent;
});

// src/pageType.ts
var neverMatch = () => false;
var TopicsPage = (opts) => ({
  name: "TopicsPage",
  priority: 5,
  match: neverMatch,
  generate() {
    const virtualPages = [
      {
        slug: "topics",
        title: "Topics",
        data: {}
      }
    ];
    return virtualPages;
  },
  layout: "topics",
  body: () => TopicsContent_default(opts)
});

export { TopicsPage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map