import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import style from "./styles/recentNotes.scss"
import { Date, getDate } from "./Date"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface Options {
  title?: string
  limit: number
  linkToMore: SimpleSlug | false
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions: Options = {
  limit: 6,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => {
    const t1 = f1.dates?.modified?.getTime() ?? f1.dates?.created?.getTime() ?? 0
    const t2 = f2.dates?.modified?.getTime() ?? f2.dates?.created?.getTime() ?? 0
    return t2 - t1
  },
}

const CATEGORY_NAMES: Record<string, string> = {
  "computer-science":  "Computer Science",
  "data-engineering":  "Data Engineering",
  "data-science":      "Data Science",
  "gis":               "GIS",
  "programming":       "Programming",
  "finance-property":  "Finance & Property",
  "tools":             "Tools",
}

function getCategory(slug: string): { key: string; name: string } {
  const key = slug.split("/")[0] ?? ""
  const name =
    CATEGORY_NAMES[key] ??
    key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  return { key, name }
}

export default ((userOpts?: Partial<Options>) => {
  const RecentNotesForIndex: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }

    if (fileData.slug !== "index") return <></>

    const pages = allFiles
      .filter(opts.filter)
      .filter((f) => f.slug !== fileData.slug && f.frontmatter?.title)
      .sort(opts.sort)
      .slice(0, opts.limit)

    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h2>{opts.title ?? "Recent Posts"}</h2>
        <div class="notes-grid">
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const tags = page.frontmatter?.tags ?? []
            const description = page.description ?? ""
            const { key: catKey, name: catName } = getCategory(page.slug ?? "")

            return (
              <a
                class="note-card"
                data-category={catKey}
                href={resolveRelative(fileData.slug!, page.slug!)}
              >
                <div class="card-category">{catName}</div>
                {page.dates && (
                  <div class="card-meta">
                    <Date date={getDate(cfg, page)!} locale={cfg.locale} />
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
            {i18n(cfg.locale).components.recentNotes.seeRemainingMore({
              remaining: allFiles.length - opts.limit,
            })}
          </a>
        )}
      </div>
    )
  }

  RecentNotesForIndex.css = style
  return RecentNotesForIndex
}) satisfies QuartzComponentConstructor

export type { Options as RecentNotesOptions }
