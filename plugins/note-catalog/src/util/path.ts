// Quartz `@quartz-community/utils`의 경로 헬퍼 사본.
// ⚠️ 의존성으로 끌어오지 않는 이유: 그 패키지는 `github:` 참조라 dist 없이
// 설치돼 esbuild가 해결하지 못한다(다른 로컬 플러그인들은 dist가 남아 있던
// 시점에 설치돼 우연히 동작 중이다). 필요한 게 문자열 함수 셋뿐이라 사본이 낫다.

function endsWith(s: string, suffix: string): boolean {
  return s === suffix || s.endsWith("/" + suffix)
}

function trimSuffix(s: string, suffix: string): string {
  return endsWith(s, suffix) ? s.slice(0, -suffix.length) : s
}

function stripSlashes(s: string, onlyStripPrefix?: boolean): string {
  if (s.startsWith("/")) s = s.substring(1)
  if (!onlyStripPrefix && s.endsWith("/")) s = s.slice(0, -1)
  return s
}

export function simplifySlug(fp: string): string {
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
  const rootPath = slug
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")

  return rootPath.length === 0 ? "." : rootPath
}

export function resolveRelative(current: string, target: string): string {
  return joinSegments(pathToRoot(current), simplifySlug(target))
}
