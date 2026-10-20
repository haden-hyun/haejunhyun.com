import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { classNames } from "@quartz-community/utils/lang"
import { formatYmd, getListDate, getNoteDates } from "../../../_shared/noteMeta"
import { buildRecentRows, byListDateDesc, isListedNote, titleCase, topicName } from "../../../_shared/notes"
import { resolveRelative } from "../util/path"
import style from "./styles/recentNotes.scss"

type RecentNotesPluginData = QuartzPluginData & Record<string, unknown>

export interface RecentNotesForIndexOptions {
  title?: string
  limit: number
  linkToMore: string | false
  linkToMoreLabel: string
  showTags: boolean
  filter: (f: RecentNotesPluginData) => boolean
  sort: (f1: RecentNotesPluginData, f2: RecentNotesPluginData) => number
}

const defaultOptions: RecentNotesForIndexOptions = {
  limit: 5,
  linkToMore: false,
  linkToMoreLabel: "ALL NOTES →",
  showTags: true,
  filter: () => true,
  sort: byListDateDesc,
}

export default ((userOpts?: Partial<RecentNotesForIndexOptions>) => {
  const opts: RecentNotesForIndexOptions = { ...defaultOptions, ...userOpts }

  const RecentNotesForIndex: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    // 홈 전용 가드. `is-index` layout condition은 내장에 없다(역인 not-index만 존재).
    if (fileData.slug !== "index") return <></>

    const files = allFiles as RecentNotesPluginData[]
    const pages = files
      .filter(opts.filter)
      .filter(
        (f) =>
          f.slug !== fileData.slug && f.frontmatter?.title && isListedNote(f),
      )
      .sort(opts.sort)
    const rows = buildRecentRows(pages, opts.limit)
    const here = fileData.slug!
    const titleOf = (f: RecentNotesPluginData) => f.frontmatter?.title ?? "Untitled"

    return (
      <section class={classNames(displayClass, "recent-notes")} aria-labelledby="recent-notes-h">
        <div class="recent-notes-header">
          <h2 id="recent-notes-h">{opts.title ?? "RECENT NOTES"}</h2>
          {opts.linkToMore && (
            <a class="recent-notes-more" href={resolveRelative(here, opts.linkToMore)}>
              {opts.linkToMoreLabel}
            </a>
          )}
        </div>
        <div class="recent-rows">
          {rows.map((row) => {
            const lead = row.kind === "note" ? row.file : row.files[0]!
            const date = getListDate(lead)
            const slug = (lead.slug as string) ?? ""

            let href: string
            let title: string
            let sub: string
            let revised = false
            if (row.kind === "group") {
              const shown = row.files.slice(0, 2).map(titleOf)
              const rest = row.files.length - shown.length
              href = resolveRelative(here, `${row.folder}/index`)
              title = `${titleCase(row.folder.split("/").pop() ?? "")} · ${row.files.length} notes`
              sub = shown.join(", ") + (rest > 0 ? ` +${rest} more` : "")
            } else {
              href = resolveRelative(here, slug)
              title = titleOf(row.file)
              sub = (row.file.description as string | undefined) ?? ""
              revised = Boolean(getNoteDates(row.file).revised)
            }

            return (
              <a class="recent-row" href={href}>
                <span class="recent-date">{date ? formatYmd(date) : ""}</span>
                <span class="recent-main">
                  <span class="recent-title">
                    {title}
                    {revised && <span class="recent-revised">Revised</span>}
                  </span>
                  {sub && <span class="recent-sub">{sub}</span>}
                </span>
                {opts.showTags && <span class="recent-topic">{topicName(slug)}</span>}
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  RecentNotesForIndex.css = style
  return RecentNotesForIndex
}) satisfies QuartzComponentConstructor<Partial<RecentNotesForIndexOptions>>
