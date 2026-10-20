// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

// ../_shared/notes.ts
function isRealNote(slug2) {
  if (!slug2) return false;
  if (slug2.startsWith("tags/")) return false;
  if (slug2 === "index" || slug2.endsWith("/index")) return false;
  if (slug2 === "404") return false;
  if (slug2 === "topics" || slug2 === "archive") return false;
  return true;
}
function isListedNote(file) {
  return isRealNote(file.slug) && file.unlisted !== true && file.frontmatter?.unlisted !== true;
}
var TOPIC_NAMES = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools"
};
function titleCase(key) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function topicName(slug2) {
  const key = slug2.split("/")[0] ?? "";
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

// node_modules/@quartz-community/utils/dist/index.js
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  if (endsWith(s2, suffix)) {
    s2 = s2.slice(0, -suffix.length);
  }
  return s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) {
    s2 = s2.substring(1);
  }
  if (!onlyStripPrefix && s2.endsWith("/")) {
    s2 = s2.slice(0, -1);
  }
  return s2;
}

// src/util/path.ts
function simplifySlug2(fp) {
  return simplifySlug(fp);
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x2) => x2 !== "").slice(0, -1).map(() => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const simplified = simplifySlug2(target);
  const rootPath = pathToRoot(current);
  return joinSegments(rootPath, simplified);
}

// src/components/styles/recentNotes.scss
var recentNotes_default = '@charset "UTF-8";\n.recent-notes {\n  padding: 0 0 72px;\n}\n@media all and (max-width: 800px) {\n  .recent-notes {\n    padding-bottom: 48px;\n  }\n}\n\n.recent-notes-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding-bottom: 14px;\n  border-bottom: 1px solid var(--lightgray);\n}\n.recent-notes-header h2 {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 700;\n  letter-spacing: 0;\n  color: var(--secondary);\n}\n@media all and (max-width: 800px) {\n  .recent-notes-header {\n    padding-bottom: 10px;\n  }\n}\n\n.recent-notes-more {\n  padding: 8px 0;\n  font-family: var(--headerFont);\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--secondary);\n  text-decoration: none;\n}\n.recent-notes-more:hover {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n@media all and (max-width: 800px) {\n  .recent-notes-more {\n    padding: 10px 0;\n  }\n}\n\n.recent-row {\n  display: grid;\n  grid-template-columns: 120px minmax(0, 1fr) auto;\n  gap: 24px;\n  align-items: baseline;\n  padding: 22px 10px;\n  border-bottom: 1px solid var(--lightgray);\n  color: inherit;\n  text-decoration: none;\n  transition: background-color var(--dur-fast) var(--ease);\n}\n.recent-row:nth-child(even) {\n  background: rgba(var(--accent-rgb), 0.035);\n}\n.recent-row:hover {\n  background: rgba(var(--accent-rgb), 0.1);\n}\n@media all and (max-width: 800px) {\n  .recent-row {\n    grid-template-columns: auto minmax(0, 1fr);\n    gap: 4px 0;\n    padding: 18px 10px;\n  }\n}\n\n.recent-date {\n  font-family: var(--codeFont);\n  font-size: 12.5px;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n@media all and (max-width: 800px) {\n  .recent-date {\n    font-size: 11.5px;\n  }\n}\n\n.recent-main {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 0;\n}\n@media all and (max-width: 800px) {\n  .recent-main {\n    grid-column: 1/-1;\n    grid-row: 2;\n  }\n}\n\n.recent-title {\n  font-family: var(--headerFont);\n  font-size: 17px;\n  font-weight: 700;\n  letter-spacing: -0.01em;\n  color: var(--dark);\n  word-break: keep-all;\n}\n@media all and (max-width: 800px) {\n  .recent-title {\n    font-size: 16px;\n  }\n}\n\n.recent-revised {\n  display: inline-block;\n  margin-left: 8px;\n  padding: 0 5px;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.6;\n  color: var(--gray);\n  vertical-align: 2px;\n}\n\n.recent-sub {\n  font-size: 14.5px;\n  line-height: 1.65;\n  color: var(--gray);\n  word-break: keep-all;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 1;\n  -webkit-box-orient: vertical;\n}\n@media all and (max-width: 800px) {\n  .recent-sub {\n    font-size: 14px;\n    line-height: 1.6;\n  }\n}\n\n.recent-topic {\n  font-size: 12.5px;\n  color: var(--gray);\n  white-space: nowrap;\n}\n@media all and (max-width: 800px) {\n  .recent-topic {\n    grid-row: 1;\n    grid-column: 2;\n    font-family: var(--codeFont);\n    font-size: 11.5px;\n  }\n  .recent-topic::before {\n    content: " \xB7 ";\n    white-space: pre;\n  }\n}';

// src/components/RecentNotesForIndex.tsx
var defaultOptions = {
  limit: 5,
  linkToMore: false,
  linkToMoreLabel: "ALL NOTES \u2192",
  showTags: true,
  filter: () => true,
  sort: byListDateDesc
};
var RecentNotesForIndex_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const RecentNotesForIndex = ({
    allFiles,
    fileData,
    displayClass
  }) => {
    if (fileData.slug !== "index") return /* @__PURE__ */ u2(S, {});
    const files = allFiles;
    const pages = files.filter(opts.filter).filter(
      (f3) => f3.slug !== fileData.slug && f3.frontmatter?.title && isListedNote(f3)
    ).sort(opts.sort);
    const rows = buildRecentRows(pages, opts.limit);
    const here = fileData.slug;
    const titleOf = (f3) => f3.frontmatter?.title ?? "Untitled";
    return /* @__PURE__ */ u2("section", { class: classNames(displayClass, "recent-notes"), "aria-labelledby": "recent-notes-h", children: [
      /* @__PURE__ */ u2("div", { class: "recent-notes-header", children: [
        /* @__PURE__ */ u2("h2", { id: "recent-notes-h", children: opts.title ?? "RECENT NOTES" }),
        opts.linkToMore && /* @__PURE__ */ u2("a", { class: "recent-notes-more", href: resolveRelative(here, opts.linkToMore), children: opts.linkToMoreLabel })
      ] }),
      /* @__PURE__ */ u2("div", { class: "recent-rows", children: rows.map((row) => {
        const lead = row.kind === "note" ? row.file : row.files[0];
        const date = getListDate(lead);
        const slug2 = lead.slug ?? "";
        let href;
        let title;
        let sub;
        let revised = false;
        if (row.kind === "group") {
          const shown = row.files.slice(0, 2).map(titleOf);
          const rest = row.files.length - shown.length;
          href = resolveRelative(here, `${row.folder}/index`);
          title = `${titleCase(row.folder.split("/").pop() ?? "")} \xB7 ${row.files.length} notes`;
          sub = shown.join(", ") + (rest > 0 ? ` +${rest} more` : "");
        } else {
          href = resolveRelative(here, slug2);
          title = titleOf(row.file);
          sub = row.file.description ?? "";
          revised = Boolean(getNoteDates(row.file).revised);
        }
        return /* @__PURE__ */ u2("a", { class: "recent-row", href, children: [
          /* @__PURE__ */ u2("span", { class: "recent-date", children: date ? formatYmd(date) : "" }),
          /* @__PURE__ */ u2("span", { class: "recent-main", children: [
            /* @__PURE__ */ u2("span", { class: "recent-title", children: [
              title,
              revised && /* @__PURE__ */ u2("span", { class: "recent-revised", children: "Revised" })
            ] }),
            sub && /* @__PURE__ */ u2("span", { class: "recent-sub", children: sub })
          ] }),
          opts.showTags && /* @__PURE__ */ u2("span", { class: "recent-topic", children: topicName(slug2) })
        ] });
      }) })
    ] });
  };
  RecentNotesForIndex.css = recentNotes_default;
  return RecentNotesForIndex;
});

export { RecentNotesForIndex_default as RecentNotesForIndex };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map