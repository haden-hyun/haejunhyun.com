import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { getDate } from "./Date"
import style from "./styles/prevNext.scss"

const PrevNext: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
  if (!fileData.slug || fileData.slug === "index") return <></>

  const slugParts = fileData.slug.split("/")
  const parentDir = slugParts.slice(0, -1).join("/")

  const siblings: QuartzPluginData[] = allFiles
    .filter((f) => {
      if (!f.slug || !f.dates || !f.frontmatter?.title) return false
      const fParentDir = f.slug.split("/").slice(0, -1).join("/")
      return fParentDir === parentDir
    })
    .sort((a, b) => getDate(cfg, a)!.getTime() - getDate(cfg, b)!.getTime())

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
