// node_modules/unist-util-is/lib/index.js
var convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  })
);
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index === "number" ? index : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node, index, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node && typeof node === "object" ? node : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index = parent ? parent.children.indexOf(node) : void 0;
    return visitor(node, index, parent);
  }
}

// src/build-nodes.ts
var container = (hName, hProperties, children) => ({ type: "blockquote", data: { hName, hProperties }, children });
var textBlock = (hName, hProperties, value) => ({
  type: "paragraph",
  data: { hName, hProperties },
  children: [{ type: "text", value }]
});
var cssSize = (value, fallback) => {
  if (typeof value === "number") return `${value}px`;
  const text = String(value ?? "").trim();
  return text === "" ? fallback : text;
};
var OVERLAY_MODES = ["never", "hover", "always"];
var FIT_MODES = ["cover", "contain", "natural"];
var ALIGN_MODES = ["left", "center", "right", "full"];
function pick(value, allowed, fallback) {
  const text = String(value ?? "").trim().toLowerCase();
  return allowed.includes(text) ? text : fallback;
}
function buildFigure(image, index, withArea) {
  const style = [];
  if (withArea) style.push(`grid-area:image-${index}`);
  if (image.width) style.push(`max-width:${image.width}px`);
  const frame = {
    type: "paragraph",
    data: { hName: "div", hProperties: { className: ["il-frame"] } },
    children: [{ type: "image", url: image.url, alt: image.caption ?? "" }]
  };
  const children = [frame];
  if (image.caption) {
    children.push(textBlock("figcaption", { className: ["il-caption"] }, image.caption));
  }
  return container(
    "figure",
    { className: ["il-item"], ...style.length ? { style: style.join(";") } : {} },
    children
  );
}
function blockClassNames(block, variant) {
  const className = [
    "image-layout",
    variant,
    `il-fit-${pick(block.opts.fit, FIT_MODES, "cover")}`,
    `il-overlay-${pick(block.opts.overlay, OVERLAY_MODES, "hover")}`
  ];
  const align = pick(block.opts.align, ALIGN_MODES, "");
  if (align) className.push(`il-align-${align}`);
  return className;
}
function blockCaption(block) {
  if (!block.opts.caption) return [];
  return [textBlock("figcaption", { className: ["il-block-caption"] }, String(block.opts.caption))];
}
function buildLayoutNode(block, spec, opts) {
  const style = [`--il-gap:${opts.gap}`];
  if (spec.templateColumns) style.push(`grid-template-columns:${spec.templateColumns}`);
  if (spec.templateAreas) style.push(`grid-template-areas:${spec.templateAreas}`);
  const figures = block.images.map((image, i) => buildFigure(image, i, Boolean(spec.templateAreas)));
  return container("div", { className: blockClassNames(block, "il-grid"), style: style.join(";") }, [
    ...figures,
    ...blockCaption(block)
  ]);
}
function buildMasonryNode(block, spec, opts) {
  const columnCount = spec.columns ?? 3;
  const columns = Array.from(
    { length: columnCount },
    (_, col) => container(
      "div",
      { className: ["il-column"] },
      block.images.filter((_2, i) => i % columnCount === col).map((image) => buildFigure(image, 0, false))
    )
  );
  return container(
    "div",
    {
      className: blockClassNames(block, "il-masonry"),
      style: `--il-gap:${opts.gap};grid-template-columns:repeat(${columnCount}, 1fr)`
    },
    [...columns, ...blockCaption(block)]
  );
}
function buildCarouselNode(block, opts) {
  const style = [`--il-carousel-height:${cssSize(block.opts.carouselheight, opts.carouselHeight)}`];
  if (block.opts.carouselbackground) {
    style.push(`--il-carousel-bg:${String(block.opts.carouselbackground)}`);
  }
  const children = [
    container(
      "div",
      { className: ["il-viewport"] },
      block.images.map((image) => buildFigure(image, 0, false))
    )
  ];
  if (block.opts.carouselshowthumbnails) {
    children.push(
      container(
        "div",
        { className: ["il-thumbs"] },
        block.images.map(
          (image) => ({
            type: "paragraph",
            data: { hName: "div", hProperties: { className: ["il-thumb"] } },
            children: [{ type: "image", url: image.url, alt: "" }]
          })
        )
      )
    );
  }
  children.push(...blockCaption(block));
  return container(
    "div",
    {
      className: blockClassNames(block, "il-carousel"),
      "data-needs-init": "true",
      style: style.join(";")
    },
    children
  );
}

// src/parse-grid.ts
var MAX_SLOTS = 20;
function parseCustomGrid(spec) {
  if (typeof spec !== "string" || spec.trim() === "") return null;
  const rows = spec.split("\n").map((line) => line.trim()).filter((line) => line !== "").map((line) => line.split(/\s+/));
  if (rows.length === 0) return null;
  const columns = rows[0].length;
  if (rows.some((row) => row.length !== columns)) return null;
  const order = [];
  for (const row of rows) {
    for (const cell of row) {
      if (cell !== "." && !order.includes(cell)) order.push(cell);
    }
  }
  if (order.length === 0 || order.length > MAX_SLOTS) return null;
  for (const token of order) {
    let minRow = Infinity;
    let maxRow = -1;
    let minCol = Infinity;
    let maxCol = -1;
    let count = 0;
    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== token) return;
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
        count++;
      });
    });
    if (count !== (maxRow - minRow + 1) * (maxCol - minCol + 1)) return null;
  }
  const templateAreas = rows.map(
    (row) => `"${row.map((cell) => cell === "." ? "." : `image-${order.indexOf(cell)}`).join(" ")}"`
  ).join(" ");
  return { columns, rows: rows.length, slots: order.length, templateAreas };
}

// src/layouts.ts
var PRESETS = {
  a: { templateColumns: "1fr 1fr", templateAreas: `"image-0 image-1"` },
  b: { templateColumns: "2fr 1fr", templateAreas: `"image-0 image-1"` },
  c: { templateColumns: "1fr 2fr", templateAreas: `"image-1 image-0"` },
  d: { templateColumns: "2fr 1fr", templateAreas: `"image-0 image-1" "image-0 image-2"` },
  e: { templateColumns: "1fr 2fr", templateAreas: `"image-1 image-0" "image-2 image-0"` },
  f: {
    templateColumns: "3fr 1fr",
    templateAreas: `"image-0 image-1" "image-0 image-2" "image-0 image-3"`
  },
  g: {
    templateColumns: "1fr 3fr",
    templateAreas: `"image-1 image-0" "image-2 image-0" "image-3 image-0"`
  },
  h: { templateColumns: "1fr 1fr 1fr", templateAreas: `"image-0 image-1 image-2"` },
  i: { templateColumns: "1fr 1fr 1fr 1fr", templateAreas: `"image-0 image-1 image-2 image-3"` },
  single: { templateColumns: "1fr", templateAreas: `"image-0"` }
};
var MASONRY = /^masonry-([2-6])$/;
var AUTO = { kind: "grid" };
function resolveLayout(layout, grid, fallback) {
  const name = (layout || fallback).trim().toLowerCase();
  if (name === "carousel") return { kind: "carousel" };
  const masonry = name.match(MASONRY);
  if (masonry) return { kind: "masonry", columns: Number(masonry[1]) };
  if (name === "custom") {
    const parsed = parseCustomGrid(grid);
    if (!parsed) return AUTO;
    return {
      kind: "grid",
      templateColumns: `repeat(${parsed.columns}, 1fr)`,
      templateAreas: parsed.templateAreas
    };
  }
  const preset = PRESETS[name];
  if (preset) return { kind: "grid", ...preset };
  return AUTO;
}

// src/parse-options.ts
function parseScalar(raw) {
  const text = raw.trim();
  if (text === "") return "";
  const quoted = text.match(/^"(.*)"$|^'(.*)'$/);
  if (quoted) return quoted[1] ?? quoted[2] ?? "";
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null" || text === "~") return null;
  if (/^-?\d+$/.test(text)) return Number(text);
  if (/^-?\d*\.\d+$/.test(text)) return Number(text);
  return text;
}
var KEY_LINE = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/;
function parseOptions(source) {
  const opts = {};
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const match = line.match(KEY_LINE);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (value === "|" || value === "|-" || value === ">" || value === ">-") {
      const collected = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const next = lines[j];
        if (next.trim() === "") {
          collected.push("");
          continue;
        }
        if (!/^\s/.test(next)) break;
        collected.push(next.replace(/^\s+/, ""));
      }
      while (collected.length > 0 && collected[collected.length - 1] === "") collected.pop();
      opts[key] = collected.join(value.startsWith(">") ? " " : "\n");
      i = j - 1;
      continue;
    }
    opts[key] = parseScalar(value);
  }
  return opts;
}

// src/parse-block.ts
var FENCE_PREFIX = "image-layout";
var BLOCK_FRONTMATTER = /^\s*---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/;
var SIZE = /^(\d+)(?:x(\d+))?$/;
var WIKILINK = /!?\[\[([^\]]+)\]\]/;
var MD_IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)$/;
function parseWikilink(body) {
  const [target, ...rest] = body.split("|");
  const image = { url: target.trim() };
  const captionParts = [];
  for (const part of rest) {
    const trimmed = part.trim();
    const size = trimmed.match(SIZE);
    if (size) {
      image.width = Number(size[1]);
      if (size[2]) image.height = Number(size[2]);
    } else if (trimmed) {
      captionParts.push(trimmed);
    }
  }
  if (captionParts.length > 0) image.caption = captionParts.join(" ");
  return image;
}
function parseBlock(lang, value) {
  if (!lang?.startsWith(FENCE_PREFIX)) return null;
  const legacyLayout = lang.slice(FENCE_PREFIX.length).replace(/^-/, "").trim();
  let body = value;
  let opts = {};
  const frontmatter = value.match(BLOCK_FRONTMATTER);
  if (frontmatter) {
    body = value.slice(frontmatter[0].length);
    opts = parseOptions(frontmatter[1]);
  }
  const images = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    const wiki = trimmed.match(WIKILINK);
    if (wiki) {
      images.push(parseWikilink(wiki[1]));
      continue;
    }
    const md = trimmed.match(MD_IMAGE);
    if (md) {
      images.push({ url: md[2].trim(), ...md[1] ? { caption: md[1] } : {} });
    }
  }
  const layout = String(opts.layout ?? legacyLayout ?? "").trim();
  return { layout, opts, images };
}

// src/scripts/carousel.inline.ts
var carousel_inline_default = 'document.addEventListener("nav",()=>{let v=document.querySelectorAll(\'.il-carousel[data-needs-init="true"]\');for(let r of v){let e=r.querySelector(".il-viewport");if(!e)continue;let i=Array.from(e.querySelectorAll(".il-item"));if(i.length<2)continue;let d=Array.from(r.querySelectorAll(".il-thumb")),s=()=>Math.round(e.scrollLeft/e.clientWidth),c=t=>{let n=i[Math.max(0,Math.min(i.length-1,t))];n&&e.scrollTo({left:n.offsetLeft-e.offsetLeft})},a=()=>{let t=s();d.forEach((n,l)=>n.classList.toggle("is-active",l===t))},u=(t,n,l,m)=>{let o=document.createElement("button");o.type="button",o.className=`il-nav ${t}`,o.setAttribute("aria-label",n),o.textContent=l,o.addEventListener("click",m),r.appendChild(o),window.addCleanup(()=>{o.removeEventListener("click",m),o.remove()})};u("il-prev","\\uC774\\uC804 \\uC774\\uBBF8\\uC9C0","\\u2039",()=>c(s()-1)),u("il-next","\\uB2E4\\uC74C \\uC774\\uBBF8\\uC9C0","\\u203A",()=>c(s()+1)),d.forEach((t,n)=>{let l=()=>c(n);t.addEventListener("click",l),window.addCleanup(()=>t.removeEventListener("click",l))}),e.addEventListener("scroll",a,{passive:!0}),window.addCleanup(()=>e.removeEventListener("scroll",a)),a(),r.removeAttribute("data-needs-init")}});\n';

// src/styles/imageLayouts.scss
var imageLayouts_default = ".image-layout {\n  margin: 1.5rem 0;\n}\n.image-layout.il-grid, .image-layout.il-masonry {\n  display: grid;\n  gap: var(--il-gap, 0.5rem);\n  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));\n}\n.image-layout.il-align-left {\n  justify-items: start;\n}\n.image-layout.il-align-center {\n  justify-items: center;\n}\n.image-layout.il-align-right {\n  justify-items: end;\n}\n\n.il-column {\n  display: flex;\n  flex-direction: column;\n  gap: var(--il-gap, 0.5rem);\n}\n\n.il-item {\n  display: flex;\n  flex-direction: column;\n  margin: 0;\n  min-width: 0;\n}\n\n.il-frame {\n  flex: 1;\n  min-height: 0;\n  margin: 0;\n  overflow: hidden;\n  border-radius: 4px;\n}\n.il-frame img {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  margin: 0;\n}\n\n.il-fit-contain .il-frame img {\n  object-fit: contain;\n}\n\n.il-fit-natural {\n  align-items: start;\n}\n.il-fit-natural .il-frame {\n  flex: 0 0 auto;\n}\n.il-fit-natural .il-frame img {\n  height: auto;\n  object-fit: contain;\n}\n\n.il-caption {\n  margin: 0.35rem 0 0;\n  padding: 0;\n  font-size: 0.8rem;\n  line-height: 1.45;\n  color: var(--gray);\n}\n\n.il-overlay-never .il-caption {\n  display: none;\n}\n\n.il-block-caption {\n  margin: 0.6rem 0 0;\n  font-size: 0.85rem;\n  color: var(--gray);\n  text-align: center;\n}\n\n.il-carousel {\n  position: relative;\n  background: var(--il-carousel-bg, var(--lightgray));\n  border-radius: 4px;\n}\n.il-carousel .il-viewport {\n  display: flex;\n  height: var(--il-carousel-height, 24rem);\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  scroll-behavior: smooth;\n  scrollbar-width: none;\n}\n.il-carousel .il-viewport::-webkit-scrollbar {\n  display: none;\n}\n.il-carousel .il-item {\n  flex: 0 0 100%;\n  height: 100%;\n  scroll-snap-align: center;\n}\n.il-carousel .il-frame {\n  border-radius: 0;\n}\n.il-carousel .il-frame img {\n  object-fit: contain;\n}\n.il-carousel .il-caption {\n  padding: 0 0.6rem 0.4rem;\n  text-align: center;\n}\n\n.il-thumbs {\n  display: flex;\n  gap: 0.4rem;\n  padding: 0.5rem;\n  overflow-x: auto;\n}\n\n.il-thumb {\n  flex: 0 0 auto;\n  margin: 0;\n  cursor: pointer;\n}\n.il-thumb img {\n  display: block;\n  width: 3.5rem;\n  height: 3.5rem;\n  margin: 0;\n  object-fit: cover;\n  border-radius: 3px;\n  opacity: 0.55;\n  transition: opacity 0.15s ease;\n}\n.il-thumb:hover img, .il-thumb.is-active img {\n  opacity: 1;\n}\n\n.il-nav {\n  position: absolute;\n  top: calc(var(--il-carousel-height, 24rem) / 2);\n  z-index: 1;\n  display: grid;\n  place-items: center;\n  width: 2.2rem;\n  height: 2.2rem;\n  padding: 0;\n  font-size: 1.4rem;\n  line-height: 1;\n  color: var(--dark);\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 50%;\n  transform: translateY(-50%);\n  cursor: pointer;\n  opacity: 0.85;\n}\n.il-nav:hover {\n  opacity: 1;\n}\n.il-nav.il-prev {\n  left: 0.5rem;\n}\n.il-nav.il-next {\n  right: 0.5rem;\n}\n\n@media (max-width: 600px) {\n  .image-layout.il-grid,\n  .image-layout.il-masonry {\n    grid-template-columns: 1fr !important;\n    grid-template-areas: none !important;\n  }\n  .il-grid .il-item,\n  .il-masonry .il-item {\n    grid-area: auto !important;\n  }\n}";

// src/index.ts
var defaults = {
  defaultLayout: "single",
  carouselHeight: "24rem",
  gap: "0.5rem"
};
var ImageLayouts = (userOpts) => {
  const opts = { ...defaults, ...userOpts };
  return {
    name: "ImageLayouts",
    markdownPlugins() {
      return [
        () => (tree) => {
          visit(tree, "code", (node, index, parent) => {
            if (!node.lang?.startsWith("image-layout")) return;
            if (index === void 0 || parent === null || parent === void 0) return;
            const block = parseBlock(node.lang, node.value);
            if (!block || block.images.length === 0) return;
            const spec = resolveLayout(block.layout, block.opts.grid, opts.defaultLayout);
            parent.children[index] = spec.kind === "carousel" ? buildCarouselNode(block, opts) : spec.kind === "masonry" ? buildMasonryNode(block, spec, opts) : buildLayoutNode(block, spec, opts);
            return SKIP;
          });
        }
      ];
    },
    externalResources() {
      return {
        css: [{ content: imageLayouts_default, inline: true }],
        js: [{ script: carousel_inline_default, loadTime: "afterDOMReady", contentType: "inline" }]
      };
    }
  };
};
var src_default = ImageLayouts;

export { src_default as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map