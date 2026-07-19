import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { classNames } from "@quartz-community/utils/lang"
import { formatDate } from "@quartz-community/utils/date"
import { resolveRelative } from "../util/path"
import style from "./styles/recentNotes.scss"

type RecentNotesPluginData = QuartzPluginData & Record<string, unknown>

export interface RecentNotesForIndexOptions {
  title?: string
  limit: number
  linkToMore: string | false
  showTags: boolean
  filter: (f: RecentNotesPluginData) => boolean
  sort: (f1: RecentNotesPluginData, f2: RecentNotesPluginData) => number
}

/**
 * v4 semantics preserved: sort by modified date, falling back to created
 * date, falling back to 0 (unset dates sort last). Deliberately NOT reusing
 * `@quartz-community/utils/sort`'s `byDateAndAlphabetical`, which only reads
 * a single `defaultDateType` with no modified→created fallback chain — see
 * MIGRATION-NOTES §15 decision note for this plugin.
 */
function getSortTime(f: RecentNotesPluginData): number {
  return f.dates?.modified?.getTime() ?? f.dates?.created?.getTime() ?? 0
}

function getDisplayDate(f: RecentNotesPluginData): Date | undefined {
  return f.dates?.modified ?? f.dates?.created ?? f.dates?.published
}

const defaultOptions: RecentNotesForIndexOptions = {
  limit: 6,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: (f1, f2) => getSortTime(f2) - getSortTime(f1),
}

const CATEGORY_NAMES: Record<string, string> = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools",
}

function getCategory(slug: string): { key: string; name: string } {
  const key = slug.split("/")[0] ?? ""
  const name = CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return { key, name }
}

export default ((userOpts?: Partial<RecentNotesForIndexOptions>) => {
  const opts: RecentNotesForIndexOptions = { ...defaultOptions, ...userOpts }

  const RecentNotesForIndex: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    // Index-only guard. No built-in v5 layout `condition` matches "index page
    // only" — only the inverse, `not-index`, is built in (MIGRATION-NOTES §6)
    // — so this keeps the same internal-guard pattern v4 used.
    if (fileData.slug !== "index") return <></>

    const files = allFiles as RecentNotesPluginData[]
    const pages = files
      .filter(opts.filter)
      .filter((f) => f.slug !== fileData.slug && f.frontmatter?.title)
      .sort(opts.sort)
      .slice(0, opts.limit)

    const locale = cfg.locale ?? "en-US"

    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h2>{opts.title ?? "Recent Posts"}</h2>
        <div class="notes-grid">
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? "Untitled"
            const tags = page.frontmatter?.tags ?? []
            const description = page.description ?? ""
            const { key: catKey, name: catName } = getCategory(page.slug ?? "")
            const displayDate = getDisplayDate(page)

            return (
              <a class="note-card" data-category={catKey} href={resolveRelative(fileData.slug!, page.slug!)}>
                <div class="card-category">{catName}</div>
                {displayDate && (
                  <div class="card-meta">
                    <time dateTime={displayDate.toISOString()}>{formatDate(displayDate, locale)}</time>
                  </div>
                )}
                <h3 class="card-title">{title}</h3>
                {description && <p class="card-desc">{description}</p>}
                {opts.showTags && tags.length > 0 && (
                  <div class="card-tags">
                    {tags.slice(0, 3).map((tag) => (
                      <span class="tag-chip">#{tag}</span>
                    ))}
                  </div>
                )}
              </a>
            )
          })}
        </div>
        {opts.linkToMore && (
          <a href={resolveRelative(fileData.slug!, opts.linkToMore)} class="see-more">
            {`See ${Math.max(0, files.length - opts.limit)} more`}
          </a>
        )}
      </div>
    )
  }

  RecentNotesForIndex.css = style
  return RecentNotesForIndex
}) satisfies QuartzComponentConstructor<Partial<RecentNotesForIndexOptions>>
