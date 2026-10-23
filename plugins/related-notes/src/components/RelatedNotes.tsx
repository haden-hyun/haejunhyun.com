import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/relatedNotes.scss"
import { isListedNote } from "../../../_shared/notes"
import { seriesIndexOf, seriesOf } from "../../../_shared/series"
import { scoreRelated } from "./score"
import graphPanelScript from "./graphPanel"

type FileData = QuartzPluginData & Record<string, unknown>

export interface RelatedNotesOptions {
  limit: number
  /** Backlinks 패널에 이미 있는 노트는 뺀다(같은 island에 같은 제목이 두 번 뜨지 않게). */
  excludeBacklinks: boolean
}

const defaultOptions: RelatedNotesOptions = {
  limit: 5,
  excludeBacklinks: true,
}

const tagsOf = (f: FileData): string[] => {
  const raw = (f.frontmatter as { tags?: unknown } | undefined)?.tags
  return Array.isArray(raw) ? raw.map(String) : []
}

/** 우측 사이드바 Related — 링크 > 같은 시리즈 > 개념 태그 순위로 최대 limit편. 기준 점수를 넘는 노트가 없으면 그리지 않는다. */
export default ((userOpts?: Partial<RelatedNotesOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const RelatedNotes: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const current = fileData as FileData
    const currentSlug = current.slug as string | undefined
    if (!currentSlug || !isListedNote(current)) return null

    const files = allFiles as FileData[]
    const notes = files
      .filter((f) => isListedNote(f))
      .map((f) => ({
        slug: f.slug as string,
        links: (f.links as string[] | undefined) ?? [],
        tags: tagsOf(f),
        series: seriesOf(f),
        seriesIndex: seriesIndexOf(f),
        title: String(f.frontmatter?.title ?? f.slug),
      }))
    const self = notes.find((n) => n.slug === currentSlug)
    if (!self) return null

    // 주의: Backlinks 패널과 같은 판정(unlisted 제외, links 포함)이어야 중복이 정확히 빠진다.
    const backlinkSlugs = new Set(
      files
        .filter((f) => f.unlisted !== true && (f.links as string[] | undefined)?.includes(currentSlug))
        .map((f) => f.slug as string),
    )

    const related = scoreRelated(self, notes, backlinkSlugs)
      .filter((r) => !(opts.excludeBacklinks && backlinkSlugs.has(r.note.slug)))
      .slice(0, opts.limit)
    if (related.length === 0) return null

    return (
      <div class={`${displayClass ?? ""} related-notes`}>
        <h3>Related</h3>
        <ul>
          {related.map(({ note }) => (
            <li>
              <a class="internal" href={resolveRelative(currentSlug, note.slug)}>
                {note.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  RelatedNotes.css = style
  RelatedNotes.afterDOMLoaded = graphPanelScript
  return RelatedNotes
}) satisfies QuartzComponentConstructor<Partial<RelatedNotesOptions>>
