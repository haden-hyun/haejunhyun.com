// [빌드 안정성] `@quartz-community/utils`(github: 참조)는 fresh install에서
// dist 없이 설치될 수 있음이 home-hero 작업 중 확인됐다(0.1.1 사본 실측).
// resolveRelative가 의존하는 부분만 인라인해 이 의존성을 아예 없앤다.
// 로직은 @quartz-community/utils/dist/path.js와 동일.

function endsWith(s: string, suffix: string): boolean {
  return s === suffix || s.endsWith("/" + suffix)
}

function trimSuffix(s: string, suffix: string): string {
  return endsWith(s, suffix) ? s.slice(0, -suffix.length) : s
}

function stripSlashes(s: string, onlyStripPrefix = false): string {
  if (s.startsWith("/")) s = s.substring(1)
  if (!onlyStripPrefix && s.endsWith("/")) s = s.slice(0, -1)
  return s
}

function simplifySlug(fp: string): string {
  const res = stripSlashes(trimSuffix(fp, "index"), true)
  return res.length === 0 ? "/" : res
}

function joinSegments(...args: string[]): string {
  if (args.length === 0) return ""
  let joined = args
    .filter((segment) => segment !== "" && segment !== "/")
    .map((segment) => stripSlashes(segment))
    .join("/")
  const first = args[0]
  const last = args[args.length - 1]
  if (first?.startsWith("/")) joined = "/" + joined
  if (last?.endsWith("/")) joined = joined + "/"
  return joined
}

function pathToRoot(slug: string): string {
  let rootPath = slug
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  if (rootPath.length === 0) rootPath = "."
  return rootPath
}

export function resolveRelative(current: string, target: string): string {
  const simplified = simplifySlug(target)
  const rootPath = pathToRoot(current)
  return joinSegments(rootPath, simplified)
}
