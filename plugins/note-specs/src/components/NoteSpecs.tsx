import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "../../../_shared/path"
import { formatYmd, getNoteDates, readingMinutes } from "../../../_shared/noteMeta"
import style from "./styles/noteSpecs.scss"
import { isRealNote } from "../../../_shared/notes"

export interface NoteSpecsOptions {
  title: string
  labels: { created: string; revised: string; updated: string; runtime: string; topic: string }
}

const defaultOptions: NoteSpecsOptions = {
  title: "SPECS",
  labels: { created: "Created", revised: "Revised", updated: "Updated", runtime: "Read time", topic: "Topic" },
}

/**
 * 좌측 사이드바 최상단 스펙 블록 — 음반 슬리브의 사양 표기.
 * 개정·수정 행은 앞선 날짜와 다를 때만 나온다(getNoteDates).
 */
export default ((userOpts?: Partial<NoteSpecsOptions>) => {
  const opts = {
    ...defaultOptions,
    ...userOpts,
    labels: { ...defaultOptions.labels, ...userOpts?.labels },
  }

  const NoteSpecs: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug
    if (!slug || !isRealNote(slug)) return <></>

    const { created, revised, updated } = getNoteDates(fileData)
    const minutes = readingMinutes(fileData.text as string | undefined)
    const tags = (fileData.frontmatter?.tags ?? []) as string[]

    if (!created && !minutes && tags.length === 0) return <></>

    const dateRows: [string, Date | undefined][] = [
      [opts.labels.created, created],
      [opts.labels.revised, revised],
      [opts.labels.updated, updated],
    ]

    return (
      <aside class="note-specs">
        <h3 class="note-specs-title">{opts.title}</h3>
        <dl class="note-specs-list">
          {dateRows.map(
            ([label, date]) =>
              date && (
                <div class="note-specs-row">
                  <dt>{label}</dt>
                  <dd class="note-specs-date">
                    <time datetime={date.toISOString()}>{formatYmd(date)}</time>
                  </dd>
                </div>
              ),
          )}
          {minutes > 0 && (
            <div class="note-specs-row">
              <dt>{opts.labels.runtime}</dt>
              <dd>{minutes} min</dd>
            </div>
          )}
          {tags.length > 0 && (
            <div class="note-specs-row">
              <dt>{opts.labels.topic}</dt>
              <dd class="note-specs-tags">
                {tags.map((tag) => (
                  <a key={tag} href={resolveRelative(slug, `tags/${tag}`)}>
                    {tag}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </aside>
    )
  }

  NoteSpecs.css = style
  return NoteSpecs
}) satisfies QuartzComponentConstructor<Partial<NoteSpecsOptions>>
