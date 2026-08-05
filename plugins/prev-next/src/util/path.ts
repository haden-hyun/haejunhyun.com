import { simplifySlug as utilSimplifySlug, joinSegments } from "@quartz-community/utils"

// utils의 branded slug 헬퍼를 평범한 `string`으로 감싼 래퍼.
// allFiles 항목의 `.slug`는 `string`으로 읽히는데 utils의 resolveRelative는
// branded `FullSlug`를 요구해서 그대로는 안 맞는다.
// 다른 로컬 플러그인들도 같은 파일을 복제해 쓴다.

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
