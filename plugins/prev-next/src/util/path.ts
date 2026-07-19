import { simplifySlug as utilSimplifySlug, joinSegments } from "@quartz-community/utils"

// Local plain-`string` wrapper around @quartz-community/utils' branded-slug
// helpers. `fileData`/`allFiles` entries are typed as loosely-typed
// `QuartzPluginData & Record<string, unknown>` (see MIGRATION-NOTES §1), so
// `.slug` reads back as `unknown`/`string`, not the branded `FullSlug` type
// that `@quartz-community/utils/path`'s `resolveRelative` expects. Mirrors
// the same pattern used by plugins/recent-notes-index/src/util/path.ts and
// the installed `recent-notes` community plugin
// (`.quartz/plugins/recent-notes/src/util/path.ts`).

export function simplifySlug(fp: string): string {
  return utilSimplifySlug(fp)
}

function pathToRoot(slug: string): string {
  let rootPath = slug
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")

  if (rootPath.length === 0) {
    rootPath = "."
  }

  return rootPath
}

export function resolveRelative(current: string, target: string): string {
  const simplified = simplifySlug(target)
  const rootPath = pathToRoot(current)
  return joinSegments(rootPath, simplified)
}
