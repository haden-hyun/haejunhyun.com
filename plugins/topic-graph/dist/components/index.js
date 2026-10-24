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
  return key.replace(/-/g, " ").replace(/\b\w/g, (c3) => c3.toUpperCase());
}
function topicName(slug) {
  const key = slug.split("/")[0] ?? "";
  return TOPIC_NAMES[key] ?? titleCase(key);
}
function folderTitle(path, overrides = {}) {
  const segment = path.split("/").pop() ?? path;
  return overrides[path] ?? overrides[segment] ?? TOPIC_NAMES[segment] ?? titleCase(segment);
}

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
  const rootPath = slug.split("/").filter((x4) => x4 !== "").slice(0, -1).map(() => "..").join("/");
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
    const index2 = Number(raw);
    return Number.isFinite(index2) ? index2 : void 0;
  }
  return void 0;
}

// src/core/graph.ts
var dirOf = (slug) => slug.split("/").slice(0, -1).join("/");
var folderId = (path) => "f:" + path;
function isFolderMirrorTag(slug, tag) {
  const dir = dirOf(slug);
  return dir === tag || dir.startsWith(tag + "/");
}
function resolveLink(link, slugs, all) {
  const clean = link.replace(/\/index$/, "").replace(/^\.?\//, "");
  if (slugs.has(clean)) return clean;
  const hits = all.filter((s2) => s2.endsWith("/" + clean));
  return hits.length === 1 ? hits[0] : void 0;
}
function buildTopicGraph(current, notes, folderLabel, topicLabel) {
  const topic = current.split("/")[0];
  if (!topic || !current.includes("/")) return void 0;
  const inTopic = notes.filter((n2) => n2.slug.startsWith(topic + "/")).sort((a3, b2) => a3.slug < b2.slug ? -1 : a3.slug > b2.slug ? 1 : 0);
  if (!inTopic.some((n2) => n2.slug === current)) return void 0;
  const folders = /* @__PURE__ */ new Set();
  for (const n2 of inTopic) {
    const parts = dirOf(n2.slug).split("/");
    for (let i2 = 1; i2 <= parts.length; i2++) folders.add(parts.slice(0, i2).join("/"));
  }
  const nodes = [];
  const edges = [];
  for (const path of [...folders].sort()) {
    const parent = dirOf(path);
    nodes.push({
      id: folderId(path),
      kind: path === topic ? "topic" : "folder",
      label: path === topic ? topicLabel(topic) : folderLabel(path),
      parent: parent ? folderId(parent) : null,
      depth: path.split("/").length - 1,
      current: false,
      tags: [],
      count: inTopic.filter((n2) => n2.slug.startsWith(path + "/")).length
    });
    if (parent) edges.push({ s: folderId(path), t: folderId(parent), kind: "tree" });
  }
  for (const n2 of inTopic) {
    nodes.push({
      id: n2.slug,
      kind: "note",
      label: n2.title,
      parent: folderId(dirOf(n2.slug)),
      depth: n2.slug.split("/").length - 1,
      current: n2.slug === current,
      tags: n2.tags.filter((t2) => !isFolderMirrorTag(n2.slug, t2)),
      count: 0,
      slug: n2.slug
    });
    edges.push({ s: n2.slug, t: folderId(dirOf(n2.slug)), kind: "tree" });
  }
  const slugs = new Set(inTopic.map((n2) => n2.slug));
  const all = inTopic.map((n2) => n2.slug);
  const pairs = /* @__PURE__ */ new Set();
  for (const n2 of inTopic) {
    for (const raw of n2.links) {
      const t2 = resolveLink(raw, slugs, all);
      if (!t2 || t2 === n2.slug) continue;
      const key = [n2.slug, t2].sort().join("|");
      if (pairs.has(key)) continue;
      pairs.add(key);
      edges.push({ s: n2.slug, t: t2, kind: "link" });
    }
  }
  const bySeries = /* @__PURE__ */ new Map();
  for (const n2 of inTopic) if (n2.series && n2.seriesIndex !== void 0) bySeries.set(n2.series, [...bySeries.get(n2.series) ?? [], n2]);
  for (const key of [...bySeries.keys()].sort()) {
    const chain = bySeries.get(key).sort((a3, b2) => a3.seriesIndex - b2.seriesIndex);
    for (let i2 = 1; i2 < chain.length; i2++) edges.push({ s: chain[i2 - 1].slug, t: chain[i2].slug, kind: "series" });
  }
  return { topic, nodes, edges };
}
function relations(model) {
  const cur = model.nodes.find((n2) => n2.current);
  const link = /* @__PURE__ */ new Set();
  const series = /* @__PURE__ */ new Set();
  for (const e2 of model.edges) {
    if (e2.kind === "tree") continue;
    const other = e2.s === cur.id ? e2.t : e2.t === cur.id ? e2.s : void 0;
    if (other) (e2.kind === "link" ? link : series).add(other);
  }
  const siblings = new Set(model.nodes.filter((n2) => n2.kind === "note" && n2.parent === cur.parent && n2.id !== cur.id).map((n2) => n2.id));
  const ancestors = /* @__PURE__ */ new Set();
  const byId = new Map(model.nodes.map((n2) => [n2.id, n2]));
  for (let p2 = cur.parent; p2; p2 = byId.get(p2)?.parent ?? null) ancestors.add(p2);
  return { cur, link, series, direct: /* @__PURE__ */ new Set([...link, ...series]), siblings, ancestors };
}
function aliasCollisions(notes) {
  const byBase = /* @__PURE__ */ new Map();
  for (const n2 of notes) {
    const base = n2.slug.split("/").pop().toLowerCase();
    byBase.set(base, [...byBase.get(base) ?? [], n2.slug]);
  }
  const out = [];
  for (const n2 of notes) {
    for (const alias of n2.aliases) {
      const parts = alias.startsWith("./") || alias.startsWith("../") ? [...dirOf(n2.slug).split("/"), ...alias.split("/")] : alias.split("/");
      const resolved = [];
      for (const p2 of parts) {
        if (p2 === "." || p2 === "") continue;
        if (p2 === "..") resolved.pop();
        else resolved.push(p2);
      }
      const target = resolved.join("/");
      if (!target || target === n2.slug) continue;
      const hits = byBase.get(target.split("/").pop().toLowerCase()) ?? [];
      if (hits.length > 0 && target.split("/").length < Math.min(...hits.map((h2) => h2.split("/").length)))
        out.push({ slug: n2.slug, alias, hits });
    }
  }
  return out;
}

// src/core/labels.ts
var FONT = 10;
var clip = (t2, max) => [...t2].length > max ? [...t2].slice(0, max - 1).join("") + "\u2026" : t2;
function charEm(c3) {
  if (/[가-힣㄰-㆏]/.test(c3)) return 1;
  if (c3 === " ") return 0.27;
  if ("il.,:;'|!".includes(c3)) return 0.28;
  if ("fjrtI".includes(c3)) return 0.36;
  if ("MW".includes(c3)) return 0.88;
  if ("mw".includes(c3)) return 0.85;
  if (/[A-Z]/.test(c3)) return 0.68;
  if (/[0-9]/.test(c3)) return 0.6;
  return 0.56;
}
function textWidth(text, size = FONT, bold = false) {
  let em = 0;
  for (const c3 of text) em += charEm(c3);
  return em * size * (bold ? 1.08 : 1) * 1.12;
}
function candidates(rightFirst) {
  const sides = rightFirst ? ["R", "L"] : ["L", "R"];
  const out = [];
  for (const far of [0, 8, 16, 24]) {
    for (const side of sides) out.push({ side, far, dy: 0 });
    out.push({ side: "D", far, dy: 0 }, { side: "U", far, dy: 0 });
    for (const step of [1, 2, 3]) for (const side of sides) out.push({ side, far, dy: -step }, { side, far, dy: step });
  }
  return out;
}
function boxFor(req, c3, width) {
  const { x: px, y: py } = req.at;
  const x4 = c3.side === "R" ? px + req.gap + c3.far : c3.side === "L" ? px - req.gap - c3.far : px;
  const y4 = c3.side === "D" ? py + req.gap + c3.far + FONT * 0.8 : c3.side === "U" ? py - req.gap - c3.far : py + FONT * 0.35 + c3.dy * FONT * 0.9;
  const anchor = c3.side === "R" ? "start" : c3.side === "L" ? "end" : "middle";
  const left = anchor === "start" ? x4 : anchor === "end" ? x4 - width : x4 - width / 2;
  return { id: req.id, text: req.text, x: x4, y: y4, anchor, box: { x: left, y: y4 - FONT * 0.95, w: width, h: FONT * 1.25 } };
}
var area = (a3, b2) => Math.max(0, Math.min(a3.x + a3.w, b2.x + b2.w) - Math.max(a3.x, b2.x)) * Math.max(0, Math.min(a3.y + a3.h, b2.y + b2.h) - Math.max(a3.y, b2.y));
function placeLabels(requests, obstacles, view) {
  const placed = [];
  for (const req of requests) {
    const width = textWidth(req.text, FONT, req.bold);
    const order = candidates(req.at.x < view.w * 0.62);
    let best;
    for (const cand of order) {
      const label = boxFor(req, cand, width);
      const b2 = label.box;
      const out = b2.x < 0 || b2.y < 0 || b2.x + b2.w > view.w || b2.y + b2.h > view.h ? 1e4 : 0;
      const cost = out + placed.reduce((s2, p2) => s2 + area(b2, p2.box), 0) + obstacles.filter((o2) => o2.id !== req.id).reduce((s2, o2) => s2 + area(b2, o2), 0);
      if (!best || cost < best.cost) best = { label, cost };
      if (cost === 0) break;
    }
    if (req.optional && best.cost > 0) continue;
    placed.push(best.label);
  }
  return placed;
}

// node_modules/d3-quadtree/src/add.js
function add_default(d2) {
  const x4 = +this._x.call(null, d2), y4 = +this._y.call(null, d2);
  return add(this.cover(x4, y4), x4, y4, d2);
}
function add(tree, x4, y4, d2) {
  if (isNaN(x4) || isNaN(y4)) return tree;
  var parent, node = tree._root, leaf = { data: d2 }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i2, j2;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x4 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y4 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (parent = node, !(node = node[i2 = bottom << 1 | right])) return parent[i2] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x4 === xp && y4 === yp) return leaf.next = node, parent ? parent[i2] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i2] = new Array(4) : tree._root = new Array(4);
    if (right = x4 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y4 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
  } while ((i2 = bottom << 1 | right) === (j2 = (yp >= ym) << 1 | xp >= xm));
  return parent[j2] = node, parent[i2] = leaf, tree;
}
function addAll(data) {
  var d2, i2, n2 = data.length, x4, y4, xz = new Array(n2), yz = new Array(n2), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (i2 = 0; i2 < n2; ++i2) {
    if (isNaN(x4 = +this._x.call(null, d2 = data[i2])) || isNaN(y4 = +this._y.call(null, d2))) continue;
    xz[i2] = x4;
    yz[i2] = y4;
    if (x4 < x0) x0 = x4;
    if (x4 > x1) x1 = x4;
    if (y4 < y0) y0 = y4;
    if (y4 > y1) y1 = y4;
  }
  if (x0 > x1 || y0 > y1) return this;
  this.cover(x0, y0).cover(x1, y1);
  for (i2 = 0; i2 < n2; ++i2) {
    add(this, xz[i2], yz[i2], data[i2]);
  }
  return this;
}

// node_modules/d3-quadtree/src/cover.js
function cover_default(x4, y4) {
  if (isNaN(x4 = +x4) || isNaN(y4 = +y4)) return this;
  var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x4)) + 1;
    y1 = (y0 = Math.floor(y4)) + 1;
  } else {
    var z2 = x1 - x0 || 1, node = this._root, parent, i2;
    while (x0 > x4 || x4 >= x1 || y0 > y4 || y4 >= y1) {
      i2 = (y4 < y0) << 1 | x4 < x0;
      parent = new Array(4), parent[i2] = node, node = parent, z2 *= 2;
      switch (i2) {
        case 0:
          x1 = x0 + z2, y1 = y0 + z2;
          break;
        case 1:
          x0 = x1 - z2, y1 = y0 + z2;
          break;
        case 2:
          x1 = x0 + z2, y0 = y1 - z2;
          break;
        case 3:
          x0 = x1 - z2, y0 = y1 - z2;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
}

// node_modules/d3-quadtree/src/data.js
function data_default() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}

// node_modules/d3-quadtree/src/extent.js
function extent_default(_2) {
  return arguments.length ? this.cover(+_2[0][0], +_2[0][1]).cover(+_2[1][0], +_2[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}

// node_modules/d3-quadtree/src/quad.js
function quad_default(node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
}

// node_modules/d3-quadtree/src/find.js
function find_default(x4, y4, radius) {
  var data, x0 = this._x0, y0 = this._y0, x1, y1, x22, y22, x32 = this._x1, y32 = this._y1, quads = [], node = this._root, q2, i2;
  if (node) quads.push(new quad_default(node, x0, y0, x32, y32));
  if (radius == null) radius = Infinity;
  else {
    x0 = x4 - radius, y0 = y4 - radius;
    x32 = x4 + radius, y32 = y4 + radius;
    radius *= radius;
  }
  while (q2 = quads.pop()) {
    if (!(node = q2.node) || (x1 = q2.x0) > x32 || (y1 = q2.y0) > y32 || (x22 = q2.x1) < x0 || (y22 = q2.y1) < y0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2;
      quads.push(
        new quad_default(node[3], xm, ym, x22, y22),
        new quad_default(node[2], x1, ym, xm, y22),
        new quad_default(node[1], xm, y1, x22, ym),
        new quad_default(node[0], x1, y1, xm, ym)
      );
      if (i2 = (y4 >= ym) << 1 | x4 >= xm) {
        q2 = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i2];
        quads[quads.length - 1 - i2] = q2;
      }
    } else {
      var dx = x4 - +this._x.call(null, node.data), dy = y4 - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
      if (d2 < radius) {
        var d3 = Math.sqrt(radius = d2);
        x0 = x4 - d3, y0 = y4 - d3;
        x32 = x4 + d3, y32 = y4 + d3;
        data = node.data;
      }
    }
  }
  return data;
}

// node_modules/d3-quadtree/src/remove.js
function remove_default(d2) {
  if (isNaN(x4 = +this._x.call(null, d2)) || isNaN(y4 = +this._y.call(null, d2))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x4, y4, xm, ym, right, bottom, i2, j2;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x4 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y4 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (!(parent = node, node = node[i2 = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i2 + 1 & 3] || parent[i2 + 2 & 3] || parent[i2 + 3 & 3]) retainer = parent, j2 = i2;
  }
  while (node.data !== d2) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i2] = next : delete parent[i2];
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j2] = node;
    else this._root = node;
  }
  return this;
}
function removeAll(data) {
  for (var i2 = 0, n2 = data.length; i2 < n2; ++i2) this.remove(data[i2]);
  return this;
}

// node_modules/d3-quadtree/src/root.js
function root_default() {
  return this._root;
}

// node_modules/d3-quadtree/src/size.js
function size_default() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}

// node_modules/d3-quadtree/src/visit.js
function visit_default(callback) {
  var quads = [], q2, node = this._root, child, x0, y0, x1, y1;
  if (node) quads.push(new quad_default(node, this._x0, this._y0, this._x1, this._y1));
  while (q2 = quads.pop()) {
    if (!callback(node = q2.node, x0 = q2.x0, y0 = q2.y0, x1 = q2.x1, y1 = q2.y1) && node.length) {
      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
    }
  }
  return this;
}

// node_modules/d3-quadtree/src/visitAfter.js
function visitAfter_default(callback) {
  var quads = [], next = [], q2;
  if (this._root) quads.push(new quad_default(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q2 = quads.pop()) {
    var node = q2.node;
    if (node.length) {
      var child, x0 = q2.x0, y0 = q2.y0, x1 = q2.x1, y1 = q2.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
    }
    next.push(q2);
  }
  while (q2 = next.pop()) {
    callback(q2.node, q2.x0, q2.y0, q2.x1, q2.y1);
  }
  return this;
}

// node_modules/d3-quadtree/src/x.js
function defaultX(d2) {
  return d2[0];
}
function x_default(_2) {
  return arguments.length ? (this._x = _2, this) : this._x;
}

// node_modules/d3-quadtree/src/y.js
function defaultY(d2) {
  return d2[1];
}
function y_default(_2) {
  return arguments.length ? (this._y = _2, this) : this._y;
}

// node_modules/d3-quadtree/src/quadtree.js
function quadtree(nodes, x4, y4) {
  var tree = new Quadtree(x4 == null ? defaultX : x4, y4 == null ? defaultY : y4, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Quadtree(x4, y4, x0, y0, x1, y1) {
  this._x = x4;
  this._y = y4;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = void 0;
}
function leaf_copy(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto = quadtree.prototype = Quadtree.prototype;
treeProto.copy = function() {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i2 = 0; i2 < 4; ++i2) {
      if (child = node.source[i2]) {
        if (child.length) nodes.push({ source: child, target: node.target[i2] = new Array(4) });
        else node.target[i2] = leaf_copy(child);
      }
    }
  }
  return copy;
};
treeProto.add = add_default;
treeProto.addAll = addAll;
treeProto.cover = cover_default;
treeProto.data = data_default;
treeProto.extent = extent_default;
treeProto.find = find_default;
treeProto.remove = remove_default;
treeProto.removeAll = removeAll;
treeProto.root = root_default;
treeProto.size = size_default;
treeProto.visit = visit_default;
treeProto.visitAfter = visitAfter_default;
treeProto.x = x_default;
treeProto.y = y_default;

// node_modules/d3-force/src/constant.js
function constant_default(x4) {
  return function() {
    return x4;
  };
}

// node_modules/d3-force/src/jiggle.js
function jiggle_default(random) {
  return (random() - 0.5) * 1e-6;
}

// node_modules/d3-force/src/collide.js
function x(d2) {
  return d2.x + d2.vx;
}
function y(d2) {
  return d2.y + d2.vy;
}
function collide_default(radius) {
  var nodes, radii, random, strength = 1, iterations = 1;
  if (typeof radius !== "function") radius = constant_default(radius == null ? 1 : +radius);
  function force() {
    var i2, n2 = nodes.length, tree, node, xi, yi, ri, ri2;
    for (var k = 0; k < iterations; ++k) {
      tree = quadtree(nodes, x, y).visitAfter(prepare);
      for (i2 = 0; i2 < n2; ++i2) {
        node = nodes[i2];
        ri = radii[node.index], ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }
    }
    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r2 = ri + rj;
      if (data) {
        if (data.index > node.index) {
          var x4 = xi - data.x - data.vx, y4 = yi - data.y - data.vy, l2 = x4 * x4 + y4 * y4;
          if (l2 < r2 * r2) {
            if (x4 === 0) x4 = jiggle_default(random), l2 += x4 * x4;
            if (y4 === 0) y4 = jiggle_default(random), l2 += y4 * y4;
            l2 = (r2 - (l2 = Math.sqrt(l2))) / l2 * strength;
            node.vx += (x4 *= l2) * (r2 = (rj *= rj) / (ri2 + rj));
            node.vy += (y4 *= l2) * r2;
            data.vx -= x4 * (r2 = 1 - r2);
            data.vy -= y4 * r2;
          }
        }
        return;
      }
      return x0 > xi + r2 || x1 < xi - r2 || y0 > yi + r2 || y1 < yi - r2;
    }
  }
  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i2 = quad.r = 0; i2 < 4; ++i2) {
      if (quad[i2] && quad[i2].r > quad.r) {
        quad.r = quad[i2].r;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i2, n2 = nodes.length, node;
    radii = new Array(n2);
    for (i2 = 0; i2 < n2; ++i2) node = nodes[i2], radii[node.index] = +radius(node, i2, nodes);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.iterations = function(_2) {
    return arguments.length ? (iterations = +_2, force) : iterations;
  };
  force.strength = function(_2) {
    return arguments.length ? (strength = +_2, force) : strength;
  };
  force.radius = function(_2) {
    return arguments.length ? (radius = typeof _2 === "function" ? _2 : constant_default(+_2), initialize(), force) : radius;
  };
  return force;
}

// node_modules/d3-force/src/link.js
function index(d2) {
  return d2.index;
}
function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}
function link_default(links) {
  var id = index, strength = defaultStrength, strengths, distance = constant_default(30), distances, nodes, count, bias, random, iterations = 1;
  if (links == null) links = [];
  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }
  function force(alpha) {
    for (var k = 0, n2 = links.length; k < iterations; ++k) {
      for (var i2 = 0, link, source, target, x4, y4, l2, b2; i2 < n2; ++i2) {
        link = links[i2], source = link.source, target = link.target;
        x4 = target.x + target.vx - source.x - source.vx || jiggle_default(random);
        y4 = target.y + target.vy - source.y - source.vy || jiggle_default(random);
        l2 = Math.sqrt(x4 * x4 + y4 * y4);
        l2 = (l2 - distances[i2]) / l2 * alpha * strengths[i2];
        x4 *= l2, y4 *= l2;
        target.vx -= x4 * (b2 = bias[i2]);
        target.vy -= y4 * b2;
        source.vx += x4 * (b2 = 1 - b2);
        source.vy += y4 * b2;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i2, n2 = nodes.length, m3 = links.length, nodeById = new Map(nodes.map((d2, i3) => [id(d2, i3, nodes), d2])), link;
    for (i2 = 0, count = new Array(n2); i2 < m3; ++i2) {
      link = links[i2], link.index = i2;
      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }
    for (i2 = 0, bias = new Array(m3); i2 < m3; ++i2) {
      link = links[i2], bias[i2] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }
    strengths = new Array(m3), initializeStrength();
    distances = new Array(m3), initializeDistance();
  }
  function initializeStrength() {
    if (!nodes) return;
    for (var i2 = 0, n2 = links.length; i2 < n2; ++i2) {
      strengths[i2] = +strength(links[i2], i2, links);
    }
  }
  function initializeDistance() {
    if (!nodes) return;
    for (var i2 = 0, n2 = links.length; i2 < n2; ++i2) {
      distances[i2] = +distance(links[i2], i2, links);
    }
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.links = function(_2) {
    return arguments.length ? (links = _2, initialize(), force) : links;
  };
  force.id = function(_2) {
    return arguments.length ? (id = _2, force) : id;
  };
  force.iterations = function(_2) {
    return arguments.length ? (iterations = +_2, force) : iterations;
  };
  force.strength = function(_2) {
    return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant_default(+_2), initializeStrength(), force) : strength;
  };
  force.distance = function(_2) {
    return arguments.length ? (distance = typeof _2 === "function" ? _2 : constant_default(+_2), initializeDistance(), force) : distance;
  };
  return force;
}

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i2 = 0, n2 = arguments.length, _2 = {}, t2; i2 < n2; ++i2) {
    if (!(t2 = arguments[i2] + "") || t2 in _2 || /[\s.]/.test(t2)) throw new Error("illegal type: " + t2);
    _2[t2] = [];
  }
  return new Dispatch(_2);
}
function Dispatch(_2) {
  this._ = _2;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t2) {
    var name = "", i2 = t2.indexOf(".");
    if (i2 >= 0) name = t2.slice(i2 + 1), t2 = t2.slice(0, i2);
    if (t2 && !types.hasOwnProperty(t2)) throw new Error("unknown type: " + t2);
    return { type: t2, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _2 = this._, T2 = parseTypenames(typename + "", _2), t2, i2 = -1, n2 = T2.length;
    if (arguments.length < 2) {
      while (++i2 < n2) if ((t2 = (typename = T2[i2]).type) && (t2 = get(_2[t2], typename.name))) return t2;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i2 < n2) {
      if (t2 = (typename = T2[i2]).type) _2[t2] = set(_2[t2], typename.name, callback);
      else if (callback == null) for (t2 in _2) _2[t2] = set(_2[t2], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _2 = this._;
    for (var t2 in _2) copy[t2] = _2[t2].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n2 = arguments.length - 2) > 0) for (var args = new Array(n2), i2 = 0, n2, t2; i2 < n2; ++i2) args[i2] = arguments[i2 + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t2 = this._[type], i2 = 0, n2 = t2.length; i2 < n2; ++i2) t2[i2].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t2 = this._[type], i2 = 0, n2 = t2.length; i2 < n2; ++i2) t2[i2].value.apply(that, args);
  }
};
function get(type, name) {
  for (var i2 = 0, n2 = type.length, c3; i2 < n2; ++i2) {
    if ((c3 = type[i2]).name === name) {
      return c3.value;
    }
  }
}
function set(type, name, callback) {
  for (var i2 = 0, n2 = type.length; i2 < n2; ++i2) {
    if (type[i2].name === name) {
      type[i2] = noop, type = type.slice(0, i2).concat(type.slice(i2 + 1));
      break;
    }
  }
  if (callback != null) type.push({ name, value: callback });
  return type;
}
var dispatch_default = dispatch;

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f3) {
  setTimeout(f3, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t2 = new Timer();
  t2.restart(callback, delay, time);
  return t2;
}
function timerFlush() {
  now();
  ++frame;
  var t2 = taskHead, e2;
  while (t2) {
    if ((e2 = clockNow - t2._time) >= 0) t2._call.call(void 0, e2);
    t2 = t2._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-force/src/lcg.js
var a = 1664525;
var c = 1013904223;
var m = 4294967296;
function lcg_default() {
  let s2 = 1;
  return () => (s2 = (a * s2 + c) % m) / m;
}

// node_modules/d3-force/src/simulation.js
function x2(d2) {
  return d2.x;
}
function y2(d2) {
  return d2.y;
}
var initialRadius = 10;
var initialAngle = Math.PI * (3 - Math.sqrt(5));
function simulation_default(nodes) {
  var simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch_default("tick", "end"), random = lcg_default();
  if (nodes == null) nodes = [];
  function step() {
    tick();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }
  function tick(iterations) {
    var i2, n2 = nodes.length, node;
    if (iterations === void 0) iterations = 1;
    for (var k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay;
      forces.forEach(function(force) {
        force(alpha);
      });
      for (i2 = 0; i2 < n2; ++i2) {
        node = nodes[i2];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }
    return simulation;
  }
  function initializeNodes() {
    for (var i2 = 0, n2 = nodes.length, node; i2 < n2; ++i2) {
      node = nodes[i2], node.index = i2;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (isNaN(node.x) || isNaN(node.y)) {
        var radius = initialRadius * Math.sqrt(0.5 + i2), angle = i2 * initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }
  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes, random);
    return force;
  }
  initializeNodes();
  return simulation = {
    tick,
    restart: function() {
      return stepper.restart(step), simulation;
    },
    stop: function() {
      return stepper.stop(), simulation;
    },
    nodes: function(_2) {
      return arguments.length ? (nodes = _2, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },
    alpha: function(_2) {
      return arguments.length ? (alpha = +_2, simulation) : alpha;
    },
    alphaMin: function(_2) {
      return arguments.length ? (alphaMin = +_2, simulation) : alphaMin;
    },
    alphaDecay: function(_2) {
      return arguments.length ? (alphaDecay = +_2, simulation) : +alphaDecay;
    },
    alphaTarget: function(_2) {
      return arguments.length ? (alphaTarget = +_2, simulation) : alphaTarget;
    },
    velocityDecay: function(_2) {
      return arguments.length ? (velocityDecay = 1 - _2, simulation) : 1 - velocityDecay;
    },
    randomSource: function(_2) {
      return arguments.length ? (random = _2, forces.forEach(initializeForce), simulation) : random;
    },
    force: function(name, _2) {
      return arguments.length > 1 ? (_2 == null ? forces.delete(name) : forces.set(name, initializeForce(_2)), simulation) : forces.get(name);
    },
    find: function(x4, y4, radius) {
      var i2 = 0, n2 = nodes.length, dx, dy, d2, node, closest;
      if (radius == null) radius = Infinity;
      else radius *= radius;
      for (i2 = 0; i2 < n2; ++i2) {
        node = nodes[i2];
        dx = x4 - node.x;
        dy = y4 - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;
      }
      return closest;
    },
    on: function(name, _2) {
      return arguments.length > 1 ? (event.on(name, _2), simulation) : event.on(name);
    }
  };
}

// node_modules/d3-force/src/manyBody.js
function manyBody_default() {
  var nodes, node, random, alpha, strength = constant_default(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
  function force(_2) {
    var i2, n2 = nodes.length, tree = quadtree(nodes, x2, y2).visitAfter(accumulate);
    for (alpha = _2, i2 = 0; i2 < n2; ++i2) node = nodes[i2], tree.visit(apply);
  }
  function initialize() {
    if (!nodes) return;
    var i2, n2 = nodes.length, node2;
    strengths = new Array(n2);
    for (i2 = 0; i2 < n2; ++i2) node2 = nodes[i2], strengths[node2.index] = +strength(node2, i2, nodes);
  }
  function accumulate(quad) {
    var strength2 = 0, q2, c3, weight = 0, x4, y4, i2;
    if (quad.length) {
      for (x4 = y4 = i2 = 0; i2 < 4; ++i2) {
        if ((q2 = quad[i2]) && (c3 = Math.abs(q2.value))) {
          strength2 += q2.value, weight += c3, x4 += c3 * q2.x, y4 += c3 * q2.y;
        }
      }
      quad.x = x4 / weight;
      quad.y = y4 / weight;
    } else {
      q2 = quad;
      q2.x = q2.data.x;
      q2.y = q2.data.y;
      do
        strength2 += strengths[q2.data.index];
      while (q2 = q2.next);
    }
    quad.value = strength2;
  }
  function apply(quad, x1, _2, x22) {
    if (!quad.value) return true;
    var x4 = quad.x - node.x, y4 = quad.y - node.y, w2 = x22 - x1, l2 = x4 * x4 + y4 * y4;
    if (w2 * w2 / theta2 < l2) {
      if (l2 < distanceMax2) {
        if (x4 === 0) x4 = jiggle_default(random), l2 += x4 * x4;
        if (y4 === 0) y4 = jiggle_default(random), l2 += y4 * y4;
        if (l2 < distanceMin2) l2 = Math.sqrt(distanceMin2 * l2);
        node.vx += x4 * quad.value * alpha / l2;
        node.vy += y4 * quad.value * alpha / l2;
      }
      return true;
    } else if (quad.length || l2 >= distanceMax2) return;
    if (quad.data !== node || quad.next) {
      if (x4 === 0) x4 = jiggle_default(random), l2 += x4 * x4;
      if (y4 === 0) y4 = jiggle_default(random), l2 += y4 * y4;
      if (l2 < distanceMin2) l2 = Math.sqrt(distanceMin2 * l2);
    }
    do
      if (quad.data !== node) {
        w2 = strengths[quad.data.index] * alpha / l2;
        node.vx += x4 * w2;
        node.vy += y4 * w2;
      }
    while (quad = quad.next);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.strength = function(_2) {
    return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant_default(+_2), initialize(), force) : strength;
  };
  force.distanceMin = function(_2) {
    return arguments.length ? (distanceMin2 = _2 * _2, force) : Math.sqrt(distanceMin2);
  };
  force.distanceMax = function(_2) {
    return arguments.length ? (distanceMax2 = _2 * _2, force) : Math.sqrt(distanceMax2);
  };
  force.theta = function(_2) {
    return arguments.length ? (theta2 = _2 * _2, force) : Math.sqrt(theta2);
  };
  return force;
}

// node_modules/d3-force/src/x.js
function x_default2(x4) {
  var strength = constant_default(0.1), nodes, strengths, xz;
  if (typeof x4 !== "function") x4 = constant_default(x4 == null ? 0 : +x4);
  function force(alpha) {
    for (var i2 = 0, n2 = nodes.length, node; i2 < n2; ++i2) {
      node = nodes[i2], node.vx += (xz[i2] - node.x) * strengths[i2] * alpha;
    }
  }
  function initialize() {
    if (!nodes) return;
    var i2, n2 = nodes.length;
    strengths = new Array(n2);
    xz = new Array(n2);
    for (i2 = 0; i2 < n2; ++i2) {
      strengths[i2] = isNaN(xz[i2] = +x4(nodes[i2], i2, nodes)) ? 0 : +strength(nodes[i2], i2, nodes);
    }
  }
  force.initialize = function(_2) {
    nodes = _2;
    initialize();
  };
  force.strength = function(_2) {
    return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant_default(+_2), initialize(), force) : strength;
  };
  force.x = function(_2) {
    return arguments.length ? (x4 = typeof _2 === "function" ? _2 : constant_default(+_2), initialize(), force) : x4;
  };
  return force;
}

// node_modules/d3-force/src/y.js
function y_default2(y4) {
  var strength = constant_default(0.1), nodes, strengths, yz;
  if (typeof y4 !== "function") y4 = constant_default(y4 == null ? 0 : +y4);
  function force(alpha) {
    for (var i2 = 0, n2 = nodes.length, node; i2 < n2; ++i2) {
      node = nodes[i2], node.vy += (yz[i2] - node.y) * strengths[i2] * alpha;
    }
  }
  function initialize() {
    if (!nodes) return;
    var i2, n2 = nodes.length;
    strengths = new Array(n2);
    yz = new Array(n2);
    for (i2 = 0; i2 < n2; ++i2) {
      strengths[i2] = isNaN(yz[i2] = +y4(nodes[i2], i2, nodes)) ? 0 : +strength(nodes[i2], i2, nodes);
    }
  }
  force.initialize = function(_2) {
    nodes = _2;
    initialize();
  };
  force.strength = function(_2) {
    return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant_default(+_2), initialize(), force) : strength;
  };
  force.y = function(_2) {
    return arguments.length ? (y4 = typeof _2 === "function" ? _2 : constant_default(+_2), initialize(), force) : y4;
  };
  return force;
}

// src/core/layout.ts
var VIEW_TALL = { w: 260, h: 280, pad: 8 };
var VIEW_SHORT = { w: 260, h: 220, pad: 8 };
var VIEW_WIDE = { w: 640, h: 440, pad: 12 };
var VIEW_PORTRAIT = { w: 260, h: 400, pad: 8 };
var TICKS = 300;
function layoutTopicGraph(model, view) {
  const rel = relations(model);
  const curParent = rel.cur.parent;
  const near = /* @__PURE__ */ new Set([...rel.siblings, ...rel.direct]);
  const nodes = model.nodes.map((n2) => ({ id: n2.id, kind: n2.kind, current: n2.current }));
  const links = model.edges.map((e2) => ({ source: e2.s, target: e2.t, kind: e2.kind }));
  const pull = (d2) => d2.current || d2.id === curParent ? 0.3 : rel.siblings.has(d2.id) ? 0.15 : 0.05;
  const sim = simulation_default(nodes).force(
    "link",
    link_default(links).id((d2) => d2.id).distance((e2) => {
      if (e2.kind !== "tree") return 34;
      const s2 = e2.source;
      const t2 = e2.target;
      return s2.kind === "note" ? t2.id === curParent ? 22 : 16 : 42;
    }).strength((e2) => e2.kind === "tree" ? 0.9 : 0.12)
  ).force("charge", manyBody_default().strength((d2) => d2.kind === "note" ? -22 : -140)).force("collide", collide_default((d2) => d2.current ? 13 : d2.kind !== "note" ? 10 : near.has(d2.id) ? 8 : 5)).force("x", x_default2(0).strength((d2) => pull(d2) * (view.h / view.w))).force("y", y_default2(0).strength(pull)).stop();
  for (let i2 = 0; i2 < TICKS; i2++) sim.tick();
  const c0 = nodes.find((n2) => n2.current);
  const cx = c0.x ?? 0;
  const cy = c0.y ?? 0;
  const padX = view.pad + 18;
  const padY = view.pad + 12;
  const ax = view.w / 2;
  const ay = view.h / 2;
  const ext = { r: 1e-6, l: 1e-6, d: 1e-6, u: 1e-6 };
  for (const n2 of nodes) {
    const x4 = (n2.x ?? 0) - cx;
    const y4 = (n2.y ?? 0) - cy;
    ext.r = Math.max(ext.r, x4);
    ext.l = Math.max(ext.l, -x4);
    ext.d = Math.max(ext.d, y4);
    ext.u = Math.max(ext.u, -y4);
  }
  const k = { r: (view.w - padX - ax) / ext.r, l: (ax - padX) / ext.l, d: (view.h - padY - ay) / ext.d, u: (ay - padY) / ext.u };
  const kmin = Math.min(k.r, k.l, k.d, k.u);
  for (const s2 of ["r", "l", "d", "u"]) k[s2] = Math.min(k[s2], kmin * 1.8, 3);
  const round = (v2) => Math.round(v2 * 10) / 10;
  return new Map(
    nodes.map((n2) => {
      const x4 = (n2.x ?? 0) - cx;
      const y4 = (n2.y ?? 0) - cy;
      return [n2.id, { x: round(ax + x4 * (x4 > 0 ? k.r : k.l)), y: round(ay + y4 * (y4 > 0 ? k.d : k.u)) }];
    })
  );
}

// src/components/styles/topicGraph.scss
var topicGraph_default = ".topic-graph {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n.topic-graph.tg-overflow {\n  display: none;\n}\n\n.topic-graph,\n.topic-graph-dialog {\n  --tg-edge: color-mix(in srgb, var(--lightgray), var(--gray) 22%);\n  --tg-mute: color-mix(in srgb, var(--lightgray), var(--gray) 45%);\n  --tg-halo: var(--island-bg, var(--light));\n}\n.topic-graph .topic-graph-head,\n.topic-graph-dialog .topic-graph-head {\n  display: flex;\n  align-items: baseline;\n  gap: 0.4rem;\n}\n.topic-graph .topic-graph-title,\n.topic-graph-dialog .topic-graph-title {\n  margin: 0;\n}\n.topic-graph .topic-graph-topic,\n.topic-graph-dialog .topic-graph-topic {\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n.topic-graph .topic-graph-btn,\n.topic-graph-dialog .topic-graph-btn {\n  display: inline-flex;\n  align-items: center;\n  align-self: center;\n  padding: 0 0.35rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  background: none;\n  color: var(--gray);\n  font-family: var(--codeFont);\n  font-size: 0.68rem;\n  line-height: 1.6;\n  cursor: pointer;\n  transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);\n}\n.topic-graph .topic-graph-btn:hover,\n.topic-graph-dialog .topic-graph-btn:hover {\n  color: var(--secondary);\n  border-color: var(--secondary);\n}\n.topic-graph .topic-graph-btn:focus-visible,\n.topic-graph-dialog .topic-graph-btn:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 1px;\n}\n.topic-graph .topic-graph-btn svg,\n.topic-graph-dialog .topic-graph-btn svg {\n  width: 0.75rem;\n  height: 1.6em;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.3;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n.topic-graph .topic-graph-expand,\n.topic-graph .topic-graph-close,\n.topic-graph-dialog .topic-graph-expand,\n.topic-graph-dialog .topic-graph-close {\n  margin-left: auto;\n}\n.topic-graph .topic-graph-box,\n.topic-graph-dialog .topic-graph-box {\n  position: relative;\n  margin-top: 0.5rem;\n}\n.topic-graph .topic-graph-box svg,\n.topic-graph-dialog .topic-graph-box svg {\n  display: block;\n  width: 100%;\n  height: auto;\n  overflow: hidden;\n  touch-action: none;\n  user-select: none;\n  cursor: grab;\n}\n.topic-graph .topic-graph-box svg.tg-panning, .topic-graph .topic-graph-box svg.tg-dragging,\n.topic-graph-dialog .topic-graph-box svg.tg-panning,\n.topic-graph-dialog .topic-graph-box svg.tg-dragging {\n  cursor: grabbing;\n}\n.topic-graph .topic-graph-box svg.tg-short,\n.topic-graph-dialog .topic-graph-box svg.tg-short {\n  display: none;\n}\n@media (max-height: 760px) {\n  .topic-graph .topic-graph-box svg.tg-tall,\n  .topic-graph-dialog .topic-graph-box svg.tg-tall {\n    display: none;\n  }\n  .topic-graph .topic-graph-box svg.tg-short,\n  .topic-graph-dialog .topic-graph-box svg.tg-short {\n    display: block;\n  }\n}\n\n.tg-e {\n  fill: none;\n}\n\n.tg-tree {\n  stroke: var(--tg-edge);\n  stroke-width: 0.8;\n}\n\n.tg-link,\n.tg-series {\n  stroke: var(--gray);\n  stroke-width: 1;\n  opacity: 0.7;\n}\n\n.tg-series {\n  stroke-dasharray: 3 2.5;\n}\n\n.tg-link.hot,\n.tg-series.hot {\n  stroke: var(--secondary);\n  stroke-width: 1.5;\n  opacity: 1;\n}\n\n.tg-topic,\n.tg-folder {\n  fill: var(--tg-halo);\n  stroke: var(--gray);\n  stroke-width: 1.1;\n}\n\n.tg-folder.here {\n  stroke: var(--dark);\n  stroke-width: 1.5;\n}\n\n.tg-current-ring {\n  fill: none;\n  stroke: var(--secondary);\n  stroke-width: 1.5;\n}\n\n.tg-current {\n  fill: var(--secondary);\n}\n\n.tg-direct {\n  fill: var(--tg-halo);\n  stroke: var(--secondary);\n  stroke-width: 1.8;\n}\n\n.tg-sibling {\n  fill: var(--darkgray);\n}\n\n.tg-other {\n  fill: var(--tg-mute);\n}\n\n.tg-n {\n  cursor: pointer;\n  outline: none;\n}\n.tg-n.current {\n  cursor: default;\n}\n\n.tg-hit {\n  fill: transparent;\n}\n\n.tg-dragging .tg-n {\n  cursor: grabbing;\n}\n\n.tg-focus .tg-n:not(.near),\n.tg-focus .tg-e:not(.near) {\n  opacity: 0.2;\n}\n.tg-focus .tg-e.near {\n  stroke: var(--secondary);\n  stroke-width: 1.5;\n  opacity: 1;\n}\n.tg-focus .tg-labels .tg-label:not(.near) {\n  visibility: hidden;\n}\n\n.tg-n.hot > :not(.tg-hit) {\n  transform: scale(1.35);\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  .tg-n,\n  .tg-e {\n    transition: opacity var(--dur-fast) var(--ease), stroke var(--dur-fast) var(--ease);\n  }\n  .tg-n > * {\n    transition: transform var(--dur-fast) var(--ease);\n  }\n}\n.tg-n:focus-visible .tg-hit,\n.tg-n.armed .tg-hit {\n  stroke: var(--secondary);\n  stroke-width: 1.2;\n}\n\n.tg-label {\n  font-family: var(--bodyFont);\n  fill: var(--gray);\n  paint-order: stroke;\n  stroke: var(--tg-halo);\n  stroke-width: 3px;\n  stroke-linejoin: round;\n  pointer-events: none;\n}\n.tg-label.here {\n  fill: var(--dark);\n  font-weight: 700;\n}\n.tg-label.cur {\n  fill: var(--dark);\n  font-weight: 600;\n}\n.tg-label.note, .tg-label.tg-hover {\n  fill: var(--darkgray);\n}\n\n.topic-graph-dialog {\n  --tg-halo: var(--light);\n  box-sizing: border-box;\n  width: min(60rem, 100% - 4rem);\n  height: min(42rem, 100% - 4rem);\n  max-width: none;\n  max-height: none;\n  padding: 0;\n  border: 1px solid var(--lightgray);\n  border-radius: var(--radius-m, 8px);\n  background: var(--light);\n  color: var(--darkgray);\n  overscroll-behavior: contain;\n}\n.topic-graph-dialog::backdrop {\n  background: color-mix(in srgb, var(--light) 78%, transparent);\n}\n@media (max-width: 800px) {\n  .topic-graph-dialog {\n    width: 100%;\n    height: 100%;\n    border: 0;\n    border-radius: 0;\n  }\n}\n.topic-graph-dialog .topic-graph-sheet {\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 1rem 1.25rem 1.25rem;\n}\n.topic-graph-dialog .tg-wide-box {\n  flex: 1 1 0;\n  min-height: 0;\n  margin-top: 0.75rem;\n}\n.topic-graph-dialog .tg-wide-box svg {\n  height: 100%;\n}\n.topic-graph-dialog .tg-wide-box svg.tg-port {\n  display: none;\n}\n@media (max-width: 800px) {\n  .topic-graph-dialog .tg-wide-box svg.tg-land {\n    display: none;\n  }\n  .topic-graph-dialog .tg-wide-box svg.tg-port {\n    display: block;\n  }\n}\n\n.topic-graph-tip {\n  position: absolute;\n  z-index: 3;\n  max-width: 14rem;\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n  background: var(--dark);\n  color: var(--light);\n  font-size: 0.72rem;\n  line-height: 1.4;\n  pointer-events: none;\n}\n\n.topic-graph-tip-tags {\n  font-family: var(--codeFont);\n  font-size: 0.66rem;\n}";

// src/components/scripts/topicGraph.inline.ts
var topicGraph_inline_default = 'function U(t){return function(){return t}}function tt(t){return(t()-.5)*1e-6}function jt(t){return t.index}function bt(t,e){var i=t.get(e);if(!i)throw new Error("node not found: "+e);return i}function et(t){var e=jt,i=h,r,c=U(30),b,v,y,k,M,E=1;t==null&&(t=[]);function h(l){return 1/Math.min(y[l.source.index],y[l.target.index])}function S(l){for(var d=0,n=t.length;d<E;++d)for(var s=0,u,w,p,g,A,G,P;s<n;++s)u=t[s],w=u.source,p=u.target,g=p.x+p.vx-w.x-w.vx||tt(M),A=p.y+p.vy-w.y-w.vy||tt(M),G=Math.sqrt(g*g+A*A),G=(G-b[s])/G*l*r[s],g*=G,A*=G,p.vx-=g*(P=k[s]),p.vy-=A*P,w.vx+=g*(P=1-P),w.vy+=A*P}function N(){if(v){var l,d=v.length,n=t.length,s=new Map(v.map((w,p)=>[e(w,p,v),w])),u;for(l=0,y=new Array(d);l<n;++l)u=t[l],u.index=l,typeof u.source!="object"&&(u.source=bt(s,u.source)),typeof u.target!="object"&&(u.target=bt(s,u.target)),y[u.source.index]=(y[u.source.index]||0)+1,y[u.target.index]=(y[u.target.index]||0)+1;for(l=0,k=new Array(n);l<n;++l)u=t[l],k[l]=y[u.source.index]/(y[u.source.index]+y[u.target.index]);r=new Array(n),T(),b=new Array(n),f()}}function T(){if(v)for(var l=0,d=t.length;l<d;++l)r[l]=+i(t[l],l,t)}function f(){if(v)for(var l=0,d=t.length;l<d;++l)b[l]=+c(t[l],l,t)}return S.initialize=function(l,d){v=l,M=d,N()},S.links=function(l){return arguments.length?(t=l,N(),S):t},S.id=function(l){return arguments.length?(e=l,S):e},S.iterations=function(l){return arguments.length?(E=+l,S):E},S.strength=function(l){return arguments.length?(i=typeof l=="function"?l:U(+l),T(),S):i},S.distance=function(l){return arguments.length?(c=typeof l=="function"?l:U(+l),f(),S):c},S}var Ut={value:()=>{}};function Lt(){for(var t=0,e=arguments.length,i={},r;t<e;++t){if(!(r=arguments[t]+"")||r in i||/[\\s.]/.test(r))throw new Error("illegal type: "+r);i[r]=[]}return new X(i)}function X(t){this._=t}function Xt(t,e){return t.trim().split(/^|\\s+/).map(function(i){var r="",c=i.indexOf(".");if(c>=0&&(r=i.slice(c+1),i=i.slice(0,c)),i&&!e.hasOwnProperty(i))throw new Error("unknown type: "+i);return{type:i,name:r}})}X.prototype=Lt.prototype={constructor:X,on:function(t,e){var i=this._,r=Xt(t+"",i),c,b=-1,v=r.length;if(arguments.length<2){for(;++b<v;)if((c=(t=r[b]).type)&&(c=Yt(i[c],t.name)))return c;return}if(e!=null&&typeof e!="function")throw new Error("invalid callback: "+e);for(;++b<v;)if(c=(t=r[b]).type)i[c]=Et(i[c],t.name,e);else if(e==null)for(c in i)i[c]=Et(i[c],t.name,null);return this},copy:function(){var t={},e=this._;for(var i in e)t[i]=e[i].slice();return new X(t)},call:function(t,e){if((c=arguments.length-2)>0)for(var i=new Array(c),r=0,c,b;r<c;++r)i[r]=arguments[r+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(b=this._[t],r=0,c=b.length;r<c;++r)b[r].value.apply(e,i)},apply:function(t,e,i){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],c=0,b=r.length;c<b;++c)r[c].value.apply(e,i)}};function Yt(t,e){for(var i=0,r=t.length,c;i<r;++i)if((c=t[i]).name===e)return c.value}function Et(t,e,i){for(var r=0,c=t.length;r<c;++r)if(t[r].name===e){t[r]=Ut,t=t.slice(0,r).concat(t.slice(r+1));break}return i!=null&&t.push({name:e,value:i}),t}var nt=Lt;var _=0,R=0,B=0,Mt=1e3,Y,H,$=0,q=0,W=0,z=typeof performance=="object"&&performance.now?performance:Date,kt=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};function it(){return q||(kt($t),q=z.now()+W)}function $t(){q=0}function ot(){this._call=this._time=this._next=null}ot.prototype=Z.prototype={constructor:ot,restart:function(t,e,i){if(typeof t!="function")throw new TypeError("callback is not a function");i=(i==null?it():+i)+(e==null?0:+e),!this._next&&H!==this&&(H?H._next=this:Y=this,H=this),this._call=t,this._time=i,rt()},stop:function(){this._call&&(this._call=null,this._time=1/0,rt())}};function Z(t,e,i){var r=new ot;return r.restart(t,e,i),r}function Tt(){it(),++_;for(var t=Y,e;t;)(e=q-t._time)>=0&&t._call.call(void 0,e),t=t._next;--_}function St(){q=($=z.now())+W,_=R=0;try{Tt()}finally{_=0,Zt(),q=0}}function Wt(){var t=z.now(),e=t-$;e>Mt&&(W-=e,$=t)}function Zt(){for(var t,e=Y,i,r=1/0;e;)e._call?(r>e._time&&(r=e._time),t=e,e=e._next):(i=e._next,e._next=null,e=t?t._next=i:Y=i);H=t,rt(r)}function rt(t){if(!_){R&&(R=clearTimeout(R));var e=t-q;e>24?(t<1/0&&(R=setTimeout(St,t-z.now()-W)),B&&(B=clearInterval(B))):(B||($=z.now(),B=setInterval(Wt,Mt)),_=1,kt(St))}}function At(){let t=1;return()=>(t=(1664525*t+1013904223)%4294967296)/4294967296}var Jt=10,Qt=Math.PI*(3-Math.sqrt(5));function st(t){var e,i=1,r=.001,c=1-Math.pow(r,1/300),b=0,v=.6,y=new Map,k=Z(h),M=nt("tick","end"),E=At();t==null&&(t=[]);function h(){S(),M.call("tick",e),i<r&&(k.stop(),M.call("end",e))}function S(f){var l,d=t.length,n;f===void 0&&(f=1);for(var s=0;s<f;++s)for(i+=(b-i)*c,y.forEach(function(u){u(i)}),l=0;l<d;++l)n=t[l],n.fx==null?n.x+=n.vx*=v:(n.x=n.fx,n.vx=0),n.fy==null?n.y+=n.vy*=v:(n.y=n.fy,n.vy=0);return e}function N(){for(var f=0,l=t.length,d;f<l;++f){if(d=t[f],d.index=f,d.fx!=null&&(d.x=d.fx),d.fy!=null&&(d.y=d.fy),isNaN(d.x)||isNaN(d.y)){var n=Jt*Math.sqrt(.5+f),s=f*Qt;d.x=n*Math.cos(s),d.y=n*Math.sin(s)}(isNaN(d.vx)||isNaN(d.vy))&&(d.vx=d.vy=0)}}function T(f){return f.initialize&&f.initialize(t,E),f}return N(),e={tick:S,restart:function(){return k.restart(h),e},stop:function(){return k.stop(),e},nodes:function(f){return arguments.length?(t=f,N(),y.forEach(T),e):t},alpha:function(f){return arguments.length?(i=+f,e):i},alphaMin:function(f){return arguments.length?(r=+f,e):r},alphaDecay:function(f){return arguments.length?(c=+f,e):+c},alphaTarget:function(f){return arguments.length?(b=+f,e):b},velocityDecay:function(f){return arguments.length?(v=1-f,e):1-v},randomSource:function(f){return arguments.length?(E=f,y.forEach(T),e):E},force:function(f,l){return arguments.length>1?(l==null?y.delete(f):y.set(f,T(l)),e):y.get(f)},find:function(f,l,d){var n=0,s=t.length,u,w,p,g,A;for(d==null?d=1/0:d*=d,n=0;n<s;++n)g=t[n],u=f-g.x,w=l-g.y,p=u*u+w*w,p<d&&(A=g,d=p);return A},on:function(f,l){return arguments.length>1?(M.on(f,l),e):M.on(f)}}}var Nt=(t,e)=>[...t].length>e?[...t].slice(0,e-1).join("")+"\\u2026":t;function lt(){for(let t of document.querySelectorAll(".graph > .graph-outer"))t.remove()}lt();var te="(max-height: 760px)",J=null,ee="(min-width: 1201px)";function ct(){for(let t of document.querySelectorAll(".sidebar.right .topic-graph")){let e=t.closest(".sidebar");t.classList.remove("tg-overflow"),!(!e||!window.matchMedia(ee).matches)&&e.scrollHeight>e.clientHeight+1&&t.classList.add("tg-overflow")}K()}ct();var at=0,ut=()=>{at||(at=requestAnimationFrame(()=>(at=0,ct())))};window.addEventListener("resize",ut,{passive:!0});document.fonts?.ready.then(ut);function ne(){lt(),ct();let t=document.querySelector(".sidebar.right .toc");if(t&&"ResizeObserver"in window){let i=new ResizeObserver(ut);i.observe(t),window.addCleanup(()=>i.disconnect())}J=new Set,K();for(let i of document.querySelectorAll(".topic-graph"))oe(i);let e=window.matchMedia(te);e.addEventListener("change",K),window.addCleanup(()=>e.removeEventListener("change",K))}function K(){if(J)for(let t of document.querySelectorAll(".topic-graph-box"))for(let e of t.querySelectorAll("svg"))J.has(e)||e.getClientRects().length===0||(J.add(e),le(t,e))}function oe(t){let e=t.querySelector(".topic-graph-dialog"),i=t.querySelector(".topic-graph-expand"),r=e?.querySelector(".topic-graph-close");if(!e||!i||!r)return;let c=null,b=()=>{c=document.activeElement instanceof HTMLElement?document.activeElement:i,document.body.appendChild(e),e.showModal(),K()},v=()=>{t.appendChild(e),c?.focus(),c=null},y=()=>e.close(),k=E=>{E.target===e&&e.close()},M=E=>{if((E.metaKey||E.ctrlKey)&&E.key.toLowerCase()==="g")return e.close();if(E.key!=="Tab")return;let h=[...e.querySelectorAll("button, [tabindex=\'0\']")].filter(T=>T.getClientRects().length>0),S=h[0],N=h[h.length-1];!S||!N||(E.shiftKey&&(document.activeElement===S||!e.contains(document.activeElement))?(E.preventDefault(),N.focus()):!E.shiftKey&&document.activeElement===N&&(E.preventDefault(),S.focus()))};i.addEventListener("click",b),r.addEventListener("click",y),e.addEventListener("click",k),e.addEventListener("close",v),e.addEventListener("keydown",M),window.addCleanup(()=>{i.removeEventListener("click",b),r.removeEventListener("click",y),e.removeEventListener("click",k),e.removeEventListener("close",v),e.removeEventListener("keydown",M),e.open&&e.close()})}var re="(prefers-reduced-motion: reduce)",ie=.6,se=4,Gt=3;function ae(t){let e=t.querySelector(".tg-world"),i=[],r=new Map;for(let n of t.querySelectorAll(".tg-n")){let s=/translate\\(([-\\d.]+),([-\\d.]+)\\)/.exec(n.getAttribute("transform")??""),u=Number(s?.[1]??0),w=Number(s?.[2]??0),p=n.classList.contains("current")?0:n.querySelector(".tg-direct")?1:n.querySelector(".tg-sibling")?3:n.querySelector(".tg-other")?4:2,g={id:n.dataset.id,hx:u,hy:w,x:u,y:w,el:n,rank:p};i.push(g),r.set(g.id,g)}let c=[],b=new Map(i.map(n=>[n.id,new Set([n.id])]));for(let n of t.querySelectorAll(".tg-e")){let s=r.get(n.dataset.s),u=r.get(n.dataset.t);!s||!u||(c.push({source:s,target:u,el:n,rest:Math.hypot(s.hx-u.hx,s.hy-u.hy),tree:n.classList.contains("tg-tree")}),b.get(s.id).add(u.id),b.get(u.id).add(s.id))}let v=[...t.querySelectorAll(".tg-label")].flatMap(n=>{let s=r.get(n.dataset.for);return s?[{el:n,n:s,dx:Number(n.getAttribute("x"))-s.hx,dy:Number(n.getAttribute("y"))-s.hy}]:[]}),y=()=>{for(let n of i)n.el.setAttribute("transform",`translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);for(let n of c){let s=n.source,u=n.target;n.el.setAttribute("x1",s.x.toFixed(1)),n.el.setAttribute("y1",s.y.toFixed(1)),n.el.setAttribute("x2",u.x.toFixed(1)),n.el.setAttribute("y2",u.y.toFixed(1))}for(let n of v)n.el.setAttribute("x",(n.n.x+n.dx).toFixed(1)),n.el.setAttribute("y",(n.n.y+n.dy).toFixed(1))},k=()=>{for(let n of i)n.fx==null&&(n.vx+=(n.hx-n.x)*.03,n.vy+=(n.hy-n.y)*.03)},M=()=>{if(i.some(s=>s.fx!=null))return;if(Math.max(...i.map(s=>Math.hypot(s.hx-s.x,s.hy-s.y)))>.3)return void E.alpha(.05).restart();for(let s of i)s.x=s.hx,s.y=s.hy,s.vx=s.vy=0;y()},E=st(i).force("link",et(c).distance(n=>n.rest).strength(n=>n.tree?.7:.3)).force("home",k).velocityDecay(.35).alphaDecay(.045).on("tick",y).on("end",M).stop(),h={k:1,x:0,y:0},S=()=>e.setAttribute("transform",`translate(${h.x.toFixed(2)},${h.y.toFixed(2)}) scale(${h.k.toFixed(3)})`),N=n=>{let s=new DOMPoint(n.clientX,n.clientY).matrixTransform(t.getScreenCTM().inverse());return{x:s.x,y:s.y}},T=(n,s)=>{s=Math.min(se,Math.max(ie,s)),h={k:s,x:n.x-(n.x-h.x)*s/h.k,y:n.y-(n.y-h.y)*s/h.k},S()},f=()=>window.matchMedia(re).matches,l=t.dataset.entered==="1",d=i.find(n=>n.el.classList.contains("current"))??i[0];if(d&&!f()&&!l){for(let n of i)n.x=d.hx+(n.hx-d.hx)*.25,n.y=d.hy+(n.hy-d.hy)*.25;y(),E.alpha(1).restart()}return t.dataset.entered="1",{world:e,labels:v,nodes:i,byId:r,adj:b,sim:E,draw:y,reduce:f,toView:N,zoomAt:T,get view(){return h},pan(n,s){h={...h,x:h.x+n,y:h.y+s},S()},reset(){h={k:1,x:0,y:0},S()},visible(){let n=t.viewBox.baseVal;return{x:-h.x/h.k,y:-h.y/h.k,w:n.width/h.k,h:n.height/h.k}},screenOf(n,s){let u=new DOMPoint(n.x*h.k+h.x,n.y*h.k+h.y).matrixTransform(t.getScreenCTM()),w=s.getBoundingClientRect();return{x:u.x-w.left,y:u.y-w.top}}}}function le(t,e){let i=t.querySelector(".topic-graph-tip");if(!i)return;let r=ae(e),c=null,b="mouse",v=null,y=o=>o?.closest?.(".tg-n")??null,k=o=>r.byId.get(o.dataset.id),M=o=>{if(i.textContent=o.dataset.tip??"",o.dataset.tags){let C=document.createElement("span");C.className="topic-graph-tip-tags",C.textContent=" \\xB7 "+o.dataset.tags,i.appendChild(C)}i.hidden=!1;let{x:a,y:m}=r.screenOf(k(o),t),V=i.offsetWidth;i.style.left=`${Math.max(0,Math.min(t.clientWidth-V,a-V/2))}px`,i.style.top=`${m>i.offsetHeight+16?m-i.offsetHeight-12:m+14}px`},E=()=>{i.hidden=!0},h=e.classList.contains("tg-wide"),S=h?14:6,N=h?28:16,T=document.createElementNS("http://www.w3.org/2000/svg","g");T.setAttribute("class","tg-hover-labels"),T.setAttribute("aria-hidden","true"),r.world.appendChild(T);let f=()=>{T.replaceChildren();for(let o=r.labels.length-1;o>=0;o--)r.labels[o].el.classList.contains("tg-hover")&&r.labels.splice(o,1)},l=(o,a)=>o.x<a.x+a.w&&a.x<o.x+o.w&&o.y<a.y+a.h&&a.y<o.y+o.h,d=(o,a)=>{let m=r.visible(),V=x=>x.rank===0?9:(x.el.querySelector(":scope > :last-child")?.getBBox().width??4)/2,C=[],xt=new Set;if(!i.hidden){let x=i.getBoundingClientRect(),L=r.toView({clientX:x.left,clientY:x.top}),F=r.toView({clientX:x.right,clientY:x.bottom}),D=r.view.k;C.push({x:(L.x-r.view.x)/D,y:(L.y-r.view.y)/D,w:(F.x-L.x)/D,h:(F.y-L.y)/D})}for(let x of e.querySelectorAll(".tg-labels .tg-label.near")){let L=x.getBBox();C.push({x:L.x,y:L.y,w:L.width,h:L.height}),xt.add(x.dataset.for)}let Rt=[...a].map(x=>{let L=r.byId.get(x),F=V(L)+1;return{id:x,x:L.x-F,y:L.y-F,w:2*F,h:2*F}}),Ht=[...a].map(x=>r.byId.get(x)).filter(x=>x.id!==o.dataset.id&&!xt.has(x.id)).sort((x,L)=>x.rank-L.rank).slice(0,S);for(let x of Ht){let L=document.createElementNS("http://www.w3.org/2000/svg","text");L.setAttribute("class","tg-label tg-hover"),L.setAttribute("font-size",String(10)),L.textContent=Nt(x.el.dataset.name??"",N),T.appendChild(L);let F=L.getComputedTextLength(),D=V(x)+3,yt=[[x.x+D,x.y+10*.35,"start"],[x.x-D,x.y+10*.35,"end"],[x.x,x.y+D+10*.8,"middle"],[x.x,x.y-D,"middle"]].find(([Q,Kt,wt])=>{let O={x:wt==="start"?Q:wt==="end"?Q-F:Q-F/2,y:Kt-10*.95,w:F,h:10*1.25};return O.x>=m.x&&O.y>=m.y&&O.x+O.w<=m.x+m.w&&O.y+O.h<=m.y+m.h&&!C.some(j=>l(O,j))&&!Rt.some(j=>j.id!==x.id&&l(O,j))?(C.push(O),!0):!1});if(!yt){L.remove();continue}let[gt,vt,zt]=yt;L.setAttribute("x",gt.toFixed(1)),L.setAttribute("y",vt.toFixed(1)),L.setAttribute("text-anchor",zt),r.labels.push({el:L,n:x,dx:gt-x.x,dy:vt-x.y})}},n=o=>{if(v===o)return;v?.classList.remove("hot"),v=o,o?.classList.add("hot"),e.classList.toggle("tg-focus",!!o);let a=o?r.adj.get(o.dataset.id):null;for(let m of r.nodes)m.el.classList.toggle("near",!!a?.has(m.id));for(let m of e.querySelectorAll(".tg-e"))m.classList.toggle("near",!!o&&(m.dataset.s===o.dataset.id||m.dataset.t===o.dataset.id));for(let m of e.querySelectorAll(".tg-labels .tg-label"))m.classList.toggle("near",!!a?.has(m.dataset.for));f(),o&&a&&d(o,a)},s=()=>{c?.classList.remove("armed"),c=null,E(),n(null)},u=(o,a)=>{let m=o.dataset.href;if(!m||o.classList.contains("current"))return;let V=new URL(m,window.location.toString()),C=e.closest("dialog");C?.open&&!a&&C.close(),a?window.open(V,"_blank"):window.spaNavigate?window.spaNavigate(V):window.location.assign(V)},w=new Map,p=null,g=null,A=null,G=!1,P=()=>{let[o,a]=[...w.values()];return{mid:{x:(o.x+a.x)/2,y:(o.y+a.y)/2},d:Math.hypot(o.x-a.x,o.y-a.y)}},Vt=o=>{if(b=o.pointerType,o.button!==0)return;let a=r.toView(o);if(w.set(o.pointerId,a),w.size===2){p&&ft(),g=null,A={d:P().d,k:r.view.k};return}let m=y(o.target);m?p={id:o.pointerId,node:m,start:a,moved:!1}:g={id:o.pointerId,last:a,moved:!1}},ft=()=>{if(!p)return;let o=k(p.node);o.fx=null,o.fy=null,p.node.classList.remove("dragging"),e.classList.remove("tg-dragging"),r.reduce()?(o.x=o.hx,o.y=o.hy,r.draw()):r.sim.alphaTarget(0),p=null},Ct=o=>{if(!w.has(o.pointerId))return;let a=r.toView(o);if(w.set(o.pointerId,a),A&&w.size===2){let m=P();r.zoomAt(m.mid,A.k*(m.d/A.d)),G=!0;return}if(p&&p.id===o.pointerId){if(!p.moved&&Math.hypot(a.x-p.start.x,a.y-p.start.y)<Gt)return;p.moved||(p.moved=!0,e.setPointerCapture(o.pointerId),p.node.classList.add("dragging"),e.classList.add("tg-dragging"),E(),r.reduce()||r.sim.alphaTarget(.3).restart());let m=k(p.node);m.fx=(a.x-r.view.x)/r.view.k,m.fy=(a.y-r.view.y)/r.view.k,r.reduce()&&(m.x=m.fx,m.y=m.fy,r.draw());return}if(g&&g.id===o.pointerId){let m=a.x-g.last.x,V=a.y-g.last.y;if(!g.moved&&Math.hypot(m,V)<Gt)return;g.moved||e.setPointerCapture(o.pointerId),g.moved=!0,e.classList.add("tg-panning"),g.last=a,r.pan(m,V)}},dt=o=>{if(w.delete(o.pointerId)){if(A){w.size<2&&(A=null);return}p&&p.id===o.pointerId&&(p.moved&&(G=!0),ft()),g&&g.id===o.pointerId&&(g.moved&&(G=!0),e.classList.remove("tg-panning"),g=null)}},Ft=o=>{o.preventDefault();let a=o.deltaMode===1?o.deltaY*16:o.deltaY;r.zoomAt(r.toView(o),r.view.k*Math.exp(-a*.0025)),v&&M(v)},Dt=o=>{y(o.target)||r.reset()},Ot=o=>{let a=y(o.target);if(G){G=!1,o.stopPropagation();return}if(a){if(o.stopPropagation(),b!=="touch")return u(a,o.ctrlKey||o.metaKey);if(c===a)return s(),u(a,!1);s(),c=a,a.classList.add("armed"),M(a),n(a)}},Pt=o=>{if(o.pointerType==="touch"||p?.moved||g?.moved)return;let a=y(o.target);a&&(M(a),n(a))},qt=o=>{o.pointerType==="touch"||c||p?.moved||y(o.relatedTarget)===v&&v||(E(),n(null))},_t=o=>{let a=y(o.target);a&&(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),u(a,o.ctrlKey||o.metaKey))},It=o=>{let a=y(o.target);a&&(M(a),n(a))},Bt=()=>{c||(E(),n(null))},mt=o=>{c&&!t.contains(o.target)&&s()},ht=[["pointerdown",Vt],["pointermove",Ct],["pointerup",dt],["pointercancel",dt],["wheel",Ft,{passive:!1}],["dblclick",Dt],["click",Ot],["pointerover",Pt],["pointerout",qt],["keydown",_t],["focusin",It],["focusout",Bt]];for(let[o,a,m]of ht)e.addEventListener(o,a,m);document.addEventListener("click",mt);let pt=e.closest("dialog");pt?.addEventListener("close",s),window.addCleanup(()=>{r.sim.stop();for(let[o,a,m]of ht)e.removeEventListener(o,a,m);document.removeEventListener("click",mt),pt?.removeEventListener("close",s)})}document.addEventListener("nav",ne);document.addEventListener("render",lt);\n';

// src/components/scripts/tocFold.inline.ts
var tocFold_inline_default = 'var L="(min-width: 1201px)";function h(s){let n=[];for(let o of s.querySelectorAll(":scope > li"))if(o.classList.contains("depth-0")||!n.length){let i=o.querySelector("a")?.dataset.for??"";n.push({head:o,target:document.getElementById(i),subs:[]})}else n[n.length-1].subs.push(o);return n}function g(){let s=document.querySelector(".sidebar.right .toc-content"),n=s?.closest(".sidebar");if(!s||!n)return;let o=h(s);if(!o.some(t=>t.subs.length))return;let i=-1,c=()=>{let t=-1;o.forEach((e,r)=>{e.target&&e.target.getBoundingClientRect().top<window.innerHeight&&(t=r)}),t!==i&&(i=t,o.forEach((e,r)=>e.subs.forEach(m=>m.classList.toggle("toc-folded",r!==i))))},a=()=>{s.classList.remove("toc-fold");let t=!1;if(window.matchMedia(L).matches&&!s.classList.contains("collapsed")){let e=n.querySelector(".topic-graph"),r=e?.style.display??"";e&&(e.style.display="none"),t=n.scrollHeight>n.clientHeight+1,e&&(e.style.display=r)}s.classList.toggle("toc-fold",t),i=-2,t&&c()},d=t=>{let e=0;return()=>{e||(e=requestAnimationFrame(()=>(e=0,t())))}},u=d(()=>s.classList.contains("toc-fold")&&c()),l=d(a),f=s.closest(".toc")?.querySelector(".toc-header");a(),document.fonts?.ready.then(l),window.addEventListener("scroll",u,{passive:!0}),window.addEventListener("resize",l,{passive:!0}),f?.addEventListener("click",l),window.addCleanup(()=>{window.removeEventListener("scroll",u),window.removeEventListener("resize",l),f?.removeEventListener("click",l)})}document.addEventListener("nav",g);\n';
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
  var a3, c3, p2 = t2;
  if ("ref" in p2) for (c3 in p2 = {}, t2) "ref" == c3 ? a3 = t2[c3] : p2[c3] = t2[c3];
  var l2 = { type: e2, props: p2, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a3 = e2.defaultProps)) for (c3 in a3) void 0 === p2[c3] && (p2[c3] = a3[c3]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/TopicGraph.tsx
var defaultOptions = { title: "Graph", folderTitles: {} };
function tagsOf(f3) {
  const raw = f3.frontmatter?.tags;
  if (Array.isArray(raw)) return raw.map(String);
  return typeof raw === "string" && raw.trim() ? [raw.trim()] : [];
}
var warned = /* @__PURE__ */ new Set();
function warnAliasCollisions(listed) {
  const notes = listed.map((f3) => ({ slug: f3.slug, aliases: (f3.aliases ?? []).map(String) }));
  for (const c3 of aliasCollisions(notes)) {
    const key = `${c3.slug}|${c3.alias}`;
    if (warned.has(key)) continue;
    warned.add(key);
    console.warn(`[topic-graph] ${c3.slug}: \uBCC4\uCE6D "${c3.alias}"\uC758 \uB9AC\uB2E4\uC774\uB809\uD2B8 \uC2AC\uB7EC\uADF8\uAC00 \uB178\uD2B8 \uD30C\uC77C\uBA85(${c3.hits.join(", ")})\uACFC \uACB9\uCE5C\uB2E4 \u2014 [[\uD30C\uC77C\uBA85]] \uB9C1\uD06C\uAC00 \uBCC4\uCE6D \uD398\uC774\uC9C0\uB85C \uD480\uB824 Backlinks\uC5D0\uC11C \uBE60\uC9C4\uB2E4`);
  }
}
var R_CURRENT = 5;
var R_RING = 9;
var R_DIRECT = 3.8;
var R_SIBLING = 2.8;
var R_OTHER = 1.8;
var NOTE_LABEL_MAX = 22;
var TopicGraph_default = ((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  const TopicGraph = ({ fileData, allFiles, displayClass }) => {
    const current = fileData;
    const slug = current.slug;
    if (!slug || !isListedNote(current)) return null;
    const listed = allFiles.filter((f3) => f3.slug && isListedNote(f3));
    warnAliasCollisions(listed);
    const notes = listed.map((f3) => ({
      slug: f3.slug,
      title: String(f3.frontmatter?.title ?? f3.slug),
      links: f3.links ?? [],
      tags: tagsOf(f3),
      series: seriesOf(f3),
      seriesIndex: seriesIndexOf(f3)
    }));
    const model = buildTopicGraph(slug, notes, (p2) => folderTitle(p2, opts.folderTitles), topicName);
    if (!model) return null;
    const rel = relations(model);
    const touches = (s2, t2) => s2 === rel.cur.id || t2 === rel.cur.id;
    const rank = (n2) => n2.current ? 4 : rel.direct.has(n2.id) ? 3 : n2.kind !== "note" ? 2 : rel.siblings.has(n2.id) ? 1 : 0;
    const radius = (n2) => n2.kind !== "note" ? 5 : n2.current ? R_RING : rel.direct.has(n2.id) ? R_DIRECT : rel.siblings.has(n2.id) ? R_SIBLING : R_OTHER;
    const labelled = model.nodes.filter((n2) => n2.kind === "folder" && (n2.depth === 1 || rel.ancestors.has(n2.id))).sort((a3, b2) => Number(b2.id === rel.cur.parent) - Number(a3.id === rel.cur.parent) || Number(rel.ancestors.has(b2.id)) - Number(rel.ancestors.has(a3.id)));
    const hrefOf = (n2) => {
      const target = n2.kind === "note" ? n2.slug : `${n2.id.slice(2)}/index`;
      return resolveRelative(slug, target);
    };
    const tipOf = (n2) => n2.kind === "note" ? n2.label : `${n2.label} \xB7 ${n2.count}\uD3B8`;
    const tagLine = (n2) => n2.tags.map((t2) => "#" + t2).join(" ");
    const edges = [...model.edges].sort(
      (a3, b2) => Number(a3.kind !== "tree") - Number(b2.kind !== "tree") || Number(touches(a3.s, a3.t)) - Number(touches(b2.s, b2.t))
    );
    const nodes = [...model.nodes].sort((a3, b2) => rank(a3) - rank(b2));
    const extra = [
      ...model.nodes.filter((n2) => n2.current),
      ...model.nodes.filter((n2) => n2.kind === "note" && rel.direct.has(n2.id)),
      ...model.nodes.filter((n2) => n2.kind === "folder" && !labelled.includes(n2))
    ];
    const labelClass = (id) => {
      const n2 = model.nodes.find((m3) => m3.id === id);
      return id === rel.cur.parent ? "tg-label here" : n2.current ? "tg-label cur" : n2.kind === "note" ? "tg-label note" : "tg-label";
    };
    const renderSvg = (view, cls, wide = false) => {
      const pos = layoutTopicGraph(model, view);
      const at = (id) => pos.get(id);
      const obstacles = model.nodes.filter((n2) => n2.kind !== "note" || n2.current || rel.direct.has(n2.id) || rel.siblings.has(n2.id)).map((n2) => {
        const r2 = radius(n2) + 2;
        const p2 = at(n2.id);
        return { id: n2.id, x: p2.x - r2, y: p2.y - r2, w: 2 * r2, h: 2 * r2 };
      });
      const labels = placeLabels(
        [
          ...labelled.map((n2) => ({ id: n2.id, text: n2.label, bold: n2.id === rel.cur.parent, at: at(n2.id), gap: 7 })),
          ...(wide ? extra : []).map((n2) => ({
            id: n2.id,
            text: n2.kind === "note" ? clip(n2.label, NOTE_LABEL_MAX) : n2.label,
            bold: n2.current,
            at: at(n2.id),
            gap: n2.current ? R_RING + 3 : 7,
            optional: true
          }))
        ],
        obstacles,
        view
      );
      return /* @__PURE__ */ u2("svg", { class: cls, viewBox: `0 0 ${view.w} ${view.h}`, role: "group", "aria-label": `${topicName(slug)} topic graph`, children: /* @__PURE__ */ u2("g", { class: "tg-world", children: [
        /* @__PURE__ */ u2("g", { class: "tg-edges", children: edges.map((e2) => {
          const a3 = at(e2.s);
          const b2 = at(e2.t);
          const hot = e2.kind !== "tree" && touches(e2.s, e2.t);
          return /* @__PURE__ */ u2("line", { x1: a3.x, y1: a3.y, x2: b2.x, y2: b2.y, class: `tg-e tg-${e2.kind}${hot ? " hot" : ""}`, "data-s": e2.s, "data-t": e2.t });
        }) }),
        /* @__PURE__ */ u2("g", { class: "tg-nodes", children: nodes.map((n2) => {
          const p2 = at(n2.id);
          const here = n2.id === rel.cur.parent;
          let shape;
          if (n2.kind === "topic") shape = /* @__PURE__ */ u2("circle", { r: 4.5, class: "tg-topic" });
          else if (n2.kind === "folder") {
            const s2 = here ? 7 : 6;
            shape = /* @__PURE__ */ u2("rect", { x: -s2 / 2, y: -s2 / 2, width: s2, height: s2, class: here ? "tg-folder here" : "tg-folder" });
          } else if (n2.current)
            shape = /* @__PURE__ */ u2(S, { children: [
              /* @__PURE__ */ u2("circle", { r: R_RING, class: "tg-current-ring" }),
              /* @__PURE__ */ u2("circle", { r: R_CURRENT, class: "tg-current" })
            ] });
          else if (rel.direct.has(n2.id)) shape = /* @__PURE__ */ u2("circle", { r: R_DIRECT, class: "tg-direct" });
          else if (rel.siblings.has(n2.id)) shape = /* @__PURE__ */ u2("circle", { r: R_SIBLING, class: "tg-sibling" });
          else shape = /* @__PURE__ */ u2("circle", { r: R_OTHER, class: "tg-other" });
          const tags = n2.kind === "note" ? tagLine(n2) : "";
          return /* @__PURE__ */ u2(
            "g",
            {
              class: `tg-n${n2.current ? " current" : ""}`,
              tabindex: 0,
              role: "link",
              "aria-label": tipOf(n2) + (tags ? ` \xB7 ${tags}` : ""),
              "aria-current": n2.current ? "page" : void 0,
              transform: `translate(${p2.x},${p2.y})`,
              "data-href": hrefOf(n2),
              "data-id": n2.id,
              "data-tip": tipOf(n2),
              "data-name": n2.label,
              "data-tags": tags || void 0,
              children: [
                /* @__PURE__ */ u2("circle", { r: R_RING, class: "tg-hit" }),
                shape
              ]
            }
          );
        }) }),
        /* @__PURE__ */ u2("g", { class: "tg-labels", "aria-hidden": "true", children: labels.map((l2) => /* @__PURE__ */ u2(
          "text",
          {
            x: Math.round(l2.x * 10) / 10,
            y: Math.round(l2.y * 10) / 10,
            "text-anchor": l2.anchor,
            "font-size": FONT,
            class: labelClass(l2.id),
            "data-for": l2.id,
            children: l2.text
          }
        )) })
      ] }) });
    };
    return /* @__PURE__ */ u2("div", { class: ["topic-graph", displayClass].filter(Boolean).join(" "), children: [
      /* @__PURE__ */ u2("div", { class: "topic-graph-head", children: [
        /* @__PURE__ */ u2("h3", { class: "topic-graph-title", children: opts.title }),
        /* @__PURE__ */ u2("span", { class: "topic-graph-topic", children: topicName(slug) }),
        /* @__PURE__ */ u2("button", { type: "button", class: "topic-graph-btn topic-graph-expand", "aria-label": "Expand graph", "aria-haspopup": "dialog", title: "\uD655\uB300 \uBCF4\uAE30", children: /* @__PURE__ */ u2("svg", { viewBox: "0 0 12 12", "aria-hidden": "true", children: /* @__PURE__ */ u2("path", { d: "M7.5 1.5h3v3M4.5 10.5h-3v-3M10.5 1.5 7 5M1.5 10.5 5 7" }) }) }),
        /* @__PURE__ */ u2("button", { type: "button", class: "global-graph-icon topic-graph-btn topic-graph-global", "aria-label": "Global Graph", title: "Global graph (\u2318G)", children: "\u2318G" })
      ] }),
      /* @__PURE__ */ u2("div", { class: "topic-graph-box", children: [
        renderSvg(VIEW_TALL, "tg-tall"),
        renderSvg(VIEW_SHORT, "tg-short"),
        /* @__PURE__ */ u2("div", { class: "topic-graph-tip", hidden: true })
      ] }),
      /* @__PURE__ */ u2("dialog", { class: "topic-graph-dialog", "aria-label": `${opts.title} \xB7 ${topicName(slug)}`, children: /* @__PURE__ */ u2("div", { class: "topic-graph-sheet", children: [
        /* @__PURE__ */ u2("div", { class: "topic-graph-head", children: [
          /* @__PURE__ */ u2("h3", { class: "topic-graph-title", children: opts.title }),
          /* @__PURE__ */ u2("span", { class: "topic-graph-topic", children: topicName(slug) }),
          /* @__PURE__ */ u2("button", { type: "button", class: "topic-graph-btn topic-graph-close", "aria-label": "Close", title: "\uB2EB\uAE30 (Esc)", children: /* @__PURE__ */ u2("svg", { viewBox: "0 0 12 12", "aria-hidden": "true", children: /* @__PURE__ */ u2("path", { d: "M2.5 2.5l7 7M9.5 2.5l-7 7" }) }) })
        ] }),
        /* @__PURE__ */ u2("div", { class: "topic-graph-box tg-wide-box", children: [
          renderSvg(VIEW_WIDE, "tg-wide tg-land", true),
          renderSvg(VIEW_PORTRAIT, "tg-wide tg-port", true),
          /* @__PURE__ */ u2("div", { class: "topic-graph-tip", hidden: true })
        ] })
      ] }) })
    ] });
  };
  TopicGraph.css = topicGraph_default;
  TopicGraph.afterDOMLoaded = topicGraph_inline_default + ";\n(() => {\n" + tocFold_inline_default + "\n})();";
  return TopicGraph;
});

export { TopicGraph_default as TopicGraph };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map