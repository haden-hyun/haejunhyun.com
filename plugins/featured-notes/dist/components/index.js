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
var featured_default = '.featured-section {\n  margin: 0 0 1.5rem 0;\n  padding-bottom: 1.5rem;\n  border-bottom: 1px solid var(--border);\n}\n.flex-component .featured-section {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  margin-bottom: 0;\n  padding-bottom: 0;\n  border-bottom: none;\n}\n\n.featured-header {\n  margin-bottom: 0.9rem;\n}\n.featured-header h2 {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-size: 1.15rem;\n  font-weight: 720;\n}\n\n.featured-grid {\n  display: grid;\n  grid-template-columns: 1.35fr 1fr;\n  gap: 16px;\n}\n@media all and (max-width: 800px) {\n  .featured-grid {\n    grid-template-columns: 1fr;\n  }\n}\n.flex-component .featured-grid {\n  grid-template-columns: 1fr;\n  grid-template-rows: 1fr auto;\n  flex: 1;\n  min-height: 0;\n  gap: 12px;\n}\n\n.featured-cat {\n  color: var(--text-3);\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-family: var(--codeFont);\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  margin-bottom: 14px;\n}\n.featured-cat::before {\n  content: "";\n  width: 6px;\n  height: 6px;\n  border-radius: 2px;\n  background: currentColor;\n}\n\n.featured-main {\n  display: flex;\n  flex-direction: column;\n  padding: 26px;\n  border: 1px solid var(--border);\n  border-radius: var(--radius, 10px);\n}\n.flex-component .featured-main {\n  min-height: 0;\n}\n.flex-component .featured-main .featured-meta {\n  margin-top: auto;\n  padding-top: 0.75rem;\n}\n.featured-main {\n  background: linear-gradient(160deg, var(--surface-2), var(--surface));\n  text-decoration: none;\n  transition: border-color 0.15s;\n}\n.featured-main:hover {\n  border-color: var(--border-strong, var(--accent));\n}\n.featured-main h3 {\n  margin: 0 0 0.6rem 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-size: 1.5rem;\n  font-weight: 730;\n  line-height: 1.3;\n  color: var(--text);\n}\n.featured-main p {\n  margin: 0 0 0.9rem 0;\n  font-size: 0.92rem;\n  line-height: 1.6;\n  color: var(--text-2);\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.featured-side {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.flex-component .featured-side {\n  flex: none;\n}\n.flex-component .featured-side .featured-item {\n  flex: none;\n}\n\n.featured-item {\n  display: flex;\n  flex-direction: column;\n  padding: 15px 17px;\n  border: 1px solid var(--border);\n  border-radius: var(--radius, 10px);\n  background: var(--surface);\n  text-decoration: none;\n  transition: border-color 0.15s;\n}\n.featured-item:hover {\n  border-color: var(--border-strong);\n}\n.featured-item h4 {\n  margin: 0;\n  padding: 0;\n  border: none;\n  font-family: var(--headerFont);\n  font-size: 0.97rem;\n  font-weight: 650;\n  line-height: 1.4;\n  color: var(--text);\n}\n\n.featured-meta {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-top: 0.5rem;\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  color: var(--text-3);\n}\n\n.featured-meta-sep {\n  width: 3px;\n  height: 3px;\n  border-radius: 50%;\n  background: var(--text-3);\n  flex-shrink: 0;\n}';
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
var CATEGORY_NAMES = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools"
};
function getCategoryName(slug) {
  const key = slug.split("/")[0] ?? "";
  return CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c2) => c2.toUpperCase());
}
function isRealNote(slug) {
  if (slug.startsWith("tags/")) return false;
  if (slug === "index" || slug.endsWith("/index")) return false;
  if (slug === "404") return false;
  if (slug === "topics" || slug === "archive") return false;
  return true;
}
function getTime(f3) {
  const dates = f3.dates;
  return dates?.modified?.getTime() ?? dates?.created?.getTime() ?? 0;
}
function getDisplayDate(f3) {
  const dates = f3.dates;
  return dates?.modified ?? dates?.created ?? dates?.published;
}
function getReadingMinutes(f3) {
  const text = f3.text ?? "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
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
  recentExcludeCount: 6,
  slugs: []
};
function resolveSlugs(slugs, files) {
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
    const files = allFiles.filter((f3) => isRealNote(f3.slug ?? ""));
    const curated = resolveSlugs(opts.slugs, files);
    const recentPostsSlugs = new Set(
      [...files].sort((a2, b2) => getTime(b2) - getTime(a2)).slice(0, opts.recentExcludeCount).map((f3) => f3.slug)
    );
    const exclude = /* @__PURE__ */ new Set([...curated.map((f3) => f3.slug), ...recentPostsSlugs]);
    const needed = MAX_SLOTS - curated.length;
    const autoFilled = needed > 0 ? pickRoundRobin(files, needed, exclude).sort((a2, b2) => getTime(b2) - getTime(a2)) : [];
    const selected = [...curated, ...autoFilled];
    if (selected.length === 0) return /* @__PURE__ */ u2(S, {});
    const [main, ...rest] = selected;
    const sideItems = rest.slice(0, 3);
    return /* @__PURE__ */ u2("section", { class: `${displayClass ?? ""} featured-section`, children: [
      /* @__PURE__ */ u2("div", { class: "featured-header", children: /* @__PURE__ */ u2("h2", { children: "Featured" }) }),
      /* @__PURE__ */ u2("div", { class: "featured-grid", children: [
        /* @__PURE__ */ u2("a", { class: "featured-main", href: resolveRelative(fileData.slug, main.slug), children: [
          /* @__PURE__ */ u2(
            "span",
            {
              class: "featured-cat",
              children: getCategoryName(main.slug ?? "")
            }
          ),
          /* @__PURE__ */ u2("h3", { children: main.frontmatter?.title ?? "Untitled" }),
          main.description && /* @__PURE__ */ u2("p", { children: main.description }),
          /* @__PURE__ */ u2("div", { class: "featured-meta", children: [
            (() => {
              const d2 = getDisplayDate(main);
              return d2 ? /* @__PURE__ */ u2("span", { children: d2.toLocaleDateString("ko-KR", {
                month: "short",
                day: "2-digit",
                year: "numeric"
              }) }) : null;
            })(),
            /* @__PURE__ */ u2("span", { class: "featured-meta-sep" }),
            /* @__PURE__ */ u2("span", { children: [
              getReadingMinutes(main),
              "\uBD84"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ u2("div", { class: "featured-side", children: sideItems.map((item) => /* @__PURE__ */ u2("a", { class: "featured-item", href: resolveRelative(fileData.slug, item.slug), children: [
          /* @__PURE__ */ u2(
            "span",
            {
              class: "featured-cat",
              children: getCategoryName(item.slug ?? "")
            }
          ),
          /* @__PURE__ */ u2("h4", { children: item.frontmatter?.title ?? "Untitled" }),
          /* @__PURE__ */ u2("div", { class: "featured-meta", children: [
            (() => {
              const d2 = getDisplayDate(item);
              return d2 ? /* @__PURE__ */ u2("span", { children: d2.toLocaleDateString("ko-KR", {
                month: "short",
                day: "2-digit",
                year: "numeric"
              }) }) : null;
            })(),
            /* @__PURE__ */ u2("span", { class: "featured-meta-sep" }),
            /* @__PURE__ */ u2("span", { children: [
              getReadingMinutes(item),
              "\uBD84"
            ] })
          ] })
        ] })) })
      ] })
    ] });
  };
  FeaturedNotes.css = featured_default;
  return FeaturedNotes;
});

export { FeaturedNotes_default as FeaturedNotes };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map