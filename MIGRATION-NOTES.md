# Quartz v5 API Recon Notes

Source of truth for Tasks 3-12 of the v4→v5 migration. Everything here was read
directly from the cloned `v5` branch (`~/Developer/haejunhyun-v5-test`,
`.quartz/plugins/*`, `quartz/plugins/loader/*`, `docs/`) and, where marked
**VERIFIED LIVE**, confirmed by actually running the CLI and building the site.

Read this together with `quartz.config.yaml` in this repo — it is a working,
fully-annotated example of every syntax described below.

---

## 0. The big picture: what changed from v4

- v4: a single `quartz.config.ts` where you literally call `Component.Explorer({...})`
  and assemble arrays for `defaultContentPageLayout` etc.
- v5: **components/transformers/filters/emitters/page-types are all separate,
  independently-versioned Git repositories** ("community plugins"). Your project
  only holds:
  - `quartz.config.yaml` — declarative list of `{ source, enabled, options, order, layout }`
  - `quartz.lock.json` — resolved commit hashes for every installed plugin (like a lockfile)
  - `.quartz/plugins/` — gitignored, either a full clone of each plugin repo (git sources) or a **symlink** to a local directory (local sources)
  - `quartz.ts` — thin bootstrap (`loadQuartzConfig()` / `loadQuartzLayout()`); only touched for advanced TS overrides (callback options, custom Flex/ConditionalRender wiring)
- A generated glue file `.quartz/plugins/index.ts` re-exports every installed
  plugin's factory function (namespaced through `componentRegistry`) so that
  `quartz.ts` overrides can do `import * as Plugin from "./.quartz/plugins"`.
- Component plugins still use the **exact same runtime contract as v4**:
  `Component.css = ...`, `Component.beforeDOMLoaded = ...`, `Component.afterDOMLoaded = ...`
  set on the render function. This did not change.

---

## 1. Component plugin factory signature & types import

Everything comes from `@quartz-community/types` (**not** `@jackyzha0/quartz` — that
import path is explicitly disallowed for community plugins, see docs/advanced/making
plugins.md "What to Import from Where" table).

```ts
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
```

Type definitions (from `node_modules/@quartz-community/types/dist/index.d.ts`):

```ts
type QuartzComponentProps = {
  ctx: unknown;
  externalResources: StaticResources;
  fileData: QuartzPluginData & Record<string, unknown>;
  cfg: GlobalConfiguration;      // = quartz.config.yaml's `configuration:` block
  children: unknown;
  tree: unknown;                 // HAST root for the current page
  allFiles: (QuartzPluginData & Record<string, unknown>)[];
  displayClass?: "mobile-only" | "desktop-only";
  [key: string]: unknown;
};

type QuartzComponent = ((props: QuartzComponentProps) => unknown) & {
  css?: string | string[] | undefined;
  beforeDOMLoaded?: string | string[] | undefined;
  afterDOMLoaded?: string | string[] | undefined;
};

type QuartzComponentConstructor<Options extends object | undefined = undefined> =
  (opts?: Options) => QuartzComponent;
```

Canonical factory shape (from `.quartz/plugins/explorer/src/components/Explorer.tsx`,
trimmed):

```tsx
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import style from "./styles/explorer.scss";
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import script from "./scripts/explorer.inline.ts";

export interface ExplorerOptions {
  title?: string;
  folderDefaultState: "collapsed" | "open";
  // ...
}

const defaultOptions: ExplorerOptions = { folderDefaultState: "collapsed", /* ... */ };

export default ((userOpts?: Partial<ExplorerOptions>) => {
  const opts: ExplorerOptions = { ...defaultOptions, ...userOpts };

  const ExplorerComponent: QuartzComponent = (props: QuartzComponentProps) => {
    const { cfg } = props;
    return <div class="explorer">{/* ... */}</div>;
  };

  ExplorerComponent.css = style;
  ExplorerComponent.afterDOMLoaded = script;
  return ExplorerComponent;
}) satisfies QuartzComponentConstructor;
```

A simpler variant with `beforeDOMLoaded` (from `.quartz/plugins/darkmode/src/components/Darkmode.tsx`):

```tsx
const Darkmode: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return <button class={classNames(displayClass, "darkmode")}>{/* svg icons */}</button>;
};

Darkmode.beforeDOMLoaded = darkmodeScript;   // string, imported from a `.inline.ts` file
Darkmode.css = styles;                        // string, imported from a `.scss` file

export default (() => Darkmode) satisfies QuartzComponentConstructor;
```

**Minimal `src/index.ts` for the plugin root**, just re-exports the component and
its options type:

```ts
export { default as Explorer } from "./components/Explorer";
export type { ExplorerOptions } from "./components/Explorer";
```

---

## 2. css / beforeDOMLoaded / afterDOMLoaded attachment — **unchanged from v4**

Set directly as properties on the component function, exactly like v4:

```tsx
Component.css = style;                 // string (or string[]); SCSS imports work via build plugin, see §5
Component.beforeDOMLoaded = script;     // string of JS, runs before DOM ready
Component.afterDOMLoaded = script2;     // string of JS, runs after DOM ready
```

- `beforeDOMLoaded`: executed before the page finishes loading (prefetch / early init).
- `afterDOMLoaded`: executed once the page has fully loaded.
- For SPA-navigation-safe listeners, hook `document.addEventListener("nav", fn)`
  (fires on every SPA nav) and `"render"` (fires when DOM changes without a full
  nav, e.g. after decryption). Always deregister via `window.addCleanup(() => ...)`.
- Concatenate multiple resource strings if a component composes sub-widgets:
  ```ts
  function concatenateResources(...resources: (string | undefined)[]): string {
    return resources.filter((r): r is string => !!r).join("\n");
  }
  ExplorerComponent.afterDOMLoaded = concatenateResources(script, overflowListAfterDOMLoaded);
  ```

### Importing CSS/scripts (build-time mechanics)

Handled by an esbuild plugin registered in `tsup.config.ts` (see `.quartz/plugins/explorer/tsup.config.ts`):

- `import style from "./styles/foo.scss"` → the plugin's `onLoad` hook runs
  `sass.compile(path)` and returns the compiled CSS as a `text` loader string.
  **You get a plain string, not a CSS Module** — styles are global, so scope
  your selectors (e.g. `.explorer .foo`) to avoid collisions.
- `import script from "./scripts/foo.inline.ts"` → matched by `/\.inline\.ts$/`,
  stripped of `export`/`export default`, bundled+minified standalone via esbuild
  (`platform: "browser"`, `format: "esm"`, `target: "es2020"`), and returned as
  a `text` loader string. This is why the TS import needs
  `// @ts-expect-error - Inline script loaded as text by esbuild plugin` above it —
  TypeScript doesn't know about the custom loader.
- If you don't want to replicate the tsup/esbuild plumbing, you can ship a
  hand-written `dist/` (see §6) with the CSS/script already inlined as plain
  strings — the loader only cares about the final JS module shape, not how it
  was produced.

---

## 3. Referencing a plugin in `quartz.config.yaml` — including LOCAL plugins

### 3.1 Standard remote (GitHub) source — string form

```yaml
plugins:
  - source: github:quartz-community/explorer
    enabled: true
    options:
      folderDefaultState: collapsed
    order: 50                 # execution/build order among transformers etc. (lower = earlier); optional, default from manifest's defaultOrder
    layout:
      position: left           # left | right | beforeBody | afterBody
      priority: 50              # lower = earlier within that position
```

### 3.2 Object source form (branch/ref, subdir monorepo plugins, name override)

```yaml
plugins:
  - source:
      repo: "https://github.com/user/repo.git"
      subdir: plugin            # plugin lives in a subdirectory of the repo
      ref: main                 # branch or tag to pin (equivalent to #ref suffix)
      name: my-plugin            # override the .quartz/plugins/<name> directory name
    enabled: true
```
Real example actually in this repo's `quartz.config.yaml` (quartz-themes, a
monorepo-subdir plugin):
```yaml
  - source:
      name: quartz-themes
      repo: github:saberzero1/quartz-themes
      subdir: plugin
    enabled: true
    options:
      theme: default
```

### 3.3 LOCAL plugin source — **VERIFIED LIVE**

Any source string/`repo` value starting with `./`, `../`, `/`, or a Windows
drive letter (`C:\...`) is treated as a **local filesystem path**, per
`quartz/plugins/loader/gitLoader.ts::isLocalSource()`:

```ts
export function isLocalSource(source: PluginSource): boolean {
  if (typeof source === "object") return isLocalSource(source.repo);
  if (source.startsWith("./") || source.startsWith("../") || source.startsWith("/")) return true;
  if (/^[A-Za-z]:[\\/]/.test(source)) return true;
  return false;
}
```

Recommended workflow — use the CLI, don't hand-edit YAML for this:

```shell
npx quartz plugin add ./plugins/my-local-component
```

What this actually does (confirmed by running it):
1. `.quartz/plugins/<dirBasename>` is created as a **real symlink** to the
   local directory (`path.resolve()`'d to an absolute path). It is NOT copied.
2. `quartz.config.yaml` gets a new entry with `source: <path-you-passed-verbatim>`
   — **CORRECTED**: the CLI does *not* always resolve to an absolute path; it
   writes whatever form you passed it. `npx quartz plugin add ./plugins/foo`
   produced `source: ./plugins/foo` (relative, verified in the §14 smoke test);
   an earlier run in this same recon that passed an absolute path produced an
   absolute `source:`. The symlink target in `.quartz/plugins/` is always
   resolved to an absolute path internally either way (`path.resolve()`), but
   what lands in the YAML mirrors your CLI argument's form:
   ```yaml
   plugins:
     - source: ./plugins/my-local-component     # or an absolute path, if that's what you passed to `plugin add`
       enabled: true
       options:
         someOption: someDefaultFromManifest      # plugin add seeds this from the manifest's defaultOptions
       order: 15
       layout:
         position: right
         priority: 99
   ```
3. **The plugin's directory name in `.quartz/plugins/` is derived from
   `path.basename(resolvedPath)` — NOT from `package.json`'s `"name"` or
   `"quartz"."name"` field**, unless you use the object-source form with an
   explicit `name:` override. In our smoke test, a folder called
   `local-plugin-test` produced a plugin registered as `local-plugin-test`
   even though its `package.json` said `"name": "hello-local-test"`.
4. If the local dir already ships a built `dist/`, install is instant
   ("using pre-built dist/"). If not, Quartz falls back to running
   `npm install && npm run build` inside it on every `install --latest`
   (no git operations) — this is why local dev plugins usually gitignore `dist/`.
5. `npx quartz plugin remove <name>` deletes the symlink and the config/lockfile
   entries — this is how we cleaned up after the smoke test below.

You can also point `source:` directly at a relative path from `quartz.config.yaml`
without going through `plugin add` (matches the brief's guessed
`source: ./plugins/<name>` syntax) — the loader resolves it the same way via
`parsePluginSource()`. Using the CLI is still recommended because it also
updates `quartz.lock.json` and creates the symlink for you.

**Live verification performed for this task:** copied the built `spacer`
plugin into a scratch dir, renamed its `package.json` (`name`,
`quartz.name`, `quartz.displayName`) but kept its component export name
(`Spacer`, since the dist's export name must match the manifest's
`components` key — see §4), pointed `quartz.config.yaml`'s
`layout.position: right, priority: 99` at it via
`npx quartz plugin add <abs-path>`, ran `npx quartz build`, and confirmed
**2** `class="spacer"` divs appeared in `public/index.html` (1 built-in +
1 from the local plugin) — i.e. the local plugin's component was correctly
resolved, registered, laid out, and rendered. After `npx quartz plugin remove`,
a rebuild dropped back to exactly 1, confirming clean removal. Build stayed
at 89/89 input files and 790 emitted files throughout — no regression risk
from the local-plugin mechanism itself.

---

## 4. `package.json` `"quartz"` manifest — REQUIRED for component discovery

This is how Quartz knows a plugin repo/directory exports a component at all —
distinct from and in addition to the runtime `QuartzComponentConstructor` code.
Full type (from `quartz/plugins/loader/types.ts`):

```ts
export type PluginCategory = "transformer" | "filter" | "emitter" | "pageType" | "component";
export type LayoutPosition = "left" | "right" | "beforeBody" | "afterBody";
export type LayoutDisplay = "all" | "mobile-only" | "desktop-only";

export interface ComponentLayoutDefaults {
  displayName: string;
  description?: string;
  defaultPosition?: LayoutPosition;
  defaultPriority?: number;
}

export interface PluginManifest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author?: string;
  homepage?: string;
  keywords?: string[];
  category?: PluginCategory | PluginCategory[];   // single plugins use a bare string, e.g. "component"; multi-role plugins use an array, e.g. ["transformer","component"]
  quartzVersion?: string;                          // e.g. ">=5.0.0"
  dependencies?: string[];                         // other plugin sources this one requires, e.g. ["github:quartz-community/crawl-links"]
  defaultOrder?: number;                           // default execution order (0-100 convention, lower = earlier). Default 50.
  defaultEnabled?: boolean;                        // default true
  defaultOptions?: Record<string, unknown>;
  configSchema?: object;                           // JSON Schema, used for validation + TUI generation
  components?: Record<string, ComponentManifest & ComponentLayoutDefaults>;  // keyed by the EXPORT NAME from ./components subpath
  frames?: Record<string, { exportName: string }>; // custom PageFrame exports, see §8
  requiresInstall?: boolean;                       // true if plugin has native deps (e.g. sharp) needing `npm install` in host project
}
```

Real, complete example — `.quartz/plugins/explorer/package.json`'s `"quartz"` block:

```json
"quartz": {
  "name": "explorer",
  "displayName": "Explorer",
  "category": "component",
  "version": "1.0.0",
  "quartzVersion": ">=5.0.0",
  "dependencies": [],
  "defaultOrder": 50,
  "defaultEnabled": true,
  "defaultOptions": {
    "folderDefaultState": "collapsed",
    "folderClickBehavior": "link",
    "useSavedState": true
  },
  "components": {
    "Explorer": {
      "displayName": "Explorer",
      "defaultPosition": "left",
      "defaultPriority": 50
    }
  },
  "optionSchema": {
    "title": { "type": "string" },
    "folderDefaultState": { "type": "enum", "values": ["collapsed", "open"] }
  }
}
```

Key rule verified via `quartz/plugins/loader/componentLoader.ts`: the key
under `"components"` (e.g. `"Explorer"`) **must exactly match the named export**
from the plugin's `./components` subpath (see §5 for how that subpath is wired
in `exports`). Quartz does `componentsModule[exportName]` — a mismatch means
the component silently fails to register (with only a console warning, not a
hard build error).

Registration side-effects (from `componentLoader.ts`): for each declared
component Quartz registers it three ways so config/layout code can look it up
by different keys:
1. `"<pluginName>/<exportName>"` (fully qualified)
2. `"<exportName>"` (bare, if not already taken by another plugin — collisions
   log `⚠ Export "X" conflicts across plugins — use plugins["pluginName"].X in quartz.ts`,
   which we actually triggered and saw in the smoke test)
3. `"<pluginName>"` (bare kebab-case plugin name, only if the plugin exports
   exactly one component)

`category` values seen in the wild (from every installed plugin's
`package.json`): pure single-role plugins use a bare string
(`"category": "component"`, `"category": "transformer"`, `"category": "filter"`,
`"category": "emitter"`); multi-role plugins use an array, e.g.
`bases-page` → `["transformer", "pageType", "component"]`,
`table-of-contents` → `["transformer", "component"]`,
`content-page` → `["pageType", "component"]`.

### Component-only plugins and YAML options — **CORRECTED, VERIFIED LIVE (see §14)**

> An earlier version of this section claimed pure `"category": "component"`
> plugins never receive `options:` from YAML unless they export `init()`. That
> was **wrong** and has been replaced after empirical testing — see §14 for
> the smoke test. The paragraph below documents the actual, verified mechanism.

**If a plugin's `quartz.config.yaml` entry has a `layout:` block (i.e. it is
placed somewhere on the page — which is true for essentially every real UI
component, including Explorer in §1), its `options:` from YAML flow straight
into the factory function. No `init()` export is required.**

This happens in `quartz/plugins/loader/config-loader.ts`, in
`loadQuartzLayout()` → `buildLayoutForEntries()`, which runs **separately**
from (and after) the plugin-categorization loop that only calls processing
plugins (`transformer`/`filter`/`emitter`/`pageType`) with their options
immediately:

```ts
// loadQuartzLayout():
const enabledWithLayout = json.plugins.filter((e) => e.enabled && e.layout)
const defaultLayout = buildLayoutForEntries(enabledWithLayout, layoutConfig)

// buildLayoutForEntries(), per entry:
if (typeof reg.component === "function" && !("displayName" in reg.component)) {
  const tsOverrides = componentRegistry.getOptionOverrides(name)   // quartz.ts overrides, if any
  const opts = { ...entry.options, ...tsOverrides }                // <-- YAML options: here, NOT manifest defaultOptions
  const optsArg = Object.keys(opts).length > 0 ? opts : undefined
  component = componentRegistry.instantiate(reg.component, optsArg)  // calls constructor(optsArg)
}
```

`componentRegistry.instantiate()` just calls `constructor(options)` (cached by
constructor identity + serialized options, to avoid duplicate
`afterDOMLoaded` scripts if the same component appears in multiple
page-type layouts) — i.e. it is a completely ordinary call to the
`QuartzComponentConstructor` factory, exactly as shown for Explorer in §1.

**Important nuance, also verified live:** the manifest's `"quartz".defaultOptions`
is **not** merged in at this step — only `entry.options` (+ any `quartz.ts`
TS override) is passed. If YAML `options:` is empty/absent, the component
falls back to whatever default its own factory code applies internally
(the same `{ ...defaultOptions, ...userOpts }` pattern shown for Explorer in
§1) — **not** the manifest's `defaultOptions` field. The manifest's
`defaultOptions` is only actually consumed in two other places: (a) it seeds
the initial `options:` block that `npx quartz plugin add` writes into
`quartz.config.yaml` on first install, and (b) it's merged for the `init()`
call path described below. So in practice a component should still declare
its own internal defaults, same as v4 — don't rely on the manifest field
alone.

**When `init()` still matters:** a plugin entry with **no** `layout:` block
never goes through `buildLayoutForEntries` at all, so nothing ever calls its
component constructor with `entry.options`. This is the actual scenario the
`init()` mechanism exists for — pure side-effect registration that must run
regardless of layout placement (e.g. `bases-page`'s custom view registrations,
which register into a global `ViewRegistry`, not a layout slot). For such a
plugin, if it exports `init(options)`, Quartz calls it once at load time with
`{ ...manifest?.defaultOptions, ...entry.options, ...tsOverrides }` — this
path is real and still applies, just narrower in scope than originally stated
here.

**Bottom line for Tasks 5-10:** any plugin that has a `layout:` block (which
will be true for SocialLinks, RecentNotesForIndex, and essentially every
other planned local UI component) gets its YAML `options:` automatically —
write the factory exactly like Explorer/§1 (`(userOpts?: Partial<Options>) => { const opts = {...defaultOptions, ...userOpts}; ... }`)
and it just works. Only reach for `init()` if a component needs to run
side-effect setup independent of whether/where it's placed in the layout.

---

## 5. `package.json` `exports` map — required subpaths

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types.d.ts",
      "import": "./dist/types.js"
    },
    "./components": {
      "types": "./dist/components/index.d.ts",
      "import": "./dist/components/index.js"
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false
}
```
`componentLoader.ts` specifically imports `<pluginName>/components` (i.e. the
`"./components"` export) to get at `Record<exportName, QuartzComponentConstructor>`.
If your plugin has no `dist/components/index.js`, component discovery silently
no-ops.

`peerDependencies` must include `preact: ^10.0.0` (component plugins render
Preact JSX) with `peerDependenciesMeta.preact.optional = false`.
`dependencies` should include `@quartz-community/types` (and
`@quartz-community/utils` if you use path/dom/lang/date helpers — see the
import table in §9).

### Build config (tsup) — only needed if authoring from source

```ts
// tsup.config.ts
const SINGLETON_EXTERNALS = [
  "preact", "preact/hooks", "preact/jsx-runtime", "preact/compat",
  "@jackyzha0/quartz", "@jackyzha0/quartz/*", "vfile", "vfile/*", "unified",
];

export default defineConfig({
  entry: { index: "src/index.ts", types: "src/types.ts", "components/index": "src/components/index.ts" },
  format: ["esm"],
  dts: true,
  noExternal: [/.*/],       // bundle everything...
  external: SINGLETON_EXTERNALS, // ...except these singletons
  outDir: "dist",
  esbuildOptions(options) { options.jsx = "automatic"; options.jsxImportSource = "preact"; },
  esbuildPlugins: [inlineScriptPlugin], // handles .scss -> compiled CSS text, .inline.ts -> bundled/minified JS text
});
```
Ship `dist/` committed (don't gitignore it) so installs skip the build step
("using pre-built dist/"). If `dist/` is missing/gitignored, Quartz runs
`npm install && npm run build` in the plugin dir automatically on install —
**confirmed this fallback is what powers local plugin dev** (§3.3 point 4).

**Shortcut for local/internal plugins (used in our smoke test):** you don't
strictly need tsup — a hand-written `dist/index.js` + `dist/components/index.js`
that are plain ESM modules exporting a function satisfying
`QuartzComponentConstructor` work identically, as long as the `exports` map in
`package.json` points at them and the `"quartz".components` key matches the
export name.

---

## 6. Layout syntax — position / priority / condition / display / group

Full type (`quartz/plugins/loader/types.ts`):

```ts
export interface PluginLayoutDeclaration {
  position: "left" | "right" | "beforeBody" | "afterBody";
  priority: number;                 // lower = earlier within that position
  display?: "all" | "mobile-only" | "desktop-only";  // default "all"
  condition?: string;               // built-in or custom-registered condition name
  group?: string;                   // key into top-level layout.groups (Flex container)
  groupOptions?: {
    grow?: boolean; shrink?: boolean; basis?: string; order?: number;
    align?: "start" | "end" | "center" | "stretch";
    justify?: "start" | "end" | "center" | "between" | "around";
  };
}
```

Per-plugin usage in `quartz.config.yaml`:

```yaml
plugins:
  - source: github:quartz-community/breadcrumbs
    enabled: true
    layout:
      position: beforeBody
      priority: 5
      condition: not-index
  - source: github:quartz-community/search
    enabled: true
    layout:
      position: left
      priority: 20
      group: toolbar
      groupOptions:
        grow: true
```

Top-level `layout:` section (root of `quartz.config.yaml`, sibling of `plugins:`):

```ts
export interface FlexGroupConfig {
  priority?: number;   // overrides first-member priority for ordering the whole group
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  gap?: string;
}
export interface PageTypeLayoutOverride {
  exclude?: string[];                                              // component names to drop for this page type
  positions?: Partial<Record<LayoutPosition, PluginLayoutDeclaration[]>>;  // override which components sit in a position for this page type
  template?: string;                                                // override page frame, see §8
}
export interface LayoutConfig {
  groups?: Record<string, FlexGroupConfig>;
  byPageType?: Record<string, PageTypeLayoutOverride>;              // keys observed in this repo: "content", "folder", "tag", "404", "canvas", "bases"
}
```

Real example (this repo's `quartz.config.yaml`):

```yaml
layout:
  groups:
    toolbar:
      priority: 35
      direction: row
      gap: 0.5rem
  byPageType:
    "404":
      positions:
        beforeBody: []
        left: []
        right: []
    content: {}
    folder:
      exclude:
        - reader-mode
      positions:
        right: []
    tag:
      exclude:
        - reader-mode
      positions:
        right: []
    canvas: {}
    bases: {}
```

### Available built-in `condition` values (from `quartz/plugins/loader/conditions.ts`)

| Condition | Predicate |
|---|---|
| `not-index` | `props.fileData.slug !== "index"` |
| `has-tags` | `props.fileData.frontmatter?.tags` is a non-empty array |
| `has-backlinks` | `props.fileData.backlinks` is a non-empty array |
| `has-toc` | `props.fileData.toc` is a non-empty array |

Custom conditions: call `registerCondition(name, (props: QuartzComponentProps) => boolean)`
from any plugin's module-load side effect, then reference `condition: <name>` in YAML.

### The 8 layout slots (`quartz/cfg.ts` `FullPageLayout`)

```ts
interface FullPageLayout {
  head: QuartzComponent;         // single, renders <head>
  header: QuartzComponent[];     // horizontal row, before beforeBody
  beforeBody: QuartzComponent[]; // vertical
  pageBody: QuartzComponent;     // single, the Content component
  afterBody: QuartzComponent[];  // vertical
  left: QuartzComponent[];       // sidebar (vertical desktop/tablet, horizontal mobile)
  right: QuartzComponent[];      // sidebar (vertical desktop, horizontal tablet/mobile)
  footer: QuartzComponent;       // single
}
```
Only `left`, `right`, `beforeBody`, `afterBody` are settable via
`layout.position` in YAML (`head`/`header`/`pageBody`/`footer` are structural
and assigned by specific plugin roles, e.g. `content-page`'s `pageBody`).

---

## 7. Plugin categories — instance shapes (needed if a plugin is more than a component)

```ts
type QuartzTransformerPluginInstance = {
  name: string;
  textTransform?: (ctx: BuildCtx, src: string) => string;
  markdownPlugins?: (ctx: BuildCtx) => PluggableList;   // remark plugins
  htmlPlugins?: (ctx: BuildCtx) => PluggableList;       // rehype plugins
  externalResources?: (ctx: BuildCtx) => Partial<StaticResources>;
};

type QuartzFilterPluginInstance = {
  name: string;
  shouldPublish(ctx: BuildCtx, content: ProcessedContent): boolean;
};

type QuartzEmitterPluginInstance = {
  name: string;
  emit(ctx: BuildCtx, content: ProcessedContent[], resources: StaticResources): Promise<FilePath[]> | AsyncGenerator<FilePath>;
  partialEmit?(ctx, content, resources, changeEvents: ChangeEvent[]): Promise<FilePath[]> | AsyncGenerator<FilePath> | null;
  getQuartzComponents?: (ctx: BuildCtx) => QuartzComponent[];
  externalResources?: (ctx: BuildCtx) => Partial<StaticResources>;
};

type QuartzPageTypePluginInstance = {
  name: string;
  priority?: number;          // higher wins when multiple page types match the same file; default 0
  fileExtensions?: string[];  // e.g. [".canvas"]; .md handled by default content page type
  match: (args: { slug: FullSlug; fileData; cfg: GlobalConfiguration }) => boolean;
  generate?: (args: { content: ProcessedContent[]; cfg; ctx: BuildCtx }) => VirtualPage[];
  layout: string;             // key into layout.byPageType
  frame?: string;             // page frame name, see §8
  body: QuartzComponentConstructor;
  treeTransforms?: (ctx: BuildCtx) => TreeTransform[];
};
```

Example transformer (Latex, trimmed):
```ts
export const Latex: QuartzTransformerPlugin<Options> = (opts?: Options) => {
  const engine = opts?.renderEngine ?? "katex";
  return {
    name: "Latex",
    markdownPlugins() { return [remarkMath]; },
    htmlPlugins() { return engine === "katex" ? [[rehypeKatex, { output: "html" }]] : [rehypeMathjax]; },
    externalResources() {
      return { css: [{ content: "https://cdnjs.../katex.min.css" }] };
    },
  };
};
```

Example filter (RemoveDrafts):
```ts
export const RemoveDrafts: QuartzFilterPlugin<{}> = () => ({
  name: "RemoveDrafts",
  shouldPublish(_ctx, [_tree, vfile]) {
    return !(vfile.data?.frontmatter?.draft ?? false);
  },
});
```

Example emitter (simplified ContentPage):
```tsx
export const ContentPage: QuartzEmitterPlugin = () => ({
  name: "ContentPage",
  getQuartzComponents(ctx) {
    const { head, header, beforeBody, pageBody, afterBody, left, right, footer } = ctx.cfg.layout;
    return [head, ...header, ...beforeBody, pageBody, ...afterBody, ...left, ...right, footer];
  },
  async emit(ctx, content, resources) {
    const cfg = ctx.cfg.configuration;
    const fps = [];
    for (const [tree, file] of content) {
      const slug = canonicalizeServer(file.data.slug);
      const externalResources = pageResources(slug, file.data, resources);
      const componentData = { fileData: file.data, externalResources, cfg, children: [], tree, allFiles: content.map(c => c[1].data) };
      const html = renderPage(cfg, slug, componentData, {}, externalResources);
      fps.push(await write({ ctx, content: html, slug: file.data.slug, ext: ".html" }));
    }
    return fps;
  },
});
```
`renderPage`, `pageResources`, `canonicalizeServer`, `write`, `htmlToJsx` all
come from `@quartz-community/utils` (not `@quartz-community/types`).

---

## 8. Page Frames (only relevant if a plugin needs a non-standard page shell)

Three built-in frames: `default` (3-column, standard), `full-width` (no
sidebars), `minimal` (no sidebars/header/beforeBody, used by 404). Resolution
order: (1) `layout.byPageType.<name>.template` in YAML → (2) plugin-registered
frame from Frame Registry → (3) page type's own `frame` field → (4) `"default"`.

A plugin ships a custom frame via a `./frames` export + `"quartz".frames` manifest
key (`{ "MyFrame": { "exportName": "MyFrame" } }`) — see
`docs/advanced/making plugins.md` "Providing Custom Frames" for the full
5-step recipe if any Task 3-12 plugin needs this (unlikely for simple UI
components).

---

## 9. Utility import map (`docs/advanced/making plugins.md`)

| Need | Import from |
|---|---|
| Types (`QuartzComponent`, `QuartzTransformerPlugin`, etc.) | `@quartz-community/types` |
| Path utils (`simplifySlug`, `resolveRelative`, `pathToRoot`) | `@quartz-community/utils/path` |
| DOM utils (`removeAllChildren`, `registerEscapeHandler`) | `@quartz-community/utils/dom` |
| JSX conversion (`htmlToJsx`) | `@quartz-community/utils/jsx` |
| Lang utils (`classNames`, `capitalize`) | `@quartz-community/utils/lang` |
| Date/sort (`formatDate`, `getDate`, `byDateAndAlphabetical`) | `@quartz-community/utils/date`, `.../sort` |
| HTML escaping | `@quartz-community/utils/escape` |
| Emoji (`getIconCode`) | `@quartz-community/utils/emoji` |
| Browser runtime (`onNav`, `onRender`, `fetchContentIndex`) | `@quartz-community/runtime` |

**Never** import from `@jackyzha0/quartz` or `vfile` directly in a community plugin.

---

## 10. i18n pattern (expected for any user-facing string)

```
src/i18n/
├── index.ts
└── locales/
    └── en-US.ts
```
```ts
// locales/en-US.ts
export default {
  components: { myPlugin: { title: "My Plugin" } },
};
// index.ts
import enUS from "./locales/en-US";
const locales: Record<string, typeof enUS> = { "en-US": enUS };
export function i18n(locale: string) { return locales[locale] || enUS; }
```
Usage in a component: `const t = i18n(cfg.locale ?? "en-US").components.myPlugin;`

---

## 11. CLI cheat sheet (`npx quartz plugin ...`)

```shell
npx quartz plugin add github:org/repo[#branch]     # remote, string source
npx quartz plugin add ./local/path                 # local, symlinked into .quartz/plugins/
npx quartz plugin remove <name>                     # unsymlink/uninstall + strip from config+lockfile
npx quartz plugin list                              # list installed
npx quartz plugin enable|disable <name>              # toggle `enabled:` in yaml, keep files
npx quartz plugin config <name> --set key=value      # patch options: in yaml
npx quartz plugin install [--from-config] [--latest] [--clean] [--dry-run] [-c N]
npx quartz plugin prune [--dry-run]                  # remove installed-but-unreferenced plugins
npx quartz tui                                       # interactive plugin manager
```
`--from-config` reconciles `.quartz/plugins/` + lockfile with whatever is
currently in `quartz.config.yaml` (installs missing, prunes orphaned) — this
is the command to run after a fresh clone or before CI builds.

---

## 12. Baseline build facts for this repo (vanilla, pre-customization)

- Node: this run used the machine's active Node (`v25.8.0`); repo declares
  `"engines": { "node": ">=22" }` — task brief mentioned v22.16.0 is the
  pinned/expected version; both satisfy `>=22`, no issue observed.
- `npm i` at repo root: 285 packages, 0 errors, 8 audit vulnerabilities
  (1 low/2 moderate/5 high) — not addressed, out of scope for recon.
- `npx quartz create -t obsidian -X copy -s ~/Developer/quartz-v5-migration-backup/content -l shortest -b haejunhyun.com`
  used **CLI flags**, not the interactive prompt (see report for why: `--help`
  showed `-t/-X/-s/-b/-l` flags; only `-b/--baseUrl` had no flag equivalent
  passed initially and prompted once — resolved by adding `-b` explicitly).
  This resolved **46 plugins** on first run (obsidian template's default set,
  including `note-properties` already enabled — no manual install needed for
  frontmatter parsing).
- `npx quartz build`: **89 input files** parsed (matches Task 1's 89-page
  sitemap baseline exactly), **790 files emitted**, ~14s. One benign warning:
  `LaTeX-incompatible input ... Unrecognized Unicode character "㎡"` (KaTeX
  strict-mode warning, not an error, does not block build).
- `quartz.config.yaml` top of file: `# yaml-language-server: $schema=./quartz/plugins/quartz-plugins.schema.json`
  — point any editor's YAML LSP at this for autocomplete/validation.
- `.gitignore` already excludes `.quartz/`, `node_modules`, `public` — safe to
  `git add -A` at the repo root without special-casing plugin dirs.

---

## 13. Quick-start checklist for writing a new local component plugin (Tasks 5-10)

1. `mkdir -p plugins/<name>/src/components` (or wherever you keep it; local = anything under `./`).
2. `package.json`: set `"type": "module"`, `"exports"` map (§5), `"peerDependencies": { "preact": "^10.0.0" }`, `"dependencies": { "@quartz-community/types": "..." }`, and the `"quartz"` manifest block (§4) — `category: "component"`, `components: { <ExportName>: { displayName, defaultPosition, defaultPriority } }`.
3. `src/components/<Name>.tsx`: factory function `(opts?) => QuartzComponent` per §1, set `.css`/`.beforeDOMLoaded`/`.afterDOMLoaded` per §2.
4. `src/components/index.ts`: `export { default as <ExportName> } from "./<Name>"` — **name must match the manifest's `components` key exactly**.
5. `src/index.ts`: `export { default as <ExportName> } from "./components/<Name>"`.
6. Either wire up `tsup.config.ts` (copy §5's config) and `npm run build`, or hand-write `dist/index.js` + `dist/components/index.js` as plain ESM (fine for internal/local plugins not meant for distribution).
7. `npx quartz plugin add ./plugins/<name>` from the project root — creates the symlink and a `quartz.config.yaml` entry.
8. Edit that entry's `layout:` block (`position`, `priority`, optional `condition`/`display`/`group`) and `options:` to taste. **Options only reach your factory if this entry has a `layout:` block** — see §4's corrected subsection and §14.
9. `npx quartz build` and grep the output HTML for your component's marker class/id (and, if it takes options, the option value itself) to confirm it rendered correctly — this is exactly how the local-plugin mechanism and the options-passing mechanism were verified for this document (§3.3, §14).

---

## 14. VERIFIED LIVE: YAML `options:` → component factory, end-to-end proof

This section documents the smoke test that resolved a reviewer-flagged
contradiction between §1 (Explorer's factory receiving `userOpts`) and an
earlier, incorrect version of §4 that claimed pure `"category": "component"`
plugins never receive YAML `options:` without an `init()` export. §4 has
already been corrected above; this section is the raw evidence.

**Setup:** created `plugins/options-test-plugin/` inside this repo (not a
symlinked-from-elsewhere path, so Node's `preact/jsx-runtime` singleton
import — externalized per §5 — resolves correctly against the host project's
own `node_modules`). Hand-wrote `dist/` directly (no tsup build):

```json title="plugins/options-test-plugin/package.json (relevant excerpt)"
{
  "quartz": {
    "name": "options-test-plugin",
    "category": "component",
    "defaultOrder": 15,
    "defaultOptions": { "testValue": "DEFAULT_FROM_MANIFEST" },
    "components": {
      "OptionMarker": { "displayName": "OptionMarker", "defaultPosition": "right", "defaultPriority": 99 }
    }
  }
}
```
```js title="plugins/options-test-plugin/dist/components/OptionMarker.js"
import { jsx } from "preact/jsx-runtime";

const OptionMarker = (userOpts) => {
  const opts = { testValue: "FACTORY_DEFAULT", ...userOpts };  // same pattern as Explorer in §1
  const Component = (_props) => jsx("div", {
    id: "option-marker-smoke-test",
    "data-testvalue": opts.testValue,
    children: `OPTION_MARKER_VALUE:${opts.testValue}`,
  });
  return Component;
};
export default OptionMarker;
```
No `init()` was exported anywhere in this plugin — deliberately, to isolate
whether the factory-call path alone is sufficient.

**Test 1 — YAML options reach the factory without `init()`:**
```shell
npx quartz plugin add ./plugins/options-test-plugin
# quartz.config.yaml auto-seeded:
#   - source: ./plugins/options-test-plugin
#     options: { testValue: DEFAULT_FROM_MANIFEST }   # seeded from manifest defaultOptions
#     layout: { position: right, priority: 99 }
```
Edited `options.testValue` to `YAML_OPTIONS_WORK_42`, ran `npx quartz build`,
then:
```shell
$ grep -o 'OPTION_MARKER_VALUE:[A-Za-z0-9_]*' public/index.html
OPTION_MARKER_VALUE:YAML_OPTIONS_WORK_42
```
**Confirmed: the YAML `options:` value reached the factory and rendered in
the DOM, with zero `init()` involvement.**

**Test 2 — manifest `defaultOptions` is NOT auto-merged at layout time:**
Changed the YAML entry to `options: {}` (empty), rebuilt:
```shell
$ grep -o 'OPTION_MARKER_VALUE:[A-Za-z0-9_]*' public/index.html
OPTION_MARKER_VALUE:FACTORY_DEFAULT
```
Note this is `FACTORY_DEFAULT` (the component's own internal default), **not**
`DEFAULT_FROM_MANIFEST` (the manifest's `defaultOptions`) — proving
`buildLayoutForEntries()` passes only `entry.options` (+ `quartz.ts`
overrides) to the constructor, never the manifest's `defaultOptions`. A
component must still implement its own internal default-merging, exactly
like v4 and exactly like Explorer in §1.

**Cleanup — verified fully reversible:**
```shell
npx quartz plugin remove options-test-plugin   # strips config + lockfile entries + symlink
rm -rf plugins/                                  # scratch source dir
npx quartz build                                 # back to 89 input files / 790 emitted, 0 occurrences of the test marker, 0 git diff
```
`git status` after cleanup showed a byte-for-byte clean tree against the
`migration` branch's committed baseline — no residue from either this test
or the earlier §3.3 local-plugin test leaked into the repo.

---

## 15. 로컬 플러그인 규약 (established by Task 4, SocialLinks) — replicate for Tasks 5-10

This section is the **mechanical recipe**. It was produced by actually
building and shipping `plugins/social-links/` end-to-end (source → `dist/` →
`npx quartz plugin add` → `quartz.config.yaml` entry → `npx quartz build` →
grep-verified in `public/index.html`). Follow it file-for-file for
RecentNotesForIndex and the other Task 5-10 components; only the component
logic, options shape, and layout placement change.

### 15.1 Directory layout (source of truth: `plugins/social-links/`)

```
plugins/<kebab-name>/                    # kebab-case dir name = the plugin's registered name
├── package.json                         # npm manifest + "quartz" manifest block (§4)
├── tsup.config.ts                       # copied verbatim from .quartz/plugins/spacer/tsup.config.ts
├── tsconfig.json                        # copied from spacer, trimmed (see 15.4)
├── tsconfig.build.json                  # extends tsconfig.json, types:["node"] only
├── .gitignore                           # "node_modules" + "*.tsbuildinfo" (dist IS committed)
├── types/
│   └── globals.d.ts                     # declare module "*.scss" { const c: string; export default c }
├── src/
│   ├── index.ts                         # re-exports component + its Options type
│   └── components/
│       ├── index.ts                     # export { default as <ExportName> } from "./<Name>"
│       ├── <Name>.tsx                   # the actual QuartzComponentConstructor factory
│       └── styles/
│           └── <name>.scss              # copied verbatim from the v4 component's styles/*.scss
├── dist/                                # COMMITTED — built output, see 15.5
│   ├── index.js / .d.ts / .js.map
│   └── components/
│       └── index.js / .d.ts / .js.map
├── node_modules/                        # gitignored, from `npm install` inside the plugin dir
└── package-lock.json                    # committed, for reproducible plugin-local builds
```

Do NOT nest a `src/types.ts` re-export file or a `./types` export subpath
unless the component actually needs a standalone types-only entry point —
SocialLinks didn't, so `tsup.config.ts`'s `entry` map only lists `index` and
`components/index` (the spacer template's default `types: "src/types.ts"`
entry was deleted).

### 15.2 `package.json` — copy this shape, then edit the marked fields

Based on `.quartz/plugins/spacer/package.json`, trimmed of registry-publish
cruft (`repository`, `homepage`, `keywords`, lint/test scripts — none of
that applies to an internal, unpublished local plugin) and marked `"private": true`:

```json
{
  "name": "@haejunhyun/<kebab-name>",        // EDIT: any private scope, never published
  "version": "0.1.0",
  "description": "...",
  "type": "module",
  "license": "MIT",
  "private": true,
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./components": { "types": "./dist/components/index.d.ts", "import": "./dist/components/index.js" },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": { "build": "tsup" },
  "peerDependencies": { "preact": "^10.0.0" },
  "peerDependenciesMeta": { "preact": { "optional": false } },
  "dependencies": { "@quartz-community/types": "github:quartz-community/types" },
  "devDependencies": {
    "@types/node": "^24.10.0",
    "preact": "^10.28.2",
    "sass": "^1.97.3",
    "tsup": "^8.5.0",
    "typescript": "^5.9.3"
  },
  "engines": { "node": ">=22" },
  "quartz": {
    "name": "<kebab-name>",                  // EDIT: MUST match the plugins/<dir> basename (§3.3)
    "displayName": "<Human Name>",           // EDIT
    "category": "component",
    "version": "0.1.0",
    "quartzVersion": ">=5.0.0",
    "dependencies": [],
    "defaultOrder": 15,
    "defaultEnabled": true,
    "defaultOptions": { /* EDIT: seeds the YAML options: block on first `plugin add`, nothing more — see §4 */ },
    "components": {
      "<ExportName>": {                      // EDIT: MUST exactly match the named export from src/components/index.ts
        "displayName": "<Human Name>",
        "defaultPosition": "left",           // EDIT: left | right | beforeBody | afterBody
        "defaultPriority": 13                // EDIT: only used to seed the YAML layout: block on first `plugin add`
      }
    }
  }
}
```

Add `@quartz-community/utils` to `dependencies` only if the component needs
path/dom/lang/date/i18n helpers (§9) — SocialLinks didn't.

### 15.3 Component factory — `src/components/<Name>.tsx`

Exact pattern used (this IS the working file, minus the JSX body which is
component-specific):

```tsx
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/<name>.scss"

export interface <Name>Options { /* ... */ }

const defaultOptions: <Name>Options = { /* internal fallback defaults */ }

export default ((userOpts?: Partial<<Name>Options>) => {
  const opts: <Name>Options = { ...defaultOptions, ...userOpts }   // MANDATORY merge — manifest defaultOptions is NOT auto-applied, see §4

  const <Name>: QuartzComponent = (props: QuartzComponentProps) => {
    // ... render using opts and props (cfg, displayClass, etc.)
  }

  <Name>.css = style
  return <Name>
}) satisfies QuartzComponentConstructor<Partial<<Name>Options>>
```

`src/components/index.ts`:
```ts
export { default as <ExportName> } from "./<Name>"
```

`src/index.ts`:
```ts
export { default as <ExportName> } from "./components/<Name>"
export type { <Name>Options } from "./components/<Name>"
```

### 15.4 `tsconfig.json` / `tsconfig.build.json` — trims vs. the spacer template

The spacer template's `tsconfig.json` references `vitest/globals` and a
`test/` dir that a from-scratch local plugin doesn't have yet. Two edits
that matter (skip them and `tsup run build`'s DTS step errors out):

1. `"types": ["node"]` (drop `"vitest/globals"` unless you actually add a
   `test/` dir + vitest devDependency).
2. `"include": ["src", "types", "tsup.config.ts"]` — **must include `"types"`**
   so `types/globals.d.ts`'s `declare module "*.scss"` ambient declaration is
   picked up. Omitting it produces exactly this build failure (hit and fixed
   during Task 4):
   ```
   src/components/SocialLinks.tsx(6,19): error TS2307: Cannot find module
   './styles/socialLinks.scss' or its corresponding type declarations.
   Error: error occurred in dts build
   ```

`tsconfig.build.json` (extends `tsconfig.json`, used by tsup) stays exactly
as spacer's: `{ "extends": "./tsconfig.json", "compilerOptions": { "types": ["node"] }, "include": ["src", "types"], "exclude": ["dist", "node_modules", "test"] }`.

`tsup.config.ts`: copy `.quartz/plugins/spacer/tsup.config.ts` byte-for-byte
(it already includes the `.scss`→text and `.inline.ts`→bundled-JS esbuild
loader plugin, needed the moment any Task 5-10 component ships a script),
only trim the `entry` map per 15.1.

### 15.5 Build + install — the exact commands that worked

```shell
cd plugins/<kebab-name>
npm install        # pulls tsup/sass/typescript/preact into this dir's own node_modules
                    # (network access confirmed available — registry.npmjs.org reachable)
npm run build       # runs tsup; must end with "DTS ⚡️ Build success" AND "ESM ⚡️ Build success"
                    # — a DTS-only failure (ESM succeeds, DTS errors) still leaves a stale/partial
                    # dist/ from a previous run; don't treat ESM success alone as "done"
```

Why `npm install` works from inside `plugins/<name>/` even though the
*symlinked* copy under `.quartz/plugins/<name>/` couldn't resolve `preact`
on its own: `plugins/<name>/` is a **real, physical directory inside this
repo**, so Node's module resolution walks up from its real path and finds
the *project root's* `node_modules` (which already has
`@quartz-community/types` and `@quartz-community/utils` hoisted, confirmed
in §14's setup note) — no plugin-local `node_modules/@quartz-community/*`
needed, only the tooling deps (`tsup`, `sass`, `typescript`, `preact`) that
must be present for the *build step itself* to run.

```shell
cd ../..                                    # back to repo root
npx quartz plugin add ./plugins/<kebab-name>
```
Output, confirming the pre-built `dist/` was used (no fallback `npm install
&& npm run build` triggered inside the plugin dir by the CLI itself):
```
→ Adding <name> from local path .../plugins/<name>...
✓ Added <name> (local symlink)
→ Building plugins...
  ✓ <name>: using pre-built dist/
  ✓ <name> built
Updated quartz.lock.json
```

### 15.6 `quartz.config.yaml` registration — what `plugin add` writes, and what to hand-edit after

`plugin add` auto-seeds this block (priority/position pulled straight from
the manifest's `components.<ExportName>.defaultPriority`/`defaultPosition`,
options seeded from `defaultOptions`):

```yaml
  - source: ./plugins/social-links
    enabled: true
    options:
      links: []
    order: 15
    layout:
      position: left
      priority: 13
```

Then hand-edit `options:` to the real content (**the `layout:` block is
what makes `options:` reach the factory at all — see §4's corrected
subsection; do not delete it even if you think the component ignores
props**). For SocialLinks this meant pasting the 3-link array copied
verbatim from v4 `quartz.layout.ts:80-97` (GitHub/LinkedIn/Instagram, name +
url + inline-SVG icon string) under `options.links`. YAML gotcha: wrap each
`icon:` value in **single quotes**, not double — the SVG strings contain
`xmlns="..."` double-quoted attributes, and YAML double-quoted scalars would
require escaping every one of them; single-quoted scalars only need `''` to
escape a literal single quote (none present here).

Priority placement used for SocialLinks specifically: **13**, between
`page-title` (10) and `spacer`/`search`/`darkmode` (15/20/30) — verified by
grepping DOM offsets in the built `public/index.html` (see §15.7). Reserve
11-12 for anything that must sit between page-title and SocialLinks (this
migration reserved it for VisitorCounter, Task 10).

### 15.7 Build verification — the exact checks that count as "done"

```shell
npx quartz build
# must report: Found 89 input files ... Emitted 790 files ... Done processing 89 files
# (89/790 is this repo's pre-existing baseline — any deviation means something broke)

grep -o '<a[^>]*href="<one-of-the-3-urls>"[^>]*>' public/index.html   # once per link, 3 total
grep -c '\.social-links' public/component-*.css                        # >=1, confirms scss compiled+attached
```

DOM-order proof (don't just trust the YAML priority number — confirm the
actual emitted HTML):
```python
html = open('public/index.html').read()
pt = html.find('page-title'); sl = html.find('social-links'); se = html.find('search')
assert pt < sl < se
```
Actual byte offsets observed: `page-title`@5297 < `social-links`@5352 <
`search`@8496 — the rendered fragment was
`<div class="left sidebar"><h2 class="page-title">...</h2><div class=" social-links"><ul><li><a href="https://github.com/...">...`,
i.e. SocialLinks renders as a sibling `<div>` immediately after the
`page-title` `<h2>`, exactly matching the v4 `left: [...]` array order.

### 15.8 What NOT to do (mistakes avoided/caught during Task 4)

- Don't rely on the manifest's `"quartz".defaultOptions` to actually supply
  data at render time — it only seeds the YAML on first `plugin add`. Empty
  `options: {}` in YAML falls back to the **factory's own** `defaultOptions`
  object, not the manifest's (§4, §14 Test 2).
- Don't omit the `layout:` block "because the component doesn't need
  placement logic" — no `layout:` means `buildLayoutForEntries()` never
  calls the constructor with `entry.options` at all (§4's `init()` carve-out
  is for a different, side-effect-only use case that doesn't apply to any
  planned Task 5-10 component).
- Don't forget `types/globals.d.ts` + `"types"` in `tsconfig.json`'s
  `include` — the DTS build step silently fails on the first `.scss` import
  otherwise (15.4).
- Don't hand-copy `tsconfig.json` without trimming `vitest/globals` unless
  you're also adding a real `test/` dir — an unmet `types` reference isn't
  always a hard error but is unnecessary noise/risk to carry forward.

---

## 16. Task 11: absorbing v4's core-file edits (Explorer/Footer/Head/og/ko-KR)

v4 hand-modified 5 core files directly (`Explorer.tsx`, `Footer.tsx`, `Head.tsx`,
`util/og.tsx`, `i18n/locales/ko-KR.ts`). None of those edits were re-applied to
v5's copies of the same files — v5 core stays untouched. Instead:

- **Footer** (v4 replaced "Created with Quartz vX © year" with "Created by
  haejun", added an `<hr />`, dropped the version/year): the `footer`
  community plugin has no option for custom text, so it was fully replaced —
  `npx quartz plugin remove footer` then a new local plugin at
  `./plugins/footer` (same registered name "footer", since **the footer slot
  is resolved structurally by plugin name**, not by `layout:` — see
  `config-loader.ts`'s `loadQuartzLayout()`: `json.plugins.find(e => e.enabled
  && extractPluginName(e.source) === "footer")`. A local plugin with any other
  name would never be picked up for the footer slot no matter what
  `layout.position` you gave it — there's no such position for `footer`; §6's
  `LayoutPosition` type only has `left/right/beforeBody/afterBody`).
  `options.links: {}` fixes the deferred Task 3 item (empty links, matching
  v4's `Component.Footer({ links: {} })`) in the same change.
- **Head** (v4 hardcoded a GoatCounter `<script data-goatcounter ...>` tag
  *in addition to* Google Analytics): v5 core's `componentResources.ts`
  already has native `analytics.provider: "goatcounter"` support, but
  `analytics:` only accepts **one** provider and this site already uses
  `provider: "google"` — so the extra script couldn't be expressed as a
  config option. Added via a new local **transformer** plugin,
  `./plugins/goatcounter-tracking`, using `externalResources()` →
  `additionalHead` (the same extension point `Head.tsx` already reads at
  `{additionalHead.map(...)}` — no core edit needed). Gotcha: a
  category:"transformer" plugin instance that only implements
  `externalResources` fails `config-loader.ts`'s `validateCategory()` (it
  requires `textTransform`/`markdownPlugins`/`htmlPlugins` to be *present as a
  key*, even as a no-op) — logs "declares category transformer but its
  factory returned an instance missing the required methods" and gets
  skipped. Fix: add a trivial `htmlPlugins() { return [] }`.
- **og.tsx** (v4 added a left accent bar in the theme's `secondary` color and
  changed the title `<h1>` color from `dark` to `secondary`): the `og-image`
  plugin's `imageStructure` option is a function, so it's excluded from
  `UserOpts` (`Omit<SocialImageOptions, "imageStructure">`) and can't be set
  from YAML. It has a first-class TS-override hook generated specifically for
  this: `.quartz/plugins/index.ts` exports `CustomOgImages(opts)`, which calls
  `componentRegistry.setOptionOverrides("og-image", opts)` — this is merged
  into the emitter's options at instantiation time
  (`{ ...manifest?.defaultOptions, ...entry.options, ...pluginOverrides }` in
  `config-loader.ts`'s `instantiate()`), the same override mechanism §4
  documents for components, just also wired up for processing-category
  (transformer/filter/emitter/pageType) plugins. Implementation: new root file
  `og-image.overrides.tsx` (kept at repo root, not under `plugins/`, since
  it's consumed directly by `quartz.ts` and isn't a registered/installed
  plugin) exports `customOgImage`, and `quartz.ts` calls
  `CustomOgImages({ imageStructure: customOgImage })` before
  `loadQuartzConfig()`. Verified live: extracted the left-edge pixel color of
  a generated `*-og-image.webp` and confirmed it matches the config's
  `theme.colors.lightMode.secondary` (`#3d6b8e` → observed RGB (60,106,143),
  the ~1-off difference being webp compression). Gotcha: root `tsconfig.json`
  uses `"moduleResolution": "node"` (classic), which does **not** honor
  package.json `"exports"` subpath maps — `import ... from
  "@quartz-community/utils/sort"` fails `tsc --noEmit` with `TS2307` even
  though it bundles fine with esbuild (which does honor `exports`). Fix:
  import `getDate` from the package **root** (`"@quartz-community/utils"`)
  instead — it's re-exported there too. Only matters for files living at the
  repo root under the root `tsconfig.json`; plugin-local files under
  `plugins/*/tsconfig.json` use `"moduleResolution": "Bundler"` and don't hit
  this.
- **Explorer** (v4 added `class="file-title"` to the `<a>` in
  `template-file`): **skipped, no visible effect.** Grepped v4's entire
  `quartz/` tree — no CSS rule or JS selector anywhere references
  `.file-title` (the inline script does `li.querySelector("a")`, generic, not
  class-scoped). v5's Explorer plugin is a different, Obsidian-style rewrite
  of the same template (`class="nav-file-title tree-item-self"` instead) —
  porting a no-op class onto a differently-styled template would add nothing.
- **ko-KR.ts** (v4 changed several Korean UI strings — "백링크", "라이트
  모드", "검색" etc — to their English equivalents): **skipped, not
  reachable.** `quartz.config.yaml`'s `configuration.locale` is `en-US` (set
  in Task 3, matching v4's own `locale: "en-US"` — v4 kept `ko-KR.ts` edited
  but never switched `locale` to `"ko-KR"` either, so the v4 edits were
  themselves already dead code in the live site). `quartz/i18n/locales/ko-KR.ts`
  is also an unmodified v5 core file — editing it would both have zero
  visible effect and violate the "don't touch v5 core files" constraint for
  no benefit.
