import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/prevNext.scss"

type PrevNextPluginData = QuartzPluginData & Record<string, unknown>

/**
 * 읽는 순서 = created(원 작성일). 목록 날짜 posted는 개정 때 오늘로 덮어써져
 * 시리즈 순서를 흔들고, modified(=updated)는 작업마다 바뀌므로 둘 다 쓰지 않는다.
 */
function getSortTime(f: PrevNextPluginData): number {
  return f.dates?.created?.getTime() ?? 0
}

const PrevNext: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (!fileData.slug || fileData.slug === "index") return <></>

  const slugParts = fileData.slug.split("/")
  const parentDir = slugParts.slice(0, -1).join("/")

  const files = allFiles as PrevNextPluginData[]
  const siblings: PrevNextPluginData[] = files
    .filter((f) => {
      if (!f.slug || !f.dates || !f.frontmatter?.title) return false
      const fParentDir = f.slug.split("/").slice(0, -1).join("/")
      return fParentDir === parentDir
    })
    .sort((a, b) => getSortTime(a) - getSortTime(b))

  const currentIdx = siblings.findIndex((f) => f.slug === fileData.slug)
  if (currentIdx === -1) return <></>

  const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null
  const next = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null
  if (!prev && !next) return <></>

  return (
    <nav class="prev-next-nav">
      <div class="prev-next-inner">
        {prev ? (
          <a class="prev-next-link prev" href={resolveRelative(fileData.slug!, prev.slug!)}>
            <span class="direction">← Prev</span>
            <span class="ptitle">{prev.frontmatter!.title}</span>
          </a>
        ) : (
          <div />
        )}
        {next ? (
          <a class="prev-next-link next" href={resolveRelative(fileData.slug!, next.slug!)}>
            <span class="direction">Next →</span>
            <span class="ptitle">{next.frontmatter!.title}</span>
          </a>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}

PrevNext.css = style
export default (() => PrevNext) satisfies QuartzComponentConstructor
