/** 파일명 단독 → 현재 페이지 기준 상대 URL. Quartz `shortest` 해석과 같은 규칙(파일명 일치, 유일할 때만). */
export function resolveAsset(currentSlug: string, name: string, allSlugs: readonly string[]): string | undefined {
  const matches = allSlugs.filter((slug) => slug === name || slug.endsWith(`/${name}`))
  if (matches.length !== 1) return undefined

  const depth = currentSlug.split("/").length - 1
  const toRoot = depth === 0 ? "." : Array(depth).fill("..").join("/")
  return `${toRoot}/${matches[0]}`
}
