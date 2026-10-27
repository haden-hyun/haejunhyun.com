// 홈 Recent Notes — 날짜 · 제목(개정 배지) · 요약 · 토픽 행, 목록 날짜 최신순.
// - 같은 날짜·같은 폴더 3편 이상은 폴더 링크 한 행으로 묶는다(_shared/notes buildRecentRows)
// - 묶음 라벨: 전원이 한 시리즈면 시리즈명 + `시리즈 · N편 — 첫 편부터`, 아니면 폴더 표시명 + `N notes`
// 주의: Featured의 recentExcludeCount가 이 limit과 같아야 두 섹션이 겹치지 않는다.
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { classNames } from "@quartz-community/utils/lang"
import { formatYmd, getListDate, getNoteDates } from "../../../_shared/noteMeta"
import { buildRecentRows, byListDateDesc, folderTitle, isListedNote, plural, topicName } from "../../../_shared/notes"
import { resolveRelative } from "../../../_shared/path"
import { episodeLabel, getSeriesEntries, seriesOf } from "../../../_shared/series"
import style from "./styles/recentNotes.scss"

type RecentNotesPluginData = QuartzPluginData & Record<string, unknown>

export interface RecentNotesForIndexOptions {
  title?: string
  limit: number
  linkToMore: string | false
  linkToMoreLabel: string
  showTags: boolean
  /** 시리즈 키 → 표시명. quartz.config.yaml의 `&seriesTitles` 앵커를 받는다. */
  seriesTitles: Record<string, string>
  /** 폴더 표시명. quartz.config.yaml의 `&folderTitles` 앵커를 받는다. */
  folderTitles: Record<string, string>
}

const defaultOptions: RecentNotesForIndexOptions = {
  limit: 5,
  linkToMore: false,
  linkToMoreLabel: "ALL NOTES →",
  showTags: true,
  seriesTitles: {},
  folderTitles: {},
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

    const pages = (allFiles as RecentNotesPluginData[])
      .filter((f) => f.slug !== fileData.slug && f.frontmatter?.title && isListedNote(f))
      .sort(byListDateDesc)
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
              href = resolveRelative(here, `${row.folder}/index`)
              revised = row.files.every((f) => getNoteDates(f).revised)
              const series = seriesOf(row.files[0]!)
              const all = series ? getSeriesEntries(series, allFiles as RecentNotesPluginData[]) : []
              const episodes = all.filter((e) => row.files.includes(e.file))
              if (series && episodes.length === row.files.length) {
                title = opts.seriesTitles[series] ?? series
                // 서문 제목이 시리즈명과 같으면 부제가 제목을 되풀이하므로 다음 편을 보인다.
                const [head, next] = [episodes[0]!, episodes[1]]
                const first = head.index === 0 && head.title === title && next ? next : head
                sub = `시리즈 · ${all.length}편 — ${episodeLabel(first.index)} ${first.title}부터`
              } else {
                const parts = row.folder.split("/")
                const parent =
                  parts.length > 2 ? `${folderTitle(parts.slice(0, -1).join("/"), opts.folderTitles)} › ` : ""
                const shown = row.files.slice(0, 2).map(titleOf)
                const rest = row.files.length - shown.length
                title = `${parent}${folderTitle(row.folder, opts.folderTitles)} · ${plural(row.files.length, "note")}`
                sub = shown.join(", ") + (rest > 0 ? ` +${rest} more` : "")
              }
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
